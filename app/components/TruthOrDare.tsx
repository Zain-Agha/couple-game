'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { playSound } from '../page';

export default function TruthOrDare({ game, role, onReturnToHub }: any) {
  const state = game?.truthordare_state || { prompt: '', type: null };
  const [loading, setLoading] = useState(false);

  const handleFetchPrompt = async (type: 'truth' | 'dare') => {
    playSound('click');
    setLoading(true);

    const res = await fetch('/api/truth-or-dare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        relationshipMode: game?.relationship_mode || 'couples',
      }),
    });

    const data = await res.json();
    setLoading(false);

    const newState = { prompt: data.prompt, type };
    await supabase.from('games').update({ truthordare_state: newState }).eq('id', game.id);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="font-bold text-rose-400 text-sm">🔥 Groq AI Truth or Dare</span>
        <button onClick={onReturnToHub} className="text-xs text-slate-400 hover:text-white">
          ← Back to Hub
        </button>
      </div>

      {!state.prompt ? (
        <div className="space-y-4 py-6">
          <p className="text-xs text-slate-300">Choose Truth or Dare for Groq AI to generate a custom prompt!</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleFetchPrompt('truth')}
              disabled={loading}
              className="py-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold text-sm transition"
            >
              😇 Truth
            </button>
            <button
              onClick={() => handleFetchPrompt('dare')}
              disabled={loading}
              className="py-4 bg-rose-500 hover:bg-rose-600 rounded-xl font-bold text-sm transition"
            >
              😈 Dare
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
              {state.type === 'truth' ? '😇 TRUTH PROMPT' : '😈 DARE PROMPT'}
            </span>
            <h3 className="text-lg font-bold text-white">{state.prompt}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleFetchPrompt('truth')}
              disabled={loading}
              className="py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold text-xs"
            >
              New Truth 😇
            </button>
            <button
              onClick={() => handleFetchPrompt('dare')}
              disabled={loading}
              className="py-3 bg-rose-500 hover:bg-rose-600 rounded-xl font-bold text-xs"
            >
              New Dare 😈
            </button>
          </div>
        </div>
      )}
    </div>
  );
}