'use client';

import { LEVEL_NAMES } from '../page';

export default function RoomHub({
  game,
  role,
  onCopyLink,
  copied,
  onStartQuiz,
  onStartWouldYouRather,
  onStartConnect4,
  onStartTicTacToe,
  onStartBattleship,
  onStartWordle,
  onExitRoom,
}: any) {
  return (
    <div className="space-y-6 text-center">
      {/* Room Code Header */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
        <span className="text-xs text-slate-400 uppercase font-semibold">Room Code</span>
        <p className="text-3xl font-mono font-extrabold text-pink-400 tracking-widest">
          {game.code || game.id.substring(0, 6).toUpperCase()}
        </p>
        <button
          onClick={onCopyLink}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 transition active:scale-95"
        >
          {copied ? '✓ Link Copied!' : '🔗 Copy Invite Link'}
        </button>
      </div>

      {/* Players Connected */}
      <div className="flex justify-around items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
        <div className="text-center">
          <span className="font-bold text-pink-300">{game.player_a_name || 'Waiting...'}</span>
        </div>
        <span className="text-slate-600 font-bold">💕</span>
        <div className="text-center">
          <span className="font-bold text-indigo-300">{game.player_b_name || 'Waiting...'}</span>
        </div>
      </div>

      {game.player_a_name && game.player_b_name ? (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Couples Arcade (6 Games):</h3>

          {/* QUIZ SELECTOR SECTION */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left space-y-3">
            <span className="font-bold text-pink-400 text-sm block">🧠 1. Couples Quiz (Levels 1-15)</span>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-1">
              {Object.entries(LEVEL_NAMES).map(([lvlStr, title]) => {
                const lvlNum = Number(lvlStr);
                return (
                  <button
                    key={lvlNum}
                    onClick={() => onStartQuiz(lvlNum)}
                    className="p-2 bg-slate-900 hover:bg-pink-500/20 border border-slate-800 hover:border-pink-500/50 rounded-lg text-left text-xs transition"
                  >
                    <span className="block font-bold text-slate-200">Lvl {lvlNum}</span>
                    <span className="text-[10px] text-slate-400 truncate block">{title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5-GAME ARCADE GRID LAYOUT */}
          <div className="grid grid-cols-2 gap-3">
            {/* Game 2: Would You Rather */}
            <button
              onClick={onStartWouldYouRather}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left flex flex-col justify-between transition group"
            >
              <span className="text-xl mb-1">🤖</span>
              <div>
                <span className="font-bold text-amber-400 text-xs block">Would You Rather?</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Groq AI Dilemma Engine</span>
              </div>
            </button>

            {/* Game 3: Connect 4 */}
            <button
              onClick={onStartConnect4}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left flex flex-col justify-between transition group"
            >
              <span className="text-xl mb-1">🔴🔵</span>
              <div>
                <span className="font-bold text-emerald-400 text-xs block">Connect 4</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Red vs Blue Drop Battle</span>
              </div>
            </button>

            {/* Game 4: Tic-Tac-Toe */}
            <button
              onClick={onStartTicTacToe}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left flex flex-col justify-between transition group"
            >
              <span className="text-xl mb-1">❌⭕</span>
              <div>
                <span className="font-bold text-indigo-400 text-xs block">Tic-Tac-Toe</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Classic X vs O</span>
              </div>
            </button>

            {/* Game 5: Couples Battleship */}
            <button
              onClick={onStartBattleship}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left flex flex-col justify-between transition group"
            >
              <span className="text-xl mb-1">🚢</span>
              <div>
                <span className="font-bold text-rose-400 text-xs block">Couples Battleship</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Hide & Find 3 Hearts</span>
              </div>
            </button>

            {/* Game 6: Secret Wordle */}
            <button
              onClick={onStartWordle}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left flex flex-col justify-between col-span-2 transition group"
            >
              <span className="text-xl mb-1">🔤</span>
              <div>
                <span className="font-bold text-purple-400 text-xs block">Secret Wordle for Couples</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Pick a 5-letter secret word for your partner to guess!</span>
              </div>
            </button>
          </div>

          <button
            onClick={onExitRoom}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-xs transition mt-4"
          >
            🚪 Exit Room (Deletes Data)
          </button>
        </div>
      ) : (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm">
          Waiting for partner to join room...
        </div>
      )}
    </div>
  );
}