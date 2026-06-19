/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Wallet, Deposit, Withdrawal, Bet, SlotLog, BlackjackLog, AuditLog } from '../types';
import { 
  ShieldCheck, Users, TrendingUp, DollarSign, ArrowDown, ArrowUp, 
  CheckCircle, XCircle, Search, UserMinus, UserCheck, BarChart3, 
  AlertCircle, Sliders, ChevronDown, ChevronRight, Filter, Download, 
  RotateCw, Plus, Calendar, HelpCircle, Bell, User as UserIcon, LogOut, Globe
} from 'lucide-react';

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
  slotsSymbols?: any[];
  onUpdateSlotsSymbols?: (updated: any[]) => void;
  winChanceModifier?: number;
  onSetWinChanceModifier?: (val: number) => void;
  safeProfitLock?: boolean;
  onSetSafeProfitLock?: (val: boolean) => void;
  onUpdateUserWalletPot?: (userId: string, newPot: number) => void;
  onUpdateUserWalletBalance?: (userId: string, newBalance: number) => void;
  onAddBettor?: (username: string, email: string, initialBalance: number) => void;
  onDeleteBettor?: (userId: string) => void;
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
  matches,
  slotsSymbols = [],
  onUpdateSlotsSymbols,
  winChanceModifier = 0.85,
  onSetWinChanceModifier,
  safeProfitLock = false,
  onSetSafeProfitLock,
  onUpdateUserWalletPot,
  onUpdateUserWalletBalance,
  onAddBettor,
  onDeleteBettor
}: AdminPanelProps) {
  
  // Tab Routing system based on TC Gaming mockup
  const [activeMenuSection, setActiveMenuSection] = useState<'Player Fund Management' | 'User Management' | 'Platform Management'>('Player Fund Management');
  const [activeSubsection, setActiveSubsection] = useState<'Player Deposits' | 'Transactions' | 'Player Adjustment' | 'Player Withdraws' | 'System Controls' | 'Audit Logs'>('Player Deposits');
  
  // Sub-tabs under Player Deposits
  const [activeDepositSubTab, setActiveDepositSubTab] = useState<'Player Deposit' | 'Deposit On Behalf' | 'Credit Deposit'>('Player Deposit');

  // Filter box forms inputs
  const [filterUsername, setFilterUsername] = useState('');
  const [filterRunningNumber, setFilterRunningNumber] = useState('');
  const [filterBankRef, setFilterBankRef] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected'>('ALL');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');

  // User management / Bettors list Search input
  const [userSearchText, setUserSearchText] = useState('');

  // Settle Match Helper state
  const [selectedMatchToSettle, setSelectedMatchToSettle] = useState<string>('');
  const [settlementResult, setSettlementResult] = useState<'Won_A' | 'Won_B' | 'Draw' | 'Void'>('Won_A');

  // Multiplier edits
  const [localSymbols, setLocalSymbols] = useState<any[]>(slotsSymbols);
  const [tempPotOverride, setTempPotOverride] = useState<Record<string, string>>({});
  const [tempBalanceOverride, setTempBalanceOverride] = useState<Record<string, string>>({});

  // Add user Form State
  const [addUsername, setAddUsername] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addInitialBalance, setAddInitialBalance] = useState('1500');

  React.useEffect(() => {
    if (slotsSymbols && slotsSymbols.length > 0) {
      setLocalSymbols(slotsSymbols);
    }
  }, [slotsSymbols]);

  // Compute stats dynamically from arrays
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const pendingDepositsCount = deposits.filter(d => d.status === 'Pending').length;
  
  const totalSlotsWagered = slotsLogs.reduce((acc, current) => acc + current.betAmount, 0);
  const totalSlotsWin = slotsLogs.reduce((acc, current) => acc + current.winAmount, 0);
  const slotsGGR = totalSlotsWagered - totalSlotsWin;

  const totalBlackjackWagered = blackjackLogs.reduce((acc, current) => acc + current.betAmount, 0);
  const totalBlackjackWin = blackjackLogs.reduce((acc, current) => acc + current.winAmount, 0);
  const blackjackGGR = totalBlackjackWagered - totalBlackjackWin;

  const totalBetsVolume = bets.reduce((acc, current) => acc + current.stake, 0);
  const settledBetsPlayerWon = bets.filter(b => b.status === 'Won').reduce((acc, current) => acc + current.potentialPayout, 0);
  const sportsGGR = totalBetsVolume - settledBetsPlayerWon;
  const totalPlatformGGR = slotsGGR + blackjackGGR + sportsGGR;

  // Filter dynamic deposits list from standard storage database
  const filteredDeposits = deposits.filter(dep => {
    // Exact Email/Username matching
    if (filterUsername && !dep.username.toLowerCase().includes(filterUsername.toLowerCase()) && !dep.userId.toLowerCase().includes(filterUsername.toLowerCase())) {
      return false;
    }
    // Running Number Reference code matching 
    if (filterRunningNumber && !dep.referenceNumber.includes(filterRunningNumber) && !dep.id.includes(filterRunningNumber)) {
      return false;
    }
    // Bank reference code matching
    if (filterBankRef && !dep.referenceNumber.includes(filterBankRef)) {
      return false;
    }
    // Status filter matching
    if (filterStatus !== 'ALL' && dep.status !== filterStatus) {
      return false;
    }
    // Amount range filtering
    if (filterMinAmount && dep.amount < parseFloat(filterMinAmount)) {
      return false;
    }
    if (filterMaxAmount && dep.amount > parseFloat(filterMaxAmount)) {
      return false;
    }
    return true;
  });

  const totalDepositedSum = filteredDeposits.reduce((acc, current) => acc + current.amount, 0);

  return (
    <div className="bg-[#f0f2f5] min-h-screen text-[#333333] flex flex-col font-sans select-none" id="tcg-admin-console">
      
      {/* 1. TOP HEADER BAR (TC GAMING BRAND LOGO) */}
      <header className="h-12 bg-[#090f24] text-white flex items-center justify-between px-4 shrink-0 shadow-md border-b border-[#1b254b]">
        <div className="flex items-center gap-2">
          {/* Circular logo */}
          <div className="w-7 h-7 bg-red-650 rounded-full bg-gradient-to-r from-red-600 to-amber-500 flex items-center justify-center border-2 border-white/20">
            <span className="text-white text-xs font-black">TC</span>
          </div>
          <span className="font-sans font-black tracking-tight text-white uppercase text-sm">
            TC <span className="text-red-500 font-bold">GAMING</span>
          </span>
          <span className="text-[10px] bg-white/10 text-slate-300 font-mono px-2 py-0.5 rounded ml-2 uppercase font-bold">
            Back Office Live Console
          </span>
        </div>

        {/* Top Active Tab bar mimicking screenshot browser tabs */}
        <div className="hidden lg:flex items-center h-full gap-0.5 ml-4 self-end text-[11px] font-sans">
          <button 
            onClick={() => { setActiveSubsection('Player Deposits'); setActiveMenuSection('Player Fund Management'); }}
            className={`px-3 py-2 rounded-t-lg transition flex items-center gap-1 cursor-pointer font-bold ${activeSubsection === 'Player Deposits' ? 'bg-[#f0f2f5] text-[#121c42] border border-b-0 border-[#cfd4db]' : 'text-slate-400 hover:text-white'}`}
          >
            Player Deposits <span className="text-[9px] bg-[#00a8ff] text-white px-1.5 py-0.2 rounded-full font-sans ml-1">{pendingDepositsCount}</span>
          </button>
          <button 
            onClick={() => { setActiveSubsection('Player Adjustment'); setActiveMenuSection('Player Fund Management'); }}
            className={`px-3 py-2 rounded-t-lg transition flex items-center gap-1 cursor-pointer font-bold ${activeSubsection === 'Player Adjustment' ? 'bg-[#f0f2f5] text-[#121c42] border border-b-0 border-[#cfd4db]' : 'text-slate-400 hover:text-white'}`}
          >
            Player Information <span className="text-[9px] text-[#CD7F32] font-mono leading-none">max</span>
          </button>
          <button 
            onClick={() => { setActiveSubsection('Player Withdraws'); setActiveMenuSection('Player Fund Management'); }}
            className={`px-3 py-2 rounded-t-lg transition flex items-center gap-1 cursor-pointer font-bold ${activeSubsection === 'Player Withdraws' ? 'bg-[#f0f2f5] text-[#121c42] border border-[#cfd4db] border-b-0' : 'text-slate-400 hover:text-white'}`}
          >
            Player Withdraws
          </button>
          <button 
            onClick={() => { setActiveSubsection('System Controls'); setActiveMenuSection('Platform Management'); }}
            className={`px-3 py-2 rounded-t-lg transition flex items-center gap-1 cursor-pointer font-bold ${activeSubsection === 'System Controls' ? 'bg-[#f0f2f5] text-[#121c42] border border-[#cfd4db] border-b-0' : 'text-slate-400 hover:text-white'}`}
          >
            Settings Matrix
          </button>
          <button 
            onClick={() => { setActiveSubsection('Audit Logs'); setActiveMenuSection('Platform Management'); }}
            className={`px-3 py-2 rounded-t-lg transition flex items-center gap-1 cursor-pointer font-bold ${activeSubsection === 'Audit Logs' ? 'bg-[#f0f2f5] text-[#121c42] border border-[#cfd4db] border-b-0' : 'text-slate-400 hover:text-white'}`}
          >
            Audits & Logs
          </button>
        </div>

        {/* Right Admin meta elements */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1 cursor-help hover:text-white">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            <span>yamacs015</span>
          </div>

          <div className="bg-[#00a8ff] text-white px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider font-sans">
            GMT+8
          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT AREA GRID (SIDEBAR + MAIN COMPONENT VIEWER) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-56 bg-[#0c1020] text-[#a5b4fc] flex flex-col justify-between shrink-0 overflow-y-auto" id="tcg-admin-sidebar">
          <div className="p-3 space-y-4">
            
            {/* Expanded section menu: User Management */}
            <div>
              <button 
                onClick={() => setActiveMenuSection(activeMenuSection === 'User Management' ? 'Player Fund Management' : 'User Management')}
                className="w-full text-left font-sans text-xs uppercase font-extrabold text-slate-400 pb-2 border-b border-white/5 flex items-center justify-between"
              >
                <span>👤 User Management</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="mt-2 space-y-1 font-sans text-[11px]">
                <button 
                  onClick={() => { setActiveSubsection('Player Adjustment'); setActiveMenuSection('Player Fund Management'); }} 
                  className={`w-full text-left px-2 py-1.5 rounded transition ${activeSubsection === 'Player Adjustment' ? 'bg-[#00a8ff] text-white font-bold' : 'text-slate-400 hover:bg-slate-900'}`}
                >
                  Bettors Directory
                </button>
              </div>
            </div>

            {/* EXPANDED SECTION MENU: FUND MANAGEMENT */}
            <div>
              <button 
                onClick={() => setActiveMenuSection('Player Fund Management')}
                className="w-full text-left font-sans text-xs uppercase font-extrabold text-white pb-2 border-b border-[#00a8ff]/20 flex items-center justify-between"
              >
                <span>💰 Player Fund Management</span>
                <ChevronDown className="w-3.5 h-3.5 text-white" />
              </button>
              <div className="mt-2 space-y-1 font-sans text-xs font-bold font-sans">
                <button
                  onClick={() => setActiveSubsection('Player Deposits')}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition ${activeSubsection === 'Player Deposits' ? 'bg-[#00a8ff] text-white font-black' : 'text-slate-400 hover:bg-slate-900/60'}`}
                >
                  <span>🎰 Player Deposits</span>
                  <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-bold">{pendingDepositsCount}</span>
                </button>
                <button
                  onClick={() => setActiveSubsection('Player Withdraws')}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition ${activeSubsection === 'Player Withdraws' ? 'bg-[#00a8ff] text-white font-black' : 'text-slate-400 hover:bg-slate-900/60'}`}
                >
                  <span>💸 Player Withdraws</span>
                </button>
                <button
                  onClick={() => setActiveSubsection('Transactions')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition ${activeSubsection === 'Transactions' ? 'bg-[#00a8ff] text-white font-black' : 'text-slate-400 hover:bg-slate-900/60'}`}
                >
                  <span>⚡ Sports Book Settles</span>
                </button>
              </div>
            </div>

            {/* Expansions: Platform settings */}
            <div>
              <button 
                onClick={() => setActiveMenuSection(activeMenuSection === 'Platform Management' ? 'Player Fund Management' : 'Platform Management')}
                className="w-full text-left font-sans text-xs uppercase font-extrabold text-slate-400 pb-2 border-b border-white/5 flex items-center justify-between"
              >
                <span>⚙️ Game Management</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <div className="mt-2 space-y-1 font-sans text-[11px]">
                <button 
                  onClick={() => { setActiveSubsection('System Controls'); setActiveMenuSection('Platform Management'); }} 
                  className={`w-full text-left px-2 py-1.5 rounded transition ${activeSubsection === 'System Controls' ? 'bg-[#00a8ff] text-white font-bold' : 'text-slate-400 hover:bg-slate-900'}`}
                >
                  Slots RTP & Payout Modifiers
                </button>
                <button 
                  onClick={() => { setActiveSubsection('Audit Logs'); setActiveMenuSection('Platform Management'); }} 
                  className={`w-full text-left px-2 py-1.5 rounded transition ${activeSubsection === 'Audit Logs' ? 'bg-[#00a8ff] text-white font-bold' : 'text-slate-400 hover:bg-slate-900'}`}
                >
                  Operator Audit Logs
                </button>
              </div>
            </div>

            {/* Extra mock indicators matching TC Gaming screenshot navigation panel */}
            <div className="pt-2 border-t border-white/5 space-y-1 text-[11px] text-slate-500 font-sans font-bold">
              <span className="block px-2 py-1 select-none">📊 Player Analysis • Off</span>
              <span className="block px-2 py-1 select-none">📈 Turnover & Rebates</span>
              <span className="block px-2 py-1 select-none">🎗️ VIP Programs</span>
              <span className="block px-2 py-1 select-none">🛡️ Risk Management</span>
            </div>

          </div>

          <div className="p-4 border-t border-slate-900 text-[10px] text-slate-600 font-mono tracking-tighter">
            <span>ver. 20260622-aeer Etc/GMT+8</span>
          </div>
        </aside>

        {/* MAIN DASHBOARD PANEL CONTENT AREA */}
        <main className="flex-1 p-5 overflow-y-auto space-y-5">
          
          {/* ==================================== */}
          {/* A. PLAYER DEPOSITS SECTION (MOCKUP ACCURACY) */}
          {activeSubsection === 'Player Deposits' && (
            <div className="space-y-4">
              
              {/* Double Sub-tabs for "Player Deposits" */}
              <div className="flex border-b border-[#cfd4db] uppercase text-xs font-bold bg-white p-1 rounded-t-xl gap-2 font-sans">
                <button 
                  onClick={() => setActiveDepositSubTab('Player Deposit')}
                  className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${activeDepositSubTab === 'Player Deposit' ? 'bg-[#00a8ff] text-white font-extrabold' : 'text-[#555] hover:bg-slate-100'}`}
                >
                  Player Deposit
                </button>
                <button 
                  onClick={() => setActiveDepositSubTab('Deposit On Behalf')}
                  className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${activeDepositSubTab === 'Deposit On Behalf' ? 'bg-[#00a8ff] text-white font-extrabold' : 'text-[#555] hover:bg-slate-100'}`}
                >
                  Deposit On Behalf
                </button>
                <button 
                  onClick={() => setActiveDepositSubTab('Credit Deposit')}
                  className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${activeDepositSubTab === 'Credit Deposit' ? 'bg-[#00a8ff] text-white font-extrabold' : 'text-[#555] hover:bg-slate-100'}`}
                >
                  Credit Deposit
                </button>
              </div>

              {/* 1. COMPREHENSIVE SEARCH FILTERS COMPONENT */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e4e7eb] space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-sans text-slate-700">
                  
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Username/Email</label>
                    <input 
                      type="text" 
                      placeholder="e.g. milkytee" 
                      value={filterUsername}
                      onChange={(e) => setFilterUsername(e.target.value)}
                      className="w-full bg-white border border-[#cfd4db] rounded px-2.5 py-1.5 text-xs text-[#333333] outline-none font-sans focus:border-[#00a8ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Running Number</label>
                    <input 
                      type="text" 
                      placeholder="Running Number ID..." 
                      value={filterRunningNumber}
                      onChange={(e) => setFilterRunningNumber(e.target.value)}
                      className="w-full bg-white border border-[#cfd4db] rounded px-2.5 py-1.5 text-xs text-[#333333] outline-none font-mono focus:border-[#00a8ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Bank Reference</label>
                    <input 
                      type="text" 
                      placeholder="13 Digit GCash code" 
                      value={filterBankRef}
                      onChange={(e) => setFilterBankRef(e.target.value)}
                      className="w-full bg-white border border-[#cfd4db] rounded px-2.5 py-1.5 text-xs text-[#333333] outline-none font-mono focus:border-[#00a8ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Status</label>
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="w-full bg-white border border-[#cfd4db] rounded px-2.5 py-1.5 text-xs text-[#333333] outline-none focus:border-[#00a8ff]"
                    >
                      <option value="ALL">ALL DB Records</option>
                      <option value="Pending">New / Pending</option>
                      <option value="Approved">Approved / Cleared</option>
                      <option value="Rejected">Rejected / Denied</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Payment Method</label>
                    <select className="w-full bg-white border border-[#cfd4db] rounded px-2.5 py-1.5 text-xs text-[#333333] outline-none">
                      <option>ALL METHODS</option>
                      <option>GCash Direct Transfer</option>
                      <option>Bank Remittance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Min Value (PHP)</label>
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={filterMinAmount}
                      onChange={(e) => setFilterMinAmount(e.target.value)}
                      className="w-full bg-white border border-[#cfd4db] rounded px-2.5 py-1.5 text-xs text-[#333333] outline-none font-mono focus:border-[#00a8ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Max Value (PHP)</label>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={filterMaxAmount}
                      onChange={(e) => setFilterMaxAmount(e.target.value)}
                      className="w-full bg-white border border-[#cfd4db] rounded px-2.5 py-1.5 text-xs text-[#333333] outline-none font-mono focus:border-[#00a8ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1 font-sans">Request Window</label>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        readOnly 
                        value="2026-06-20 00:00:00" 
                        className="w-full bg-slate-105 border border-[#cfd4db] rounded px-1.5 py-1 text-[10px] text-[#555] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Upline Agent</label>
                    <select className="w-full bg-white border border-[#cfd4db] rounded px-2.5 py-1.5 text-xs text-[#333333] outline-none">
                      <option>Direct (yamabet)</option>
                      <option>Sub-agent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">First Deposit Only</label>
                    <select className="w-full bg-white border border-[#cfd4db] rounded px-2.5 py-1.5 text-xs text-[#333333] outline-none">
                      <option>ALL</option>
                      <option>Yes, First time</option>
                      <option>Secondary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Approved By</label>
                    <input 
                      type="text" 
                      placeholder="Operator Initials" 
                      className="w-full bg-white border border-[#cfd4db] rounded px-2.5 py-1.5 text-xs text-[#333333]" 
                    />
                  </div>

                  <div className="flex items-end justify-end gap-1.5 col-span-2 md:col-span-1 border-t border-slate-100 pt-2 lg:border-t-0 lg:pt-0 self-end">
                    <button 
                      type="button"
                      onClick={() => {
                        setFilterUsername('');
                        setFilterRunningNumber('');
                        setFilterBankRef('');
                        setFilterStatus('ALL');
                        setFilterMinAmount('');
                        setFilterMaxAmount('');
                      }} 
                      className="px-3 py-1.5 bg-slate-600 hover:opacity-90 text-white rounded font-bold font-sans flex items-center gap-1 cursor-pointer text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Reset
                    </button>
                    <button 
                      type="button" 
                      className="px-4 py-1.5 bg-[#00a8ff] hover:bg-[#0096e6] text-white rounded font-bold font-sans flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Search className="w-3.5 h-3.5" /> Search
                    </button>
                  </div>

                </div>
              </div>

              {/* Status counter indicators bar inside layout */}
              <div className="flex items-center justify-between font-sans text-xs text-[#555] bg-white p-3 rounded-xl border border-[#e4e7eb]" id="status-counters-and-exports">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-[#00a8ff] text-white font-black rounded uppercase text-[10px]">
                    ALL ({filteredDeposits.length})
                  </button>
                  <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#555] font-bold rounded uppercase text-[10px]">
                    Pending ({filteredDeposits.filter(d => d.status === 'Pending').length})
                  </button>
                </div>

                <div className="flex items-center gap-2.5 font-bold font-sans text-[#444]">
                  <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[11px] flex items-center gap-1 cursor-pointer">
                    <Filter className="w-3 h-3 text-[#555]" /> Filter
                  </button>
                  <button 
                    onClick={() => {
                      alert(`Successfully exported reports: Compiled ${filteredDeposits.length} wagers, Aggregate Volume: ₱${totalDepositedSum.toLocaleString()}`);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-[#555]" /> Export
                  </button>
                  <div className="flex items-center gap-1">
                    <input type="checkbox" defaultChecked className="rounded accent-[#00a8ff]" />
                    <span className="text-[11px] text-slate-500 font-medium">Auto Refresh</span>
                  </div>
                </div>
              </div>

              {/* 2. THE MASSIVE LIVE DEPOSIT TABLE GRID (21 COLUMNS) */}
              <div className="bg-white rounded-2xl shadow-md border border-[#e4e7eb] overflow-x-auto relative min-h-[400px]">
                {filteredDeposits.length === 0 ? (
                  <div className="p-16 text-center space-y-2">
                    <span className="text-4xl block">🔍</span>
                    <span className="text-sm text-slate-400 font-sans block">No manual deposit receipts found for active filter configurations.</span>
                    <p className="text-xs text-slate-500 font-serif max-w-md mx-auto">
                      Any wagers/deposits logged by players via the manual GCash payment form will propagate instantly in the live database matrix logs.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left text-[11px] font-sans text-slate-700 whitespace-nowrap">
                    <thead className="text-[10px] text-slate-500 uppercase bg-[#fafbfc] border-b border-[#e4e7eb] font-mono tracking-tight sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Running Number</th>
                        <th className="py-2.5 px-3">Username</th>
                        <th className="py-2.5 px-3">First Deposit</th>
                        <th className="py-2.5 px-3">Upline Agent</th>
                        <th className="py-2.5 px-3">Master Agent</th>
                        <th className="py-2.5 px-3">Internal Level</th>
                        <th className="py-2.5 px-3">VIP Level</th>
                        <th className="py-2.5 px-3">Referrer</th>
                        <th className="py-2.5 px-3">Operation Label</th>
                        <th className="py-2.5 px-3">IP Address</th>
                        <th className="py-2.5 px-3">Request Time</th>
                        <th className="py-2.5 px-3">Request Amount</th>
                        <th className="py-2.5 px-3">Account Balance</th>
                        <th className="py-2.5 px-3">Conversion Amount</th>
                        <th className="py-2.5 px-3">Deposited Time</th>
                        <th className="py-2.5 px-3">Deposited Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Bank Charge</th>
                        <th className="py-2.5 px-3">Deposit Exceed Charge</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4e7eb]">
                      {filteredDeposits.map((dep, ind) => {
                        // Locate user and wallet
                        const userWallet = wallets.find(w => w.userId === dep.userId);
                        const isApproved = dep.status === 'Approved';

                        return (
                          <tr 
                            key={dep.id} 
                            className={`transition-all hover:bg-slate-50 ${isApproved ? 'bg-[#2ecc71]/15 text-[#1e5a32] font-semibold' : 'bg-white'}`}
                          >
                            <td className="py-3 px-3 font-mono font-bold">{ind + 1}</td>
                            <td className="py-3 px-3 font-mono font-bold text-indigo-650">{dep.referenceNumber}</td>
                            <td className="py-3 px-3 font-extrabold text-[#121c42]">
                              {dep.username}
                              <span className="block text-[8.5px] font-mono font-normal text-slate-500">ID: {dep.userId}</span>
                            </td>
                            <td className="py-3 px-3 text-slate-500 font-mono">First</td>
                            <td className="py-3 px-3">yamabet</td>
                            <td className="py-3 px-3">yamabet</td>
                            <td className="py-3 px-3 font-mono">Payment Group 1</td>
                            <td className="py-3 px-3">
                              <span className="bg-slate-100 text-[#444] px-1.5 py-0.5 rounded text-[9px] font-bold font-sans uppercase border border-slate-200">
                                Classic VIP
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-400 font-serif">-</td>
                            <td className="py-3 px-3 text-slate-400">-</td>
                            <td className="py-3 px-3 font-mono text-slate-550">121.214.51.98</td>
                            <td className="py-3 px-3 font-mono text-[10px] text-slate-500">
                              {new Date(dep.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 font-mono text-xs font-black text-rose-600">
                              ₱{dep.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-900">
                              ₱{(userWallet?.balance ?? 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-400">0.0000</td>
                            <td className="py-3 px-3 font-mono text-[10px] text-slate-500">
                              {dep.reviewedAt ? new Date(dep.reviewedAt).toLocaleString() : '-'}
                            </td>
                            <td className="py-3 px-3 font-mono font-black text-emerald-650">
                              ₱{isApproved ? dep.amount.toFixed(2) : '0.00'}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-block px-2.5 py-1 text-[9px] font-sans font-extrabold uppercase rounded-full ${isApproved ? 'bg-emerald-500 text-white' : (dep.status === 'Rejected' ? 'bg-red-500 text-white' : 'bg-[#e2e8f0] text-[#334155]')}`}>
                                {dep.status === 'Pending' ? 'New' : dep.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-500">0.0000</td>
                            <td className="py-3 px-3 font-mono text-slate-500">0.00</td>
                            <td className="py-3 px-3 font-mono text-center">
                              {dep.status === 'Pending' ? (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => onApproveDeposit(dep.id, "Real PHP ledger balance credited")}
                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black uppercase text-[9px] rounded-lg cursor-pointer shadow-sm transition"
                                  >
                                    Manual
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt("Enter Rejection notes:") || "Receipt proofs voided by operator";
                                      onRejectDeposit(dep.id, reason);
                                    }}
                                    className="px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white font-sans font-black uppercase text-[9px] rounded-lg cursor-pointer transition"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[10px]">Settled</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* B. PLAYER DIRECTORY / CREDITS OVERRIDE TAB */}
          {activeSubsection === 'Player Adjustment' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#e4e7eb]">
                <div>
                  <h3 className="text-sm font-sans font-bold text-[#121c42] uppercase tracking-wider">
                    👥 Bettors Directory & Manual PHP Balance Top-ups
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Query active player accounts, override wagers, set user lucky pots, or add new player credentials manually!
                  </p>
                </div>
                
                <div className="flex gap-2 w-full max-w-xs bg-white border border-[#cfd4db] rounded px-2.5 py-1.5 items-center">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name or ID..."
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    className="bg-transparent border-none text-xs text-[#333] outline-none w-full font-sans"
                  />
                </div>
              </div>

              {/* Add User Form Block */}
              <div className="bg-white p-5 rounded-xl border border-[#e4e7eb] space-y-4">
                <span className="block text-xs uppercase font-mono tracking-wider font-extrabold text-slate-400 mb-1">
                  ➕ CREATE A DIRECT BETTING SLOT (REAL REGISTER)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Bettor Username:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. luckyjuan" 
                      value={addUsername}
                      onChange={(e) => setAddUsername(e.target.value)}
                      className="w-full bg-[#fafbfc] border border-[#cfd4db] rounded p-2 text-xs text-[#333] font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Email Mailbox:</label>
                    <input 
                      type="email" 
                      placeholder="juan@gmail.com" 
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      className="w-full bg-[#fafbfc] border border-[#cfd4db] rounded p-2 text-xs text-[#333] font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Initial balance (PHP):</label>
                    <input 
                      type="number" 
                      value={addInitialBalance}
                      onChange={(e) => setAddInitialBalance(e.target.value)}
                      className="w-full bg-[#fafbfc] border border-[#cfd4db] rounded p-2 text-xs text-[#333] font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!addUsername.trim() || !addEmail.trim()) {
                          alert("Provide unique account username & email.");
                          return;
                        }
                        const numBal = parseFloat(addInitialBalance) || 0;
                        onAddBettor?.(addUsername.trim(), addEmail.trim().toLowerCase(), numBal);
                        alert(`Account ${addUsername} added inside Live DB with PHP ${numBal} balance!`);
                        setAddUsername('');
                        setAddEmail('');
                      }}
                      className="w-full py-2.5 bg-[#00a8ff] hover:bg-[#0096e6] text-white font-sans font-extrabold text-xs rounded-lg transition text-center cursor-pointer uppercase font-sans font-bold shadow-sm"
                    >
                      REGISTER ACCOUNT
                    </button>
                  </div>
                </div>
              </div>

              {/* Account list table inside directory */}
              <div className="bg-white rounded-xl border border-[#e4e7eb] overflow-x-auto p-4 shadow-sm">
                <table className="w-full text-xs text-left text-slate-700 font-sans">
                  <thead className="text-[10px] text-slate-500 uppercase bg-[#fafbfc] border-b border-[#e4e7eb] font-mono">
                    <tr>
                      <th className="py-2.5">User Profile & ID</th>
                      <th className="py-2.5">Authority Role</th>
                      <th className="py-2.5">Live PHP Balance</th>
                      <th className="py-2.5">Manual Adjust Balance</th>
                      <th className="py-2.5">Individual Lucky Pot</th>
                      <th className="py-2.5">Exclusion Gate</th>
                      <th className="py-2.5 text-center">Execute CRUD Commands</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4e7eb]">
                    {users
                      .filter(u => u.username.toLowerCase().includes(userSearchText.toLowerCase()) || u.email.toLowerCase().includes(userSearchText.toLowerCase()))
                      .map((u) => {
                        const userWallet = wallets.find(w => w.userId === u.id);
                        const currWalletPot = userWallet?.grandLuckyPot ?? 120000.00;
                        const currBalance = userWallet?.balance ?? 1500.00;

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/70">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <img src={u.avatarUrl} alt="Avatar" referrerPolicy="no-referrer" className="w-7 h-7 rounded-full border border-slate-200" />
                                <div>
                                  <span className="block font-bold text-slate-900">{u.username}</span>
                                  <span className="block text-[9px] text-slate-500 font-mono">{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 font-mono text-[9px] uppercase font-black text-[#CD7F32]">{u.role}</td>
                            <td className="py-3 font-mono font-black text-slate-800 text-xs text-emerald-700">
                              ₱{currBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3">
                              <input
                                type="number"
                                placeholder="Type Adjusted Balance"
                                value={tempBalanceOverride[u.id] ?? ''}
                                onChange={(e) => setTempBalanceOverride({ ...tempBalanceOverride, [u.id]: e.target.value })}
                                className="bg-white border border-[#cfd4db] rounded px-2 py-1 text-xs text-[#333] font-mono w-32 placeholder:text-[9.5px]/none"
                              />
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1 font-mono text-gold-dark font-extrabold text-[#CD7F32]">
                                <span>₱</span>
                                <input
                                  type="number"
                                  placeholder={currWalletPot.toFixed(0)}
                                  value={tempPotOverride[u.id] ?? ''}
                                  onChange={(e) => setTempPotOverride({ ...tempPotOverride, [u.id]: e.target.value })}
                                  className="bg-white border border-[#cfd4db] rounded px-2 py-1 text-xs text-[#444] font-mono w-28 placeholder:text-[10px]"
                                />
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${u.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="py-3 text-center font-mono space-x-1 flex items-center justify-center">
                              <button
                                onClick={() => {
                                  const balStr = tempBalanceOverride[u.id];
                                  const potStr = tempPotOverride[u.id];

                                  if (balStr !== undefined && balStr !== '') {
                                    const numBal = parseFloat(balStr);
                                    if (!isNaN(numBal)) {
                                      onUpdateUserWalletBalance?.(u.id, numBal);
                                    }
                                  }

                                  if (potStr !== undefined && potStr !== '') {
                                    const numPot = parseFloat(potStr);
                                    if (!isNaN(numPot)) {
                                      onUpdateUserWalletPot?.(u.id, numPot);
                                    }
                                  }

                                  alert(`Completed balance calibration for ${u.username}!`);
                                  setTempBalanceOverride({ ...tempBalanceOverride, [u.id]: '' });
                                  setTempPotOverride({ ...tempPotOverride, [u.id]: '' });
                                }}
                                className="text-[10px] bg-slate-100 border border-slate-300 hover:bg-[#00a8ff] hover:text-white px-2 py-1 rounded cursor-pointer font-bold font-sans tracking-wide transition"
                              >
                                Modify
                              </button>
                              
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => onDeleteBettor?.(u.id)}
                                  className="text-[10px] border border-red-200 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-2 py-1 rounded cursor-pointer transition"
                                >
                                  Delete
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

          {/* ==================================== */}
          {/* C. PLAYER WITHDRAWALS / CASH-OUT APPROVALS */}
          {activeSubsection === 'Player Withdraws' && (
            <div className="space-y-4">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-500 block">GCash Manual Payee Payout Claims Inbox:</span>
              <div className="bg-white rounded-xl border border-[#e4e7eb] overflow-x-auto p-4 shadow-sm">
                {withdrawals.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 font-sans font-medium">No withdrawal requests reported in this batch ledger.</div>
                ) : (
                  <table className="w-full text-xs text-left text-[#333] font-sans">
                    <thead className="text-[10px] text-slate-500 uppercase bg-[#fafbfc] border-b border-[#e4e7eb] font-mono">
                      <tr>
                        <th className="pb-2">Bettor Account</th>
                        <th className="pb-2">PHP claimed</th>
                        <th className="pb-2">GCash Saved Payee Credentials</th>
                        <th className="pb-2">Authorization Status</th>
                        <th className="pb-2 text-right">Operator Decisions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4e7eb]">
                      {withdrawals.map((wit) => (
                        <tr key={wit.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-bold text-slate-800">{wit.username}</td>
                          <td className="py-2.5 font-mono text-xs font-black text-rose-600">₱{wit.amount.toLocaleString()}</td>
                          <td className="py-2.5 text-xs font-mono">
                            <span className="block font-sans font-bold text-slate-700">Payee: {wit.gcashName}</span>
                            <span className="block text-[11px] font-bold text-slate-500">Phone: {wit.gcashNumber}</span>
                          </td>
                          <td className="py-2.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono uppercase ${wit.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : (wit.status === 'Rejected' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200')}`}>
                              {wit.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right space-x-1 font-mono">
                            {wit.status === 'Pending' && (
                              <button
                                onClick={() => onApproveWithdrawal(wit.id, "Remittance queued")}
                                className="text-[9.5px] border border-amber-200 text-amber-600 bg-amber-50 px-2 py-1 rounded hover:bg-amber-600 hover:text-white transition duration-100 cursor-pointer"
                              >
                                PROCESSING
                              </button>
                            )}
                            {wit.status === 'Processing' && (
                              <button
                                onClick={() => onCompleteWithdrawal(wit.id, "Manual GCash verification approved: PHP credited")}
                                className="text-[9.5px] border border-emerald-200 text-emerald-650 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-600 hover:text-white transition cursor-pointer font-black"
                              >
                                COMPLETE CASHOUT
                              </button>
                            )}
                            {(wit.status === 'Pending' || wit.status === 'Processing') && (
                              <button
                                onClick={() => {
                                  const reason = prompt("Enter payout rejection reason:") || "GCash invalid phone configuration";
                                  onRejectWithdrawal(wit.id, reason);
                                }}
                                className="text-[9.5px] border border-red-200 text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition cursor-pointer"
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

          {/* ==================================== */}
          {/* D. SPORTS BOOK FIXTURES SETTLE TAB */}
          {activeSubsection === 'Transactions' && (
            <div className="space-y-4">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-500 block">Settle Active Bets & Sports Brokerage Slips:</span>
              
              <div className="bg-white p-5 rounded-xl border border-[#e4e7eb] space-y-4 shadow-sm">
                <h4 className="text-xs font-sans font-extrabold text-[#CD7F32] uppercase tracking-wider">
                  🎯 Proclaim Sports Predictor Winner Node
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl font-sans">
                  Whenever a real-world sports fixture (Basketball or Soccer) concludes, declare the victor. Our automated database handler reviews all open wagers, processes calculations based on locked multipliers, and dispatches PHP balance updates instantly!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs items-end">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1.5 font-sans font-bold">Select Active Open Match:</label>
                    <select
                      value={selectedMatchToSettle}
                      onChange={(e) => setSelectedMatchToSettle(e.target.value)}
                      className="w-full bg-[#fafbfc] border border-[#cfd4db] rounded p-2 text-xs text-[#333] focus:outline-none font-sans"
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
                    <label className="block text-[10px] text-slate-500 mb-1.5 font-sans font-bold">Proclaim Winner Result:</label>
                    <select
                      value={settlementResult}
                      onChange={(e) => setSettlementResult(e.target.value as any)}
                      className="w-full bg-[#fafbfc] border border-[#cfd4db] rounded p-2 text-xs text-[#333] focus:outline-none font-sans"
                    >
                      <option value="Won_A">Home Team Winner (First team)</option>
                      <option value="Won_B">Away Team Winner (Second team)</option>
                      <option value="Draw">Match Draw</option>
                      <option value="Void">Void Limit Postponed</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedMatchToSettle) {
                        alert("Select the open sports fixture to resolve.");
                        return;
                      }
                      onSettleMatch(selectedMatchToSettle, settlementResult);
                      alert("Successfully matched live wager accounts against sports settlement!");
                      setSelectedMatchToSettle('');
                    }}
                    className="w-full py-2.5 bg-[#00a8ff] hover:bg-[#0096e6] text-white font-sans font-black text-xs rounded-xl transition duration-150 cursor-pointer shadow-sm uppercase tracking-wider"
                  >
                    RESOLVE SPORTS SLIP
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* E. GAME CONTROLS & RTP ODDS SETTINGS TAB */}
          {activeSubsection === 'System Controls' && (
            <div className="space-y-6">
              
              {/* Gross Revenue aggregation widget */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-slate-700">
                <div className="bg-white p-5 rounded-2xl border border-[#e4e7eb] shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Slots Wagers (PHP)</span>
                    <span className="text-xl font-black text-slate-900 block mt-1">₱{totalSlotsWagered.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-full text-amber-600 font-bold block text-sm">🎰 Slots</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#e4e7eb] shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Blackjack Volume</span>
                    <span className="text-xl font-black text-slate-900 block mt-1">₱{totalBlackjackWagered.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-rose-500/10 rounded-full text-rose-600 font-bold block text-sm">♠ Blackjack</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#e4e7eb] shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#CD7F32] uppercase font-mono block font-black">Gross Revenue Payout (GGR)</span>
                    <span className="text-xl font-black text-emerald-600 block mt-1">₱{totalPlatformGGR.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-600 font-bold block text-sm">₱ Gross</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e4e7eb] space-y-4 shadow-sm">
                <h3 className="text-xs font-mono text-[#121c42] uppercase tracking-wider font-extrabold flex items-center gap-1">
                  🛡️ Active House RNG & Profit Lock Protection
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl font-sans">
                  Adjust standard win multipliers of casino games to keep cash operations highly stable.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-[#e4e7eb] space-y-3">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-slate-600">Odds Frequency Modifier:</span>
                      <span className="text-[#00a8ff]">{(winChanceModifier * 100).toFixed(0)}% Hit rate</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={winChanceModifier}
                      onChange={(e) => onSetWinChanceModifier?.(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00a8ff]"
                    />
                    <span className="block text-[10px] text-slate-405 font-mono text-slate-500">
                      Lowering this scales down jackpot frequencies.
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-[#e4e7eb] flex justify-between items-center">
                    <div className="space-y-1 pr-4">
                      <span className="block text-xs text-slate-800 font-bold">
                        Anti-Bankruptcy Profit Shield (Vegas Lock)
                      </span>
                      <span className="block text-[10px] text-slate-500 font-serif">
                        When active, slots will restrict payouts larger than 100x player stake to protect liquid house reserves.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSetSafeProfitLock?.(!safeProfitLock)}
                      className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center p-1 cursor-pointer ${safeProfitLock ? 'bg-[#00a8ff]' : 'bg-slate-300'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${safeProfitLock ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                </div>
              </div>

              {/* 12 symbols matrix */}
              <div className="bg-white p-5 rounded-2xl border border-[#e4e7eb] space-y-4 shadow-sm">
                <span className="block text-xs uppercase font-mono tracking-wider font-extrabold text-slate-400">
                  🎰 Reel symbols GGG / Multiplier configurations (Exact 12 icons)
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {localSymbols.map((sym, index) => (
                    <div key={index} className="bg-slate-50 border border-[#e4e7eb] p-2.5 rounded-xl flex items-center justify-between gap-1.5">
                      <span className="text-2xl">{sym.char}</span>
                      <div className="text-[10px] font-mono text-slate-601">
                        <span className="block text-[#CD7F32] font-black">{sym.name}</span>
                        <input
                          type="number"
                          value={sym.multiplier}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const copy = [...localSymbols];
                            copy[index] = { ...copy[index], multiplier: val };
                            setLocalSymbols(copy);
                          }}
                          className="w-14 bg-white border border-[#cfd4db] rounded px-1 py-0.5 text-xs text-slate-800 text-center font-mono mt-1 font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      onUpdateSlotsSymbols?.(localSymbols);
                      alert("Slots Multiplier changes pushed successfully inside database!");
                    }}
                    className="px-4 py-2 bg-[#00a8ff] hover:bg-[#0096e6] text-white font-sans font-extrabold text-xs rounded-lg transition shadow-sm uppercase font-bold"
                  >
                    Commit Multipliers
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ==================================== */}
          {/* F. AUDIT LOGS SECURE MONITOR */}
          {activeSubsection === 'Audit Logs' && (
            <div className="space-y-4">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-500 block">Operator Audit & Telemetry trail logs:</span>
              <div className="bg-white rounded-xl border border-[#e4e7eb] p-4 shadow-sm max-h-[500px] overflow-y-auto">
                <div className="divide-y divide-[#e4e7eb] font-mono text-[11px] text-[#444]">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-2.5 hover:bg-slate-50 flex justify-between items-start gap-3">
                      <div>
                        <span className="text-[#00a8ff] font-bold">[{log.action}]</span>{' '}
                        <span>{log.details}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-[9.5px] font-bold text-slate-500">Node: {log.performedBy}</span>
                        <span className="block text-[8.5px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
