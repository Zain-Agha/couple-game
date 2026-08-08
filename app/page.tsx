'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const LEVEL_NAMES: { [key: number]: string } = {
  1: 'The Basics',
  2: 'Food & Cravings',
  3: 'Hobbies & Chill',
  4: 'Daily Routines',
  5: 'Pet Peeves',
  6: 'Travel & Dreams',
  7: 'Childhood Memories',
  8: 'Personality & Heart',
  9: 'Style & Vibe',
  10: 'How We Met',
  11: 'Romantic Memories',
  12: 'Love Languages',
  13: 'Core Values',
  14: 'Fears & Vulnerabilities',
  15: 'Deep Soulmates',
};

// Web Audio API Synthesizer for Native Sound Effects
const playSound = (type: 'click' | 'success' | 'fanfare') => {
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
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
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
  } catch (e) {
    // Browser audio context blocked before interaction
  }
};

// Generate 6-Character Short Room Code
const generateShortCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function Home() {
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'lobby' | 'game' | 'results'>('menu');
  const [role, setRole] = useState<'player_a' | 'player_b' | null>(null);
  const [name, setName] = useState('');
  const [gameCodeInput, setGameCodeInput] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(1);
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

  // Check URL for direct invite link: ?code=XXXXXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code');
    if (urlCode) {
      setGameCodeInput(urlCode.toUpperCase());
      setMode('join');
    }
  }, []);

  // Real-Time Listener
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

          if (updatedGame.status === 'round_1' || updatedGame.status === 'round_2') {
            setMode('game');
            setSubmittedRound(false);
            setCurrentQIndex(0);
            setUserAnswers({});
            playSound('success');
            await loadQuestions(updatedGame.current_level || 1);
          } else if (updatedGame.status === 'finished') {
            await fetchResults(updatedGame.id);
            setMode('results');
            playSound('fanfare');
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game?.id]);

  // Load Questions
  const loadQuestions = async (lvl: number) => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('level', lvl)
      .order('id', { ascending: true });

    if (data && data.length > 0) {
      setQuestions(data);
    }
  };

  // 1. Create Game
  const handleCreateGame = async () => {
    if (!name.trim()) return setError('Please enter your name');
    playSound('click');
    setLoading(true);
    setError('');

    const shortCode = generateShortCode();

    const { data, error } = await supabase
      .from('games')
      .insert([{ player_a_name: name, status: 'waiting', current_level: selectedLevel, code: shortCode }])
      .select()
      .single();

    setLoading(false);
    if (error) {
      setError('Could not create room.');
    } else {
      setGame(data);
      setRole('player_a');
      setMode('lobby');
      playSound('success');
      await loadQuestions(selectedLevel);
    }
  };

  // 2. Join Game (Fix for short 6-character codes)
  const handleJoinGame = async () => {
    if (!name.trim()) return setError('Please enter your name');
    if (!gameCodeInput.trim()) return setError('Please enter Room Code');
    playSound('click');
    setLoading(true);
    setError('');

    const cleanCode = gameCodeInput.trim().toUpperCase();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanCode);

    // Query safely depending on whether it's a 6-char short code or UUID
    const { data: existingGame, error: fetchErr } = isUUID
      ? await supabase.from('games').select('*').eq('id', cleanCode).maybeSingle()
      : await supabase.from('games').select('*').eq('code', cleanCode).maybeSingle();

    if (fetchErr || !existingGame) {
      console.error('Room search error:', fetchErr);
      setLoading(false);
      return setError('Room not found! Check the 6-character code.');
    }

    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({ player_b_name: name, status: 'waiting' })
      .eq('id', existingGame.id)
      .select()
      .single();

    setLoading(false);
    if (updateError || !updatedGame) {
      setError('Could not join room.');
    } else {
      setGame(updatedGame);
      setRole('player_b');
      setMode('lobby');
      playSound('success');
      setSelectedLevel(updatedGame.current_level || 1);
      await loadQuestions(updatedGame.current_level || 1);
    }
  };
  // 3. Start Game
  const handleStartGame = async () => {
    playSound('click');
    await supabase.from('games').update({ current_level: selectedLevel }).eq('id', game.id);
    await loadQuestions(selectedLevel);
    const { data } = await supabase
      .from('games')
      .update({ status: 'round_1' })
      .eq('id', game.id)
      .select()
      .single();

    if (data) setGame(data);
  };

  // 4. Copy Invite Link
  const handleCopyLink = () => {
    const roomCode = game.code || game.id;
    const shareUrl = `${window.location.origin}?code=${roomCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    playSound('click');
    setTimeout(() => setCopied(false), 2500);
  };

  // 5. Submit Round
  const handleSubmitRoundAnswers = async () => {
    playSound('click');
    setLoading(true);
    const roundFocus = game.status === 'round_1' ? 'player_a' : 'player_b';
    const isFocusPlayer = (game.status === 'round_1' && role === 'player_a') || (game.status === 'round_2' && role === 'player_b');

    for (const q of questions) {
      const text = userAnswers[q.id] || '';
      
      const { data: existing } = await supabase
        .from('answers')
        .select('*')
        .eq('game_id', game.id)
        .eq('question_id', q.id)
        .eq('round_focus', roundFocus)
        .single();

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
    const { data: answers } = await supabase
      .from('answers')
      .select('*')
      .eq('game_id', game.id)
      .eq('round_focus', currentRoundFocus);

    if (answers && answers.length >= questions.length) {
      const allComplete = answers.filter((a) => a.real_answer && a.guessed_answer).length === questions.length;

      if (allComplete) {
        if (game.status === 'round_1') {
          await supabase.from('games').update({ status: 'round_2' }).eq('id', game.id);
        } else if (game.status === 'round_2') {
          evaluateAllAnswersAndFinish();
        }
      }
    }
  };

  // 6. Evaluate with AI
  const evaluateAllAnswersAndFinish = async () => {
    setEvaluating(true);
    const { data: allAnswers } = await supabase
      .from('answers')
      .select('*, questions(question_text)')
      .eq('game_id', game.id);

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
              }),
            });
            const evalData = await res.json();
            await supabase
              .from('answers')
              .update({ is_correct: evalData.isCorrect })
              .eq('id', ans.id);
          } catch (e) {
            console.error('Eval error', e);
          }
        }
      }
    }

    await supabase.from('games').update({ status: 'finished' }).eq('id', game.id);
    setEvaluating(false);
  };

  // 7. Fetch Results
  const fetchResults = async (gameId: string) => {
    const { data } = await supabase
      .from('answers')
      .select('*, questions(question_text)')
      .eq('game_id', gameId);

    if (data) {
      setResultsData(data);
    }
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
      {/* Header & Clean Subtitle */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400">
          Two of Us 💕
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">How well do you really know each other?</p>
      </motion.div>

      {/* Main Container Card */}
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* 1. CLEAN MAIN MENU */}
          {mode === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <button
                onClick={() => {
                  playSound('click');
                  setMode('create');
                }}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl font-bold text-lg transition shadow-lg shadow-pink-500/25 active:scale-95"
              >
                Create Room
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  setMode('join');
                }}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-lg transition active:scale-95"
              >
                Join Room
              </button>
            </motion.div>
          )}

          {/* 2. CREATE ROOM MODE */}
          {mode === 'create' && (
            <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-200">Create Room</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name (e.g. Alex)"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-pink-500"
              />

              {/* LEVEL SELECTOR */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Select Quiz Level</label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                  {Object.entries(LEVEL_NAMES).map(([lvlStr, title]) => {
                    const lvlNum = Number(lvlStr);
                    const isSelected = selectedLevel === lvlNum;
                    return (
                      <button
                        key={lvlNum}
                        onClick={() => {
                          playSound('click');
                          setSelectedLevel(lvlNum);
                        }}
                        className={`p-2 rounded-lg text-left text-xs transition border ${
                          isSelected
                            ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="block font-bold">Lvl {lvlNum}</span>
                        <span className="text-[10px] truncate block opacity-80">{title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleCreateGame}
                disabled={loading}
                className="w-full py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-bold transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
              <button onClick={() => setMode('menu')} className="w-full py-2 text-sm text-slate-400">
                ← Back
              </button>
            </motion.div>
          )}

          {/* 3. JOIN ROOM MODE */}
          {mode === 'join' && (
            <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-200">Join Room</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name (e.g. Sam)"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-pink-500"
              />
              <input
                type="text"
                value={gameCodeInput}
                onChange={(e) => setGameCodeInput(e.target.value.toUpperCase())}
                placeholder="6-Character Room Code"
                maxLength={6}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white tracking-widest font-mono text-center text-lg uppercase focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={handleJoinGame}
                disabled={loading}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold transition disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Enter Room'}
              </button>
              <button onClick={() => setMode('menu')} className="w-full py-2 text-sm text-slate-400">
                ← Back
              </button>
            </motion.div>
          )}

          {/* 4. LOBBY MODE */}
          {mode === 'lobby' && game && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 text-center">
              {/* Short Room Code & Copy Link Button */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <span className="text-xs text-slate-400 uppercase font-semibold">Room Code</span>
                <p className="text-3xl font-mono font-extrabold text-pink-400 tracking-widest">
                  {game.code || game.id.substring(0, 6).toUpperCase()}
                </p>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 transition active:scale-95"
                >
                  {copied ? '✓ Link Copied!' : '🔗 Copy Invite Link'}
                </button>
                <div>
                  <span className="inline-block mt-1 px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-semibold">
                    Level {game.current_level || selectedLevel}: {LEVEL_NAMES[game.current_level || selectedLevel]}
                  </span>
                </div>
              </div>

              {/* Clean Player Names Display */}
              <div className="flex justify-around items-center p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <div className="text-center">
                  <span className="font-bold text-pink-300 text-base">{game.player_a_name || 'Waiting...'}</span>
                </div>
                <span className="text-slate-600 font-bold">💕</span>
                <div className="text-center">
                  <span className="font-bold text-indigo-300 text-base">{game.player_b_name || 'Waiting...'}</span>
                </div>
              </div>

              {game.player_a_name && game.player_b_name ? (
                role === 'player_a' ? (
                  <button
                    onClick={handleStartGame}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/25 active:scale-95 transition"
                  >
                    🚀 Start Quiz!
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm animate-pulse font-medium">
                    Both connected! Waiting for {game.player_a_name} to press Start...
                  </div>
                )
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm">
                  Waiting for partner to join...
                </div>
              )}
            </motion.div>
          )}

          {/* 5. GAME / QUIZ MODE */}
          {mode === 'game' && questions.length > 0 && (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <span>Level {game.current_level} • {game.status === 'round_1' ? 'Round 1' : 'Round 2'}</span>
                      <span className="text-pink-400">Question {currentQIndex + 1} / {questions.length}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <motion.div 
                        className="bg-gradient-to-r from-pink-500 to-rose-500 h-full"
                        animate={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Question Box */}
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentQIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-center min-h-[120px] flex flex-col justify-center"
                    >
                      <span className="text-xs font-semibold text-pink-400 block mb-1">
                        {isFocusPlayer
                          ? `Answer about YOURSELF:`
                          : `Guess ${focusName}'s answer:`}
                      </span>
                      <h3 className="text-lg font-bold text-white">{currentQ?.question_text}</h3>
                    </motion.div>
                  </AnimatePresence>

                  {/* Input */}
                  <div>
                    <input
                      type="text"
                      value={userAnswers[currentQ?.id] || ''}
                      onChange={(e) =>
                        setUserAnswers({ ...userAnswers, [currentQ?.id]: e.target.value })
                      }
                      placeholder={isFocusPlayer ? 'Type your answer...' : `What would ${focusName} say?`}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-pink-500 transition"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between gap-3">
                    <button
                      onClick={() => {
                        playSound('click');
                        setCurrentQIndex(Math.max(0, currentQIndex - 1));
                      }}
                      disabled={currentQIndex === 0}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold disabled:opacity-30 transition"
                    >
                      ← Previous
                    </button>

                    {currentQIndex < questions.length - 1 ? (
                      <button
                        onClick={() => {
                          playSound('click');
                          setCurrentQIndex(currentQIndex + 1);
                        }}
                        className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 rounded-xl text-sm font-bold transition"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitRoundAnswers}
                        disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition"
                      >
                        {loading ? 'Submitting...' : 'Finish & Submit!'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 6. RESULTS MODE */}
          {mode === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                  Final Score Reveal! 🎉
                </h2>
                <p className="text-xs text-slate-400 mt-1">Level {game.current_level}: {LEVEL_NAMES[game.current_level]}</p>
              </div>

              {/* Score Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl text-center">
                  <span className="text-xs text-pink-300 font-semibold block mb-1">{game.player_a_name}'s Score</span>
                  <span className="text-3xl font-extrabold text-pink-400">{scorePlayerA} / {questions.length}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Guesses about {game.player_b_name}</span>
                </div>
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-center">
                  <span className="text-xs text-indigo-300 font-semibold block mb-1">{game.player_b_name}'s Score</span>
                  <span className="text-3xl font-extrabold text-indigo-400">{scorePlayerB} / {questions.length}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Guesses about {game.player_a_name}</span>
                </div>
              </div>

              {/* Winner Announcement */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                <p className="text-sm font-bold text-amber-300">
                  {scorePlayerA > scorePlayerB
                    ? `🏆 ${game.player_a_name} knows ${game.player_b_name} better!`
                    : scorePlayerB > scorePlayerA
                    ? `🏆 ${game.player_b_name} knows ${game.player_a_name} better!`
                    : `🤝 It's a PERFECT TIE! You know each other equally well!`}
                </p>
              </div>

              {/* TABBED BREAKDOWN */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Answer Breakdown</h3>
                
                <div className="flex border-b border-slate-800">
                  <button
                    onClick={() => {
                      playSound('click');
                      setActiveTab('player_a');
                    }}
                    className={`flex-1 py-2 text-xs font-bold transition border-b-2 ${
                      activeTab === 'player_a'
                        ? 'border-pink-500 text-pink-400'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {game.player_a_name}'s Guesses
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setActiveTab('player_b');
                    }}
                    className={`flex-1 py-2 text-xs font-bold transition border-b-2 ${
                      activeTab === 'player_b'
                        ? 'border-indigo-500 text-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {game.player_b_name}'s Guesses
                  </button>
                </div>

                {activeTab === 'player_a' && (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    <p className="text-[11px] text-slate-400 italic mb-2">
                      How well {game.player_a_name} guessed answers about {game.player_b_name}:
                    </p>
                    {playerAGuessesAboutB.map((res, i) => (
                      <div key={i} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-semibold">{res.questions?.question_text}</span>
                          <span className={res.is_correct ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {res.is_correct ? '✓ Correct' : '✗ Incorrect'}
                          </span>
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
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    <p className="text-[11px] text-slate-400 italic mb-2">
                      How well {game.player_b_name} guessed answers about {game.player_a_name}:
                    </p>
                    {playerBGuessesAboutA.map((res, i) => (
                      <div key={i} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-semibold">{res.questions?.question_text}</span>
                          <span className={res.is_correct ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {res.is_correct ? '✓ Correct' : '✗ Incorrect'}
                          </span>
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

              <button
                onClick={() => {
                  playSound('click');
                  setMode('menu');
                  setGame(null);
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm transition"
              >
                Play Again / Main Menu
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}