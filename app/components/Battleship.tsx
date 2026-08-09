'use client';

import { supabase } from '@/lib/supabase';
import { playSound } from '../page';
import confetti from 'canvas-confetti';

export default function Battleship({ game, role, onReturnToHub }: any) {
  const state = game?.battleship_state || {
    p1_hearts: [], p2_hearts: [], p1_guesses: [], p2_guesses: [], turn: 'player_a', winner: null
  };

  const myHeartsKey = role === 'player_a' ? 'p1_hearts' : 'p2_hearts';
  const partnerHeartsKey = role === 'player_a' ? 'p2_hearts' : 'p1_hearts';
  const myGuessesKey = role === 'player_a' ? 'p1_guesses' : 'p2_guesses';

  const myHearts: number[] = state[myHeartsKey] || [];
  const partnerHearts: number[] = state[partnerHeartsKey] || [];
  const myGuesses: number[] = state[myGuessesKey] || [];

  const setupComplete = myHearts.length === 3;
  const partnerSetupComplete = partnerHearts.length === 3;

  const handleTileSetup = async (idx: number) => {
    if (setupComplete) return;
    playSound('click');
    let newList = [...myHearts];
    if (newList.includes(idx)) {
      newList = newList.filter(i => i !== idx);
    } else if (newList.length < 3) {
      newList.push(idx);
    }
    const newState = { ...state, [myHeartsKey]: newList };
    await supabase.from('games').update({ battleship_state: newState }).eq('id', game.id);
  };

  const handleGuessTile = async (idx: number) => {
    if (!setupComplete || !partnerSetupComplete || state.winner) return;
    if (state.turn !== role || myGuesses.includes(idx)) return;

    playSound('click');
    const newGuesses = [...myGuesses, idx];
    const partnerHits = partnerHearts.filter(h => newGuesses.includes(h));

    let winner = state.winner;
    if (partnerHits.length === 3) {
      winner = role === 'player_a' ? game.player_a_name : game.player_b_name;
      playSound('fanfare');
      confetti({ particleCount: 120, spread: 80 });
    }

    const nextTurn = state.turn === 'player_a' ? 'player_b' : 'player_a';
    const newState = { ...state, [myGuessesKey]: newGuesses, turn: nextTurn, winner };

    await supabase.from('games').update({ battleship_state: newState }).eq('id', game.id);
  };

  const handleResetBattleship = async () => {
    playSound('click');
    const resetState = { p1_hearts: [], p2_hearts: [], p1_guesses: [], p2_guesses: [], turn: 'player_a', winner: null };
    await supabase.from('games').update({ battleship_state: resetState }).eq('id', game.id);
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="font-bold text-rose-400 text-sm">🚢 Couples Battleship</span>
        <button onClick={onReturnToHub} className="text-xs text-slate-400 hover:text-white">
          ← Back to Hub
        </button>
      </div>

      {!setupComplete ? (
        <div className="space-y-3">
          <p className="text-xs text-rose-300">Tap 3 tiles to hide your 3 Hearts 💕 ({myHearts.length}/3)</p>
          <div className="grid grid-cols-5 gap-2 max-w-[260px] mx-auto">
            {Array.from({ length: 25 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleTileSetup(idx)}
                className={`h-10 rounded-lg text-lg flex items-center justify-center border ${
                  myHearts.includes(idx)
                    ? 'bg-rose-500/30 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
              >
                {myHearts.includes(idx) ? '💕' : ''}
              </button>
            ))}
          </div>
        </div>
      ) : !partnerSetupComplete ? (
        <div className="py-8 text-center space-y-2">
          <div className="text-3xl animate-bounce">⏳</div>
          <p className="text-xs text-slate-400">Your hearts are hidden! Waiting for partner to hide theirs...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.winner ? (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 font-bold text-sm">
              🏆 {state.winner} Found All 3 Hearts First!
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Turn: <strong className="text-slate-200">{state.turn === role ? 'YOUR TURN! Guess a tile ▼' : 'Waiting for partner...'}</strong>
            </p>
          )}

          {/* 5x5 Guess Grid */}
          <div className="grid grid-cols-5 gap-2 max-w-[260px] mx-auto">
            {Array.from({ length: 25 }).map((_, idx) => {
              const guessed = myGuesses.includes(idx);
              const isHit = partnerHearts.includes(idx) && guessed;
              return (
                <button
                  key={idx}
                  onClick={() => handleGuessTile(idx)}
                  disabled={guessed || !!state.winner || state.turn !== role}
                  className={`h-10 rounded-lg text-lg flex items-center justify-center border transition ${
                    isHit
                      ? 'bg-rose-500 border-rose-400 text-white font-bold'
                      : guessed
                      ? 'bg-slate-950 border-slate-800 text-slate-600'
                      : 'bg-slate-900 border-slate-800 hover:border-rose-500/50'
                  }`}
                >
                  {isHit ? '💖' : guessed ? '❌' : ''}
                </button>
              );
            })}
          </div>

          <button onClick={handleResetBattleship} className="w-full py-2 bg-slate-800 text-xs rounded-xl font-bold">
            Reset Game 🔄
          </button>
        </div>
      )}
    </div>
  );
}