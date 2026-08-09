'use client';

import { LEVEL_NAMES } from '../page';

const MODE_CONFIGS: { [key: string]: { icon: string; title: string; desc: string; badgeColor: string } } = {
  couples: { icon: '💕', title: 'Couples', desc: '15 Levels of Romance & Intimacy', badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  friends: { icon: '⚡', title: 'Friends', desc: 'Witty Pet Peeves & Funny Habits', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  siblings: { icon: '🏠', title: 'Siblings & Family', desc: 'Childhood Memories & Family Feud', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  kids: { icon: '🎈', title: 'Kids & Family Safe', desc: 'Cartoons, Superpowers & Fun', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
};

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
  const modeKey = game.relationship_mode || 'couples';
  const modeInfo = MODE_CONFIGS[modeKey] || MODE_CONFIGS.couples;

  return (
    <div className="space-y-6 text-center">
      {/* Room Code Header */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
        <div className="flex justify-center items-center gap-2 mb-1">
          <span className={`px-3 py-1 border rounded-full text-xs font-bold ${modeInfo.badgeColor}`}>
            {modeInfo.icon} {modeInfo.title} Mode
          </span>
        </div>
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
        <span className="text-xl">{modeInfo.icon}</span>
        <div className="text-center">
          <span className="font-bold text-indigo-300">{game.player_b_name || 'Waiting...'}</span>
        </div>
      </div>

      {game.player_a_name && game.player_b_name ? (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Arcade Activities:</h3>

          {/* QUIZ SELECTOR SECTION */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left space-y-3">
            <span className="font-bold text-pink-400 text-sm block">🧠 1. {modeInfo.title} Quiz</span>
            
            {modeKey === 'couples' ? (
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
            ) : (
              <button
                onClick={() => onStartQuiz(1)}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 rounded-xl font-bold text-xs transition text-center"
              >
                Start {modeInfo.title} Trivia Challenge 🚀
              </button>
            )}
          </div>

          {/* 5-GAME ARCADE GRID LAYOUT */}
          <div className="grid grid-cols-2 gap-3">
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

            <button
              onClick={onStartBattleship}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left flex flex-col justify-between transition group"
            >
              <span className="text-xl mb-1">🚢</span>
              <div>
                <span className="font-bold text-rose-400 text-xs block">Battleship</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Hide & Find 3 Targets</span>
              </div>
            </button>

            <button
              onClick={onStartWordle}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left flex flex-col justify-between col-span-2 transition group"
            >
              <span className="text-xl mb-1">🔤</span>
              <div>
                <span className="font-bold text-purple-400 text-xs block">Secret Wordle</span>
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