'use client';

import { supabase } from '@/lib/supabase';
import { playSound } from '../page';

export default function WouldYouRather({ game, role, onReturnToHub }: any) {
  const state = game?.wouldyourather_state || {};

  const handleGenerateDilemma = async () => {
    playSound('click');
    const res = await fetch('/api/would-you-rather', { method: 'POST' });
    const data = await res.json();

    const newState = {
      prompt: data.prompt,
      option_a: data.option_a,
      option_b: data.option_b,
      choice_a: null,
      choice_b: null,
    };

    await supabase.from('games').update({ wouldyourather_state: newState }).eq('id', game.id);
  };

  const handlePickOption = async (option: 'A' | 'B') => {
    playSound('click');
    const key = role === 'player_a' ? 'choice_a' : 'choice_b';
    const newState = { ...state, [key]: option };

    await supabase.from('games').update({ wouldyourather_state: newState }).eq('id', game.id);
  };

  const myChoice = role === 'player_a' ? state.choice_a : state.choice_b;
  const partnerChoice = role === 'player_a' ? state.choice_b : state.choice_a;
  const partnerName = role === 'player_a' ? game.player_b_name : game.player_a_name;
  const bothPicked = state.choice_a && state.choice_b;

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="font-bold text-amber-400 text-sm">🤖 Groq AI Would You Rather?</span>
        <button onClick={onReturnToHub} className="text-xs text-slate-400 hover:text-white">
          ← Back to Hub
        </button>
      </div>

      {!state.prompt ? (
        <div className="py-8 space-y-4">
          <p className="text-sm text-slate-300">Tap below to let Groq AI generate a custom scenario!</p>
          <button
            onClick={handleGenerateDilemma}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 rounded-xl font-bold text-sm transition shadow-lg shadow-amber-500/20"
          >
            🎲 Generate AI Scenario
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">Groq AI Dilemma</span>
            <h3 className="text-lg font-bold text-white">{state.prompt}</h3>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handlePickOption('A')}
              className={`w-full p-4 rounded-xl text-sm font-bold border transition ${
                myChoice === 'A'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              Option A: {state.option_a}
            </button>

            <button
              onClick={() => handlePickOption('B')}
              className={`w-full p-4 rounded-xl text-sm font-bold border transition ${
                myChoice === 'B'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              Option B: {state.option_b}
            </button>
          </div>

          {bothPicked ? (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <p className="text-sm font-bold text-amber-300">
                {state.choice_a === state.choice_b
                  ? `🤝 You both picked Option ${state.choice_a}! Perfect Match!`
                  : `⚡ You disagreed! You picked ${myChoice}, while ${partnerName} picked ${partnerChoice}!`}
              </p>
              <button
                onClick={handleGenerateDilemma}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 rounded-xl font-bold text-xs transition mt-2"
              >
                Next AI Scenario →
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 animate-pulse">
              {myChoice ? `Choice locked! Waiting for ${partnerName} to pick...` : "Pick your choice above!"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}