'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { playSound } from '../page';
import confetti from 'canvas-confetti';

export default function Wordle({ game, role, onReturnToHub }: any) {
  const state = game?.wordle_state || { word_a: '', word_b: '', guesses_a: [], guesses_b: [], winner: null };

  const myWordKey = role === 'player_a' ? 'word_a' : 'word_b';
  const partnerWordKey = role === 'player_a' ? 'word_b' : 'word_a';
  const myGuessesKey = role === 'player_a' ? 'guesses_a' : 'guesses_b';
  const partnerGuessesKey = role === 'player_a' ? 'guesses_b' : 'guesses_a';

  const myWord = state[myWordKey] || '';
  const partnerWord = state[partnerWordKey] || '';
  const myGuesses: string[] = state[myGuessesKey] || [];
  const partnerGuesses: string[] = state[partnerGuessesKey] || [];

  const [inputWord, setInputWord] = useState('');
  const [guessInput, setGuessInput] = useState('');

  // Game is over if someone won OR if someone ran out of 6 guesses!
  const isGameOver = !!state.winner || myGuesses.length >= 6 || partnerGuesses.length >= 6;

  const handleSetSecretWord = async () => {
    if (inputWord.length !== 5) return;
    playSound('click');
    const newState = { ...state, [myWordKey]: inputWord.toUpperCase() };
    await supabase.from('games').update({ wordle_state: newState }).eq('id', game.id);
  };

  const handleSubmitGuess = async () => {
    if (guessInput.length !== 5 || isGameOver) return;
    playSound('click');
    const cleanGuess = guessInput.toUpperCase();
    const newGuesses = [...myGuesses, cleanGuess];

    let winner = state.winner;

    // 1. Correct guess = Win!
    if (cleanGuess === partnerWord) {
      winner = role === 'player_a' ? game.player_a_name : game.player_b_name;
      playSound('fanfare');
      confetti({ particleCount: 120, spread: 80 });
    } 
    // 2. Out of guesses loss detection!
    else if (newGuesses.length >= 6) {
      if (partnerGuesses.includes(myWord)) {
        winner = role === 'player_a' ? game.player_b_name : game.player_a_name;
      } else {
        winner = 'Out of Tries';
      }
    }

    const newState = { ...state, [myGuessesKey]: newGuesses, winner };
    await supabase.from('games').update({ wordle_state: newState }).eq('id', game.id);
    setGuessInput('');
  };

  const handleResetWordle = async () => {
    playSound('click');
    const resetState = { word_a: '', word_b: '', guesses_a: [], guesses_b: [], winner: null };
    await supabase.from('games').update({ wordle_state: resetState }).eq('id', game.id);
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="font-bold text-purple-400 text-sm">🔤 Secret Wordle</span>
        <button onClick={onReturnToHub} className="text-xs text-slate-400 hover:text-white">
          ← Back to Hub
        </button>
      </div>

      {/* 1. PERSISTENT REMINDER BAR: Shows player their own secret word */}
      {myWord && (
        <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs text-purple-300 font-semibold">
          Your Secret Word: <span className="font-mono text-white tracking-widest uppercase font-extrabold">{myWord}</span>
        </div>
      )}

      {!myWord ? (
        <div className="space-y-3">
          <p className="text-xs text-purple-300">Set a 5-letter Secret Word for your partner to guess!</p>
          <input
            type="text"
            maxLength={5}
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value.toUpperCase())}
            placeholder="5 Letters (e.g. DATES)"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg tracking-widest font-mono uppercase focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSetSecretWord}
            disabled={inputWord.length !== 5}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-bold text-xs disabled:opacity-40"
          >
            Lock In Secret Word 🔒
          </button>
        </div>
      ) : !partnerWord ? (
        <div className="py-8 text-center space-y-2">
          <div className="text-3xl animate-bounce">⏳</div>
          <p className="text-xs text-slate-400">Your word is locked! Waiting for partner to set theirs...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 2. END GAME REVEAL BANNER: Triggers when game ends or tries run out */}
          {isGameOver ? (
            <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-xl text-purple-300 font-bold text-sm space-y-1">
              <p>{state.winner === 'Out of Tries' ? "⏳ Out of Tries!" : state.winner ? `🏆 ${state.winner} Wins!` : "Game Finished!"}</p>
              <p className="text-xs text-white">
                Partner's Secret Word was: <span className="font-mono text-amber-300 tracking-widest font-extrabold">{partnerWord}</span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Guess partner's 5-letter word ({myGuesses.length}/6 tries):</p>
          )}

          {/* Guesses Display */}
          <div className="space-y-1">
            {myGuesses.map((guess, idx) => (
              <div key={idx} className="flex justify-center gap-1">
                {guess.split('').map((char, cIdx) => {
                  const isCorrect = partnerWord[cIdx] === char;
                  const isPresent = partnerWord.includes(char);
                  return (
                    <div
                      key={cIdx}
                      className={`w-9 h-9 border font-mono font-bold text-sm rounded flex items-center justify-center ${
                        isCorrect
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : isPresent
                          ? 'bg-amber-500 border-amber-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {!isGameOver && myGuesses.length < 6 && (
            <div className="space-y-2">
              <input
                type="text"
                maxLength={5}
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value.toUpperCase())}
                placeholder="Type 5-letter guess..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-sm font-mono tracking-widest uppercase focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSubmitGuess}
                disabled={guessInput.length !== 5}
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-bold text-xs disabled:opacity-40"
              >
                Submit Guess 🎯
              </button>
            </div>
          )}

          <button onClick={handleResetWordle} className="w-full py-2 bg-slate-800 text-xs rounded-xl font-bold">
            Reset Game 🔄
          </button>
        </div>
      )}
    </div>
  );
}