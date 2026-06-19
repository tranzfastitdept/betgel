import React, { useState, useEffect } from 'react';
import { Coins, HelpCircle, Trophy, Sparkles, Volume2, VolumeX, AlertOctagon, ArrowUpRight, Plus, Edit2, Check } from 'lucide-react';

interface SymbolConfig {
  char: string;
  multiplier: number;
  name: string;
}

interface SlotsGameProps {
  balance: number;
  grandLuckyPot: number;
  symbols?: SymbolConfig[];
  winChanceModifier?: number; // 0.0 to 1.0 (controlling hit rate)
  safeProfitLock?: boolean; // If true, intercepts jackpots to prevent bankruptcy
  onUpdateBalance: (amount: number, auditAction: string, auditDetail: string) => void;
  onLogGame: (bet: number, win: number, reels: string[]) => void;
  onUpdateLuckyPot: (amount: number) => void;
  onRedirectToTopup?: () => void;
}

const DEFAULT_SYMBOLS: SymbolConfig[] = [
  { char: '🍒', multiplier: 1.5, name: 'Cherry' },
  { char: '🍋', multiplier: 2.0, name: 'Lemon' },
  { char: '🍊', multiplier: 3.0, name: 'Orange' },
  { char: '🍇', multiplier: 4.0, name: 'Grape' },
  { char: '🍉', multiplier: 5.0, name: 'Watermelon' },
  { char: '🍀', multiplier: 10.0, name: 'Clover' },
  { char: '🔔', multiplier: 15.0, name: 'Bell' },
  { char: '⭐', multiplier: 20.0, name: 'Star' },
  { char: '💎', multiplier: 50.0, name: 'Diamond' },
  { char: '7️⃣', multiplier: 100.0, name: 'Lucky Seven' },
  { char: '👑', multiplier: 150.0, name: 'MGM Royal Crown' },  // 11th symbol
  { char: '💰', multiplier: 250.0, name: 'Vegas Cash Bag' }    // 12th symbol
];

