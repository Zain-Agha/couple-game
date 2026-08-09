'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { playSound } from '../page';

export default function WordChain({ game, role, onReturnToHub }: any) {
  const state = game?.wordchain_state || { words: [], turn: 'player_a', winner: null };
  const words: string[] = state.words || [];
  const [wordInput, setWordInput] = useState('');

  const lastWord = words[words.length - 1] || '';
  const requiredChar = lastWord ? lastWord[lastWord.length - 1].toUpperCase() : '';

  const handleAddWord = async () => {
    if (!wordInput.trim()) return;
    const cleanWord = wordInput.trim().toUpperCase();

    if (requiredChar && cleanWord[0] !== requiredChar) {
      alert(`Word must start with '${requiredChar}'!`);
      return;
    }

    if (words.includes(cleanWord)) {
      alert(`'${cleanWord}' was already used!`);
      return;
    }

    playSound('click');
    const newWords = [...words, cleanWord];
    const nextTurn = state.turn === 'player_a' ? 'player_b' : 'player_a';
    const newState = { words: newWords, turn: nextTurn, winner: null };

    await supabase.from('games').update({ wordchain_state: newState }).eq('id', game.id);
    setWordInput('');
  };

  const handleResetWordChain = async () => {
    playSound('click');
    const newState = { words: [], turn: 'player_a', winner: null };
    await supabase.from('games').update({ wordchain_state: newState }).eq('id', game.id);
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="font-bold text-teal-400 text-sm">🔗 Word Chain (Shiritori)</span>
        <button onClick={onReturnToHub} className="text-xs text-slate-400 hover:text-white">
          ← Back to Hub
        </button>
      </div>

      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
        <span className="text-[11px] text-slate-400">
          {requiredChar ? `Next word MUST start with letter:` : 'Start the chain with any word!'}
        </span>
        {requiredChar && <p className="text-3xl font-mono font-extrabold text-teal-400">{requiredChar}</p>}
      </div>

      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl max-h-36 overflow-y-auto space-y-1">
        <span className="text-[10px] text-slate-500 uppercase font-bold">Word Chain:</span>
        <div className="flex flex-wrap gap-1 justify-center">
          {words.map((w, idx) => (
            <span key={idx} className="px-2 py-1 bg-teal-500/20 border border-teal-500/30 text-teal-300 rounded text-xs font-mono">
              {w}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={wordInput}
          onChange={(e) => setWordInput(e.target.value.toUpperCase())}
          placeholder={requiredChar ? `Word starting with '${requiredChar}'...` : 'Type first word...'}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center font-mono uppercase text-sm focus:outline-none focus:border-teal-500"
        />
        <button
          onClick={handleAddWord}
          disabled={state.turn !== role}
          className="w-full py-3 bg-teal-500 hover:bg-teal-600 rounded-xl font-bold text-xs disabled:opacity-40"
        >
          {state.turn === role ? 'Submit Word 🔗' : 'Waiting for Partner...'}
        </button>
      </div>

      <button onClick={handleResetWordChain} className="w-full py-2 bg-slate-800 text-xs rounded-xl font-bold">
        Reset Chain 🔄
      </button>
    </div>
  );
}