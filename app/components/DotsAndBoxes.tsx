'use client';

import { supabase } from '@/lib/supabase';
import { playSound } from '../page';
import confetti from 'canvas-confetti';

export default function DotsAndBoxes({ game, role, onReturnToHub }: any) {
  const state = game?.dotsandboxes_state || { lines: [], boxes: {}, turn: 'player_a', winner: null };

  const drawnLines: string[] = state.lines || [];
  const claimedBoxes: { [key: string]: string } = state.boxes || {};

  const handleDrawLine = async (lineId: string) => {
    if (drawnLines.includes(lineId) || state.winner || state.turn !== role) return;
    playSound('click');

    const newLines = [...drawnLines, lineId];
    const newBoxes = { ...claimedBoxes };
    let boxClaimed = false;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
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
    if (Object.keys(newBoxes).length === 9) {
      const p1Score = Object.values(newBoxes).filter((v) => v === game.player_a_name).length;
      const p2Score = Object.values(newBoxes).filter((v) => v === game.player_b_name).length;
      if (p1Score > p2Score) winner = game.player_a_name;
      else if (p2Score > p1Score) winner = game.player_b_name;
      else winner = 'Tie';

      playSound('fanfare');
      confetti({ particleCount: 120, spread: 80 });
    }

    const nextTurn = boxClaimed ? state.turn : state.turn === 'player_a' ? 'player_b' : 'player_a';
    const newState = { lines: newLines, boxes: newBoxes, turn: nextTurn, winner };

    await supabase.from('games').update({ dotsandboxes_state: newState }).eq('id', game.id);
  };

  const handleResetDots = async () => {
    playSound('click');
    const resetState = { lines: [], boxes: {}, turn: 'player_a', winner: null };
    await supabase.from('games').update({ dotsandboxes_state: resetState }).eq('id', game.id);
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="font-bold text-amber-400 text-sm">⏹️ Dots & Boxes</span>
        <button onClick={onReturnToHub} className="text-xs text-slate-400 hover:text-white">
          ← Back to Hub
        </button>
      </div>

      {state.winner ? (
        <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 font-bold text-sm">
          🏆 {state.winner === 'Tie' ? "Tie Game!" : `${state.winner} Completed the Most Boxes!`}
        </div>
      ) : (
        <p className="text-xs text-slate-400">
          Turn: <strong className="text-slate-200">{state.turn === role ? 'YOUR TURN! Tap a line ▼' : 'Waiting for partner...'}</strong>
        </p>
      )}

      <div className="max-w-[260px] mx-auto p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
        {[0, 1, 2].map((r) => (
          <div key={r} className="space-y-2">
            <div className="flex justify-between items-center">
              {[0, 1, 2].map((c) => {
                const lineId = `h_${r}_${c}`;
                const drawn = drawnLines.includes(lineId);
                return (
                  <div key={c} className="flex items-center flex-1">
                    <div className="w-3 h-3 bg-amber-400 rounded-full" />
                    <button
                      onClick={() => handleDrawLine(lineId)}
                      disabled={drawn || !!state.winner || state.turn !== role}
                      className={`h-2 flex-1 rounded transition ${
                        drawn ? 'bg-amber-400' : 'bg-slate-800 hover:bg-amber-400/50'
                      }`}
                    />
                  </div>
                );
              })}
              <div className="w-3 h-3 bg-amber-400 rounded-full" />
            </div>

            {r < 3 && (
              <div className="flex justify-between items-center">
                {[0, 1, 2, 3].map((c) => {
                  const lineId = `v_${r}_${c}`;
                  const drawn = drawnLines.includes(lineId);
                  const boxOwner = c < 3 ? claimedBoxes[`${r}_${c}`] : null;

                  return (
                    <div key={c} className="flex items-center flex-1 justify-between">
                      <button
                        onClick={() => handleDrawLine(lineId)}
                        disabled={drawn || !!state.winner || state.turn !== role}
                        className={`w-2 h-10 rounded transition ${
                          drawn ? 'bg-amber-400' : 'bg-slate-800 hover:bg-amber-400/50'
                        }`}
                      />
                      {c < 3 && (
                        <div className="flex-1 h-10 flex items-center justify-center text-[10px] font-bold text-amber-300">
                          {boxOwner ? boxOwner.substring(0, 3) : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={handleResetDots} className="w-full py-2 bg-slate-800 text-xs rounded-xl font-bold">
        Reset Game 🔄
      </button>
    </div>
  );
}