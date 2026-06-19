/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Wallet,
  GCashDetails,
  Match,
  Bet,
  Deposit,
  Withdrawal,
  ChatMessage,
  ChatRoom,
  SlotLog,
  BlackjackLog,
  Notification,
  AuditLog
} from './types';

// Import subcomponents
import SlotsGame from './components/SlotsGame';
import BlackjackGame from './components/BlackjackGame';
import SportsBook from './components/SportsBook';
import LiveChat from './components/LiveChat';
import ProfilePanel from './components/ProfilePanel';
import AdminPanel from './components/AdminPanel';
import ResponsibleGaming from './components/ResponsibleGaming';
import SystemDocumentation from './components/SystemDocumentation';

// Lucide Icons
import {
  Trophy,
  Dribbble,
  User as UserIcon,
  MessageSquare,
  ShieldAlert,
  Sliders,
  DollarSign,
  Bell,
  Sparkles,
  Menu,
  X,
  Compass,
  FileCode,
  LogOut,
  Info
} from 'lucide-react';

const INITIAL_USERS: User[] = [
  {
    id: 'admin-id',
    email: 'admin@betplatform.com',
    username: 'BetMGMOberst',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'current-user',
    email: 'player@betplatform.com',
    username: 'PhHighRoller',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150',
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_WALLETS: Wallet[] = [
  {
    userId: 'admin-id',
    currency: 'PHP',
    balance: 500000.00,
    pendingDeposit: 0.00,
    pendingWithdrawal: 0.00,
    totalDeposited: 100000.00,
    totalWithdrawn: 20000.00,
    lifetimeProfitLoss: 380000.00
  },
  {
    userId: 'current-user',
    currency: 'PHP',
    balance: 1500.00,
    pendingDeposit: 100.00,
    pendingWithdrawal: 0.00,
    totalDeposited: 2000.00,
    totalWithdrawn: 500.00,
    lifetimeProfitLoss: -100.00
  }
];

const INITIAL_MATCHES: Match[] = [
  {
    id: 'match-1',
    sport: 'Basketball',
    league: 'PBA Governor Cup',
    teamA: 'Ginebra San Miguel',
    teamB: 'Meralco Bolts',
    startDate: '2026-06-25',
    startTime: '18:30',
    oddsA: 1.85,
    oddsB: 2.10,
    oddsDraw: 4.50,
    status: 'Open',
    createdAt: new Date().toISOString()
  },
  {
    id: 'match-2',
    sport: 'Soccer',
    league: 'La Liga Philippines',
    teamA: 'Manila FC',
    teamB: 'Cebu United',
    startDate: '2026-06-24',
    startTime: '20:00',
    oddsA: 1.45,
    oddsB: 3.50,
    oddsDraw: 5.00,
    status: 'Open',
    createdAt: new Date().toISOString()
  },
  {
    id: 'match-3',
    sport: 'MGM Lottery',
    league: 'Super Lotto PHP',
    teamA: 'Gold Jackpot Speculation',
    teamB: 'Silver Jackpot Speculation',
    startDate: '2026-06-23',
    startTime: '21:00',
    oddsA: 2.00,
    oddsB: 2.00,
    oddsDraw: 12.00,
    status: 'Open',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_DEPOSITS: Deposit[] = [
  {
    id: 'dep-1',
    userId: 'current-user',
    username: 'PhHighRoller',
    amount: 100.00,
    receiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=300',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

const INITIAL_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'room-1',
    userId: 'current-user',
    username: 'PhHighRoller',
    status: 'open',
    lastMessageAt: new Date().toISOString(),
    unreadCountAdmin: 1,
    unreadCountUser: 0
  }
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    roomId: 'room-1',
    senderId: 'current-user',
    senderName: 'PhHighRoller',
    senderRole: 'user',
    message: 'Hello, I made a manual GCash Deposit of PHP 100. Verification screenshot attached to the deposit history under profile! Please process thank you.',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export default function App() {
  // State Initialization from LocalStorage
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('bp_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('bp_wallets');
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('bp_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [bets, setBets] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('bp_bets');
    return saved ? JSON.parse(saved) : [];
  });

  const [deposits, setDeposits] = useState<Deposit[]>(() => {
    const saved = localStorage.getItem('bp_deposits');
    return saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
  });

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() => {
    const saved = localStorage.getItem('bp_withdrawals');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(() => {
    const saved = localStorage.getItem('bp_chat_rooms');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_ROOMS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('bp_chat_messages');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  const [slotLogs, setSlotLogs] = useState<SlotLog[]>(() => {
    const saved = localStorage.getItem('bp_slot_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [blackjackLogs, setBlackjackLogs] = useState<BlackjackLog[]>(() => {
    const saved = localStorage.getItem('bp_blackjack_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('bp_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [gCash, setGCash] = useState<GCashDetails>(() => {
    const saved = localStorage.getItem('bp_gcash');
    return saved ? JSON.parse(saved) : { accountName: 'PH ROLL PAYEE', accountNumber: '09174459821' };
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('bp_audit_logs');
    return saved ? JSON.parse(saved) : [{ id: 'init', action: 'SYSTEM_BOOTUP', performedBy: 'SERVER', details: 'Bet Platform security engines armed. PHP operational controls online.', createdAt: new Date().toISOString() }];
  });

  // Self-Exclusion states
  const [selfExclusionEnd, setSelfExclusionEnd] = useState<number>(() => {
    const expiration = localStorage.getItem('bp_self_exclusion_end');
    return expiration ? Number(expiration) : 0;
  });
  const [exclusionTimeLeft, setExclusionTimeLeft] = useState<number>(0);

  // Active perspective & Nav state
  const [currentView, setCurrentView] = useState<'lobby' | 'sportsbook' | 'profile' | 'admin' | 'services' | 'responsible' | 'help'>('lobby');
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'user'>('user');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Quick verification for active user references
  const mainUser = users.find(u => u.id === 'current-user')!;
  const mainWallet = wallets.find(w => w.userId === 'current-user')!;
  const adminUser = users.find(u => u.id === 'admin-id')!;

  // Persists state locks strictly
  useEffect(() => {
    localStorage.setItem('bp_users', JSON.stringify(users));
    localStorage.setItem('bp_wallets', JSON.stringify(wallets));
    localStorage.setItem('bp_matches', JSON.stringify(matches));
    localStorage.setItem('bp_bets', JSON.stringify(bets));
    localStorage.setItem('bp_deposits', JSON.stringify(deposits));
    localStorage.setItem('bp_withdrawals', JSON.stringify(withdrawals));
    localStorage.setItem('bp_chat_rooms', JSON.stringify(chatRooms));
    localStorage.setItem('bp_chat_messages', JSON.stringify(chatMessages));
    localStorage.setItem('bp_slot_logs', JSON.stringify(slotLogs));
    localStorage.setItem('bp_blackjack_logs', JSON.stringify(blackjackLogs));
    localStorage.setItem('bp_notifications', JSON.stringify(notifications));
    localStorage.setItem('bp_gcash', JSON.stringify(gCash));
    localStorage.setItem('bp_audit_logs', JSON.stringify(auditLogs));
  }, [users, wallets, matches, bets, deposits, withdrawals, chatRooms, chatMessages, slotLogs, blackjackLogs, notifications, gCash, auditLogs]);

  // Exclusion Clock
  useEffect(() => {
    if (selfExclusionEnd <= 0) return;
    const interval = setInterval(() => {
      const remaining = selfExclusionEnd - Date.now();
      if (remaining <= 0) {
        setSelfExclusionEnd(0);
        setExclusionTimeLeft(0);
        localStorage.removeItem('bp_self_exclusion_end');
        clearInterval(interval);
      } else {
        setExclusionTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [selfExclusionEnd]);

  const recordAuditLog = (action: string, performedBy: string, details: string) => {
    const log: AuditLog = {
      id: Math.random().toString(),
      action,
      performedBy,
      details,
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const throwNotification = (userId: string, title: string, message: string, type: Notification['type']) => {
    const notify: Notification = {
      id: Math.random().toString(),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notify, ...prev]);
  };

  // Switch between admin vs standard player perspective easily
  const handleTogglePerspectives = () => {
    const targetRole = currentUserRole === 'admin' ? 'user' : 'admin';
    setCurrentUserRole(targetRole);
    setCurrentView(targetRole === 'admin' ? 'admin' : 'lobby');
    recordAuditLog('ROLE_SWITCH', 'SIMULATOR', `Switched operator mode view to ${targetRole}.`);
  };

  const handleUpdateWalletBalance = (userId: string, changeAmount: number, auditAction: string, auditDetail: string) => {
    setWallets(prev => prev.map(w => {
      if (w.userId === userId) {
        const nextBal = Math.max(0, w.balance + changeAmount);
        const nextLifetime = w.lifetimeProfitLoss + changeAmount;
        return {
          ...w,
          balance: nextBal,
          lifetimeProfitLoss: nextLifetime
        };
      }
      return w;
    }));
    recordAuditLog(auditAction, userId === 'current-user' ? 'PLAYER' : 'ADMIN', auditDetail);
  };

  // Self Exclusion handler
  const handleSetSelfExclusion = (hours: number) => {
    const end = Date.now() + (hours * 3600 * 1000);
    setSelfExclusionEnd(end);
    setExclusionTimeLeft(hours * 3600 * 1000);
    localStorage.setItem('bp_self_exclusion_end', end.toString());
    recordAuditLog('EXCLUSION_ARMED', 'PLAYER', `Armed self lockout period of ${hours} hours.`);
  };

  const checkIsSelfExcluded = () => {
    return selfExclusionEnd > Date.now();
  };

  // Casino Logging
  const logSlotsWagerOutcome = (bet: number, win: number, reelsOutcome: string[]) => {
    const log: SlotLog = {
      id: Math.random().toString(),
      userId: 'current-user',
      username: mainUser.username,
      betAmount: bet,
      winAmount: win,
      reels: reelsOutcome,
      createdAt: new Date().toISOString()
    };
    setSlotLogs(prev => [log, ...prev]);
    recordAuditLog('SLOT_RESULT', 'SLOTS_ENGINE', `Player ${mainUser.username} spun ${reelsOutcome.join('-')}, wagered ₱${bet}, won ₱${win}.`);
  };

  const logBlackjackWagerOutcome = (bet: number, win: number, pCards: string[], dCards: string[], status: 'Won' | 'Lost' | 'Push' | 'Blackjack') => {
    const log: BlackjackLog = {
      id: Math.random().toString(),
      userId: 'current-user',
      username: mainUser.username,
      betAmount: bet,
      winAmount: win,
      playerHand: pCards,
      dealerHand: dCards,
      status,
      createdAt: new Date().toISOString()
    };
    setBlackjackLogs(prev => [log, ...prev]);
    recordAuditLog('BLACKJACK_RESULT', 'BJ_ENGINE', `Player card deal ${status}: wagered ₱${bet}, won ₱${win}. Player hand index: ${pCards.join(',')}`);
  };

  // Sports booking actions
  const handlePlaceSportsBet = (betSlip: Omit<Bet, 'id' | 'createdAt' | 'username'>) => {
    if (checkIsSelfExcluded()) {
      alert("Betting blocked under compliance self-exclusion.");
      return;
    }
    const bet: Bet = {
      ...betSlip,
      id: Math.random().toString(),
      username: mainUser.username,
      createdAt: new Date().toISOString()
    };
    setBets(prev => [bet, ...prev]);
    
    // Deduct player balance
    handleUpdateWalletBalance('current-user', -bet.stake, 'SPORTS_BET_PLACED', `Wagered PHP ${bet.stake} on match predictor ID ${bet.matchId}`);
    throwNotification('current-user', 'Sportsbook wager logged!', `Speculated ${bet.teamA} vs ${bet.teamB} outcome. Stake PHP ${bet.stake} is active.`, 'announcement');
  };

  const handleAddSportsMatch = (matchData: Omit<Match, 'id' | 'createdAt'>) => {
    const newMatch: Match = {
      ...matchData,
      id: Math.random().toString(),
      createdAt: new Date().toISOString()
    };
    setMatches(prev => [newMatch, ...prev]);
    recordAuditLog('MATCH_CREATED', 'ADMIN', `Booked new ${newMatch.sport} fixture: ${newMatch.teamA} vs ${newMatch.teamB}`);
  };

  const handleSettleSportsMatch = (matchId: string, result: 'Won_A' | 'Won_B' | 'Draw' | 'Void') => {
    // 1. Update Match Settle Status
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return { ...m, status: result as any };
      }
      return m;
    }));

    // 2. Scan and Settle bets linking this match
    setBets(prev => prev.map(bet => {
      if (bet.matchId === matchId && bet.status === 'Open') {
        let outcomeState: 'Won' | 'Lost' | 'Void' = 'Lost';
        
        if (result === 'Void') {
          outcomeState = 'Void';
        } else if (
          (result === 'Won_A' && bet.prediction === 'A') ||
          (result === 'Won_B' && bet.prediction === 'B') ||
          (result === 'Draw' && bet.prediction === 'Draw')
        ) {
          outcomeState = 'Won';
        }

        const payout = outcomeState === 'Won' ? bet.potentialPayout : (outcomeState === 'Void' ? bet.stake : 0);
        
        // Credited outcome to player wallets instantly
        if (payout > 0) {
          handleUpdateWalletBalance('current-user', payout, 'SPORTS_Payout', `Credited PHP ${payout} sports winnings for bet reference ID ${bet.id}`);
          throwNotification('current-user', 'Sports slip won!', `Congrats! Your prediction pays PHP ${payout}`, 'bet_won');
        } else {
          throwNotification('current-user', 'Bet slip settled.', `Sports wager on ${bet.teamA} vs ${bet.teamB} settled. Try again!`, 'bet_lost');
        }

        return {
          ...bet,
          status: outcomeState === 'Won' ? 'Won' : (outcomeState === 'Void' ? 'Void' : 'Lost'),
          settledAt: new Date().toISOString()
        };
      }
      return bet;
    }));

    recordAuditLog('MATCH_SETTLED', 'ADMIN', `Resolved match ref ${matchId} outcome to ${result}. Payouts processed.`);
  };

  // GCash Deposit Actions
  const handleSaveGCashProfile = (details: GCashDetails) => {
    setGCash(details);
    recordAuditLog('GCASH_PROFILE_SAVE', 'PLAYER', `Committed local withdrawal address: ${details.accountName} - ${details.accountNumber}`);
  };

  const handleRequestGCashDeposit = (amount: number, receiptLink: string) => {
    const dep: Deposit = {
      id: Math.random().toString(),
      userId: 'current-user',
      username: mainUser.username,
      amount,
      receiptUrl: receiptLink,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    setDeposits(prev => [dep, ...prev]);

    // Track on pending deposit ledger sum
    setWallets(prev => prev.map(w => {
      if (w.userId === 'current-user') {
        return { ...w, pendingDeposit: w.pendingDeposit + amount };
      }
      return w;
    }));

    recordAuditLog('DEPOSIT_REQUEST', 'PLAYER', `Requested manual GCash deposit: PHP ${amount}`);
  };

  const handleRequestWithdrawal = (amount: number) => {
    const wit: Withdrawal = {
      id: Math.random().toString(),
      userId: 'current-user',
      username: mainUser.username,
      amount,
      gcashName: gCash.accountName,
      gcashNumber: gCash.accountNumber,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    setWithdrawals(prev => [wit, ...prev]);

    // Block balance from available balance and shift to pending withdrawals
    setWallets(prev => prev.map(w => {
      if (w.userId === 'current-user') {
        return {
          ...w,
          balance: w.balance - amount,
          pendingWithdrawal: w.pendingWithdrawal + amount
        };
      }
      return w;
    }));

    recordAuditLog('WITHDRAWAL_REQUEST', 'PLAYER', `Cashed out cash balance: PHP ${amount} pending Operator checkout.`);
  };

  // Back Office GCash Approvals
  const handleApproveDeposit = (depositId: string, notes?: string) => {
    let depAmount = 0;
    setDeposits(prev => prev.map(d => {
      if (d.id === depositId) {
        depAmount = d.amount;
        return { ...d, status: 'Approved', reviewedAt: new Date().toISOString(), adminNotes: notes };
      }
      return d;
    }));

    // Update wallet stats
    setWallets(prev => prev.map(w => {
      if (w.userId === 'current-user') {
        return {
          ...w,
          balance: w.balance + depAmount,
          pendingDeposit: Math.max(0, w.pendingDeposit - depAmount),
          totalDeposited: w.totalDeposited + depAmount
        };
      }
      return w;
    }));

    throwNotification('current-user', 'Deposit approved!', `₱${depAmount} manual GCash payload successfully verified. Welcome!`, 'deposit_approved');
    recordAuditLog('DEPOSIT_APPROVED_BO', 'ADMIN', `Manually parsed deposit receipt ID ${depositId} of PHP ${depAmount}. Balanced player.`);
  };

  const handleRejectDeposit = (depositId: string, notes?: string) => {
    let depAmount = 0;
    setDeposits(prev => prev.map(d => {
      if (d.id === depositId) {
        depAmount = d.amount;
        return { ...d, status: 'Rejected', reviewedAt: new Date().toISOString(), adminNotes: notes };
      }
      return d;
    }));

    setWallets(prev => prev.map(w => {
      if (w.userId === 'current-user') {
        return { ...w, pendingDeposit: Math.max(0, w.pendingDeposit - depAmount) };
      }
      return w;
    }));

    throwNotification('current-user', 'Deposit rejected.', `₱${depAmount} GCash invoice rejected. Reason: ${notes || 'Proof invalid'}`, 'deposit_rejected');
    recordAuditLog('DEPOSIT_REJECTED_BO', 'ADMIN', `Rejected manual deposit reference ${depositId}. Reason: ${notes}`);
  };

  const handleApproveWithdrawal = (withdrawalId: string, notes?: string) => {
    setWithdrawals(prev => prev.map(w => {
      if (w.id === withdrawalId) {
        return { ...w, status: 'Processing', adminNotes: notes };
      }
      return w;
    }));
    throwNotification('current-user', 'Withdrawal Processing', `Your cash-out is being processed. Payout will be sent to GCash.`, 'withdrawal_approved');
    recordAuditLog('WITHDRAWAL_PROCESSING_BO', 'ADMIN', `Flagged withdrawal claim ${withdrawalId} as Processing.`);
  };

  const handleCompleteWithdrawal = (withdrawalId: string, notes?: string) => {
    let witAmount = 0;
    setWithdrawals(prev => prev.map(w => {
      if (w.id === withdrawalId) {
        witAmount = w.amount;
        return { ...w, status: 'Completed', completedAt: new Date().toISOString(), adminNotes: notes };
      }
      return w;
    }));

    setWallets(prev => prev.map(w => {
      if (w.userId === 'current-user') {
        return {
          ...w,
          pendingWithdrawal: Math.max(0, w.pendingWithdrawal - witAmount),
          totalWithdrawn: w.totalWithdrawn + witAmount
        };
      }
      return w;
    }));

    throwNotification('current-user', 'Withdrawal Complete!', `₱${witAmount} manual GCash payout has successfully cleared. Check GCash.`, 'withdrawal_completed');
    recordAuditLog('WITHDRAWAL_COMPLETED_BO', 'ADMIN', `Dispatched withdrawal payout ref ${withdrawalId} of PHP ${witAmount}.`);
  };

  const handleRejectWithdrawal = (withdrawalId: string, notes?: string) => {
    let witAmount = 0;
    setWithdrawals(prev => prev.map(w => {
      if (w.id === withdrawalId) {
        witAmount = w.amount;
        return { ...w, status: 'Rejected', completedAt: new Date().toISOString(), adminNotes: notes };
      }
      return w;
    }));

    // Void and return locked balances back to available
    setWallets(prev => prev.map(w => {
      if (w.userId === 'current-user') {
        return {
          ...w,
          balance: w.balance + witAmount,
          pendingWithdrawal: Math.max(0, w.pendingWithdrawal - witAmount)
        };
      }
      return w;
    }));

    throwNotification('current-user', 'Withdrawal Rejected', `₱${witAmount} payout request rejected. Balance returned. Reason: ${notes}`, 'withdrawal_rejected');
    recordAuditLog('WITHDRAWAL_REJECTED_BO', 'ADMIN', `Rejected withdrawal claim ${withdrawalId}. Reason: ${notes}`);
  };

  const handleSuspendUser = (userId: string, status: 'active' | 'suspended') => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status };
      }
      return u;
    }));
    recordAuditLog('USER_LOCKOUT', 'ADMIN', `Modified Bettor ID ${userId} gate to ${status}.`);
  };

  // Support logs messaging mechanics
  const handleSendChatMessage = (roomId: string, text: string, mockAttachedUrl?: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(),
      roomId,
      senderId: currentUserRole === 'admin' ? 'admin-id' : 'current-user',
      senderName: currentUserRole === 'admin' ? adminUser.username : mainUser.username,
      senderRole: currentUserRole === 'admin' ? 'admin' : 'user',
      message: text,
      attachedUrl: mockAttachedUrl,
      createdAt: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newMessage]);

    // Update Room statuses
    setChatRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          lastMessageAt: new Date().toISOString(),
          unreadCountAdmin: currentUserRole === 'admin' ? 0 : room.unreadCountAdmin + 1,
          unreadCountUser: currentUserRole === 'admin' ? room.unreadCountUser + 1 : 0
        };
      }
      return room;
    }));

    recordAuditLog('CHAT_MSG_TX', 'CHAT', `Transmitted support correspondence stream.`);
  };

  const handleResolveChatRoom = (roomId: string) => {
    setChatRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return { ...r, status: 'closed' };
      }
      return r;
    }));
    recordAuditLog('CHAT_TICKET_CLOSE', 'ADMIN', `Resolved and closed support Ticket ${roomId}.`);
  };

  const handleToggleNotificationRead = (notifyId: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === notifyId) {
        return { ...n, read: true };
      }
      return n;
    }));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-nearblack font-sans text-[#F5F5F5] selection:bg-gold selection:text-nearblack transition-colors dark-radial-gradient" id="bet-pwa-dock">
      
      {/* Absolute Header Ribbon */}
      <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-gold/20 bg-charcoal shadow-lg z-50 sticky top-0">
        <div className="flex items-center gap-4">
          {/* Mobile Sidebar open button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 bg-black/40 border border-white/10 rounded text-slate-400 cursor-pointer hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gold to-gold-dark rounded flex items-center justify-center shadow-md">
              <span className="text-black font-black text-lg select-none font-sans">B</span>
            </div>
            <h1 className="text-lg font-extrabold tracking-tighter uppercase text-white font-sans hidden sm:block">
              Bet<span className="text-gold">Platform</span>
            </h1>
            <span className="text-[8px] bg-gold/15 text-gold border border-gold/30 font-bold px-1.5 py-0.5 rounded tracking-widest hidden md:inline ml-1 font-mono">
              STAKE PRO
            </span>
          </div>
        </div>

        {/* Global Toolbar HUD */}
        <div className="flex items-center gap-3 md:gap-5">
          
          {/* Currency Display Widget */}
          <div 
            onClick={() => setCurrentView('profile')} 
            className="hidden sm:flex items-center bg-[#1A1A1A] border border-gold/30 rounded-full px-4 py-1.5 gap-3 shadow-inner cursor-pointer hover:border-gold/60 transition-colors"
          >
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-bronze font-bold uppercase tracking-widest leading-none">Balance</span>
              <span className="text-xs font-mono font-bold text-white">PHP {mainWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <button className="w-6 h-6 bg-gradient-to-r from-gold to-gold-dark rounded-full text-black flex items-center justify-center font-black shadow-md text-xs hover:scale-105 transition-transform">+</button>
          </div>

          {/* Persona Switch Mode Gate */}
          <button
            onClick={handleTogglePerspectives}
            id="role-switch-pill"
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-wider transition border cursor-pointer uppercase flex items-center gap-1.5 ${currentUserRole === 'admin' ? 'bg-gradient-to-r from-gold to-gold-dark text-black border-gold font-extrabold shadow-md' : 'bg-darkgrey text-gold border-gold/30 hover:border-gold/60'}`}
          >
            <Sliders className="w-3 h-3 text-current" />
            {currentUserRole === 'admin' ? 'ADMIN PERSPECTIVE' : 'PLAYER PERSPECTIVE'}
          </button>

          {/* User notifications selector */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-black/40 border border-[#D4AF37]/30 rounded-full text-slate-400 hover:text-gold transition cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gold"></span>
              )}
            </button>

            {/* Notification drop console */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2.5 w-72 bg-charcoal border border-gold/30 rounded-xl shadow-2xl p-3 z-40 max-h-96 overflow-y-auto space-y-2"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">My Notifications:</span>
                    <button onClick={clearAllNotifications} className="text-[9px] text-bronze hover:text-gold font-mono transition-colors">
                      Flush All
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <span className="text-xs text-slate-500 italic block py-4 text-center">No unread logs.</span>
                  ) : (
                    notifications.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => handleToggleNotificationRead(msg.id)}
                        className={`text-[11px] p-2 leading-snug rounded cursor-pointer transition border ${msg.read ? 'bg-black/20 border-white/5 text-slate-400' : 'bg-gold/10 border-gold/30 text-gold-dark'}`}
                      >
                        <span className="block font-bold mb-0.5">{msg.title}</span>
                        <span>{msg.message}</span>
                        <span className="block text-[8px] text-slate-500 text-right mt-1 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <div className="flex">
        {/* SIDEBAR NAVIGATION */}
        <aside className={`w-64 bg-[#141414] min-h-[calc(100vh-64px)] border-r border-gold/20 p-5 flex flex-col justify-between shrink-0 transition-transform duration-200 fixed md:static inset-y-16 left-0 z-20 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="space-y-6">
            
            {/* Main Menu Links list */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#CD7F32] font-bold block mb-3 ml-2">
                Lobby Navigation
              </span>
              <nav className="space-y-1">
                {[
                  { id: 'lobby', label: 'MGM Casino Lobby', icon: Compass },
                  { id: 'sportsbook', label: 'Sports Brokerage', icon: Dribbble },
                  { id: 'services', label: 'Manual Payout Support', icon: MessageSquare },
                  { id: 'profile', label: 'Active PHP wallet', icon: DollarSign },
                  { id: 'responsible', label: 'Resp Gaming & Rules', icon: ShieldAlert },
                  { id: 'help', label: 'Developers Exports', icon: FileCode }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs rounded-xl transition font-sans font-semibold cursor-pointer border-l-2 ${currentView === item.id ? 'bg-gold/10 border-gold text-white font-bold' : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white'}`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-current" />
                      {item.label}
                    </button>
                  );
                })}

                {/* Back Office Button (Always shown if current role is admin) */}
                {currentUserRole === 'admin' && (
                  <button
                    onClick={() => {
                      setCurrentView('admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs rounded-xl transition font-sans font-bold cursor-pointer border-l-2 ${currentView === 'admin' ? 'bg-[#CD7F32]/10 border-[#CD7F32] text-white font-bold' : 'border-transparent text-bronze hover:bg-white/5'}`}
                  >
                    <Sliders className="w-4 h-4 shrink-0" />
                    MGM Back Office
                  </button>
                )}
              </nav>
            </div>

            {/* Quick Balance display inside sidebar for ease of mobile players */}
            <div className="bg-black/55 rounded-xl p-4 border border-gold/15 space-y-2">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Player Wallet</span>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300">Balance:</span>
                <span className="text-gold font-bold">₱{mainWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <button
                onClick={() => { setCurrentView('profile'); setIsMobileMenuOpen(false); }}
                className="w-full text-center py-2 bg-gold/10 hover:bg-gold/25 text-gold font-sans font-bold text-[10px] rounded-lg border border-gold/30 transition cursor-pointer uppercase tracking-wider"
              >
                GCash Operations
              </button>
            </div>
          </div>

          {/* Legal Stamp Compliance footer */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <div className="text-[10px] text-slate-500 flex items-center gap-1 leading-normal font-sans">
              <Info className="w-3.5 h-3.5 text-gold" /> Licensed under PAGCOR limits. Wagers are in PHP currency only.
            </div>
            <div className="text-[9px] text-slate-600 block">
              Bet Platform ver 2.4.9 © 2026
            </div>
          </div>
        </aside>

        {/* PRIMARY MAIN PANEL ROUTE DISPATCHER */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-x-hidden min-h-[calc(100vh-64px)]">
          
          {/* Active lockout block check */}
          {checkIsSelfExcluded() && currentView !== 'responsible' && (
            <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-8 text-center space-y-4 max-w-2xl mx-auto">
              <X className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-serif font-black text-red-400">ACTIVE COMPLIANCE LOCKOUT</h3>
              <p className="text-xs text-slate-300 leading-normal max-w-md mx-auto">
                You have activated a responsible gaming self-imposed exclusion timeout. All slot spinning, blackjack hands, and sportsbook tickets remain locked until the exclusion clock concludes to promote a healthy experience.
              </p>
              <button
                onClick={() => setCurrentView('responsible')}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-serif font-bold text-xs rounded transition cursor-pointer"
              >
                View Exclude Clock Time
              </button>
            </div>
          )}

          {/* Settle Views */}
          {!checkIsSelfExcluded() && currentView === 'lobby' && (
            <div className="space-y-8" id="casino-lobby">
              {/* Grand Promotional Hero Banner mimicking Stake/BetMGM perfectly */}
              <div className="bg-gradient-to-r from-[#141414] via-[#0A0A0A] to-[#CD7F32]/10 rounded-2xl p-6 md:p-8 border border-gold/25 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="space-y-4 max-w-lg z-10">
                  <span className="text-[10px] uppercase font-mono tracking-widest bg-gold/15 text-gold px-2.5 py-1 rounded-full border border-gold/30">
                    Grand Lucky Jackpot Week
                  </span>
                  <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gold to-gold-dark">
                    MGM DOUBLE CHIME BONANZA
                  </h1>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Spin and test your luck on MGM Golden reels or claim double payouts on Vegas blackjack terminals. 21+ verification active. Deposits manually cleared by support via instant GCash logs!
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const slotsElem = document.getElementById('slots-terminal');
                        slotsElem?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-5 py-3 bg-gradient-to-r from-gold to-gold-dark hover:opacity-90 text-black font-sans font-extrabold text-xs rounded-xl shadow-gold-sm transition cursor-pointer"
                    >
                      SPIN GOLDEN REELS
                    </button>
                    <button
                      onClick={() => {
                        const bjElem = document.getElementById('blackjack-terminal');
                        bjElem?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-5 py-3 bg-[#1A1A1A] hover:bg-white/5 border border-white/10 text-white font-sans font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                    >
                      VEGAS BLACKJACK
                    </button>
                  </div>
                </div>

                <div className="relative shrink-0 hidden md:block">
                  <div className="w-40 h-40 rounded-full bg-gold/5 blur-3xl absolute inset-0"></div>
                  <span className="text-8xl select-none animate-pulse relative z-10">🎰</span>
                </div>
              </div>

              {/* Grid: 2 Games side-by-side */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SlotsGame
                  balance={mainWallet.balance}
                  onUpdateBalance={(amount, action, detail) => handleUpdateWalletBalance('current-user', amount, action, detail)}
                  onLogGame={logSlotsWagerOutcome}
                />
                <BlackjackGame
                  balance={mainWallet.balance}
                  onUpdateBalance={(amount, action, detail) => handleUpdateWalletBalance('current-user', amount, action, detail)}
                  onLogGame={logBlackjackWagerOutcome}
                />
              </div>

              {/* Latest bets stream block */}
              <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-serif font-bold text-gold uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-gold animate-spin" /> Active Platform Bets Feed
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Simulating real-time feeds</span>
                </div>
                
                <div className="overflow-x-auto">
                  {slotLogs.length === 0 && blackjackLogs.length === 0 ? (
                    <span className="text-xs text-slate-500 italic block py-4 text-center">No platform wagers registered yet. Spin slots or play blackjack above to fill the ledger!</span>
                  ) : (
                    <table className="w-full text-xs text-left text-slate-400 font-mono">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-500">
                          <th className="pb-2">Game Type</th>
                          <th className="pb-2">Bettor</th>
                          <th className="pb-2">Stake (PHP)</th>
                          <th className="pb-2">Reels/Hand Outcomes</th>
                          <th className="pb-2 text-right">Returns (PHP)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[11px] text-slate-300">
                        {slotLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-white/5">
                            <td className="py-2 text-gold font-sans font-black">🎰 GOLD REELS</td>
                            <td className="py-2">{log.username}</td>
                            <td className="py-2">₱{log.betAmount}</td>
                            <td className="py-2 text-center text-sm">{log.reels.join('')}</td>
                            <td className="py-2 text-right font-black text-emerald-400">
                              {log.winAmount > 0 ? `+₱${log.winAmount}` : '₱0'}
                            </td>
                          </tr>
                        ))}
                        {blackjackLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-white/5">
                            <td className="py-2 text-[#CD7F32] font-sans font-black">♠ BLACKJACK</td>
                            <td className="py-2">{log.username}</td>
                            <td className="py-2">₱{log.betAmount}</td>
                            <td className="py-2 truncate max-w-[120px]">{log.playerHand.join(',')}</td>
                            <td className="py-2 text-right font-black text-emerald-400">
                              {log.winAmount > 0 ? `+₱${log.winAmount}` : '₱0'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sportsbook View Module */}
          {!checkIsSelfExcluded() && currentView === 'sportsbook' && (
            <SportsBook
              balance={mainWallet.balance}
              matches={matches}
              onPlaceBet={handlePlaceSportsBet}
              onAddMatch={handleAddSportsMatch}
              onSettleMatch={handleSettleSportsMatch}
              currentUserRole={currentUserRole}
            />
          )}

          {/* Profile & Wallet Setting */}
          {currentView === 'profile' && (
            <ProfilePanel
              wallet={mainWallet}
              gcash={gCash}
              deposits={deposits}
              withdrawals={withdrawals}
              onSaveGCash={handleSaveGCashProfile}
              onRequestDeposit={handleRequestGCashDeposit}
              onRequestWithdrawal={handleRequestWithdrawal}
            />
          )}

          {/* Live Chat messaging hub */}
          {currentView === 'services' && (
            <LiveChat
              rooms={chatRooms}
              messages={chatMessages}
              onSendMessage={handleSendChatMessage}
              onResolveRoom={handleResolveChatRoom}
              currentUserRole={currentUserRole}
              currentUserId={currentUserRole === 'admin' ? 'admin-id' : 'current-user'}
              currentUsername={currentUserRole === 'admin' ? adminUser.username : mainUser.username}
            />
          )}

          {/* Responsible gaming settings */}
          {currentView === 'responsible' && (
            <ResponsibleGaming
              onSelfExclude={handleSetSelfExclusion}
              isSelfExcluded={checkIsSelfExcluded()}
              exclusionTimeLeft={exclusionTimeLeft}
              currentUserEmail={mainUser.email}
            />
          )}

          {/* System Exports Code & Playbook */}
          {currentView === 'help' && (
            <SystemDocumentation />
          )}

          {/* Complete Back Office Section */}
          {currentUserRole === 'admin' && currentView === 'admin' && (
            <AdminPanel
              users={users}
              wallets={wallets}
              deposits={deposits}
              withdrawals={withdrawals}
              bets={bets}
              slotsLogs={slotLogs}
              blackjackLogs={blackjackLogs}
              auditLogs={auditLogs}
              onUpdateUserStatus={handleSuspendUser}
              onApproveDeposit={handleApproveDeposit}
              onRejectDeposit={handleRejectDeposit}
              onApproveWithdrawal={handleApproveWithdrawal}
              onCompleteWithdrawal={handleCompleteWithdrawal}
              onRejectWithdrawal={handleRejectWithdrawal}
              onSettleMatch={handleSettleSportsMatch}
              matches={matches}
            />
          )}
        </main>
      </div>
    </div>
  );
}
