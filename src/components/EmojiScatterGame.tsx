import React, { useState, useEffect } from 'react';
import { Sparkles, Coins, HelpCircle, Trophy, Volume2, VolumeX, AlertOctagon, ArrowUpRight, RefreshCw, Flame } from 'lucide-react';

interface SymbolConfig {
  char: string;
  multiplier: number;
  name: string;
  payoutFour: number; // multiplier if 4 of them appear
  payoutFivePlus: number; // multiplier if 5+ of them appear
}

interface EmojiScatterGameProps {
  balance: number;
  grandLuckyPot: number;
  winChanceModifier?: number; // 0.0 to 1.0 (controlling hit rate)
  safeProfitLock?: boolean; // If true, intercepts massive pays to avoid platform bankruptcy
  onUpdateBalance: (amount: number, auditAction: string, auditDetail: string) => void;
  onLogGame: (bet: number, win: number, reels: string[]) => void;
  onUpdateLuckyPot: (amount: number) => void;
  onRedirectToTopup?: () => void;
}

const EMOJI_SYMBOLS: SymbolConfig[] = [
  { char: '👑', multiplier: 25.0, payoutFour: 60.0, payoutFivePlus: 150.0, name: 'Royal Crown' },
  { char: '💎', multiplier: 15.0, payoutFour: 35.0, payoutFivePlus: 80.0, name: 'Vegas Gem' },
  { char: '🔥', multiplier: 10.0, payoutFour: 25.0, payoutFivePlus: 50.0, name: 'Mega Fire' },
  { char: '👽', multiplier: 8.0, payoutFour: 18.0, payoutFivePlus: 40.0, name: 'Alien Star' },
  { char: '🦄', multiplier: 6.0, payoutFour: 12.0, payoutFivePlus: 30.0, name: 'Lucky Unicorn' },
  { char: '🦁', multiplier: 4.0, payoutFour: 8.0, payoutFivePlus: 20.0, name: 'MGM Lion' },
  { char: '🐼', multiplier: 3.0, payoutFour: 6.0, payoutFivePlus: 15.0, name: 'Zen Panda' },
  { char: '🦊', multiplier: 2.0, payoutFour: 4.0, payoutFivePlus: 10.0, name: 'Clever Fox' },
  { char: '🍀', multiplier: 1.0, payoutFour: 2.5, payoutFivePlus: 6.0, name: 'Four-Leaf Clover' }
];

const SCATTER_CHAR = '🟡'; // golden circle emoji as scatter

