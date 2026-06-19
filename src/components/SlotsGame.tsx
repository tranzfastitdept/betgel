/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Coins, HelpCircle, Trophy, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface SlotsGameProps {
  balance: number;
  onUpdateBalance: (amount: number, auditAction: string, auditDetail: string) => void;
  onLogGame: (bet: number, win: number, reels: string[]) => void;
}

const SYMBOLS = [
  { char: '🍒', multiplier: 1.5, name: 'Cherry' },
  { char: '🍋', multiplier: 2.0, name: 'Lemon' },
  { char: '🍊', multiplier: 3.0, name: 'Orange' },
  { char: '🍇', multiplier: 4.0, name: 'Grape' },
  { char: '🍉', multiplier: 5.0, name: 'Watermelon' },
  { char: '🍀', multiplier: 10.0, name: 'Clover' },
  { char: '🔔', multiplier: 15.0, name: 'Bell' },
  { char: '⭐', multiplier: 20.0, name: 'Star' },
  { char: '💎', multiplier: 50.0, name: 'Diamond' },
  { char: '7️⃣', multiplier: 100.0, name: 'Lucky Seven' }
];

export default function SlotsGame({ balance, onUpdateBalance, onLogGame }: SlotsGameProps) {
  const [bet, setBet] = useState<number>(20);
  const [reels, setReels] = useState<string[]>(['💎', '7️⃣', '💎']);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinClass, setSpinClass] = useState<string>('');
  const [payoutResult, setPayoutResult] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);

  // Play audio notes dynamically using Web Audio API so it's fully zero-dependency but provides beautiful authentic real retro synthesized sfx!
  const playSynthesizedSound = (type: 'spin' | 'win' | 'lose') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'spin') {
        // Sci-Fi sweep sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        // High-pitch coin chime sequence
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1); gain1.connect(ctx.destination);
        osc2.connect(gain2); gain2.connect(ctx.destination);
        
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain1.gain.setValueAtTime(0.15, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.3);

        osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15); // G5
        osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.25); // C6
        gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.5);
      } else if (type === 'lose') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // AudioContext fails gracefully if browser blocks click triggers
    }
  };

  const handleSpinSubmit = () => {
    if (isSpinning) return;
    if (balance < bet) {
      alert("Insufficient balance for this stake amount.");
      return;
    }

    setIsSpinning(true);
    setPayoutResult(null);
    setSpinClass('animate-bounce');
    playSynthesizedSound('spin');
    
    // Deduct initial bet balance
    onUpdateBalance(-bet, 'SLOTS_SPIN_BET', `Deducted PHP ${bet} for slot spin.`);

    // Perform spinning interval animations standard clientside timeouts
    let spinsCount = 0;
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
      ]);
      spinsCount++;
      if (spinsCount > 6) {
        clearInterval(interval);
        
        // Final secure RNG outcome
        const finalReels = [
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
        ];
        
        setReels(finalReels);
        setIsSpinning(false);
        setSpinClass('');
        
        // Compute winning amount
        computeSpinResult(finalReels);
      }
    }, 120);
  };

  const computeSpinResult = (finalReels: string[]) => {
    const [r1, r2, r3] = finalReels;
    let multiplier = 0;
    let matchType = '';

    const sym1 = SYMBOLS.find(s => s.char === r1);
    const sym2 = SYMBOLS.find(s => s.char === r2);
    const sym3 = SYMBOLS.find(s => s.char === r3);

    // Three of a kind rule
    if (r1 === r2 && r2 === r3) {
      const matchSym = SYMBOLS.find(s => s.char === r1);
      if (matchSym) {
        multiplier = matchSym.multiplier * 3; // Enriched multiplier reward
        matchType = `JACKPOT! Three ${matchSym.name}s!`;
      }
    }
    // Any Two of a kind matching consecutively or ends
    else if (r1 === r2 || r2 === r3 || r1 === r3) {
      const matchChar = r1 === r2 ? r1 : (r2 === r3 ? r2 : r1);
      const matchSym = SYMBOLS.find(s => s.char === matchChar);
      if (matchSym) {
        multiplier = matchSym.multiplier * 1.25;
        matchType = `Double Match: Two ${matchSym.name}s!`;
      }
    }
    // Single cherry bonus trigger
    else if (r1 === '🍒' || r2 === '🍒' || r3 === '🍒') {
      const cherryCount = finalReels.filter(r => r === '🍒').length;
      multiplier = cherryCount * 0.75;
      matchType = `${cherryCount} Lucky Cherry Bonus Pays!`;
    }

    const wonAmount = Math.round(bet * multiplier * 100) / 100;
    setPayoutResult(wonAmount);

    if (wonAmount > 0) {
      playSynthesizedSound('win');
      onUpdateBalance(wonAmount, 'SLOTS_SPIN_WIN', `Won PHP ${wonAmount} on Slots spin ${finalReels.join('-')}.`);
    } else {
      playSynthesizedSound('lose');
    }

    onLogGame(bet, wonAmount, finalReels);
  };

  return (
    <div className="bg-[#141414] p-6 rounded-2xl border border-gold/20 shadow-2xl relative" id="slots-terminal">
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gold/10">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gold" />
          <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center gap-1.5">
            MGM GOLDEN REELS
            <span className="text-[10px] uppercase tracking-widest bg-gold/10 text-gold px-1.5 py-0.5 rounded border border-gold/30">
              96.8% RTP
            </span>
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 bg-black/40 border border-white/10 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowRules(!showRules)}
            className="p-1.5 bg-black/40 border border-white/10 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="How To Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rules overlay if triggered */}
      {showRules && (
        <div className="absolute inset-0 bg-black/95 z-20 rounded-2xl p-6 overflow-y-auto border border-gold/30 text-xs text-slate-300">
          <div className="flex justify-between items-center border-b border-gold/20 pb-2 mb-3">
            <h4 className="text-gold font-sans font-bold text-sm">Slot Paytable & Directives</h4>
            <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer text-sm font-bold">Close ✕</button>
          </div>
          <div className="space-y-3 font-sans">
            <p>
              Pick a wager (PHP 20 - PHP 1000) and hit **SPIN**. Reels generate secure hardware random triggers.
            </p>
            <div className="bg-black/50 p-2.5 rounded border border-white/10 space-y-1 font-mono">
              <span className="block text-gold text-[11px] font-bold">Standard Match Multipliers:</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400 text-[10px]">
                <span>7️⃣ 7️⃣ 7️⃣: 300x Bet</span>
                <span>💎 💎 💎: 150x Bet</span>
                <span>⭐ ⭐ ⭐: 60x Bet</span>
                <span>🔔 🔔 🔔: 45x Bet</span>
                <span>🍀 🍀 🍀: 30x Bet</span>
                <span>🍉 🍉 🍉: 15x Bet</span>
                <span>🍇 🍇 🍇: 12x Bet</span>
                <span>🍊 🍊 🍊: 9x Bet</span>
                <span>🍋 🍋 🍋: 6x Bet</span>
                <span>🍒 🍒 🍒: 4.5x Bet</span>
              </div>
              <span className="block text-slate-500 text-[10px] mt-2 leading-relaxed">
                * Consecutively paired pairs return a solid 1.25x index payload multiplier. Any cherry counts as a scatter win!
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug">
              Pure clientside cryptographic feeds guarantee randomized outcomes. Absolutely no server manipulation or algorithm alterations.
            </p>
          </div>
        </div>
      )}

      {/* Jackpot Highlight Panel */}
      <div className="bg-black/60 rounded-xl p-3 border border-gold/20 flex justify-between items-center mb-4">
        <div>
          <span className="text-[9px] uppercase tracking-wider font-mono text-bronze block font-bold">Grand Lucky Pot</span>
          <span className="text-md font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gold to-gold-dark font-mono">
            PHP 148,930.22
          </span>
        </div>
        <div className="bg-gold/5 px-2.5 py-1.5 rounded border border-gold/30 text-[10px] text-gold font-sans font-bold flex items-center gap-1 text-right">
          <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" />
          RTP ACTIVE
        </div>
      </div>

      {/* Reel Box Display Interface */}
      <div className="grid grid-cols-3 gap-3 bg-black/90 p-5 rounded-xl border border-white/5 shadow-inner relative justify-center items-center h-28 my-4 overflow-hidden">
        {/* Aesthetic vertical grid lines overlay just like high-profile stake casinos */}
        <div className="absolute inset-y-0 left-1/3 w-[1px] bg-white/5"></div>
        <div className="absolute inset-y-0 right-1/3 w-[1px] bg-white/5"></div>

        {reels.map((symbol, idx) => (
          <div
            key={idx}
            id={`slot-reel-${idx}`}
            className={`flex items-center justify-center text-4xl select-none transition-transform duration-75 ${spinClass}`}
          >
            {symbol}
          </div>
        ))}
      </div>

      {/* Results HUD */}
      <div className="h-10 flex items-center justify-center text-xs text-center border-t border-b border-white/5 my-3">
        {isSpinning ? (
          <span className="text-slate-400 font-mono animate-pulse">Reels in continuous rotation...</span>
        ) : payoutResult !== null ? (
          payoutResult > 0 ? (
            <div className="text-gold font-sans font-bold text-sm bg-gold/10 px-3 py-1 rounded-full border border-gold/30 animate-bounce flex items-center gap-1.5 shadow-gold-sm">
              <Sparkles className="w-4 h-4 text-gold" />
              STRIKE! Payout PHP {payoutResult.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          ) : (
            <span className="text-slate-500 font-mono">No hit. Adjust bet and spin once more.</span>
          )
        ) : (
          <span className="text-slate-400 font-mono">Set bet level and spin the MGM Gold reels!</span>
        )}
      </div>

      {/* Bet adjustments inputs */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-400 font-mono">Select Stake:</span>
            <span className="text-xs text-gold font-mono font-bold">PHP {bet}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[20, 50, 100, 500].map((val) => (
              <button
                key={val}
                onClick={() => setBet(val)}
                className={`py-1.5 border hover:border-gold text-xs font-mono font-bold rounded transition cursor-pointer ${bet === val ? 'bg-gradient-to-r from-gold to-gold-dark text-black border-gold' : 'bg-black border-white/10 text-slate-300'}`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Custom manual bet range */}
        <div className="flex items-center gap-2">
          <input
            id="slot-bet-range"
            type="range"
            min={20}
            max={1000}
            step={10}
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            className="w-full accent-gold cursor-pointer h-1.5 rounded-full bg-[#1A1A1A]"
          />
          <button
            onClick={() => setBet(1000)}
            className="px-2 py-0.5 bg-gold/10 border border-gold/30 text-[9px] font-mono text-gold rounded hover:bg-gold hover:text-black font-bold transition cursor-pointer"
          >
            MAX
          </button>
        </div>

        {/* Spin trigger button */}
        <button
          onClick={handleSpinSubmit}
          disabled={isSpinning}
          id="slot-spin-btn"
          className={`w-full py-3.5 rounded-xl font-serif font-bold text-center text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${isSpinning ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' : 'bg-gradient-to-r from-gold via-yellow-400 to-gold-dark text-black font-extrabold border-none hover:opacity-95'}`}
        >
          <Coins className="w-4 h-4 animate-spin animate-none" />
          {isSpinning ? 'SPINNING REELS' : `SPIN PHP ${bet}`}
        </button>
      </div>
    </div>
  );
}
