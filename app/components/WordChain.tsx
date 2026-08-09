'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { playSound } from '../page';
import confetti from 'canvas-confetti';

const CATEGORIES: { [key: string]: { icon: string; name: string } } = {
  general: { icon: '🌟', name: 'General Words' },
  animals: { icon: '🦁', name: 'Animals' },
  food: { icon: '🍕', name: 'Food & Drinks' },
  countries: { icon: '🌍', name: 'Countries & Cities' },
  romance: { icon: '💕', name: 'Romance & Feelings' },
};

export default function WordChain({ game, role, onReturnToHub }: any) {
  const state = game?.wordchain_state || { words: [], turn: 'player_a', category: 'general', winner: null };
  const words: string[] = state.words || [];
  const categoryKey = state.category || 'general';

  const [wordInput, setWordInput] = useState('');
  const [timer, setTimer] = useState(15);
  const [validating, setValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const lastWord = words[words.length - 1] || '';
  const requiredChar = lastWord ? lastWord[lastWord.length - 1].toUpperCase() : '';

  // 15-Second Turn Timer
  useEffect(() => {
    if (state.winner || !state.turn) return;

    setTimer(15);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeoutLoss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.turn, words.length, state.winner]);

  // Timeout Loss Logic
  const handleTimeoutLoss = async () => {
    if (state.winner || state.turn !== role) return;
    playSound('fanfare');

    const winner = role === 'player_a' ? game.player_b_name : game.player_a_name;
    const newState = { ...state, winner, reason: 'Time Expired!' };
    await supabase.from('games').update({ wordchain_state: newState }).eq('id', game.id);
  };

  // Set Category
  const handleSelectCategory = async (catKey: string) => {
    playSound('click');
    const newState = { words: [], turn: 'player_a', category: catKey, winner: null };
    await supabase.from('games').update({ wordchain_state: newState }).eq('id', game.id);
  };

  // Submit & Validate Word
  const handleAddWord = async () => {
    if (!wordInput.trim() || validating || state.winner) return;
    setErrorMsg('');
    const cleanWord = wordInput.trim().toUpperCase();

    // Duplicate check
    if (words.includes(cleanWord)) {
      setErrorMsg(`'${cleanWord}' was already used!`);
      return;
    }

    setValidating(true);

    // Groq AI Smart Validation
    try {
      const res = await fetch('/api/word-chain-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: cleanWord,
          category: CATEGORIES[categoryKey].name,
          requiredLetter: requiredChar,
        }),
      });

      const evalData = await res.json();
      setValidating(false);

      if (!evalData.isValid) {
        setErrorMsg(evalData.reason || 'Invalid word for this category!');
        return;
      }

      playSound('click');
      const newWords = [...words, cleanWord];
      const nextTurn = state.turn === 'player_a' ? 'player_b' : 'player_a';
      const newState = { ...state, words: newWords, turn: nextTurn, winner: null };

      await supabase.from('games').update({ wordchain_state: newState }).eq('id', game.id);
      setWordInput('');
    } catch (e) {
      setValidating(false);
    }
  };

  const handleResetWordChain = async () => {
    playSound('click');
    const newState = { words: [], turn: 'player_a', category: 'general', winner: null };
    await supabase.from('games').update({ wordchain_state: newState }).eq('id', game.id);
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="font-bold text-teal-400 text-sm">🔗 Smart Word Chain</span>
        <button onClick={onReturnToHub} className="text-xs text-slate-400 hover:text-white">
          ← Back to Hub
        </button>
      </div>

      {/* Category & Timer Header */}
      <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
        <div className="text-left">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Category</span>
          <span className="font-bold text-teal-300">
            {CATEGORIES[categoryKey]?.icon} {CATEGORIES[categoryKey]?.name}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Turn Timer</span>
          <span className={`text-lg font-mono font-extrabold ${timer <= 5 ? 'text-rose-400 animate-pulse' : 'text-teal-400'}`}>
            ⏱️ {timer}s
          </span>
        </div>
      </div>

      {state.winner ? (
        <div className="p-3 bg-teal-500/20 border border-teal-500/40 rounded-xl text-teal-300 font-bold text-sm space-y-1">
          <p>🏆 {state.winner} Wins Word Chain! 🎉</p>
          <p className="text-xs text-slate-400">{state.reason || 'Great Word Chain!'}</p>
        </div>
      ) : words.length === 0 ? (
        <div className="space-y-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block font-semibold">Select Category:</span>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CATEGORIES).map(([catKey, info]) => (
              <button
                key={catKey}
                onClick={() => handleSelectCategory(catKey)}
                className={`p-2 rounded-lg text-xs font-bold border transition ${
                  categoryKey === catKey
                    ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {info.icon} {info.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] text-slate-400 block">
            Next word MUST start with letter:
          </span>
          <p className="text-4xl font-mono font-extrabold text-teal-400">{requiredChar}</p>
        </div>
      )}

      {/* Word History */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl max-h-32 overflow-y-auto space-y-1">
        <span className="text-[10px] text-slate-500 uppercase font-bold">Word History:</span>
        <div className="flex flex-wrap gap-1 justify-center">
          {words.map((w, idx) => (
            <span key={idx} className="px-2 py-1 bg-teal-500/20 border border-teal-500/30 text-teal-300 rounded text-xs font-mono">
              {w}
            </span>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-2 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-300 text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {!state.winner && (
        <div className="space-y-2">
          <input
            type="text"
            value={wordInput}
            onChange={(e) => {
              setErrorMsg('');
              setWordInput(e.target.value.toUpperCase());
            }}
            placeholder={requiredChar ? `Word starting with '${requiredChar}'...` : 'Type first word...'}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center font-mono uppercase text-sm focus:outline-none focus:border-teal-500"
          />
          <button
            onClick={handleAddWord}
            disabled={state.turn !== role || validating}
            className="w-full py-3 bg-teal-500 hover:bg-teal-600 rounded-xl font-bold text-xs disabled:opacity-40"
          >
            {validating ? '🤖 Groq AI Validating...' : state.turn === role ? 'Submit Word 🔗' : 'Waiting for Partner...'}
          </button>
        </div>
      )}

      <button onClick={handleResetWordChain} className="w-full py-2 bg-slate-800 text-xs rounded-xl font-bold">
        Reset Chain 🔄
      </button>
    </div>
  );
}