export default function EmojiScatterGame({
  balance,
  grandLuckyPot,
  winChanceModifier = 0.85,
  safeProfitLock = false,
  onUpdateBalance,
  onLogGame,
  onUpdateLuckyPot,
  onRedirectToTopup
}: EmojiScatterGameProps) {
  const [bet, setBet] = useState<number>(1.0); // minimum is 0.5, default to 1.0
  const [grid, setGrid] = useState<string[][]>([
    ['💎', '👽', '🦊', '🦁', '🟡'],
    ['🦁', '🟡', '🐼', '👑', '🔥'],
    ['👑', '🔥', '🍀', '💎', '👽'],
    ['🦄', '🦁', '🦊', '🍀', '🐼'],
    ['🍀', '💎', '👑', '👽', '🦄']
  ]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinTick, setSpinTick] = useState<number>(0);
  const [payoutResult, setPayoutResult] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);

  // Scatter/Free spins states
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState<number>(0);
  const [isFreeSpinMode, setIsFreeSpinMode] = useState<boolean>(false);
  const [accumulatedFreeSpinWins, setAccumulatedFreeSpinWins] = useState<number>(0);
  const [triggeringScattersCount, setTriggeringScattersCount] = useState<number>(0);
  const [winningMatches, setWinningMatches] = useState<{ char: string; count: number; payout: number }[]>([]);

  // Sound generator
  const playSound = (type: 'spin' | 'win' | 'lose' | 'scatter' | 'freespinticks') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'spin') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(); osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'scatter') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(); osc.stop(ctx.currentTime + 0.55);
      } else if (type === 'win') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start(); osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'lose') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(); osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio autoplay exception safely caught
    }
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (!isFreeSpinMode && balance < bet) {
      setShowWarning(true);
      return;
    }

    setIsSpinning(true);
    setPayoutResult(null);
    setWinningMatches([]);

    // Deduct standard bet if not in Free Spins mode
    if (!isFreeSpinMode) {
      onUpdateBalance(-bet, 'EMOJI_SCATTER_BET', `Spent PHP ${bet} on Emoji Scatter spin.`);
    }

    playSound('spin');

    // Simulate reel rotation
    let count = 0;
    const interval = setInterval(() => {
      setGrid([
        [getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar()],
        [getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar()],
        [getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar()],
        [getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar()],
        [getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar()]
      ]);
      count++;
      
      if (count > 8) {
        clearInterval(interval);
        evaluateSpinResult();
      }
    }, 100);
  };

  const getRandomChar = (): string => {
    // Add scatter with solid weighted chance
    const rand = Math.random();
    if (rand < 0.07) {
      return SCATTER_CHAR; // ~7% chance for any slot to hold a scatter
    }
    const sym = EMOJI_SYMBOLS[Math.floor(Math.random() * EMOJI_SYMBOLS.length)];
    return sym.char;
  };

  const evaluateSpinResult = () => {
    // Collect 5x5 array count parameters
    const finalGrid = [
      [getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar()],
      [getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar()],
      [getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar()],
      [getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar()],
      [getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar(), getRandomChar()]
    ];

    // Count variables of each symbol anywhere in the 25-block grid (Scatter payouts!)
    const countsMap: { [key: string]: number } = {};
    for (const r of finalGrid) {
      for (const char of r) {
        countsMap[char] = (countsMap[char] || 0) + 1;
      }
    }

    const scatterCount = countsMap[SCATTER_CHAR] || 0;

    // Safety checks against heavy payloads
    const calculatedPay = calculatePotentialWinnings(countsMap);
    const randProb = Math.random();

    // Platforms safeguard & bankruptcy controls
    const isProhibitedWin = calculatedPay > (bet * 3) && (safeProfitLock || randProb > winChanceModifier);
    let targetedGrid = finalGrid;

    if (isProhibitedWin) {
      // Force custom lightweight outcome (no scatter trigger, no match multiplier > 1)
      targetedGrid = [
        ['👽', '🦄', '🦁', '🦊', '🍀'],
        ['🐼', '🦊', '🍀', '👽', '🦁'],
        ['🦊', '🦁', '👽', '🐼', '🦄'],
        ['🦄', '🦁', '🦊', '🍀', '🐼'],
        ['🍀', '💎', '👑', '👽', '🦄']
      ];
      countsMap['👽'] = 4; countsMap['🦄'] = 3; countsMap['🦁'] = 4;
      countsMap['🐼'] = 3; countsMap['🦊'] = 4; countsMap['🍀'] = 4; countsMap['💎'] = 1; countsMap['👑'] = 2;
      countsMap[SCATTER_CHAR] = 0;
    }

    setGrid(targetedGrid);
    setIsSpinning(false);

    // Final calculations based on verified matrix
    const verifiedCounts: { [key: string]: number } = {};
    for (const r of targetedGrid) {
      for (const char of r) {
        verifiedCounts[char] = (verifiedCounts[char] || 0) + 1;
      }
    }

    processFinalOutcome(verifiedCounts);
  };

  const calculatePotentialWinnings = (counts: { [key: string]: number }): number => {
    let totMultiplier = 0;
    for (const [char, amt] of Object.entries(counts)) {
      if (char === SCATTER_CHAR) continue;
      const cfg = EMOJI_SYMBOLS.find(s => s.char === char);
      if (cfg && amt >= 6) {
        if (amt < 8) totMultiplier += cfg.multiplier;
        else if (amt < 10) totMultiplier += cfg.payoutFour;
        else totMultiplier += cfg.payoutFivePlus;
      }
    }
    return bet * totMultiplier;
  };

  const processFinalOutcome = (counts: { [key: string]: number }) => {
    const matchedItems: { char: string; count: number; payout: number }[] = [];
    let spinMultiplierAccum = 0;
    const currentScatters = counts[SCATTER_CHAR] || 0;

    for (const [char, count] of Object.entries(counts)) {
      if (char === SCATTER_CHAR) continue;
      const cfg = EMOJI_SYMBOLS.find(s => s.char === char);
      if (cfg && count >= 6) {
        let multi = 0;
        if (count < 8) multi = cfg.multiplier;
        else if (count < 10) multi = cfg.payoutFour;
        else multi = cfg.payoutFivePlus;

        spinMultiplierAccum += multi;
        matchedItems.push({
          char,
          count,
          payout: bet * multi
        });
      }
    }

    const wonAmount = Math.round(bet * spinMultiplierAccum * 100) / 100;
    setWinningMatches(matchedItems);
    setPayoutResult(wonAmount);

    // Check Trigger golden circle 🟡 scatter spins
    let scatterWinFlag = false;
    if (currentScatters >= 4) {
      scatterWinFlag = true;
      playSound('scatter');
      setTriggeringScattersCount(currentScatters);
      setFreeSpinsRemaining(prev => prev + 10);
      setIsFreeSpinMode(true);
    }

    if (wonAmount > 0) {
      playSound('win');
      if (isFreeSpinMode) {
        setAccumulatedFreeSpinWins(prev => prev + wonAmount);
      }
      onUpdateBalance(wonAmount, 'EMOJI_SCATTER_WIN', `Matched emoji scatter combinations: won PHP ${wonAmount}.`);
    } else {
      if (!scatterWinFlag) playSound('lose');
    }

    // Flat log into operator database structure
    const flatFlattenReels = grid.flat();
    onLogGame(bet, wonAmount, flatFlattenReels);

    // If Free spins are running, we deduct 1 from countdown
    if (isFreeSpinMode) {
      setFreeSpinsRemaining(prev => {
        const nextSpins = prev - 1;
        if (nextSpins <= 0) {
          // Grant accumulated bonus funds at exit of bonus cycles
          setTimeout(() => {
            alert(`🎉 BONUS CYCLE COMPLETED! You accumulated an additional ₱${accumulatedFreeSpinWins.toFixed(2)} in Free Spins!`);
            setIsFreeSpinMode(false);
            setAccumulatedFreeSpinWins(0);
          }, 1500);
        }
        return nextSpins;
      });
    }
  };

  // Automated Spun Trigger for Free Spin rounds to provide flawless user immersion
  useEffect(() => {
    if (isFreeSpinMode && !isSpinning && freeSpinsRemaining > 0) {
      const timer = setTimeout(() => {
        handleSpin();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isFreeSpinMode, isSpinning, freeSpinsRemaining]);

  const adjustBet = (amount: number) => {
    if (isSpinning || isFreeSpinMode) return;
    const nextBet = Math.max(0.5, bet + amount);
    setBet(Math.round(nextBet * 100) / 100);
  };

  return (
    <div className="bg-[#0b0303] p-6 rounded-3xl border border-red-500/25 shadow-2xl relative space-y-5" id="emoji-scatter-widget">
      
      {/* Insufficient Funds screen */}
      {showWarning && (
        <div className="absolute inset-0 bg-black/95 z-30 rounded-3xl p-6 flex flex-col justify-center items-center text-center space-y-4 border border-rose-500/40">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 animate-pulse">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-md font-sans font-black text-rose-500 uppercase tracking-tight">
              DEPOSIT PENDING
            </h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto mt-1 leading-normal">
              You do not have enough funds for a ₱{bet.toFixed(2)} emoji spin. active: ₱{balance.toFixed(2)}. Please make a GCash deposit!
            </p>
          </div>
          <div className="flex gap-2.5 w-full max-w-xs pt-2">
            {onRedirectToTopup && (
              <button
                onClick={() => {
                  setShowWarning(false);
                  onRedirectToTopup();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 text-white font-sans font-extrabold text-xs rounded-xl shadow-lg hover:opacity-90 cursor-pointer flex items-center justify-center gap-1"
              >
                GCash Deposit <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setShowWarning(false)}
              className="flex-1 py-2.5 bg-zinc-850 text-slate-300 hover:text-white font-sans font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Free Spin Header overlay banner */}
      {isFreeSpinMode && (
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-red-650 p-3 rounded-2xl border border-yellow-400/40 text-center text-black space-y-1 animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.2)]">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-black animate-spin" />
            <span className="font-sans font-black text-xs uppercase tracking-wider">
              FREE SPINS IN PLAY: {freeSpinsRemaining} LEFT
            </span>
          </div>
          <p className="text-[10px] font-mono leading-none font-bold text-black/80">
            Total Bonus Accumulated: ₱{accumulatedFreeSpinWins.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      )}

      {/* Primary display */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500 animate-pulse" />
          <div>
            <h3 className="text-md font-sans font-black text-white uppercase tracking-tight">
              🟡 EMOJI SCATTER BONANZA
            </h3>
            <p className="text-[9px] text-[#CD7F32] font-mono tracking-widest uppercase mt-0.5 leading-none">
              5x5 ANYWHERE SCATTER pays • MIN 0.50 PHP
            </p>
          </div>
        </div>
        
        <div className="flex gap-1.5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 bg-[#170a0a] border border-red-500/10 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setShowRules(!showRules)}
            className="p-1.5 bg-[#170a0a] border border-red-500/10 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Help Rules Overlay */}
      {showRules && (
        <div className="absolute inset-0 bg-black/95 z-20 rounded-3xl p-6 overflow-y-auto border border-red-500/30 text-xs text-slate-300 font-sans space-y-3">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h4 className="text-red-400 font-sans font-bold text-sm">Emoji Scatter Gameplay Guidelines</h4>
            <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white cursor-pointer font-bold">✕ Close</button>
          </div>
          <p className="leading-relaxed">
            Symbols pay anywhere in the 5x5 slot matrix if you land 6 or more of the same kind.
          </p>
          <div className="bg-red-950/20 p-3 rounded-xl border border-red-500/10 space-y-1 font-mono text-[10px]">
            <span className="block text-red-400 font-bold uppercase mb-1">PAYOUT STRUCTURE:</span>
            {EMOJI_SYMBOLS.map(e => (
              <div key={e.char} className="flex justify-between border-b border-white/5 pb-0.5">
                <span>{e.char} {e.name}:</span>
                <span className="text-gold font-bold">6x+: {e.multiplier}x | 8x+: {e.payoutFour}x | 10x+: {e.payoutFivePlus}x</span>
              </div>
            ))}
          </div>
          <div className="bg-amber-950/20 p-3 rounded-xl border border-amber-500/10">
            <h5 className="font-bold text-amber-400 text-[10px] uppercase">🟡 GOLDEN SCATTER RULES:</h5>
            <p className="text-[10px] text-slate-300 leading-normal mt-1">
              If 4 or more Golden Circle Scatters 🟡 hit anywhere in the 25 slots simultaneously, they ignite <strong>10 FREE SPINS</strong> where no credits are deducted from your balance!
            </p>
          </div>
        </div>
      )}

      {/* Casino spinning matrix grid */}
      <div className="bg-[#180505] p-3 rounded-2xl border border-red-500/20 relative shadow-inner">
        <div className="grid grid-cols-5 gap-1.5">
          {grid.map((row, rIdx) => 
            row.map((symbol, cIdx) => {
              const isWinningSymbol = winningMatches.some(m => m.char === symbol);
              const isScatter = symbol === SCATTER_CHAR;
              
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-2xl font-bold transition-all duration-150 relative overflow-hidden select-none border ${
                    isSpinning 
                      ? 'bg-zinc-950/50 border-white/5 animate-pulse filter blur-[1px]' 
                      : isScatter
                      ? 'bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-transparent border-yellow-400 scale-102 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                      : isWinningSymbol
                      ? 'bg-red-950/20 border-red-500 animate-bounce scale-102 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                      : 'bg-[#0f0404] border-white/5'
                  }`}
                >
                  <span className={`${isSpinning ? 'animate-bounce' : ''}`}>
                    {symbol}
                  </span>
                  
                  {isScatter && (
                    <span className="absolute bottom-1 text-[5px] font-mono uppercase bg-yellow-400/25 text-yellow-300 px-1 py-0.5 rounded leading-none scale-90 font-black">
                      SCATTER 🟡
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Results HUD Console */}
      <div className="h-14 flex items-center justify-center text-center bg-[#150404]/80 rounded-xl border border-red-500/10 px-4">
        {isSpinning ? (
          <div className="flex items-center gap-2 text-red-500 font-mono text-[10px] uppercase tracking-wider animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Rolling secure back-end ledger outcome...
          </div>
        ) : payoutResult !== null ? (
          payoutResult > 0 ? (
            <div className="space-y-0.5">
              <span className="block text-[10px] text-emerald-400 uppercase font-mono tracking-widest font-black leading-none">
                COMBINATIONS MATCHED!
              </span>
              <span className="text-md font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300 leading-none">
                Won PHP {payoutResult.toLocaleString('en-US', { minimumFractionDigits: 2 })}!
              </span>
            </div>
          ) : (
            <span className="text-zinc-500 font-sans text-xs font-semibold uppercase tracking-wider">
              No Matches. Try spinning again!
            </span>
          )
        ) : isFreeSpinMode ? (
          <span className="text-amber-400 font-mono text-[10px] uppercase tracking-wider animate-bounce font-black">
            BONUS AUTOMATED SPIN UNDERWAY
          </span>
        ) : (
          <span className="text-slate-400 font-sans text-xs">
            Enter stakes level and click SPIN
          </span>
        )}
      </div>

      {/* Controller Controls deck */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-white/5">
        
        {/* Stake size adjustment */}
        <div className="flex items-center justify-between bg-[#150404] rounded-xl border border-red-500/15 p-1 px-2 gap-4">
          <span className="text-[10px] text-rose-400 font-mono uppercase font-bold tracking-wider pl-1">Bet:</span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={isSpinning || isFreeSpinMode}
              onClick={() => adjustBet(-0.5)}
              className="w-7 h-7 bg-red-950/40 text-rose-400 border border-red-500/25 rounded-lg text-xs font-sans font-extrabold flex items-center justify-center hover:bg-rose-950/70 disabled:opacity-30 cursor-pointer"
            >
              -
            </button>
            <span className="text-sm font-mono font-bold text-white min-w-[50px] text-center">
              ₱{bet.toFixed(2)}
            </span>
            <button
              disabled={isSpinning || isFreeSpinMode}
              onClick={() => adjustBet(0.5)}
              className="w-7 h-7 bg-red-950/40 text-rose-400 border border-red-500/25 rounded-lg text-xs font-sans font-extrabold flex items-center justify-center hover:bg-rose-950/70 disabled:opacity-30 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Spin trigger action buttons */}
        <button
          disabled={isSpinning || isFreeSpinMode}
          onClick={handleSpin}
          className={`py-3 px-6 rounded-xl font-sans font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition duration-200 cursor-pointer ${
            isSpinning || isFreeSpinMode
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-transparent'
              : 'bg-gradient-to-r from-red-600 to-amber-500 text-white border border-red-500/30 hover:opacity-90 active:scale-[0.98]'
          }`}
        >
          <Coins className="w-4 h-4" />
          {isFreeSpinMode ? 'BONUS ROLLING' : 'IGNITE SPIN'}
        </button>

      </div>

    </div>
  );
}
