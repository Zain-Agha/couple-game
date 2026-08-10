'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

import WouldYouRather from './components/WouldYouRather';
import Battleship from './components/Battleship';
import Wordle from './components/Wordle';
import TruthOrDare from './components/TruthOrDare';
import DotsAndBoxes from './components/DotsAndBoxes';
import NamePlace from './components/NamePlace';
import WordChain from './components/WordChain';
import BirthdayVault from './components/BirthdayVault';

export const LEVEL_NAMES: { [key: number]: string } = {
  1: 'The Basics', 2: 'Food & Cravings', 3: 'Hobbies & Chill', 4: 'Daily Routines', 5: 'Pet Peeves',
  6: 'Travel & Dreams', 7: 'Childhood Memories', 8: 'Personality & Heart', 9: 'Style & Vibe',
  10: 'How We Met', 11: 'Romantic Memories', 12: 'Love Languages', 13: 'Core Values',
  14: 'Fears & Vulnerabilities', 15: 'Deep Soulmates',
};

const MODE_CONFIGS: { [key: string]: { icon: string; title: string; desc: string; badgeColor: string } } = {
  couples: { icon: '💕', title: 'Couples', desc: '15 Levels of Romance & Intimacy', badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  friends: { icon: '⚡', title: 'Friends', desc: 'Witty Pet Peeves & Funny Habits', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  siblings: { icon: '🏠', title: 'Siblings & Family', desc: 'Childhood Memories & Family Feud', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  kids: { icon: '🎈', title: 'Kids & Family Safe', desc: 'Cartoons, Superpowers & Fun', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
};

// INLINED ROOM HUB COMPONENT
function RoomHub({
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
  onStartTruthOrDare,
  onStartDotsAndBoxes,
  onStartNamePlace,
  onStartWordChain,
  onStartBirthdayVault,
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
          {/* SECRET CELEBRATION VAULT BUTTON */}
          <button
            onClick={onStartBirthdayVault}
            className="w-full p-4 bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-amber-500/20 border border-amber-500/50 hover:border-amber-400 rounded-xl text-left flex justify-between items-center transition group shadow-lg shadow-amber-500/10"
          >
            <div>
              <span className="font-extrabold text-amber-300 text-sm block">🎁 Secret Celebration Vault (Password Protected)</span>
              <span className="text-[10px] text-slate-300 block">Private message vault & compliment generator 🔑</span>
            </div>
            <span className="text-lg group-hover:scale-110 transition">🔐</span>
          </button>

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Arcade Games (10 Games):</h3>

          {/* QUIZ SECTION */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left space-y-3">
            <span className="font-bold text-pink-400 text-sm block">🧠 1. {modeInfo.title} Quiz</span>
            {modeKey === 'couples' ? (
              <div className="grid grid-cols-3 gap-2 max-h-28 overflow-y-auto pr-1">
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

          {/* 9-GAME ARCADE GRID */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onStartTruthOrDare} className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left">
              <span className="text-lg block mb-1">🔥</span>
              <span className="font-bold text-rose-400 text-xs block">Truth or Dare</span>
              <span className="text-[9px] text-slate-400 block">AI Prompts</span>
            </button>

            <button onClick={onStartWouldYouRather} className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left">
              <span className="text-lg block mb-1">🤖</span>
              <span className="font-bold text-amber-400 text-xs block">Would You Rather</span>
              <span className="text-[9px] text-slate-400 block">AI Dilemmas</span>
            </button>

            <button onClick={onStartConnect4} className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left">
              <span className="text-lg block mb-1">🔴🔵</span>
              <span className="font-bold text-emerald-400 text-xs block">Connect 4</span>
              <span className="text-[9px] text-slate-400 block">4-in-a-Row</span>
            </button>

            <button onClick={onStartTicTacToe} className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left">
              <span className="text-lg block mb-1">❌⭕</span>
              <span className="font-bold text-indigo-400 text-xs block">Tic-Tac-Toe</span>
              <span className="text-[9px] text-slate-400 block">X vs O</span>
            </button>

            <button onClick={onStartBattleship} className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left">
              <span className="text-lg block mb-1">🚢</span>
              <span className="font-bold text-rose-300 text-xs block">Battleship</span>
              <span className="text-[9px] text-slate-400 block">Find Hearts</span>
            </button>

            <button onClick={onStartWordle} className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left">
              <span className="text-lg block mb-1">🔤</span>
              <span className="font-bold text-purple-400 text-xs block">Secret Wordle</span>
              <span className="text-[9px] text-slate-400 block">Guess Word</span>
            </button>

            <button onClick={onStartDotsAndBoxes} className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left">
              <span className="text-lg block mb-1">⏹️</span>
              <span className="font-bold text-amber-300 text-xs block">Dots & Boxes</span>
              <span className="text-[9px] text-slate-400 block">Box Claim</span>
            </button>

            <button onClick={onStartNamePlace} className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left">
              <span className="text-lg block mb-1">📝</span>
              <span className="font-bold text-cyan-400 text-xs block">Name Place...</span>
              <span className="text-[9px] text-slate-400 block">Letter Race</span>
            </button>

            <button onClick={onStartWordChain} className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left col-span-2">
              <span className="text-lg block mb-1">🔗</span>
              <span className="font-bold text-teal-400 text-xs block">Word Chain (Shiritori)</span>
              <span className="text-[9px] text-slate-400 block">Connect words by last letter!</span>
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

export const playSound = (type: 'click' | 'success' | 'fanfare') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'fanfare') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    }
  } catch (e) {}
};

const generateShortCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function Home() {
  const [mode, setMode] = useState<any>('menu');
  const [role, setRole] = useState<'player_a' | 'player_b' | null>(null);
  const [name, setName] = useState('');
  const [gameCodeInput, setGameCodeInput] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedRelationshipMode, setSelectedRelationshipMode] = useState<'couples' | 'friends' | 'siblings' | 'kids'>('couples');
  const [game, setGame] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submittedRound, setSubmittedRound] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'player_a' | 'player_b'>('player_a');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code');
    if (urlCode) {
      setGameCodeInput(urlCode.toUpperCase());
      setMode('join');
    }
  }, []);

  useEffect(() => {
    if (!game?.id) return;

    const channel = supabase
      .channel(`game_${game.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${game.id}`,
        },
        async (payload) => {
          const updatedGame = payload.new;
          setGame(updatedGame);

          if (updatedGame.status === 'in_hub') setMode('hub');
          else if (updatedGame.status === 'round_1' || updatedGame.status === 'round_2') {
            setMode('quiz');
            setSubmittedRound(false);
            setCurrentQIndex(0);
            setUserAnswers({});
            playSound('success');
            await loadQuestions(updatedGame.current_level || 1, updatedGame.relationship_mode || 'couples');
          } else if (updatedGame.status === 'finished') {
            await fetchResults(updatedGame.id);
            setMode('results');
            playSound('fanfare');
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          } else if (updatedGame.status === 'playing_tictactoe') setMode('tictactoe');
          else if (updatedGame.status === 'playing_connect4') setMode('connect4');
          else if (updatedGame.status === 'playing_wouldyourather') setMode('wouldyourather');
          else if (updatedGame.status === 'playing_battleship') setMode('battleship');
          else if (updatedGame.status === 'playing_wordle') setMode('wordle');
          else if (updatedGame.status === 'playing_truthordare') setMode('truthordare');
          else if (updatedGame.status === 'playing_dotsandboxes') setMode('dotsandboxes');
          else if (updatedGame.status === 'playing_nameplace') setMode('nameplace');
          else if (updatedGame.status === 'playing_wordchain') setMode('wordchain');
          else if (updatedGame.status === 'playing_birthdayvault') setMode('birthdayvault');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game?.id]);

  const loadQuestions = async (lvl: number, relMode: string) => {
    let targetLevel = lvl;
    if (relMode === 'friends') targetLevel = 101;
    else if (relMode === 'siblings') targetLevel = 201;
    else if (relMode === 'kids') targetLevel = 301;

    const { data } = await supabase.from('questions').select('*').eq('level', targetLevel).order('id', { ascending: true });
    if (data && data.length > 0) setQuestions(data);
  };

  const handleCreateGame = async () => {
    if (!name.trim()) return setError('Please enter your name');
    playSound('click');
    setLoading(true);
    setError('');

    // Trigger automatic background cleanup of abandoned rooms older than 2 hours!
    try {
      await supabase.rpc('cleanup_old_games');
    } catch (e) {
      console.log('Cleanup trigger complete');
    }

    const shortCode = generateShortCode();

    const { data, error } = await supabase
      .from('games')
      .insert([{
        player_a_name: name,
        status: 'in_hub',
        current_level: selectedLevel,
        code: shortCode,
        relationship_mode: selectedRelationshipMode,
        current_game_type: 'quiz'
      }])
      .select().single();

    setLoading(false);
    if (error) setError('Could not create room.');
    else {
      setGame(data);
      setRole('player_a');
      setMode('hub');
      playSound('success');
      await loadQuestions(selectedLevel, selectedRelationshipMode);
    }
  };

  const handleJoinGame = async () => {
    if (!name.trim()) return setError('Please enter your name');
    if (!gameCodeInput.trim()) return setError('Please enter Room Code');
    playSound('click');
    setLoading(true);
    setError('');

    const cleanCode = gameCodeInput.trim().toUpperCase();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanCode);

    const { data: existingGame, error: fetchErr } = isUUID
      ? await supabase.from('games').select('*').eq('id', cleanCode).maybeSingle()
      : await supabase.from('games').select('*').eq('code', cleanCode).maybeSingle();

    if (fetchErr || !existingGame) {
      setLoading(false);
      return setError('Room not found! Check code.');
    }

    const { data: updatedGame, error } = await supabase
      .from('games')
      .update({ player_b_name: name, status: 'in_hub' })
      .eq('id', existingGame.id)
      .select().single();

    setLoading(false);
    if (error || !updatedGame) setError('Could not join room.');
    else {
      setGame(updatedGame);
      setRole('player_b');
      setMode('hub');
      playSound('success');
      setSelectedLevel(updatedGame.current_level || 1);
      setSelectedRelationshipMode(updatedGame.relationship_mode || 'couples');
      await loadQuestions(updatedGame.current_level || 1, updatedGame.relationship_mode || 'couples');
    }
  };

  const handleStartQuiz = async (lvl: number) => {
    playSound('click');
    setSelectedLevel(lvl);
    await loadQuestions(lvl, game.relationship_mode || 'couples');
    await supabase.from('answers').delete().eq('game_id', game.id);
    await supabase.from('games').update({ status: 'round_1', current_level: lvl, current_game_type: 'quiz' }).eq('id', game.id);
  };

  const handleStartWouldYouRather = async () => {
    playSound('click');
    const initState = { prompt: '', option_a: '', option_b: '', choice_a: null, choice_b: null };
    await supabase.from('games').update({ status: 'playing_wouldyourather', current_game_type: 'wouldyourather', wouldyourather_state: initState }).eq('id', game.id);
  };

  const handleStartConnect4 = async () => {
    playSound('click');
    const initialC4 = { board: Array(42).fill(''), turn: 'player_a', winner: null };
    await supabase.from('games').update({ status: 'playing_connect4', current_game_type: 'connect4', bingo_state: initialC4 }).eq('id', game.id);
  };

  const handleStartTicTacToe = async () => {
    playSound('click');
    const initialTTT = { board: ['', '', '', '', '', '', '', '', ''], turn: 'player_a', winner: null };
    await supabase.from('games').update({ status: 'playing_tictactoe', current_game_type: 'tictactoe', tictactoe_state: initialTTT }).eq('id', game.id);
  };

  const handleStartBattleship = async () => {
    playSound('click');
    const initState = { p1_hearts: [], p2_hearts: [], p1_guesses: [], p2_guesses: [], turn: 'player_a', winner: null };
    await supabase.from('games').update({ status: 'playing_battleship', current_game_type: 'battleship', battleship_state: initState }).eq('id', game.id);
  };

  const handleStartWordle = async () => {
    playSound('click');
    const initState = { word_a: '', word_b: '', guesses_a: [], guesses_b: [], winner: null };
    await supabase.from('games').update({ status: 'playing_wordle', current_game_type: 'wordle', wordle_state: initState }).eq('id', game.id);
  };

  const handleStartTruthOrDare = async () => {
    playSound('click');
    const initState = { prompt: '', type: null };
    await supabase.from('games').update({ status: 'playing_truthordare', current_game_type: 'truthordare', truthordare_state: initState }).eq('id', game.id);
  };

  const handleStartDotsAndBoxes = async () => {
    playSound('click');
    const initState = { lines: [], boxes: {}, turn: 'player_a', winner: null };
    await supabase.from('games').update({ status: 'playing_dotsandboxes', current_game_type: 'dotsandboxes', dotsandboxes_state: initState }).eq('id', game.id);
  };

  const handleStartNamePlace = async () => {
    playSound('click');
    const initState = { letter: '', p1_inputs: {}, p2_inputs: {}, result: null };
    await supabase.from('games').update({ status: 'playing_nameplace', current_game_type: 'nameplace', nameplace_state: initState }).eq('id', game.id);
  };

  const handleStartWordChain = async () => {
    playSound('click');
    const initState = { words: [], turn: 'player_a', winner: null };
    await supabase.from('games').update({ status: 'playing_wordchain', current_game_type: 'wordchain', wordchain_state: initState }).eq('id', game.id);
  };

  const handleStartBirthdayVault = async () => {
    playSound('click');
    await supabase.from('games').update({ status: 'playing_birthdayvault', current_game_type: 'birthdayvault' }).eq('id', game.id);
  };

  const handleReturnToHub = async () => {
    playSound('click');
    await supabase.from('games').update({ status: 'in_hub' }).eq('id', game.id);
  };

  const handleExitRoom = async () => {
    playSound('click');
    if (game?.id) {
      await supabase.from('answers').delete().eq('game_id', game.id);
      await supabase.from('games').delete().eq('id', game.id);
    }
    setGame(null);
    setRole(null);
    setMode('menu');
  };

  const handleCopyLink = () => {
    const roomCode = game.code || game.id;
    const shareUrl = `${window.location.origin}?code=${roomCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    playSound('click');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitRoundAnswers = async () => {
    playSound('click');
    setLoading(true);
    const roundFocus = game.status === 'round_1' ? 'player_a' : 'player_b';
    const isFocusPlayer = (game.status === 'round_1' && role === 'player_a') || (game.status === 'round_2' && role === 'player_b');

    for (const q of questions) {
      const text = userAnswers[q.id] || '';
      const { data: existing } = await supabase.from('answers').select('*').eq('game_id', game.id).eq('question_id', q.id).eq('round_focus', roundFocus).single();

      if (existing) {
        const updateData = isFocusPlayer ? { real_answer: text } : { guessed_answer: text };
        await supabase.from('answers').update(updateData).eq('id', existing.id);
      } else {
        const insertData = {
          game_id: game.id,
          question_id: q.id,
          round_focus: roundFocus,
          ...(isFocusPlayer ? { real_answer: text } : { guessed_answer: text }),
        };
        await supabase.from('answers').insert([insertData]);
      }
    }

    setSubmittedRound(true);
    setLoading(false);
    checkAndAdvanceRound();
  };

  const checkAndAdvanceRound = async () => {
    const currentRoundFocus = game.status === 'round_1' ? 'player_a' : 'player_b';
    const { data: answers } = await supabase.from('answers').select('*').eq('game_id', game.id).eq('round_focus', currentRoundFocus);

    if (answers && answers.length >= questions.length) {
      const allComplete = answers.filter((a) => a.real_answer && a.guessed_answer).length === questions.length;

      if (allComplete) {
        if (game.status === 'round_1') await supabase.from('games').update({ status: 'round_2' }).eq('id', game.id);
        else if (game.status === 'round_2') evaluateAllAnswersAndFinish();
      }
    }
  };

  const evaluateAllAnswersAndFinish = async () => {
    setEvaluating(true);
    const { data: allAnswers } = await supabase.from('answers').select('*, questions(question_text)').eq('game_id', game.id);

    if (allAnswers) {
      for (const ans of allAnswers) {
        if (ans.real_answer && ans.guessed_answer) {
          try {
            const res = await fetch('/api/check-answer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                realAnswer: ans.real_answer,
                guessedAnswer: ans.guessed_answer,
                relationshipMode: game.relationship_mode || 'couples',
              }),
            });
            const evalData = await res.json();
            await supabase.from('answers').update({ is_correct: evalData.isCorrect }).eq('id', ans.id);
          } catch (e) {
            console.error('Eval error', e);
          }
        }
      }
    }

    await supabase.from('games').update({ status: 'finished' }).eq('id', game.id);
    setEvaluating(false);
  };

  const fetchResults = async (gameId: string) => {
    const { data } = await supabase.from('answers').select('*, questions(question_text)').eq('game_id', gameId);
    if (data) setResultsData(data);
  };

  const handleTTTMove = async (index: number) => {
    if (!game?.tictactoe_state) return;
    const currentState = game.tictactoe_state;
    if (currentState.winner || currentState.board[index] !== '') return;
    if (currentState.turn !== role) return;

    playSound('click');
    const newBoard = [...currentState.board];
    newBoard[index] = role === 'player_a' ? '❌' : '⭕';

    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    let winner = null;
    for (const [a, b, c] of lines) {
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        winner = role === 'player_a' ? game.player_a_name : game.player_b_name;
      }
    }
    if (!winner && newBoard.every((cell) => cell !== '')) winner = 'Tie';

    const nextTurn = currentState.turn === 'player_a' ? 'player_b' : 'player_a';
    const updatedTTT = { board: newBoard, turn: nextTurn, winner };

    if (winner) {
      playSound('fanfare');
      confetti({ particleCount: 100, spread: 70 });
    }

    await supabase.from('games').update({ tictactoe_state: updatedTTT }).eq('id', game.id);
  };

  const handleConnect4Drop = async (colIndex: number) => {
    if (!game?.bingo_state || game.bingo_state.winner) return;
    if (game.bingo_state.turn !== role) return;

    const board = [...(game.bingo_state.board || Array(42).fill(''))];
    let placedRow = -1;
    for (let r = 5; r >= 0; r--) {
      const slotIdx = r * 7 + colIndex;
      if (board[slotIdx] === '') {
        placedRow = r;
        break;
      }
    }

    if (placedRow === -1) return;

    playSound('click');
    const chip = role === 'player_a' ? '🔴' : '🔵';
    const slotIdx = placedRow * 7 + colIndex;
    board[slotIdx] = chip;

    const checkWin = (b: string[], symbol: string) => {
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
          if (b[r*7+c] === symbol && b[r*7+c+1] === symbol && b[r*7+c+2] === symbol && b[r*7+c+3] === symbol) return true;
        }
      }
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 7; c++) {
          if (b[r*7+c] === symbol && b[(r+1)*7+c] === symbol && b[(r+2)*7+c] === symbol && b[(r+3)*7+c] === symbol) return true;
        }
      }
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          if (b[r*7+c] === symbol && b[(r+1)*7+c+1] === symbol && b[(r+2)*7+c+2] === symbol && b[(r+3)*7+c+3] === symbol) return true;
        }
      }
      for (let r = 3; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
          if (b[r*7+c] === symbol && b[(r-1)*7+c+1] === symbol && b[(r-2)*7+c+2] === symbol && b[(r-3)*7+c+3] === symbol) return true;
        }
      }
      return false;
    };

    let winner = null;
    if (checkWin(board, chip)) {
      winner = role === 'player_a' ? game.player_a_name : game.player_b_name;
      playSound('fanfare');
      confetti({ particleCount: 120, spread: 80 });
    } else if (board.every(cell => cell !== '')) {
      winner = 'Tie';
    }

    const nextTurn = game.bingo_state.turn === 'player_a' ? 'player_b' : 'player_a';
    const updatedC4 = { board, turn: nextTurn, winner };

    await supabase.from('games').update({ bingo_state: updatedC4 }).eq('id', game.id);
  };

  const currentQ = questions[currentQIndex];
  const isFocusPlayer =
    (game?.status === 'round_1' && role === 'player_a') ||
    (game?.status === 'round_2' && role === 'player_b');

  const focusName = game?.status === 'round_1' ? game?.player_a_name : game?.player_b_name;

  const scorePlayerA = resultsData.filter((r) => r.round_focus === 'player_b' && r.is_correct).length;
  const scorePlayerB = resultsData.filter((r) => r.round_focus === 'player_a' && r.is_correct).length;

  const playerAGuessesAboutB = resultsData.filter((r) => r.round_focus === 'player_b');
  const playerBGuessesAboutA = resultsData.filter((r) => r.round_focus === 'player_a');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex flex-col items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400">
          Two of Us 💕
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">How well do you really know each other?</p>
      </motion.div>

      <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <button onClick={() => { playSound('click'); setMode('create'); }} className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 rounded-xl font-bold text-lg transition active:scale-95">
                Create Room
              </button>
              <button onClick={() => { playSound('click'); setMode('join'); }} className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-lg transition active:scale-95">
                Join Room
              </button>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-200">Create Room</h2>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name (e.g. Alex)" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-pink-500" />

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Who are you playing with?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { playSound('click'); setSelectedRelationshipMode('couples'); }} className={`p-3 rounded-xl border text-left transition ${selectedRelationshipMode === 'couples' ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                    <span className="block text-sm font-bold mb-0.5">💕 Couples</span>
                    <span className="text-[10px] text-slate-400 block">Romance & Intimacy</span>
                  </button>

                  <button onClick={() => { playSound('click'); setSelectedRelationshipMode('friends'); }} className={`p-3 rounded-xl border text-left transition ${selectedRelationshipMode === 'friends' ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                    <span className="block text-sm font-bold mb-0.5">⚡ Friends</span>
                    <span className="text-[10px] text-slate-400 block">Witty & Funny Habits</span>
                  </button>

                  <button onClick={() => { playSound('click'); setSelectedRelationshipMode('siblings'); }} className={`p-3 rounded-xl border text-left transition ${selectedRelationshipMode === 'siblings' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                    <span className="block text-sm font-bold mb-0.5">🏠 Siblings & Family</span>
                    <span className="text-[10px] text-slate-400 block">Childhood Memories</span>
                  </button>

                  <button onClick={() => { playSound('click'); setSelectedRelationshipMode('kids'); }} className={`p-3 rounded-xl border text-left transition ${selectedRelationshipMode === 'kids' ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                    <span className="block text-sm font-bold mb-0.5">🎈 Kids & Family Safe</span>
                    <span className="text-[10px] text-slate-400 block">Cartoons & Superpowers</span>
                  </button>
                </div>
              </div>

              <button onClick={handleCreateGame} disabled={loading} className="w-full py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-bold transition disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Room'}
              </button>
              <button onClick={() => setMode('menu')} className="w-full py-2 text-sm text-slate-400">← Back</button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-200">Join Room</h2>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name (e.g. Sam)" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-pink-500 mb-2" />
              <input type="text" value={gameCodeInput} onChange={(e) => setGameCodeInput(e.target.value.toUpperCase())} placeholder="6-Character Code" maxLength={6} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white tracking-widest font-mono text-center text-lg uppercase focus:outline-none focus:border-pink-500" />
              <button onClick={handleJoinGame} disabled={loading} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold transition disabled:opacity-50">
                {loading ? 'Joining...' : 'Enter Room'}
              </button>
              <button onClick={() => setMode('menu')} className="w-full py-2 text-sm text-slate-400">← Back</button>
            </motion.div>
          )}

          {mode === 'hub' && game && (
            <RoomHub
              game={game}
              role={role}
              onCopyLink={handleCopyLink}
              copied={copied}
              onStartQuiz={handleStartQuiz}
              onStartWouldYouRather={handleStartWouldYouRather}
              onStartConnect4={handleStartConnect4}
              onStartTicTacToe={handleStartTicTacToe}
              onStartBattleship={handleStartBattleship}
              onStartWordle={handleStartWordle}
              onStartTruthOrDare={handleStartTruthOrDare}
              onStartDotsAndBoxes={handleStartDotsAndBoxes}
              onStartNamePlace={handleStartNamePlace}
              onStartWordChain={handleStartWordChain}
              onStartBirthdayVault={handleStartBirthdayVault}
              onExitRoom={handleExitRoom}
            />
          )}

          {mode === 'wouldyourather' && <WouldYouRather game={game} role={role} onReturnToHub={handleReturnToHub} />}
          {mode === 'battleship' && <Battleship game={game} role={role} onReturnToHub={handleReturnToHub} />}
          {mode === 'wordle' && <Wordle game={game} role={role} onReturnToHub={handleReturnToHub} />}
          {mode === 'truthordare' && <TruthOrDare game={game} role={role} onReturnToHub={handleReturnToHub} />}
          {mode === 'dotsandboxes' && <DotsAndBoxes game={game} role={role} onReturnToHub={handleReturnToHub} />}
          {mode === 'nameplace' && <NamePlace game={game} role={role} onReturnToHub={handleReturnToHub} />}
          {mode === 'wordchain' && <WordChain game={game} role={role} onReturnToHub={handleReturnToHub} />}
          {mode === 'birthdayvault' && <BirthdayVault onReturnToHub={handleReturnToHub} />}

          {mode === 'connect4' && game?.bingo_state && (
            <motion.div key="connect4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-center">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-400 text-sm">🔴🔵 Connect 4</span>
                <button onClick={handleReturnToHub} className="text-xs text-slate-400 hover:text-white">← Back to Hub</button>
              </div>

              <div className="flex justify-around items-center text-xs font-semibold">
                <span className={game.bingo_state.turn === 'player_a' ? 'text-pink-400 font-bold underline' : 'text-slate-400'}>🔴 {game.player_a_name}</span>
                <span className="text-slate-600">vs</span>
                <span className={game.bingo_state.turn === 'player_b' ? 'text-indigo-400 font-bold underline' : 'text-slate-400'}>🔵 {game.player_b_name}</span>
              </div>

              {game.bingo_state.winner ? (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-sm">
                  {game.bingo_state.winner === 'Tie' ? "🤝 Board Full!" : `🎉 ${game.bingo_state.winner} Got 4-in-a-Row! 🏆`}
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Turn: <strong className="text-slate-200">{game.bingo_state.turn === role ? 'YOUR TURN! Tap a column ▼' : `Waiting for ${game.bingo_state.turn === 'player_a' ? game.player_a_name : game.player_b_name}...`}</strong>
                </div>
              )}

              <div className="grid grid-cols-7 gap-1 max-w-[340px] mx-auto">
                {[0, 1, 2, 3, 4, 5, 6].map((colIdx) => (
                  <button key={colIdx} onClick={() => handleConnect4Drop(colIdx)} disabled={!!game.bingo_state.winner || game.bingo_state.turn !== role} className="py-1 bg-slate-800 hover:bg-emerald-500/30 text-emerald-400 rounded text-xs font-bold transition disabled:opacity-30">▼</button>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 max-w-[340px] mx-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                {(game.bingo_state.board || Array(42).fill('')).map((chip: string, idx: number) => (
                  <div key={idx} className="h-10 border border-slate-800/80 rounded-full flex items-center justify-center text-xl bg-slate-900">{chip}</div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={handleStartConnect4} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-xs transition">Play Again 🔄</button>
                <button onClick={handleReturnToHub} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs transition">Choose Another Activity 🎮</button>
              </div>
            </motion.div>
          )}

          {mode === 'tictactoe' && game?.tictactoe_state && (
            <motion.div key="tictactoe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 text-center">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="font-bold text-indigo-400 text-sm">❌⭕ Tic-Tac-Toe</span>
                <button onClick={handleReturnToHub} className="text-xs text-slate-400 hover:text-white">← Back to Hub</button>
              </div>

              <div className="flex justify-around items-center text-xs font-semibold">
                <span className={game.tictactoe_state.turn === 'player_a' ? 'text-pink-400 font-bold underline' : 'text-slate-400'}>❌ {game.player_a_name}</span>
                <span className="text-slate-600">vs</span>
                <span className={game.tictactoe_state.turn === 'player_b' ? 'text-indigo-400 font-bold underline' : 'text-slate-400'}>⭕ {game.player_b_name}</span>
              </div>

              {game.tictactoe_state.winner ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-bold text-sm">
                  {game.tictactoe_state.winner === 'Tie' ? "🤝 It's a Tie!" : `🏆 ${game.tictactoe_state.winner} Wins! 🎉`}
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Turn: <strong className="text-slate-200">{game.tictactoe_state.turn === role ? 'YOUR TURN!' : `Waiting for ${game.tictactoe_state.turn === 'player_a' ? game.player_a_name : game.player_b_name}...`}</strong>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
                {game.tictactoe_state.board.map((symbol: string, idx: number) => (
                  <button key={idx} onClick={() => handleTTTMove(idx)} disabled={symbol !== '' || !!game.tictactoe_state.winner || game.tictactoe_state.turn !== role} className="h-20 bg-slate-950 border border-slate-800 rounded-xl text-3xl flex items-center justify-center transition active:scale-95 disabled:opacity-80 font-bold">
                    {symbol}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={handleStartTicTacToe} className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold text-xs transition">Play Again 🔄</button>
                <button onClick={handleReturnToHub} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs transition">Choose Another Activity 🎮</button>
              </div>
            </motion.div>
          )}

          {/* QUIZ MODE WITH BACK TO HUB BUTTON */}
          {mode === 'quiz' && questions.length > 0 && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {evaluating ? (
                <div className="text-center py-12 space-y-4">
                  <div className="inline-block animate-spin text-4xl">🤖</div>
                  <h3 className="text-lg font-bold text-pink-300">Groq AI is judging the answers...</h3>
                  <p className="text-xs text-slate-400">Comparing your guesses to see who knows who best!</p>
                </div>
              ) : submittedRound ? (
                <div className="text-center py-12 space-y-4">
                  <div className="text-4xl animate-bounce">⏳</div>
                  <h3 className="text-lg font-bold text-slate-200">Answers Submitted!</h3>
                  <p className="text-sm text-slate-400">Waiting for your partner to finish...</p>
                  <button onClick={handleReturnToHub} className="py-2 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 mt-4 transition">
                    ← Back to Hub
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <span>Question {currentQIndex + 1} / {questions.length}</span>
                      <button onClick={handleReturnToHub} className="text-xs text-slate-400 hover:text-white transition">
                        ← Back to Hub
                      </button>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <motion.div className="bg-gradient-to-r from-pink-500 to-rose-500 h-full" animate={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={currentQIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-center min-h-[120px] flex flex-col justify-center">
                      <span className="text-xs font-semibold text-pink-400 block mb-1">{isFocusPlayer ? `Answer about YOURSELF:` : `Guess ${focusName}'s answer:`}</span>
                      <h3 className="text-lg font-bold text-white">{currentQ?.question_text}</h3>
                    </motion.div>
                  </AnimatePresence>

                  <input type="text" value={userAnswers[currentQ?.id] || ''} onChange={(e) => setUserAnswers({ ...userAnswers, [currentQ?.id]: e.target.value })} placeholder={isFocusPlayer ? 'Type your answer...' : `What would ${focusName} say?`} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-pink-500 transition" />

                  <div className="flex justify-between gap-3">
                    <button onClick={() => { playSound('click'); setCurrentQIndex(Math.max(0, currentQIndex - 1)); }} disabled={currentQIndex === 0} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold disabled:opacity-30 transition">← Previous</button>
                    {currentQIndex < questions.length - 1 ? (
                      <button onClick={() => { playSound('click'); setCurrentQIndex(currentQIndex + 1); }} className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-bold text-sm transition">Next →</button>
                    ) : (
                      <button onClick={handleSubmitRoundAnswers} disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition">{loading ? 'Submitting...' : 'Finish & Submit!'}</button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {mode === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">Final Score Reveal! 🎉</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl text-center">
                  <span className="text-xs text-pink-300 font-semibold block mb-1">{game.player_a_name}'s Score</span>
                  <span className="text-3xl font-extrabold text-pink-400">{scorePlayerA} / {questions.length}</span>
                </div>
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-center">
                  <span className="text-xs text-indigo-300 font-semibold block mb-1">{game.player_b_name}'s Score</span>
                  <span className="text-3xl font-extrabold text-indigo-400">{scorePlayerB} / {questions.length}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                <p className="text-sm font-bold text-amber-300">
                  {scorePlayerA > scorePlayerB ? `🏆 ${game.player_a_name} knows ${game.player_b_name} better!` : scorePlayerB > scorePlayerA ? `🏆 ${game.player_b_name} knows ${game.player_a_name} better!` : `🤝 It's a PERFECT TIE! You know each other equally well!`}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Answer Breakdown</h3>
                <div className="flex border-b border-slate-800">
                  <button onClick={() => { playSound('click'); setActiveTab('player_a'); }} className={`flex-1 py-2 text-xs font-bold transition border-b-2 ${activeTab === 'player_a' ? 'border-pink-500 text-pink-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{game.player_a_name}'s Guesses</button>
                  <button onClick={() => { playSound('click'); setActiveTab('player_b'); }} className={`flex-1 py-2 text-xs font-bold transition border-b-2 ${activeTab === 'player_b' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{game.player_b_name}'s Guesses</button>
                </div>

                {activeTab === 'player_a' && (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {playerAGuessesAboutB.map((res, i) => (
                      <div key={i} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-semibold">{res.questions?.question_text}</span>
                          <span className={res.is_correct ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{res.is_correct ? '✓ Correct' : '✗ Incorrect'}</span>
                        </div>
                        <div className="text-slate-400 flex justify-between pt-1 border-t border-slate-900 mt-1">
                          <span>{game.player_b_name}: <strong className="text-slate-200">{res.real_answer}</strong></span>
                          <span>{game.player_a_name} guessed: <strong className="text-slate-200">{res.guessed_answer}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'player_b' && (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {playerBGuessesAboutA.map((res, i) => (
                      <div key={i} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-semibold">{res.questions?.question_text}</span>
                          <span className={res.is_correct ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{res.is_correct ? '✓ Correct' : '✗ Incorrect'}</span>
                        </div>
                        <div className="text-slate-400 flex justify-between pt-1 border-t border-slate-900 mt-1">
                          <span>{game.player_a_name}: <strong className="text-slate-200">{res.real_answer}</strong></span>
                          <span>{game.player_b_name} guessed: <strong className="text-slate-200">{res.guessed_answer}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button onClick={handleReturnToHub} className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 rounded-xl font-bold text-sm transition shadow-lg shadow-pink-500/20">🎮 Pick Another Activity (Stay in Room)</button>
                <button onClick={handleExitRoom} className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs text-slate-400 transition">🚪 Exit Room</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}