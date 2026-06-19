/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, RefreshCw, Volume2, VolumeX, Sparkles, AlertTriangle } from 'lucide-react';

interface BlackjackGameProps {
  balance: number;
  onUpdateBalance: (amount: number, auditAction: string, auditDetail: string) => void;
  onLogGame: (bet: number, win: number, playerHand: string[], dealerHand: string[], status: 'Won' | 'Lost' | 'Push' | 'Blackjack') => void;
  onRedirectToTopup?: () => void;
}

interface Card {
  suit: '♥' | '♦' | '♣' | '♠';
  rank: string;
  value: number;
}

const SUITS: ('♥' | '♦' | '♣' | '♠')[] = ['♥', '♦', '♣', '♠'];
const RANKS = [
  { rank: 'A', value: 11 },
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 10 },
  { rank: 'Q', value: 10 },
  { rank: 'K', value: 10 }
];

export default function BlackjackGame({ balance, onUpdateBalance, onLogGame, onRedirectToTopup }: BlackjackGameProps) {
  const [bet, setBet] = useState<number>(50);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'deal' | 'player_turn' | 'dealer_turn' | 'game_over'>('idle');
  const [gameResult, setGameResult] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [currentBetLevel, setCurrentBetLevel] = useState<number>(0);
  const [showWarning, setShowWarning] = useState<boolean>(false);

  // Sound generator
  const playSynthesizedSound = (type: 'deal' | 'win' | 'lose' | 'alert') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'deal') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'win') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'lose') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'alert') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {}
  };

  const createFreshDeck = (): Card[] => {
    const newDeck: Card[] = [];
    for (const suit of SUITS) {
      for (const item of RANKS) {
        newDeck.push({
          suit,
          rank: item.rank,
          value: item.value
        });
      }
    }
    return newDeck;
  };

  const shuffleDeck = (newDeck: Card[]): Card[] => {
    const shuffled = [...newDeck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const calculateScore = (cards: Card[]): number => {
    let score = cards.reduce((acc, card) => acc + card.value, 0);
    let aces = cards.filter(c => c.rank === 'A').length;
    
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    return score;
  };

  const verifyBlackjack = (cards: Card[]): boolean => {
    return cards.length === 2 && calculateScore(cards) === 21;
  };

  const handleStartGameAndDeal = () => {
    if (gameState === 'player_turn' || gameState === 'dealer_turn') return;
    if (balance < bet) {
      playSynthesizedSound('alert');
      setShowWarning(true);
      return;
    }

    // Deduct bet immediately
    onUpdateBalance(-bet, 'BLACKJACK_BET', `Wagered PHP ${bet} in Vegas Blackjack.`);
    setCurrentBetLevel(bet);

    // Prepare deck shuffler
    const freshDeck = shuffleDeck(createFreshDeck());
    const dealerInit = [freshDeck[0], freshDeck[1]];
    const playerInit = [freshDeck[2], freshDeck[3]];
    const remainingDeck = freshDeck.slice(4);

    setDealerCards(dealerInit);
    setPlayerCards(playerInit);
    setDeck(remainingDeck);
    playSynthesizedSound('deal');

    const playerScore = calculateScore(playerInit);
    const dealerScore = calculateScore(dealerInit);

    // Blackjack assessment
    const playerBJ = verifyBlackjack(playerInit);
    const dealerBJ = verifyBlackjack(dealerInit);

    if (playerBJ && dealerBJ) {
      setGameState('game_over');
      setGameResult('Push! Both Dealer and Player hold Blackjack.');
      onUpdateBalance(bet, 'BLACKJACK_PUSH', `Blackjack Push returned PHP ${bet}.`);
      onLogGame(bet, bet, playerInit.map(c => c.rank + c.suit), dealerInit.map(c => c.rank + c.suit), 'Push');
    } else if (playerBJ) {
      setGameState('game_over');
      const payoutBJ = bet * 2.5; // Pays 3 to 2 (Returns total stake + 1.5x profit)
      setGameResult('BLACKJACK! Player wins pays 3 to 2.');
      onUpdateBalance(payoutBJ, 'BLACKJACK_WIN_BJ', `Blackjack payout won PHP ${payoutBJ}.`);
      onLogGame(bet, payoutBJ, playerInit.map(c => c.rank + c.suit), dealerInit.map(c => c.rank + c.suit), 'Blackjack');
      playSynthesizedSound('win');
    } else if (dealerBJ) {
      setGameState('game_over');
      setGameResult('Dealer Blackjack! Player loses.');
      onLogGame(bet, 0, playerInit.map(c => c.rank + c.suit), dealerInit.map(c => c.rank + c.suit), 'Lost');
      playSynthesizedSound('lose');
    } else {
      setGameState('player_turn');
      setGameResult('');
    }
  };

  const handleHit = () => {
    if (gameState !== 'player_turn') return;
    if (deck.length === 0) return;

    const drawn = deck[0];
    const newPlayerCards = [...playerCards, drawn];
    setPlayerCards(newPlayerCards);
    setDeck(deck.slice(1));
    playSynthesizedSound('deal');

    const score = calculateScore(newPlayerCards);
    if (score > 21) {
      setGameState('game_over');
      setGameResult('Bust! Player total exceeds 21.');
      onLogGame(currentBetLevel, 0, newPlayerCards.map(c => c.rank + c.suit), dealerCards.map(c => c.rank + c.suit), 'Lost');
      playSynthesizedSound('lose');
    }
  };

  const handleDoubleDown = () => {
    if (gameState !== 'player_turn') return;
    if (playerCards.length !== 2) return;
    if (balance < currentBetLevel) {
      playSynthesizedSound('alert');
      alert("Insufficient balance to Double Down.");
      return;
    }

    // Deduct double wager
    onUpdateBalance(-currentBetLevel, 'BLACKJACK_DOUBLE', `Doubled stake by PHP ${currentBetLevel}.`);
    const totalWager = currentBetLevel * 2;
    setCurrentBetLevel(totalWager);

    const drawn = deck[0];
    const newPlayerCards = [...playerCards, drawn];
    setPlayerCards(newPlayerCards);
    const remainingDeck = deck.slice(1);
    setDeck(remainingDeck);
    playSynthesizedSound('deal');

    const pScore = calculateScore(newPlayerCards);
    if (pScore > 21) {
      setGameState('game_over');
      setGameResult('Bust on Double! Total exceeds 21.');
      onLogGame(totalWager, 0, newPlayerCards.map(c => c.rank + c.suit), dealerCards.map(c => c.rank + c.suit), 'Lost');
      playSynthesizedSound('lose');
    } else {
      // Force stand after exactly 1 deal on Double Down
      triggerDealerAI(newPlayerCards, remainingDeck, totalWager);
    }
  };

  const handleStand = () => {
    if (gameState !== 'player_turn') return;
    triggerDealerAI(playerCards, deck, currentBetLevel);
  };

  const triggerDealerAI = (pHand: Card[], activeDeck: Card[], totalWager: number) => {
    setGameState('dealer_turn');
    let currentDealerCards = [...dealerCards];
    let workingDeck = [...activeDeck];
    playSynthesizedSound('deal');

    // Dealer hits on soft 17 (Vegas Casino rules)
    while (calculateScore(currentDealerCards) < 17) {
      if (workingDeck.length === 0) break;
      currentDealerCards.push(workingDeck[0]);
      workingDeck = workingDeck.slice(1);
    }

    setDealerCards(currentDealerCards);
    setDeck(workingDeck);
    setGameState('game_over');

    const playerScore = calculateScore(pHand);
    const dealerScore = calculateScore(currentDealerCards);

    let payout = 0;
    let statusText = '';
    let finalStatus: 'Won' | 'Lost' | 'Push' | 'Blackjack' = 'Lost';

    if (dealerScore > 21) {
      payout = totalWager * 2;
      statusText = 'Dealer Busts! Player wins flat double.';
      finalStatus = 'Won';
    } else if (playerScore > dealerScore) {
      payout = totalWager * 2;
      statusText = `Player wins with ${playerScore} over Dealer's ${dealerScore}!`;
      finalStatus = 'Won';
    } else if (playerScore < dealerScore) {
      payout = 0;
      statusText = `Dealer wins with ${dealerScore} over Player's ${playerScore}.`;
      finalStatus = 'Lost';
    } else {
      payout = totalWager;
      statusText = `Dealer/Player Push on ${playerScore}. Bet returned.`;
      finalStatus = 'Push';
    }

    setGameResult(statusText);
    if (payout > 0) {
      onUpdateBalance(payout, 'BLACKJACK_WIN', `Blackjack deal returned PHP ${payout}.`);
      playSynthesizedSound('win');
    } else {
      playSynthesizedSound('lose');
    }

    onLogGame(totalWager, payout, pHand.map(c => c.rank + c.suit), currentDealerCards.map(c => c.rank + c.suit), finalStatus);
  };

  const getSuiteColor = (suit: '♥' | '♦' | '♣' | '♠') => {
    return suit === '♥' || suit === '♦' ? 'text-red-500' : 'text-slate-300';
  };

  return (
    <div className="bg-[#141414] p-6 rounded-2xl border border-gold/20 shadow-2xl relative" id="blackjack-terminal">
      {/* Dynamic top-up warning screen */}
      {showWarning && (
        <div className="absolute inset-0 bg-black/95 z-30 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4 border border-red-500/30">
          <div className="w-12 h-12 rounded-full bg-red-400/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
            <AlertTriangle className="w-6 h-6 animate-none" />
          </div>
          <div>
            <h4 className="text-md font-sans font-black text-rose-500 uppercase tracking-tight">
              TOP-UP REQUIRED
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              Your wallet balance is insufficient to place a ₱{bet} blackjack bet. Your active balance is ₱{balance.toFixed(2)}. Go to the profile page to deposit PHP funds.
            </p>
          </div>
          <div className="flex gap-2.5 w-full max-w-xs">
            {onRedirectToTopup && (
              <button
                onClick={() => {
                  setShowWarning(false);
                  onRedirectToTopup();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-gold to-gold-dark text-black font-sans font-black text-xs rounded-xl shadow-gold hover:opacity-90 transition cursor-pointer"
              >
                Top-up GCash
              </button>
            )}
            <button
              onClick={() => setShowWarning(false)}
              className="flex-1 py-2.5 bg-zinc-800 text-slate-300 hover:text-white font-sans font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gold/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold" />
          <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center gap-1.5">
            VEGAS PRO BLACKJACK
            <span className="text-[10px] uppercase tracking-widest bg-gold/10 text-gold px-1.5 py-0.5 rounded border border-gold/30 font-mono">
              Pays 3:2
            </span>
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 bg-black/40 border border-white/10 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowRules(!showRules)}
            className="p-1.5 bg-black/40 border border-white/10 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rules overlay */}
      {showRules && (
        <div className="absolute inset-0 bg-black/95 z-20 rounded-2xl p-6 overflow-y-auto border border-gold/30 text-xs text-slate-300">
          <div className="flex justify-between items-center border-b border-gold/25 pb-2 mb-3">
            <h4 className="text-gold font-sans font-bold text-sm">Blackjack Betting Guidelines</h4>
            <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer text-xs font-bold">✕ Close</button>
          </div>
          <div className="space-y-2 text-slate-300 leading-normal font-sans">
            <p>• Aim: Gather cards closer to 21 than the dealer without busting (exceeding 21).</p>
            <p>• Aces count as 11 or 1 depending on convenience. Face cards count as 10.</p>
            <p>• <strong>Hit:</strong> Deal one additional card.</p>
            <p>• <strong>Stand:</strong> Finish your decisions, trigger Dealer AI.</p>
            <p>• <strong>Double Down:</strong> Increase original PHP bet level by 2x, deal exactly ONE extra card, then stand immediately.</p>
            <p>• Natural Blackjack pays 3 to 2 (Returns stake + 1.5x profit).</p>
          </div>
        </div>
      )}

      {/* Actual Live Playing Cards Desk */}
      <div className="bg-black/60 rounded-xl p-4 border border-white/5 space-y-6 relative h-64 flex flex-col justify-between shadow-inner">
        
        {/* Dealer Hand */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider">Croupier Dealer Hand:</span>
            {dealerCards.length > 0 && (
              <span className="text-[10px] bg-red-950/40 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-mono font-bold">
                {gameState === 'player_turn' ? 'Score: ?' : `Score: ${calculateScore(dealerCards)}`}
              </span>
            )}
          </div>
          <div className="flex gap-2.5">
            {dealerCards.length === 0 ? (
              <div className="text-xs text-slate-500 py-3 italic">Place bet to deal deck...</div>
            ) : (
              dealerCards.map((card, idx) => {
                const isHidden = gameState === 'player_turn' && idx === 1;
                return (
                  <div
                    key={idx}
                    id={`dealer-card-${idx}`}
                    className={`w-12 h-16 rounded-md bg-white text-black border shadow-md flex flex-col justify-between p-1 transition-all ${isHidden ? 'bg-gradient-to-br from-gold via-gold-dark to-black border-gold/40 text-transparent shadow-inner' : 'border-slate-300'}`}
                  >
                    {!isHidden && (
                      <>
                        <span className="text-xs font-bold font-mono tracking-tighter leading-none">{card.rank}</span>
                        <span className={`text-center text-md ${getSuiteColor(card.suit)} leading-none`}>{card.suit}</span>
                        <span className="text-xs font-bold text-right font-mono tracking-tighter leading-none">{card.rank}</span>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Player Hand */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider">Your Hand (PHP Stakes):</span>
            {playerCards.length > 0 && (
              <span className="text-[10px] bg-gold/5 text-gold px-2 py-0.5 rounded border border-gold/20 font-mono font-bold">
                Score: {calculateScore(playerCards)}
              </span>
            )}
          </div>
          <div className="flex gap-2.5">
            {playerCards.length === 0 ? (
              <div className="text-xs text-slate-500 py-3 italic">Await dealing...</div>
            ) : (
              playerCards.map((card, idx) => (
                <div
                  key={idx}
                  id={`player-card-${idx}`}
                  className="w-12 h-16 rounded-md bg-white text-black border border-slate-300 shadow-md flex flex-col justify-between p-1"
                >
                  <span className="text-xs font-bold font-mono tracking-tighter leading-none">{card.rank}</span>
                  <span className={`text-center text-md ${getSuiteColor(card.suit)} leading-none`}>{card.suit}</span>
                  <span className="text-xs font-bold text-right font-mono tracking-tighter leading-none">{card.rank}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Game HUD Log Console */}
      <div className="h-12 flex items-center justify-center border-t border-b border-white/5 my-3 text-center">
        {gameState === 'idle' ? (
          <span className="text-slate-400 font-mono text-xs">Set wager above and press DEAL to initiate hand.</span>
        ) : gameResult ? (
          <div className="bg-gold/10 border border-gold/20 rounded px-4 py-1.5 text-xs font-sans font-bold text-gold animate-pulse">
            {gameResult}
          </div>
        ) : (
          <span className="text-slate-300 text-xs font-mono animate-pulse">
            Select HIT, STAND, or DOUBLE DOWN...
          </span>
        )}
      </div>

      {/* Bet Adjustments */}
      {gameState === 'idle' || gameState === 'game_over' ? (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400 font-mono">Adjust Wager:</span>
              <span className="text-xs text-gold font-mono font-bold">PHP {bet}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  onClick={() => setBet(val)}
                  className={`py-1.5 border hover:border-gold text-xs font-mono font-bold rounded transition cursor-pointer ${bet === val ? 'bg-gradient-to-r from-gold to-gold-dark text-black border-gold font-extrabold' : 'bg-black border-white/10 text-slate-300'}`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartGameAndDeal}
            id="blackjack-deal-btn"
            className="w-full py-3.5 bg-gradient-to-r from-gold to-gold-dark hover:opacity-90 text-black font-sans font-extrabold text-sm rounded-xl border border-none shadow-gold-sm transition cursor-pointer"
          >
            DEAL NEW HAND
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleHit}
            disabled={gameState !== 'player_turn'}
            id="bj-hit-btn"
            className="py-3 bg-[#1A1A1A] hover:bg-white/5 text-white font-sans font-semibold rounded text-xs transition border border-white/10 cursor-pointer"
          >
            HIT (Card)
          </button>
          <button
            onClick={handleStand}
            disabled={gameState !== 'player_turn'}
            id="bj-stand-btn"
            className="py-3 bg-gradient-to-r from-gold to-gold-dark text-black font-sans font-extrabold rounded text-xs transition border-none shadow-gold-sm cursor-pointer"
          >
            STAND (Hold)
          </button>
          <button
            onClick={handleDoubleDown}
            disabled={gameState !== 'player_turn' || playerCards.length !== 2}
            id="bj-double-btn"
            className="py-3 bg-[#CD7F32]/10 hover:bg-[#CD7F32]/25 text-[#CD7F32] font-sans font-bold rounded text-xs transition border border-[#CD7F32]/30 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            DOUBLE DOWN
          </button>
        </div>
      )}
    </div>
  );
}
