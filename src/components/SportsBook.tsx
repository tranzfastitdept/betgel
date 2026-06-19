/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Match, Bet } from '../types';
import { Calendar, Clock, Disc, Plus, Check, TrendingUp, HelpCircle } from 'lucide-react';

interface SportsBookProps {
  balance: number;
  matches: Match[];
  onPlaceBet: (betSlip: Omit<Bet, 'id' | 'createdAt' | 'username'>) => void;
  onAddMatch: (match: Omit<Match, 'id' | 'createdAt'>) => void;
  onSettleMatch: (matchId: string, result: 'Won_A' | 'Won_B' | 'Draw' | 'Void') => void;
  currentUserRole: 'admin' | 'user';
  onRedirectToTopup?: () => void;
}

export default function SportsBook({ balance, matches, onPlaceBet, onAddMatch, onSettleMatch, currentUserRole, onRedirectToTopup }: SportsBookProps) {
  // Betting Slip State
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<'A' | 'B' | 'Draw' | null>(null);
  const [stake, setStake] = useState<number>(100);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  
  // Custom Create Match Inputs (Simulation/Admin)
  const [sport, setSport] = useState<Match['sport']>('Basketball');
  const [league, setLeague] = useState('PBA Governor Cup');
  const [teamA, setTeamA] = useState('Ginebra San Miguel');
  const [teamB, setTeamB] = useState('Meralco Bolts');
  const [startDate, setStartDate] = useState('2026-06-25');
  const [startTime, setStartTime] = useState('18:30');
  const [oddsA, setOddsA] = useState<number>(1.85);
  const [oddsB, setOddsB] = useState<number>(2.20);
  const [oddsDraw, setOddsDraw] = useState<number>(3.50);

  const [showAdminConsole, setShowAdminConsole] = useState(false);

  const handleSelectOutcome = (match: Match, outcome: 'A' | 'B' | 'Draw') => {
    setSelectedMatch(match);
    setSelectedOutcome(outcome);
    setStake(Math.max(50, Math.min(balance, 100))); // Safe default wager level
  };

  const getOdds = (match: Match, prediction: 'A' | 'B' | 'Draw'): number => {
    if (prediction === 'A') return match.oddsA;
    if (prediction === 'B') return match.oddsB;
    return match.oddsDraw;
  };

  const getOutcomeName = (match: Match, prediction: 'A' | 'B' | 'Draw'): string => {
    if (prediction === 'A') return match.teamA;
    if (prediction === 'B') return match.teamB;
    return 'Draw';
  };

  const handleConfirmBetSlip = () => {
    if (!selectedMatch || !selectedOutcome) return;
    if (balance < stake) {
      setShowWarning(true);
      return;
    }
    if (stake < 10) {
      alert("Minimum stake required is PHP 10.");
      return;
    }

    const betOdds = getOdds(selectedMatch, selectedOutcome);
    const payout = Math.round(stake * betOdds * 100) / 100;

    onPlaceBet({
      userId: 'current-user',
      matchId: selectedMatch.id,
      sport: selectedMatch.sport,
      teamA: selectedMatch.teamA,
      teamB: selectedMatch.teamB,
      prediction: selectedOutcome,
      stake,
      odds: betOdds,
      potentialPayout: payout,
      status: 'Open'
    });

    // Reset bet slip
    setSelectedMatch(null);
    setSelectedOutcome(null);
  };

  const handleAdminMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA || !teamB || !league) {
      alert("Please fill all teams and league variables.");
      return;
    }
    onAddMatch({
      sport,
      league,
      teamA,
      teamB,
      startDate,
      startTime,
      oddsA,
      oddsB,
      oddsDraw,
      status: 'Open'
    });
    // Set default values back
    setTeamA('');
    setTeamB('');
  };

  return (
    <div className="space-y-6 relative" id="sportsbook-view">
      {/* Insufficient balance modal */}
      {showWarning && (
        <div className="absolute inset-0 bg-[#050505]/95 z-30 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4 border border-red-500/30">
          <div className="w-12 h-12 rounded-full bg-red-400/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
            <Calendar className="w-6 h-6 animate-none" />
          </div>
          <div>
            <h4 className="text-md font-sans font-black text-rose-500 uppercase tracking-tight">
              INSOLVENT FUNDS WARNING
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              Your wallet balance is insufficient to place a ₱{stake} wager. Please top up your active PHP balance.
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
      {/* Top Interactive Panel */}
      <div className="bg-[#141414] p-6 rounded-2xl border border-gold/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gold to-gold-dark flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-gold" />
            STAKE & MGM SPORTSBOOK
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real odds, instantaneous payouts, and complete admin settlement tools. Play with PHP.
          </p>
        </div>

        <div className="flex gap-2">
          {currentUserRole === 'admin' && (
            <button
              onClick={() => setShowAdminConsole(!showAdminConsole)}
              className="px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold font-sans font-bold text-xs rounded-lg border border-gold/30 transition cursor-pointer"
            >
              {showAdminConsole ? 'Hide Admin Matchmaker' : 'Show Admin Matchmaker'}
            </button>
          )}
        </div>
      </div>

      {/* Admin Creator Cockpit Drawer */}
      {showAdminConsole && currentUserRole === 'admin' && (
        <form onSubmit={handleAdminMatchSubmit} className="bg-[#141414] p-5 rounded-2xl border border-gold/20 grid grid-cols-1 md:grid-cols-3 gap-4" id="match-creator-form">
          <div className="md:col-span-3 border-b border-white/5 pb-2 flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-gold flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-gold" /> CREATE LIVE FIXTURE (ADMIN COCKPIT)
            </span>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Sport Discipline:</label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value as Match['sport'])}
              className="w-full bg-black border border-white/10 rounded p-2 text-xs text-slate-300 focus:outline-none focus:border-gold"
            >
              <option value="Basketball">Basketball</option>
              <option value="Soccer">Soccer</option>
              <option value="Tennis">Tennis</option>
              <option value="Rugby">Rugby</option>
              <option value="Esports">Esports</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">League Title:</label>
            <input
              type="text"
              value={league}
              onChange={(e) => setLeague(e.target.value)}
              className="w-full bg-black border border-white/10 rounded p-2 text-xs text-slate-300 focus:outline-none focus:border-gold"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Fixture Date & Time:</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-black border border-white/10 rounded p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-gold"
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-black border border-white/10 rounded p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Team A:</label>
            <input
              type="text"
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              placeholder="e.g. Los Angeles Lakers"
              className="w-full bg-black border border-white/10 rounded p-2 text-xs text-slate-300 focus:outline-none focus:border-gold"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Team B:</label>
            <input
              type="text"
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              placeholder="e.g. Boston Celtics"
              className="w-full bg-black border border-white/10 rounded p-2 text-xs text-slate-300 focus:outline-none focus:border-gold"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Multipliers (Odds):</label>
            <div className="grid grid-cols-3 gap-1.5 font-mono">
              <div>
                <span className="text-[9px] text-slate-500 font-mono">Team A</span>
                <input
                  type="number"
                  step="0.01"
                  value={oddsA}
                  onChange={(e) => setOddsA(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded p-1.5 text-xs text-slate-300 text-center font-mono focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-mono">Draw</span>
                <input
                  type="number"
                  step="0.01"
                  value={oddsDraw}
                  onChange={(e) => setOddsDraw(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded p-1.5 text-xs text-slate-300 text-center font-mono focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-mono">Team B</span>
                <input
                  type="number"
                  step="0.01"
                  value={oddsB}
                  onChange={(e) => setOddsB(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded p-1.5 text-xs text-slate-300 text-center font-mono focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-3 text-right">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-gold to-gold-dark hover:opacity-90 text-black font-sans font-extrabold text-xs rounded-xl shadow-gold-sm transition cursor-pointer"
            >
              ADD MATCH TO BOOKMAKER
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Match List vs Bet Slip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Match Listing */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-sans font-bold text-gold uppercase tracking-widest flex items-center gap-1.5">
            <Disc className="w-4 h-4 text-gold animate-spin" /> Live & Upcoming Bets
          </h3>

          <div className="space-y-3.5">
            {matches.filter(m => m.status === 'Open').length === 0 ? (
              <div className="bg-[#141414] p-8 rounded-2xl border border-white/5 text-center">
                <p className="text-xs text-slate-400">All fixtures settled. Admins can create new matches above!</p>
              </div>
            ) : (
              matches.filter(m => m.status === 'Open').map((match) => (
                <div
                  key={match.id}
                  id={`match-card-${match.id}`}
                  className="bg-[#141414] p-4 rounded-2xl border border-white/5 hover:border-gold/30 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider bg-black/60 text-slate-300 px-2.5 py-0.5 rounded font-mono border border-white/10">
                        {match.sport} • {match.league}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      {match.startDate}
                      <Clock className="w-3.5 h-3.5 text-gold ml-1" />
                      {match.startTime}
                    </div>
                  </div>

                  {/* Battle Panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <div className="text-sm font-bold text-slate-100">{match.teamA}</div>
                      <span className="text-[10px] text-zinc-500 font-mono">vs</span>
                      <div className="text-sm font-bold text-slate-100">{match.teamB}</div>
                    </div>

                    {/* Odd buttons inside bento-style column */}
                    <div className="grid grid-cols-3 gap-1.5 font-mono text-center">
                      <button
                        onClick={() => handleSelectOutcome(match, 'A')}
                        id={`bet-odd-a-${match.id}`}
                        className={`p-2 bg-black hover:bg-white/5 border text-xs rounded transition flex flex-col items-center justify-center cursor-pointer ${selectedMatch?.id === match.id && selectedOutcome === 'A' ? 'border-gold text-gold bg-gold/10 font-bold' : 'border-white/10 text-slate-300'}`}
                      >
                        <span className="text-[9px] text-slate-500 font-sans">1</span>
                        <span className="font-bold">{match.oddsA}</span>
                      </button>
                      <button
                        onClick={() => handleSelectOutcome(match, 'Draw')}
                        id={`bet-odd-draw-${match.id}`}
                        className={`p-2 bg-black hover:bg-white/5 border text-xs rounded transition flex flex-col items-center justify-center cursor-pointer ${selectedMatch?.id === match.id && selectedOutcome === 'Draw' ? 'border-gold text-gold bg-gold/10 font-bold' : 'border-white/10 text-slate-300'}`}
                      >
                        <span className="text-[9px] text-slate-500 font-sans">Draw</span>
                        <span className="font-bold">{match.oddsDraw}</span>
                      </button>
                      <button
                        onClick={() => handleSelectOutcome(match, 'B')}
                        id={`bet-odd-b-${match.id}`}
                        className={`p-2 bg-black hover:bg-white/5 border text-xs rounded transition flex flex-col items-center justify-center cursor-pointer ${selectedMatch?.id === match.id && selectedOutcome === 'B' ? 'border-gold text-gold bg-gold/10 font-bold' : 'border-white/10 text-slate-300'}`}
                      >
                        <span className="text-[9px] text-slate-500 font-sans">2</span>
                        <span className="font-bold">{match.oddsB}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Settled Matches Table */}
          <div className="mt-8 space-y-3">
            <h4 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-widest">
              Settlements & Historic Outcomes
            </h4>
            <div className="bg-[#141414] rounded-2xl border border-white/5 p-4 overflow-x-auto">
              {matches.filter(m => m.status !== 'Open').length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500 font-mono">No historical settlements recorded yet.</div>
              ) : (
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="text-[10px] font-mono text-slate-500 uppercase border-b border-white/5">
                    <tr>
                      <th className="pb-2">Sport</th>
                      <th className="pb-2">Match Title</th>
                      <th className="pb-2">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {matches.filter(m => m.status !== 'Open').map((match) => (
                      <tr key={match.id} className="hover:bg-white/5">
                        <td className="py-2.5 font-mono text-[10px] text-gold">{match.sport}</td>
                        <td className="py-2.5 font-bold text-slate-200">{match.teamA} vs {match.teamB}</td>
                        <td className="py-2.5">
                          <span className="inline-flex items-center gap-1 bg-emerald-950/40 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded font-mono text-[10px]">
                            <Check className="w-3 h-3" />
                            {match.status === 'Won_A' ? match.teamA : (match.status === 'Won_B' ? match.teamB : 'Draw')} Winner
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Bet Slip Sidebar Column */}
        <div className="space-y-4 font-sans">
          <h3 className="text-sm font-sans font-bold text-gold uppercase tracking-widest">
            Bet Slip Terminal
          </h3>

          <div className="bg-[#141414] p-5 rounded-2xl border border-gold/20 shadow-2xl space-y-4 relative" id="sportsbook-slip">
            {!selectedMatch || !selectedOutcome ? (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                <HelpCircle className="w-10 h-10 text-slate-600" />
                <p className="text-xs font-mono text-slate-400 leading-normal">
                  No predictions selected. Select live odds on any game to build your ticket slip.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <span className="text-[10px] font-mono uppercase bg-gold/15 text-gold px-2 py-0.5 rounded border border-gold/30">
                    {selectedMatch.sport} Single
                  </span>
                  <button
                    onClick={() => { setSelectedMatch(null); setSelectedOutcome(null); }}
                    className="text-slate-450 hover:text-slate-200 text-xs font-bold font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] text-slate-500 uppercase font-mono">Prediction Outcome:</span>
                  <span className="block font-sans font-black text-md text-slate-100">
                    {getOutcomeName(selectedMatch, selectedOutcome)} to win!
                  </span>
                  <span className="block text-xs font-mono text-slate-400 italic">
                    {selectedMatch.teamA} vs {selectedMatch.teamB}
                  </span>
                </div>

                {/* Odds detail */}
                <div className="bg-black/50 p-3 rounded border border-white/10 flex justify-between items-center font-mono text-xs">
                  <span className="text-slate-400">Fixed Odds multiplier:</span>
                  <span className="text-gold font-bold text-md">@{getOdds(selectedMatch, selectedOutcome)}</span>
                </div>

                {/* Stake selection settings */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Total Wager (PHP):</span>
                    <span className="text-gold font-bold">PHP {stake}</span>
                  </div>
                  <input
                    id="sportsbook-bet-range"
                    type="range"
                    min={10}
                    max={Math.min(balance, 5000)}
                    step={10}
                    value={stake}
                    onChange={(e) => setStake(Number(e.target.value))}
                    className="w-full accent-gold cursor-pointer h-1 rounded-full bg-[#1A1A1A]"
                  />
                  <div className="grid grid-cols-4 gap-1.5 text-[9px] font-mono text-center">
                    {[50, 100, 200, 500].map((val) => (
                      <button
                        key={val}
                        onClick={() => setStake(val)}
                        className={`p-1 rounded cursor-pointer ${stake === val ? 'bg-gradient-to-r from-gold to-gold-dark text-black font-extrabold shadow-gold-sm' : 'bg-black text-slate-400 border border-white/10'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Potential payout metrics */}
                <div className="bg-gold/5 p-3 rounded border border-gold/25 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#A0A0A0] font-mono">Potential Payout:</span>
                    <span className="text-gold font-sans font-extrabold text-md font-mono">
                      PHP {Math.round(stake * getOdds(selectedMatch, selectedOutcome) * 100) / 100}
                    </span>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  onClick={handleConfirmBetSlip}
                  id="place-bet-slip-btn"
                  className="w-full py-3.5 bg-gradient-to-r from-gold via-yellow-400 to-gold-dark hover:opacity-95 text-black font-sans font-extrabold text-sm rounded-xl cursor-pointer transition shadow-xl"
                >
                  PLACE BET SLIP WAGER
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
