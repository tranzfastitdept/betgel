/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Wallet, Deposit, Withdrawal, Bet, SlotLog, BlackjackLog, AuditLog } from '../types';
import { ShieldCheck, Users, TrendingUp, DollarSign, ArrowDown, ArrowUp, CheckCircle, XCircle, Search, UserMinus, UserCheck, BarChart3, AlertCircle } from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  wallets: Wallet[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  bets: Bet[];
  slotsLogs: SlotLog[];
  blackjackLogs: BlackjackLog[];
  auditLogs: AuditLog[];
  onUpdateUserStatus: (userId: string, newStatus: 'active' | 'suspended') => void;
  onApproveDeposit: (depositId: string, notes?: string) => void;
  onRejectDeposit: (depositId: string, notes?: string) => void;
  onApproveWithdrawal: (withdrawalId: string, notes?: string) => void;
  onCompleteWithdrawal: (withdrawalId: string, notes?: string) => void;
  onRejectWithdrawal: (withdrawalId: string, notes?: string) => void;
  onSettleMatch: (matchId: string, result: 'Won_A' | 'Won_B' | 'Draw' | 'Void') => void;
  matches: any[];
}

export default function AdminPanel({
  users,
  wallets,
  deposits,
  withdrawals,
  bets,
  slotsLogs,
  blackjackLogs,
  auditLogs,
  onUpdateUserStatus,
  onApproveDeposit,
  onRejectDeposit,
  onApproveWithdrawal,
  onCompleteWithdrawal,
  onRejectWithdrawal,
  onSettleMatch,
  matches
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'console' | 'users' | 'deposits' | 'withdrawals' | 'sports' | 'casino' | 'audit'>('console');
  const [userSearchText, setUserSearchText] = useState('');

  // Settle Match Helper state
  const [selectedMatchToSettle, setSelectedMatchToSettle] = useState<string>('');
  const [settlementResult, setSettlementResult] = useState<'Won_A' | 'Won_B' | 'Draw' | 'Void'>('Won_A');

  // Compute stats dynamically from arrays
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  
  const pendingDepositsCount = deposits.filter(d => d.status === 'Pending').length;
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'Pending' || w.status === 'Processing').length;
  
  const totalSlotsWagered = slotsLogs.reduce((acc, current) => acc + current.betAmount, 0);
  const totalSlotsWin = slotsLogs.reduce((acc, current) => acc + current.winAmount, 0);
  const slotsGGR = totalSlotsWagered - totalSlotsWin; // Gross Gaming Revenue

  const totalBlackjackWagered = blackjackLogs.reduce((acc, current) => acc + current.betAmount, 0);
  const totalBlackjackWin = blackjackLogs.reduce((acc, current) => acc + current.winAmount, 0);
  const blackjackGGR = totalBlackjackWagered - totalBlackjackWin; // Gross Gaming Revenue

  const totalBetsVolume = bets.reduce((acc, current) => acc + current.stake, 0);
  // Settled bets that the dealer lost / payout won by player
  const settledBetsPlayerWon = bets.filter(b => b.status === 'Won').reduce((acc, current) => acc + current.potentialPayout, 0);
  const sportsGGR = totalBetsVolume - settledBetsPlayerWon;

  const totalPlatformGGR = slotsGGR + blackjackGGR + sportsGGR;

  const getMatchName = (matchId: string) => {
    const found = matches.find(m => m.id === matchId);
    return found ? `${found.teamA} vs ${found.teamB}` : 'Unknown Fixture';
  };

  return (
    <div className="bg-[#141414] text-slate-100 p-6 rounded-2xl border border-white/5 shadow-2xl space-y-6" id="admin-backoffice-control">
      
      {/* Title Header */}
      <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-gold" />
          <div>
            <h2 className="text-2xl font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-dark">
              MGM BACK OFFICE OPERATIONS
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">
              Fulfillment Desk, Security Shuts, Real-Time GGR Metrics
            </p>
          </div>
        </div>

        {/* Navigation Selector */}
        <div className="flex flex-wrap gap-1.5 bg-black p-1 rounded-xl border border-white/5">
          {[
            { id: 'console', label: 'Dashboard' },
            { id: 'users', label: 'Bettors' },
            { id: 'deposits', label: 'Deposits' },
            { id: 'withdrawals', label: 'Payouts' },
            { id: 'sports', label: 'Sports Settles' },
            { id: 'casino', label: 'GGR Reports' },
            { id: 'audit', label: 'Audit Logs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition uppercase cursor-pointer ${activeTab === tab.id ? 'bg-gradient-to-r from-gold to-gold-dark text-black font-bold shadow-gold-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* PRIMARY CONSOLE METRICS VIEW */}
      {activeTab === 'console' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users card */}
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/10">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">Registered Users</span>
                <span className="text-xl font-bold block">{totalUsersCount} Total</span>
                <span className="text-[9px] text-emerald-400 font-mono">{activeUsersCount} active now</span>
              </div>
            </div>

            {/* Platform GGR */}
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="p-3 bg-gold/10 rounded-lg text-gold border border-gold/10">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">Operator Gross GGR</span>
                <span className={`text-xl font-bold block ${totalPlatformGGR >= 0 ? 'text-gold' : 'text-rose-500'}`}>
                  ₱{totalPlatformGGR.toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Slots + Cards + Sports Book</span>
              </div>
            </div>

            {/* Pending actions */}
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="p-3 bg-gold/10 rounded-lg text-gold border border-gold/10">
                <ArrowDown className="w-5 h-5 text-gold" />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">GCash Deposits Due</span>
                <span className="text-xl font-bold block">{pendingDepositsCount} pending</span>
                <span className="text-[9px] text-slate-500 font-mono">Requires receipt audit</span>
              </div>
            </div>

            {/* Pending payouts */}
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 rounded-lg text-rose-450 border border-rose-500/10">
                <ArrowUp className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">Withdrawals Due</span>
                <span className="text-xl font-bold block">{pendingWithdrawalsCount} pending</span>
                <span className="text-[9px] text-slate-500 font-mono">Needs GCash payout dispatch</span>
              </div>
            </div>
          </div>

          {/* SVG Bento Chart representing daily user growth & GGR split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-gold" /> REVENUE FLOW STATS (PHP METRICS)
              </h4>
              <div className="h-44 flex items-end justify-between border-b border-white/5 pb-2 px-4 gap-2">
                <div className="flex flex-col items-center gap-1 w-1/3">
                  <div className="w-full bg-gold/25 rounded-t border-t border-gold/50 h-28 flex items-center justify-center font-bold font-mono text-white text-xs">
                    ₱{slotsGGR.toFixed(0)}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Slots GGR</span>
                </div>
                <div className="flex flex-col items-center gap-1 w-1/3">
                  <div className="w-full bg-gold/50 rounded-t border-t border-gold h-20 flex items-center justify-center font-bold font-mono text-black text-xs">
                    ₱{blackjackGGR.toFixed(0)}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase">BJ Cards GGR</span>
                </div>
                <div className="flex flex-col items-center gap-1 w-1/3">
                  <div className="w-full bg-emerald-500/30 rounded-t border-t border-emerald-500 h-16 flex items-center justify-center font-bold font-mono text-white text-xs">
                    ₱{sportsGGR.toFixed(0)}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Sports GGR</span>
                </div>
              </div>
            </div>

            <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-gold" /> RAPID MANUAL FULFILLMENT GUIDELINE
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  The Back Office acts as the manual merchant node. Verify receipts and payout statuses in real-time. Approved deposits trigger instantaneous wallet updates. Completed withdrawals clear pending balances automatically to secure ledger integrity.
                </p>
              </div>
              <div className="border border-gold/20 rounded-xl p-3 bg-black/40 text-[10px] text-gold font-mono flex items-center gap-1">
                ✔ Absolute double-ledger verification active.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER MANAGEMENT SECTION */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-mono uppercase text-slate-400">Search Platform Bettors:</span>
            <div className="flex gap-2 w-full max-w-xs bg-black border border-slate-800 rounded px-2.5 py-1.5 items-center">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Type name or email..."
                value={userSearchText}
                onChange={(e) => setUserSearchText(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-200 outline-none w-full"
              />
            </div>
          </div>

          <div className="bg-charcoal rounded-xl border border-slate-800 overflow-x-auto p-4">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800 font-mono">
                <tr>
                  <th className="pb-2">User Details</th>
                  <th className="pb-2">Authority</th>
                  <th className="pb-2">Wallet PHP Balance</th>
                  <th className="pb-2">Security Status</th>
                  <th className="pb-2 text-right">Modifier Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users
                  .filter(u => u.username.toLowerCase().includes(userSearchText.toLowerCase()) || u.email.toLowerCase().includes(userSearchText.toLowerCase()))
                  .map((u) => {
                    const userWallet = wallets.find(w => w.userId === u.id);
                    return (
                      <tr key={u.id} className="hover:bg-slate-900/30">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <img src={u.avatarUrl} alt="Avatar" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full" />
                            <div>
                              <span className="block font-bold text-slate-200">{u.username}</span>
                              <span className="block text-[10px] text-slate-500 font-mono">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 font-mono text-[10px] uppercase text-amber-500 font-bold">{u.role}</td>
                        <td className="py-2.5 font-mono font-black text-slate-200">
                          ₱{userWallet ? userWallet.balance.toFixed(2) : '0.00'}
                        </td>
                        <td className="py-2.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${u.status === 'active' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-red-950/40 text-red-400'}`}>
                            {u.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono">
                          {u.status === 'active' ? (
                            <button
                              onClick={() => onUpdateUserStatus(u.id, 'suspended')}
                              className="text-[9px] border border-red-500/20 text-red-400 bg-red-950/30 px-2 py-1 rounded hover:bg-red-950/50 transition cursor-pointer"
                            >
                              SUSPEND NODE
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateUserStatus(u.id, 'active')}
                              className="text-[9px] border border-emerald-500/20 text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded hover:bg-emerald-950/50 transition cursor-pointer"
                            >
                              ACTIVATE NODE
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEPOSIT MANAGEMENT */}
      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-500 block">GCash Manual Deposits Inbox:</span>
          <div className="bg-charcoal rounded-xl border border-slate-800 overflow-x-auto p-4">
            {deposits.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">No deposit receipts reported.</div>
            ) : (
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800 font-mono">
                  <tr>
                    <th className="pb-2">Bettor</th>
                    <th className="pb-2">Amount Paid</th>
                    <th className="pb-2">Receipt Copy</th>
                    <th className="pb-2">Verification State</th>
                    <th className="pb-2 text-right">Approval Decisions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-900/30">
                      <td className="py-2.5 font-bold">{dep.username}</td>
                      <td className="py-2.5 font-mono text-amber-500 font-bold">₱{dep.amount}</td>
                      <td className="py-2.5">
                        <a
                          href={dep.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 underline hover:text-indigo-300 text-[10px] font-mono"
                        >
                          View Receipt Link
                        </a>
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${dep.status === 'Approved' ? 'bg-emerald-950 text-emerald-400' : (dep.status === 'Rejected' ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-400')}`}>
                          {dep.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right space-x-1.5 font-mono">
                        {dep.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => onApproveDeposit(dep.id, "Auto verified via BO portal review")}
                              className="text-[9px] border border-emerald-500/20 text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded hover:bg-emerald-950/50 cursor-pointer"
                            >
                              APPROVE CREDIT
                            </button>
                            <button
                              onClick={() => {
                                const notes = prompt("Enter rejection reason:") || "Receipt proof invalidated";
                                onRejectDeposit(dep.id, notes);
                              }}
                              className="text-[9px] border border-red-500/20 text-red-500 bg-red-950/30 px-2.5 py-1 rounded hover:bg-red-950/50 cursor-pointer"
                            >
                              REJECT
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* WITHDRAWAL MANAGEMENT */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-500 block">Payout requests desk:</span>
          <div className="bg-charcoal rounded-xl border border-slate-800 overflow-x-auto p-4">
            {withdrawals.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">No withdrawals claimed.</div>
            ) : (
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800 font-mono">
                  <tr>
                    <th className="pb-2">Bettor Node</th>
                    <th className="pb-2">PHP claimed</th>
                    <th className="pb-2">GCash Account Payee</th>
                    <th className="pb-2">Security Status</th>
                    <th className="pb-2 text-right">Payout Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {withdrawals.map((wit) => (
                    <tr key={wit.id} className="hover:bg-slate-900/30">
                      <td className="py-2.5 font-bold">{wit.username}</td>
                      <td className="py-2.5 font-mono font-bold text-slate-200">₱{wit.amount}</td>
                      <td className="py-2.5">
                        <div className="font-mono text-[10px] text-slate-400 leading-tight">
                          <span>Name: {wit.gcashName}</span>
                          <span className="block">No: {wit.gcashNumber}</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${wit.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' : (wit.status === 'Rejected' ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-500')}`}>
                          {wit.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right space-x-1 font-mono">
                        {wit.status === 'Pending' && (
                          <button
                            onClick={() => onApproveWithdrawal(wit.id, "Ready for manual payouts")}
                            className="text-[9px] border border-amber-500/25 text-amber-400 bg-amber-950/20 px-2 py-1 rounded hover:bg-amber-950/40 cursor-pointer"
                          >
                            SET PROCESSING
                          </button>
                        )}
                        {wit.status === 'Processing' && (
                          <button
                            onClick={() => onCompleteWithdrawal(wit.id, "GCash remittance completed manually by staff")}
                            className="text-[9px] border border-emerald-500/25 text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded hover:bg-emerald-950/40 cursor-pointer"
                          >
                            MARK COMPLETED
                          </button>
                        )}
                        {(wit.status === 'Pending' || wit.status === 'Processing') && (
                          <button
                            onClick={() => {
                              const notes = prompt("Enter payout rejection reason:") || "Invalidated payee";
                              onRejectWithdrawal(wit.id, notes);
                            }}
                            className="text-[9px] border border-red-500/35 text-red-500 bg-red-950/20 px-2 py-1 rounded hover:bg-red-950/30 cursor-pointer"
                          >
                            REJECT
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* SPORTS BOOK SETTLEMENT COCKPIT */}
      {activeTab === 'sports' && (
        <div className="space-y-4">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-500 block">Settle Bookmaker Fixtures:</span>
          
          <div className="bg-charcoal p-5 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-serif font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
              Manual Winner Settlement Node
            </h4>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              When a match finishes in the real world, specify the victor here. The platform's automated engine searches all open bets on this fixture, calculates returns matching locked multipliers, updates player wallets instantly, and despatches notifications.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs items-end">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Select Open Fixture:</label>
                <select
                  value={selectedMatchToSettle}
                  onChange={(e) => setSelectedMatchToSettle(e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="">-- Choose active fixture --</option>
                  {matches.filter(m => m.status === 'Open').map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.teamA} vs {m.teamB} ({m.sport})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Declare Outcome winner:</label>
                <select
                  value={settlementResult}
                  onChange={(e) => setSettlementResult(e.target.value as any)}
                  className="w-full bg-black border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Won_A">Team A Winner (First Team)</option>
                  <option value="Won_B">Team B Winner (Second Team)</option>
                  <option value="Draw">Draw Settle</option>
                  <option value="Void">Void/Postponed Slip</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!selectedMatchToSettle) {
                    alert("Please choose a match to settle first.");
                    return;
                  }
                  onSettleMatch(selectedMatchToSettle, settlementResult);
                  alert("Successfully resolved bookmaker match! All winners credited.");
                  setSelectedMatchToSettle('');
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-nearblack font-serif font-black text-xs rounded transition duration-150 cursor-pointer"
              >
                PROCLAIM RESOLUTION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CASINO GGR ANALYTICS SECTION */}
      {activeTab === 'casino' && (
        <div className="space-y-4">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-500 block">Casino Gross gaming Reports:</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slots Card */}
            <div className="bg-charcoal p-5 rounded-xl border border-slate-800 space-y-3.5">
              <span className="block text-md font-serif text-amber-400 font-bold">MGM Slots Metrics</span>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-black/40 p-2.5 rounded border border-slate-800">
                  <span className="block text-slate-500 text-[10px]">Total Wagers (PHP)</span>
                  <span className="block text-slate-200 font-bold mt-1">₱{totalSlotsWagered}</span>
                </div>
                <div className="bg-black/40 p-2.5 rounded border border-slate-800">
                  <span className="block text-slate-500 text-[10px]">Total Returns (PHP)</span>
                  <span className="block text-slate-200 font-bold mt-1">₱{totalSlotsWin}</span>
                </div>
                <div className="md:col-span-2 bg-amber-500/10 p-3 rounded border border-amber-500/20 flex justify-between items-center text-sm">
                  <span className="text-amber-400/80 uppercase tracking-widest text-[10px]">Active Slots GGR</span>
                  <span className="text-amber-400 font-bold">₱{slotsGGR}</span>
                </div>
              </div>
            </div>

            {/* Blackjack Card */}
            <div className="bg-charcoal p-5 rounded-xl border border-slate-800 space-y-3.5">
              <span className="block text-md font-serif text-amber-500 font-bold">Vegas Blackjack Metrics</span>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-black/40 p-2.5 rounded border border-slate-800">
                  <span className="block text-slate-500 text-[10px]">Total Wagers (PHP)</span>
                  <span className="block text-slate-200 font-bold mt-1">₱{totalBlackjackWagered}</span>
                </div>
                <div className="bg-black/40 p-2.5 rounded border border-slate-800">
                  <span className="block text-slate-500 text-[10px]">Total Returns (PHP)</span>
                  <span className="block text-slate-200 font-bold mt-1">₱{totalBlackjackWin}</span>
                </div>
                <div className="md:col-span-2 bg-amber-500/10 p-3 rounded border border-amber-500/20 flex justify-between items-center text-sm">
                  <span className="text-amber-400/80 uppercase tracking-widest text-[10px]">Active Blackjack GGR</span>
                  <span className="text-amber-400 font-bold">₱{blackjackGGR}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOGS SECURITY COCKPIT */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-500 block">System Audit Trails & telemetry logs:</span>
          <div className="bg-charcoal rounded-xl border border-slate-800 p-4 max-h-96 overflow-y-auto">
            <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2 border-b border-slate-850 hover:bg-slate-900/30 flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] text-amber-500 font-bold">[{log.action}]</span>{' '}
                    <span>{log.details}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-[9px] text-slate-400">By: {log.performedBy}</span>
                    <span className="block text-[9px] text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
