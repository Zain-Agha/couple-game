'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../page';
import confetti from 'canvas-confetti';

export default function BirthdayVault({ onReturnToHub }: any) {
  const [passwordInput, setPasswordInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [compliment, setCompliment] = useState('');
  const [loading, setLoading] = useState(false);

  // Exact Passcode Options
  const ALLOWED_PASSWORDS = [
    '11 AUG 2026',
    '11AUG2026',
    '11 AUGUST 2026',
    '11/08/2026',
    '11-08-2026'
  ];

  const handleUnlock = () => {
    const cleanPass = passwordInput.trim().toUpperCase().replace(/\s+/g, ' ');
    if (ALLOWED_PASSWORDS.includes(cleanPass) || ALLOWED_PASSWORDS.includes(passwordInput.trim().toUpperCase())) {
      playSound('fanfare');
      setUnlocked(true);
      setErrorMsg('');
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
      });
    } else {
      playSound('click');
      setErrorMsg('Incorrect Access Passcode. Please check your entry.');
    }
  };

  const handleGetCompliment = async () => {
    playSound('click');
    setLoading(true);
    try {
      const res = await fetch('/api/fiance-compliment', { method: 'POST' });
      const data = await res.json();
      setCompliment(data.compliment);
    } catch (e) {
      setCompliment("Amina, you are my heart, my soul, and my home. Happy Birthday, my love! ❤️");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="font-bold text-amber-400 text-sm">🎁 Secret Celebration Vault</span>
        <button onClick={onReturnToHub} className="text-xs text-slate-400 hover:text-white">
          ← Back to Hub
        </button>
      </div>

      {!unlocked ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 py-6">
          <div className="text-4xl">🔐</div>
          <h3 className="text-lg font-bold text-amber-300">Private Access Required</h3>
          <p className="text-xs text-slate-400">Enter the secret passcode to unlock this private vault.</p>

          <input
            type="text"
            value={passwordInput}
            onChange={(e) => {
              setErrorMsg('');
              setPasswordInput(e.target.value);
            }}
            placeholder="Enter Passcode..."
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-sm focus:outline-none focus:border-amber-500 font-mono tracking-widest uppercase"
          />

          {errorMsg && (
            <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
          )}

          <button
            onClick={handleUnlock}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 rounded-xl font-bold text-sm transition shadow-lg shadow-amber-500/20"
          >
            Unlock Vault 🔑
          </button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
            {/* Zain's Birthday Message Card */}
            <div className="p-6 bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 border border-amber-500/40 rounded-2xl space-y-4 shadow-xl shadow-amber-500/10">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Special Birthday Message</span>
                <h2 className="text-xl font-extrabold text-pink-300 mt-1">Happy birthday to the love of my life, Amina ❤️</h2>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-200">
                <p>
                  I feel incredibly lucky and grateful to have you in my life. I honestly look forward to spending the rest of our lives together, growing old side by side and sharing all the ups and downs that come our way.
                </p>
                <p>
                  I hope we always respect, love, and support each other, and that our love stays strong until the day we die.
                </p>
                <p className="font-semibold text-pink-300">
                  Happy birthday, my love. ❤️
                </p>
                <div className="pt-2 text-right">
                  <p className="text-xs text-slate-400">Love,</p>
                  <p className="text-sm font-bold text-amber-300">Zain</p>
                </div>
              </div>
            </div>

            {/* Compliment Generator Box */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-center">
              <button
                onClick={handleGetCompliment}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 rounded-xl font-extrabold text-xs text-white shadow-lg shadow-pink-500/25 transition active:scale-95"
              >
                {loading ? '❤️ Writing Compliment...' : 'CLICK FOR COMPLIMENTS FROM ZAIN 💕'}
              </button>

              {compliment && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl text-xs text-pink-200 font-medium italic">
                  "{compliment}"
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}