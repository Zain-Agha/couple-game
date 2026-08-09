'use client';

import { supabase } from '@/lib/supabase';
import { playSound } from '../page';
import confetti from 'canvas-confetti';

export default function DotsAndBoxes({ game, role, onReturnToHub }: any) {
  const state = game?.dotsandboxes_state || { lines: [], boxes: {}, turn: 'player_a', winner: null };

  const drawnLines: string[] = state.lines || [];
  const claimedBoxes: { [key: string]: string } = state.boxes || {};

  // 8x8 Boxes = 9x9 Dots (81 Dots Total, 64 Boxes Total)
  const BOX_COUNT = 8;
  const SPACING = 36; // Scaled for mobile screens
  const OFFSET = 15;  // Margin offset

  const handleDrawLine = async (lineId: string) => {
    if (drawnLines.includes(lineId) || state.winner || state.turn !== role) return;
    playSound('click');

    const newLines = [...drawnLines, lineId];
    const newBoxes = { ...claimedBoxes };
    let boxClaimed = false;

    // Check all 64 boxes (8x8 grid)
    for (let r = 0; r < BOX_COUNT; r++) {
      for (let c = 0; c < BOX_COUNT; c++) {
        const boxKey = `${r}_${c}`;
        if (!newBoxes[boxKey]) {
          const top = `h_${r}_${c}`;
          const bottom = `h_${r + 1}_${c}`;
          const left = `v_${r}_${c}`;
          const right = `v_${r}_${c + 1}`;

          if (newLines.includes(top) && newLines.includes(bottom) && newLines.includes(left) && newLines.includes(right)) {
            newBoxes[boxKey] = role === 'player_a' ? game.player_a_name : game.player_b_name;
            boxClaimed = true;
          }
        }
      }
    }

    let winner = null;
    if (Object.keys(newBoxes).length === BOX_COUNT * BOX_COUNT) {
      const p1Score = Object.values(newBoxes).filter((v) => v === game.player_a_name).length;
      const p2Score = Object.values(newBoxes).filter((v) => v === game.player_b_name).length;
      if (p1Score > p2Score) winner = game.player_a_name;
      else if (p2Score > p1Score) winner = game.player_b_name;
      else winner = 'Tie';

      playSound('fanfare');
      confetti({ particleCount: 120, spread: 80 });
    }

    // Player keeps turn if they completed a box!
    const nextTurn = boxClaimed ? state.turn : state.turn === 'player_a' ? 'player_b' : 'player_a';
    const newState = { lines: newLines, boxes: newBoxes, turn: nextTurn, winner };

    await supabase.from('games').update({ dotsandboxes_state: newState }).eq('id', game.id);
  };

  const handleResetDots = async () => {
    playSound('click');
    const resetState = { lines: [], boxes: {}, turn: 'player_a', winner: null };
    await supabase.from('games').update({ dotsandboxes_state: resetState }).eq('id', game.id);
  };

  const p1Score = Object.values(claimedBoxes).filter((v) => v === game.player_a_name).length;
  const p2Score = Object.values(claimedBoxes).filter((v) => v === game.player_b_name).length;
  const totalClaimed = Object.keys(claimedBoxes).length;

  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="font-bold text-amber-400 text-sm">⏹️ 8x8 Dots & Boxes (64 Boxes)</span>
        <button onClick={onReturnToHub} className="text-xs text-slate-400 hover:text-white">
          ← Back to Hub
        </button>
      </div>

      {/* PROMINENT LIVE SCOREBOARD */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
        <div className="p-2 bg-pink-500/10 border border-pink-500/30 rounded-lg">
          <span className="text-xs text-pink-300 font-semibold block truncate">{game.player_a_name}</span>
          <span className="text-2xl font-extrabold text-pink-400">{p1Score} <span className="text-[10px] text-slate-400 font-normal">Boxes</span></span>
        </div>
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
          <span className="text-xs text-indigo-300 font-semibold block truncate">{game.player_b_name}</span>
          <span className="text-2xl font-extrabold text-indigo-400">{p2Score} <span className="text-[10px] text-slate-400 font-normal">Boxes</span></span>
        </div>
      </div>

      {state.winner ? (
        <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 font-bold text-sm">
          🏆 {state.winner === 'Tie' ? "It's a Tie!" : `${state.winner} Wins with Most Boxes! 🎉`}
        </div>
      ) : (
        <div className="flex justify-between items-center text-xs text-slate-400 px-1">
          <span>{64 - totalClaimed} Boxes Remaining</span>
          <span>
            Turn: <strong className={state.turn === 'player_a' ? 'text-pink-400' : 'text-indigo-400'}>
              {state.turn === role ? 'YOUR TURN! ▼' : `Waiting for ${state.turn === 'player_a' ? game.player_a_name : game.player_b_name}...`}
            </strong>
          </span>
        </div>
      )}

      {/* 8x8 VECTOR SVG BOARD (64 Boxes, 81 Dots) */}
      <div className="flex justify-center p-2 bg-slate-950 border border-slate-800 rounded-2xl max-w-[330px] mx-auto shadow-inner">
        <svg width="318" height="318" viewBox="0 0 318 318" className="select-none">
          {/* 1. Claimed Boxes */}
          {Array.from({ length: BOX_COUNT }).map((_, r) =>
            Array.from({ length: BOX_COUNT }).map((_, c) => {
              const boxKey = `${r}_${c}`;
              const owner = claimedBoxes[boxKey];
              if (!owner) return null;

              const isP1 = owner === game.player_a_name;
              const x = OFFSET + c * SPACING;
              const y = OFFSET + r * SPACING;

              return (
                <g key={boxKey}>
                  <rect
                    x={x}
                    y={y}
                    width={SPACING}
                    height={SPACING}
                    fill={isP1 ? '#ec4899' : '#818cf8'}
                    fillOpacity={0.35}
                    rx={3}
                  />
                  <text
                    x={x + SPACING / 2}
                    y={y + SPACING / 2 + 3}
                    fill={isP1 ? '#f472b6' : '#a5b4fc'}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {owner.substring(0, 2).toUpperCase()}
                  </text>
                </g>
              );
            })
          )}

          {/* 2. Horizontal Lines */}
          {Array.from({ length: BOX_COUNT + 1 }).map((_, r) =>
            Array.from({ length: BOX_COUNT }).map((_, c) => {
              const lineId = `h_${r}_${c}`;
              const drawn = drawnLines.includes(lineId);
              const x1 = OFFSET + c * SPACING;
              const y1 = OFFSET + r * SPACING;
              const x2 = x1 + SPACING;

              return (
                <g key={lineId}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y1}
                    stroke={drawn ? '#f59e0b' : '#334155'}
                    strokeWidth={drawn ? '3.5' : '1.5'}
                    strokeLinecap="round"
                  />
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y1}
                    stroke="transparent"
                    strokeWidth="12"
                    className="cursor-pointer"
                    onClick={() => handleDrawLine(lineId)}
                  />
                </g>
              );
            })
          )}

          {/* 3. Vertical Lines */}
          {Array.from({ length: BOX_COUNT }).map((_, r) =>
            Array.from({ length: BOX_COUNT + 1 }).map((_, c) => {
              const lineId = `v_${r}_${c}`;
              const drawn = drawnLines.includes(lineId);
              const x1 = OFFSET + c * SPACING;
              const y1 = OFFSET + r * SPACING;
              const y2 = y1 + SPACING;

              return (
                <g key={lineId}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x1}
                    y2={y2}
                    stroke={drawn ? '#f59e0b' : '#334155'}
                    strokeWidth={drawn ? '3.5' : '1.5'}
                    strokeLinecap="round"
                  />
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x1}
                    y2={y2}
                    stroke="transparent"
                    strokeWidth="12"
                    className="cursor-pointer"
                    onClick={() => handleDrawLine(lineId)}
                  />
                </g>
              );
            })
          )}

          {/* 4. Dots (81 Golden Circles) */}
          {Array.from({ length: BOX_COUNT + 1 }).map((_, r) =>
            Array.from({ length: BOX_COUNT + 1 }).map((_, c) => (
              <circle
                key={`dot_${r}_${c}`}
                cx={OFFSET + c * SPACING}
                cy={OFFSET + r * SPACING}
                r="3.5"
                fill="#f59e0b"
              />
            ))
          )}
        </svg>
      </div>

      <button onClick={handleResetDots} className="w-full py-2 bg-slate-800 text-xs rounded-xl font-bold">
        Reset Board 🔄
      </button>
    </div>
  );
}