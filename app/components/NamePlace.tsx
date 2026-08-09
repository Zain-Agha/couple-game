'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { playSound } from '../page';

export default function NamePlace({ game, role, onReturnToHub }: any) {
  const state = game?.nameplace_state || { letter: '', p1_inputs: {}, p2_inputs: {}, result: null };
  const [inputs, setInputs] = useState({ name: '', place: '', animal: '', thing: '' });
  const [loading, setLoading] = useState(false);

  const myInputsKey = role === 'player_a' ? 'p1_inputs' : 'p2_inputs';
  const mySubmittedKey = role === 'player_a' ? 'p1_submitted' : 'p2_submitted';

  const isSubmitted = state[mySubmittedKey];

  const handleStartRound = async () => {
    playSound('click');
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const newState = { letter: randomLetter, p1_inputs: {}, p2_inputs: {}, p1_submitted: false, p2_submitted: false, result: null };
    await supabase.from('games').update({ nameplace_state: newState }).eq('id', game.id);
  };

  const handleSubmitInputs = async () => {
    playSound('click');
    setLoading(true);
    const newState = {
      ...state,
      [myInputsKey]: inputs,
      [mySubmittedKey]: true,
    };

    await supabase.from('games').update({ nameplace_state: newState }).eq('id', game.id);

    if (state.p1_submitted || state.p2_submitted) {
      const evalRes = await fetch('/api/name-place-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          letter: state.letter,
          p1Inputs: role === 'player_a' ? inputs : state.p1_inputs,
          p2Inputs: role === 'player_b' ? inputs : state.p2_inputs,
        }),
      });

      const evalData = await evalRes.json();
      await supabase.from('games').update({
        nameplace_state: { ...newState, result: evalData }
      }).eq('id', game.id);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="font-bold text-cyan-400 text-sm">📝 Name Place Animal Thing</span>
        <button onClick={onReturnToHub} className="text-xs text-slate-400 hover:text-white">
          ← Back to Hub
        </button>
      </div>

      {!state.letter ? (
        <div className="py-6 space-y-3">
          <p className="text-xs text-slate-300">Spin for a Letter and fill in all 4 categories starting with that letter!</p>
          <button onClick={handleStartRound} className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 rounded-xl font-bold text-sm">
            🎲 Spin Random Letter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Active Letter</span>
            <p className="text-4xl font-mono font-extrabold text-cyan-400">{state.letter}</p>
          </div>

          {state.result ? (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h4 className="font-bold text-cyan-300 text-sm">Round Results</h4>
              <div className="flex justify-around text-xs">
                <span>{game.player_a_name}: <strong>{state.result.p1Score}/4 pts</strong></span>
                <span>{game.player_b_name}: <strong>{state.result.p2Score}/4 pts</strong></span>
              </div>
              <p className="text-xs text-slate-400">{state.result.feedback}</p>
              <button onClick={handleStartRound} className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 rounded-xl font-bold text-xs mt-2">
                Next Letter 🎲
              </button>
            </div>
          ) : isSubmitted ? (
            <div className="py-8 space-y-2">
              <div className="text-3xl animate-bounce">⏳</div>
              <p className="text-xs text-slate-400">Inputs locked! Waiting for partner to submit...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {['Name', 'Place', 'Animal', 'Thing'].map((cat) => (
                <input
                  key={cat}
                  type="text"
                  value={(inputs as any)[cat.toLowerCase()]}
                  onChange={(e) => setInputs({ ...inputs, [cat.toLowerCase()]: e.target.value })}
                  placeholder={`${cat} starting with '${state.letter}'...`}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              ))}
              <button
                onClick={handleSubmitInputs}
                disabled={loading}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 rounded-xl font-bold text-xs"
              >
                Submit Answers 🎯
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}