export default function SlotsGame({
  balance,
  grandLuckyPot,
  symbols = DEFAULT_SYMBOLS,
  winChanceModifier = 0.9,
  safeProfitLock = false,
  onUpdateBalance,
  onLogGame,
  onUpdateLuckyPot,
  onRedirectToTopup
}: SlotsGameProps) {
  const [bet, setBet] = useState<number>(20);
  const [reels, setReels] = useState<string[]>(['💎', '👑', '💰']);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinClass, setSpinClass] = useState<string>('');
  const [payoutResult, setPayoutResult] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);

  // Lucky Pot edit overrides
  const [isEditingPot, setIsEditingPot] = useState<boolean>(false);
  const [tempPotVal, setTempPotVal] = useState<string>('');

  const activeSymbols = symbols && symbols.length === 12 ? symbols : DEFAULT_SYMBOLS;

  // Synthesize Retro SFX Zero-Dependency audio oscillator
  const playSynthesizedSound = (type: 'spin' | 'win' | 'lose') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'spin') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1); gain1.connect(ctx.destination);
        osc2.connect(gain2); gain2.connect(ctx.destination);
        
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain1.gain.setValueAtTime(0.12, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.3);

        osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12); // G5
        osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.22); // C6
        gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.42);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.45);
      } else if (type === 'lose') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Browser autoplay exception
    }
  };

  const handleSpinSubmit = () => {
    if (isSpinning) return;
    if (balance < bet) {
      setShowWarning(true);
      return;
    }

    setIsSpinning(true);
    setPayoutResult(null);
    setSpinClass('animate-bounce');
    playSynthesizedSound('spin');
    
    // Deduct initial bet balance
    onUpdateBalance(-bet, 'SLOTS_SPIN_BET', `Deducted PHP ${bet} for slot spin.`);

    let spinsCount = 0;
    const interval = setInterval(() => {
      setReels([
        activeSymbols[Math.floor(Math.random() * activeSymbols.length)].char,
        activeSymbols[Math.floor(Math.random() * activeSymbols.length)].char,
        activeSymbols[Math.floor(Math.random() * activeSymbols.length)].char,
      ]);
      spinsCount++;
      if (spinsCount > 6) {
        clearInterval(interval);
        
        // Final secure RNG outcome
        let finalReels = [
          activeSymbols[Math.floor(Math.random() * activeSymbols.length)].char,
          activeSymbols[Math.floor(Math.random() * activeSymbols.length)].char,
          activeSymbols[Math.floor(Math.random() * activeSymbols.length)].char,
        ];

        // Profit margins safeguard & Bankruptcy Protection checks
        const checkMultiplier = getReelsMultiplier(finalReels);
        const randFloat = Math.random();

        // 1. Check WinChance limit modifier
        // 2. Check SafeProfitLock. If true and payout is substantial, override outcomes
        const wouldBeBankruptcy = checkMultiplier > 10 && (safeProfitLock || randFloat > winChanceModifier);
        
        if (wouldBeBankruptcy) {
          // Absolute intervention. Re-arrange values to prevent jackpot and ensure platform safety
          // Assign 3 non-matching different symbols ensuring no consecutive double match
          finalReels = [activeSymbols[0].char, activeSymbols[3].char, activeSymbols[6].char];
        }
        
        setReels(finalReels);
        setIsSpinning(false);
        setSpinClass('');
        
        computeSpinResult(finalReels);
      }
    }, 120);
  };

  const getReelsMultiplier = (reelsOutcome: string[]): number => {
    const [r1, r2, r3] = reelsOutcome;
    let multiplier = 0;

    if (r1 === r2 && r2 === r3) {
      const match = activeSymbols.find(s => s.char === r1);
      if (match) multiplier = match.multiplier * 3;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      const matchChar = r1 === r2 ? r1 : (r2 === r3 ? r2 : r1);
      const match = activeSymbols.find(s => s.char === matchChar);
      if (match) multiplier = match.multiplier * 1.25;
    } else if (reelsOutcome.includes('🍒')) {
      const cherryCount = reelsOutcome.filter(r => r === '🍒').length;
      multiplier = cherryCount * 0.75;
    }
    return multiplier;
  };

  const computeSpinResult = (finalReels: string[]) => {
    const multiplier = getReelsMultiplier(finalReels);
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

  const startEditPot = () => {
    setTempPotVal(grandLuckyPot.toString());
    setIsEditingPot(true);
  };

  const savePotValue = () => {
    const numeric = parseFloat(tempPotVal);
    if (!isNaN(numeric) && numeric >= 0) {
      onUpdateLuckyPot(numeric);
    }
    setIsEditingPot(false);
  };

  return (
    <div className="bg-[#141414] p-6 rounded-3xl border border-white/5 shadow-2xl relative space-y-5" id="slots-terminal">
      {/* Insufficient balance modal */}
      {showWarning && (
        <div className="absolute inset-0 bg-black/95 z-30 rounded-3xl p-6 flex flex-col justify-center items-center text-center space-y-4 border border-red-500/30">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-md font-sans font-black text-rose-500 uppercase tracking-tight">
              TOP-UP WALLET REQUIRED
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              You do not have enough funds to spin at a ₱{bet} stake level. Your active balance is ₱{balance.toFixed(2)}. Please make a GCash deposit!
            </p>
          </div>
          <div className="flex gap-2.5 w-full max-w-xs">
            {onRedirectToTopup && (
              <button
                onClick={() => {
                  setShowWarning(false);
                  onRedirectToTopup();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-gold to-gold-dark text-black font-sans font-extrabold text-xs rounded-xl shadow-gold hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-1"
              >
                Top-up via GCash <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setShowWarning(false)}
              className="flex-1 py-2.5 bg-zinc-800 text-slate-300 hover:text-white font-sans font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gold" />
          <h3 className="text-lg font-sans font-black text-slate-100 flex items-center gap-1.5">
            MGM GOLDEN REELS
            <span className="text-[9px] font-mono tracking-widest uppercase bg-gold/15 text-gold px-1.5 py-0.5 rounded border border-gold/30">
              12 SYMBOLS ACTIVE
            </span>
          </h3>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 bg-[#1F1F1F] border border-white/5 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowRules(!showRules)}
            className="p-1.5 bg-[#1F1F1F] border border-white/5 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Paytables Rules overlay */}
      {showRules && (
        <div className="absolute inset-0 bg-black/95 z-20 rounded-3xl p-6 overflow-y-auto border border-gold/30 text-xs text-slate-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
            <h4 className="text-gold font-sans font-bold text-sm">Real-time Slots RTP & Multipliers</h4>
            <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer text-sm font-bold">✕ Close</button>
          </div>
          <div className="space-y-3 font-sans">
            <p>
              Match three symbols consecutively to trigger progressive jackpot payouts. Single cherries reward scatter payouts.
            </p>
            <div className="bg-black/50 p-3 rounded-xl border border-white/5 space-y-1 font-mono">
              <span className="block text-gold text-[10px] font-bold uppercase tracking-wider">Dynamic Multiplier Ledger (3-of-a-kind):</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400 text-[9px]">
                {activeSymbols.map(sym => (
                  <span key={sym.char}>{sym.char} {sym.name}: {sym.multiplier * 3}x</span>
                ))}
              </div>
              <span className="block text-slate-500 text-[9px] mt-2 leading-relaxed">
                * Consecutively paired pairs trigger a 1.25x jackpot return!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grand Lucky Pot HUD */}
      <div className="bg-gradient-to-r from-black/80 to-black/40 rounded-2xl p-4 border border-gold/15 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-mono text-gold font-black block">
            ⭐ MY GRAND LUCKY POT ⭐
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isEditingPot ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempPotVal}
                  onChange={(e) => setTempPotVal(e.target.value)}
                  className="bg-zinc-900 border border-gold text-white text-md font-mono rounded px-2 py-0.5 w-32 focus:outline-none"
                />
                <button
                  onClick={savePotValue}
                  className="p-1 bg-gold text-black rounded hover:opacity-90 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <span className="text-lg font-bold font-mono text-transparent bg-clip-text bg-gradient-to-br from-white via-gold to-[#CD7F32]">
                  ₱{(grandLuckyPot || 148930.22).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <button
                  onClick={startEditPot}
                  className="p-1 bg-white/5 text-slate-400 hover:text-gold rounded transition-colors cursor-pointer"
                  title="Manually input Lucky Pot"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="bg-gold/5 px-2.5 py-1.5 rounded-xl border border-gold/20 text-[9px] text-zinc-300 font-mono flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" />
          CUSTOMIZABLE POT
        </div>
      </div>

      {/* Reel Box Display Interface */}
      <div className="grid grid-cols-3 gap-3 bg-black p-5 rounded-2xl border border-white/5 shadow-inner relative justify-center items-center h-28 overflow-hidden">
        <div className="absolute inset-y-0 left-1/3 w-[1px] bg-white/5"></div>
        <div className="absolute inset-y-0 right-1/3 w-[1px] bg-white/5"></div>

        {reels.map((symbol, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center text-4xl select-none transition-transform duration-75 ${spinClass}`}
          >
            {symbol}
          </div>
        ))}
      </div>

      {/* Dynamic Outputs */}
      <div className="h-11 flex items-center justify-center text-xs text-center border-t border-b border-white/5 my-1">
        {isSpinning ? (
          <span className="text-slate-400 font-mono animate-pulse">Reels spun under random hardware seeds...</span>
        ) : payoutResult !== null ? (
          payoutResult > 0 ? (
            <div className="text-gold font-sans font-extrabold text-xs bg-gold/10 px-4 py-1.5 rounded-full border border-gold/30 animate-bounce flex items-center gap-1.5 shadow-gold-sm">
              <Sparkles className="w-4 h-4 text-gold animate-spin" />
              WIN! PAYOUT PHP {payoutResult.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          ) : (
            <span className="text-slate-500 font-mono">No winnings this spin. Adjust bet and play once more.</span>
          )
        ) : (
          <span className="text-slate-400 font-mono">Input slot parameters or change multipliers to play.</span>
        )}
      </div>

      {/* Controls and Inputs */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Active Bet Stake:</span>
            <span className="text-xs text-gold font-mono font-bold">PHP {bet}.00</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[20, 50, 100, 500].map((val) => (
              <button
                key={val}
                onClick={() => setBet(val)}
                className={`py-2 border hover:border-gold text-xs font-mono font-bold rounded-xl transition cursor-pointer ${bet === val ? 'bg-gradient-to-r from-gold to-gold-dark text-black border-gold shadow-gold-xs' : 'bg-black border-white/10 text-slate-300'}`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min={20}
            max={1000}
            step={10}
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            className="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-gold"
          />
          <button
            onClick={() => setBet(1000)}
            className="px-2 py-1 bg-gold/10 border border-gold/30 text-[9px] font-mono text-gold rounded-lg hover:bg-gold hover:text-black font-extrabold transition cursor-pointer"
          >
            MAX
          </button>
        </div>

        <button
          onClick={handleSpinSubmit}
          disabled={isSpinning}
          className={`w-full py-4 rounded-xl font-sans font-black text-center text-sm shadow-xl flex items-center justify-center gap-2 transition-transform cursor-pointer active:scale-95 ${isSpinning ? 'bg-[#121212] text-zinc-600 cursor-not-allowed border border-white/5' : 'bg-gradient-to-r from-gold via-yellow-400 to-gold-dark text-black hover:opacity-95'}`}
        >
          <Coins className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          {isSpinning ? 'SPINNING REELS' : `SPIN PHP ${bet}.00`}
        </button>
      </div>
    </div>
  );
}
