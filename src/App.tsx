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
import EmojiScatterGame from './components/EmojiScatterGame';
import SportsBook from './components/SportsBook';
import LiveChat from './components/LiveChat';
import ProfilePanel from './components/ProfilePanel';
import AdminPanel from './components/AdminPanel';
import ResponsibleGaming from './components/ResponsibleGaming';
import SystemDocumentation from './components/SystemDocumentation';
import AuthScreen from './components/AuthScreen';

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
    email: 'betplatform@bet.bet',
    username: 'BetMGMOberst',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150',
    role: 'admin',
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
    lifetimeProfitLoss: 380000.00,
    grandLuckyPot: 500000.00
  }
];

const INITIAL_MATCHES: Match[] = [];

const INITIAL_DEPOSITS: Deposit[] = [];

const INITIAL_CHAT_ROOMS: ChatRoom[] = [];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

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

  // Dynamic slots configs state
  const [slotsSymbols, setSlotsSymbols] = useState<any[]>([
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
    { char: '👑', multiplier: 150.0, name: 'MGM Royal Crown' },
    { char: '💰', multiplier: 250.0, name: 'Vegas Cash Bag' }
  ]);

  const [winChanceModifier, setWinChanceModifier] = useState<number>(0.85);
  const [safeProfitLock, setSafeProfitLock] = useState<boolean>(true);

  // Active perspective & user session state
  const [activeUser, setActiveUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bp_current_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeWallet, setActiveWallet] = useState<Wallet | null>(() => {
    const saved = localStorage.getItem('bp_current_wallet_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Dynamic hash routing state for admin portal
  const [isAdminRouteActive, setIsAdminRouteActive] = useState<boolean>(() => {
    return window.location.hash === '#/betadmin2026';
  });

  // Listener to watch hash changes and redirect accordingly
  useEffect(() => {
    const handleHashChange = () => {
      const active = window.location.hash === '#/betadmin2026';
      setIsAdminRouteActive(active);
      if (active) {
        setCurrentView('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    // Parse on startup too
    handleHashChange();
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Quick verification for active user references mapping logged-in user dynamically with clean robust fallbacks
  const mainUser = activeUser || {
    id: 'guest-id',
    email: 'guest@bet.bet',
    username: 'Guest Bettor',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    role: 'user' as const,
    status: 'active' as const,
    createdAt: new Date().toISOString()
  };

  const mainWallet = wallets.find(w => w.userId === mainUser.id) || activeWallet || {
    userId: 'guest-id',
    currency: 'PHP' as const,
    balance: 0.00,
    pendingDeposit: 0.00,
    pendingWithdrawal: 0.00,
    totalDeposited: 0.00,
    totalWithdrawn: 0.00,
    lifetimeProfitLoss: 0.00,
    grandLuckyPot: 120000.00
  };

  // Sync active user state and wallet session with latest database state in 'users' and 'wallets'
  useEffect(() => {
    if (activeUser) {
      const dbUser = users.find(u => u.id === activeUser.id);
      if (dbUser && JSON.stringify(dbUser) !== JSON.stringify(activeUser)) {
        setActiveUser(dbUser);
        localStorage.setItem('bp_current_user_session', JSON.stringify(dbUser));
      }
      const dbWallet = wallets.find(w => w.userId === activeUser.id);
      if (dbWallet && JSON.stringify(dbWallet) !== JSON.stringify(activeWallet)) {
        setActiveWallet(dbWallet);
        localStorage.setItem('bp_current_wallet_session', JSON.stringify(dbWallet));
      }
    }
  }, [users, wallets, activeUser]);

  const adminUser = users.find(u => u.role === 'admin') || {
    id: 'admin-id',
    email: 'betplatform@bet.bet',
    username: 'MGM_Backoffice_Admin'
  };

  // Dynamic session triggers for auth success
  const handleAuthSuccess = (user: User, wallet: Wallet) => {
    setActiveUser(user);
    setActiveWallet(wallet);
    
    // Add user into 'users' and 'wallets' list if not already present
    setUsers(prev => {
      if (!prev.find(u => u.id === user.id)) {
        return [...prev, user];
      }
      return prev;
    });

    setWallets(prev => {
      if (!prev.find(w => w.userId === wallet.userId)) {
        return [...prev, wallet];
      }
      return prev;
    });

    if (user.role === 'admin') {
      setCurrentUserRole('admin');
      setCurrentView('admin');
    } else {
      setCurrentUserRole('user');
      setCurrentView('lobby');
    }

    recordAuditLog('AUTH_SUCCESS', user.role === 'admin' ? 'ADMIN' : 'PLAYER', `${user.username} logged in successfully.`);
  };

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



  const handleUpdateWalletBalance = (userId: string, changeAmount: number, auditAction: string, auditDetail: string) => {
    setWallets(prev => prev.map(w => {
      if (w.userId === userId) {
        const nextBal = Math.max(0, w.balance + changeAmount);
        const nextLifetime = w.lifetimeProfitLoss + changeAmount;
        // Keep active wallet session storage synchronized
        if (activeUser && userId === activeUser.id) {
          const updated: Wallet = {
            ...w,
            balance: nextBal,
            lifetimeProfitLoss: nextLifetime
          };
          setActiveWallet(updated);
          localStorage.setItem('bp_current_wallet_session', JSON.stringify(updated));
        }
        return {
          ...w,
          balance: nextBal,
          lifetimeProfitLoss: nextLifetime
        };
      }
      return w;
    }));
    recordAuditLog(auditAction, userId === 'admin-id' ? 'ADMIN' : 'PLAYER', auditDetail);
  };

  // Custom balance override from Back Office desk
  const handleUpdateUserWalletBalanceOverride = (userId: string, newBalance: number) => {
    setWallets(prev => prev.map(w => {
      if (w.userId === userId) {
        // Keeps both local and session storage synced
        if (activeUser && userId === activeUser.id) {
          const updated: Wallet = {
            ...w,
            balance: newBalance
          };
          setActiveWallet(updated);
          localStorage.setItem('bp_current_wallet_session', JSON.stringify(updated));
        }
        return {
          ...w,
          balance: newBalance
        };
      }
      return w;
    }));
    recordAuditLog('BALANCE_OVERRIDE', 'ADMIN', `Overrode PHP balance for userId ${userId} to ${newBalance}`);
  };

  // Custom tailored grand lucky pot setter
  const handleUpdateUserWalletPot = (userId: string, newPot: number) => {
    setWallets(prev => prev.map(w => {
      if (w.userId === userId) {
        if (activeUser && userId === activeUser.id) {
          const updated: Wallet = {
            ...w,
            grandLuckyPot: newPot
          };
          setActiveWallet(updated);
          localStorage.setItem('bp_current_wallet_session', JSON.stringify(updated));
        }
        return {
          ...w,
          grandLuckyPot: newPot
        };
      }
      return w;
    }));
    recordAuditLog('POT_OVERRIDE', 'ADMIN', `Overrode grand lucky pot for userId ${userId} to PHP ${newPot}`);
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
      userId: mainUser.id,
      username: mainUser.username,
      betAmount: bet,
      winAmount: win,
      reels: reelsOutcome,
      createdAt: new Date().toISOString()
    };
    setSlotLogs(prev => [log, ...prev]);
    recordAuditLog('SLOT_RESULT', 'SLOTS_ENGINE', `Player ${mainUser.username} spun ${reelsOutcome.join('-')}, wagered ₱${bet}, won ₱${win}.`);
  };

  const logEmojiScatterWagerOutcome = (bet: number, win: number, reelsOutcome: string[]) => {
    const log: SlotLog = {
      id: "es-" + Math.random().toString(),
      userId: mainUser.id,
      username: mainUser.username,
      betAmount: bet,
      winAmount: win,
      reels: reelsOutcome,
      createdAt: new Date().toISOString()
    };
    setSlotLogs(prev => [log, ...prev]);
    recordAuditLog('EMOJI_SCATTER_RESULT', 'EMOJI_ENGINE', `Player ${mainUser.username} spun emoji matrix ${reelsOutcome.join('-')}, wagered ₱${bet}, won ₱${win}.`);
  };

  const logBlackjackWagerOutcome = (bet: number, win: number, pCards: string[], dCards: string[], status: 'Won' | 'Lost' | 'Push' | 'Blackjack') => {
    const log: BlackjackLog = {
      id: Math.random().toString(),
      userId: mainUser.id,
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
    handleUpdateWalletBalance(mainUser.id, -bet.stake, 'SPORTS_BET_PLACED', `Wagered PHP ${bet.stake} on match predictor ID ${bet.matchId}`);
    throwNotification(mainUser.id, 'Sportsbook wager logged!', `Speculated ${bet.teamA} vs ${bet.teamB} outcome. Stake PHP ${bet.stake} is active.`, 'announcement');
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
          handleUpdateWalletBalance(bet.userId, payout, 'SPORTS_Payout', `Credited PHP ${payout} sports winnings for bet reference ID ${bet.id}`);
          throwNotification(bet.userId, 'Sports slip won!', `Congrats! Your prediction pays PHP ${payout}`, 'bet_won');
        } else {
          throwNotification(bet.userId, 'Bet slip settled.', `Sports wager on ${bet.teamA} vs ${bet.teamB} settled. Try again!`, 'bet_lost');
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

  const handleRequestGCashDeposit = (amount: number, refNum: string) => {
    const dep: Deposit = {
      id: "dep-" + Math.random().toString(36).substr(2, 9),
      userId: mainUser.id,
      username: mainUser.username,
      amount,
      referenceNumber: refNum,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    setDeposits(prev => [dep, ...prev]);

    // Track on pending deposit ledger sum
    setWallets(prev => prev.map(w => {
      if (w.userId === mainUser.id) {
        return { ...w, pendingDeposit: w.pendingDeposit + amount };
      }
      return w;
    }));

    if (activeWallet) {
      setActiveWallet(prev => prev ? {
        ...prev,
        pendingDeposit: prev.pendingDeposit + amount
      } : null);
    }

    recordAuditLog('DEPOSIT_REQUEST', 'PLAYER', `Submitted manual GCash deposit: PHP ${amount}. Reference Number: ${refNum}`);
  };

  const handleRequestWithdrawal = (amount: number) => {
    const wit: Withdrawal = {
      id: "wit-" + Math.random().toString(36).substr(2, 9),
      userId: mainUser.id,
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
      if (w.userId === mainUser.id) {
        return {
          ...w,
          balance: w.balance - amount,
          pendingWithdrawal: w.pendingWithdrawal + amount
        };
      }
      return w;
    }));

    if (activeWallet) {
      setActiveWallet(prev => prev ? {
        ...prev,
        balance: prev.balance - amount,
        pendingWithdrawal: prev.pendingWithdrawal + amount
      } : null);
    }

    recordAuditLog('WITHDRAWAL_REQUEST', 'PLAYER', `Cashed out cash balance: PHP ${amount} pending Operator checkout.`);
  };

  // Back Office GCash Approvals
  const handleApproveDeposit = (depositId: string, notes?: string) => {
    let depAmount = 0;
    let targetUserId = 'guest-id';
    setDeposits(prev => prev.map(d => {
      if (d.id === depositId) {
        depAmount = d.amount;
        targetUserId = d.userId;
        return { ...d, status: 'Approved', reviewedAt: new Date().toISOString(), adminNotes: notes };
      }
      return d;
    }));

    // Update wallet stats
    setWallets(prev => prev.map(w => {
      if (w.userId === targetUserId) {
        return {
          ...w,
          balance: w.balance + depAmount,
          pendingDeposit: Math.max(0, w.pendingDeposit - depAmount),
          totalDeposited: w.totalDeposited + depAmount
        };
      }
      return w;
    }));

    if (activeWallet && activeUser?.id === targetUserId) {
      setActiveWallet(prev => prev ? {
        ...prev,
        balance: prev.balance + depAmount,
        pendingDeposit: Math.max(0, prev.pendingDeposit - depAmount),
        totalDeposited: prev.totalDeposited + depAmount
      } : null);
    }

    throwNotification(targetUserId, 'Deposit approved!', `₱${depAmount} manual GCash reference successfully verified. Welcome!`, 'deposit_approved');
    recordAuditLog('DEPOSIT_APPROVED_BO', 'ADMIN', `Manually parsed deposit ID ${depositId} of PHP ${depAmount}. Balanced player.`);
  };

  const handleRejectDeposit = (depositId: string, notes?: string) => {
    let depAmount = 0;
    let targetUserId = 'guest-id';
    setDeposits(prev => prev.map(d => {
      if (d.id === depositId) {
        depAmount = d.amount;
        targetUserId = d.userId;
        return { ...d, status: 'Rejected', reviewedAt: new Date().toISOString(), adminNotes: notes };
      }
      return d;
    }));

    setWallets(prev => prev.map(w => {
      if (w.userId === targetUserId) {
        return { ...w, pendingDeposit: Math.max(0, w.pendingDeposit - depAmount) };
      }
      return w;
    }));

    if (activeWallet && activeUser?.id === targetUserId) {
      setActiveWallet(prev => prev ? {
        ...prev,
        pendingDeposit: Math.max(0, prev.pendingDeposit - depAmount)
      } : null);
    }

    throwNotification(targetUserId, 'Deposit rejected.', `₱${depAmount} GCash reference rejected. Reason: ${notes || 'Proof invalid'}`, 'deposit_rejected');
    recordAuditLog('DEPOSIT_REJECTED_BO', 'ADMIN', `Rejected manual deposit reference ${depositId}. Reason: ${notes}`);
  };

  const handleApproveWithdrawal = (withdrawalId: string, notes?: string) => {
    let targetUserId = 'guest-id';
    setWithdrawals(prev => prev.map(w => {
      if (w.id === withdrawalId) {
        targetUserId = w.userId;
        return { ...w, status: 'Processing', adminNotes: notes };
      }
      return w;
    }));
    throwNotification(targetUserId, 'Withdrawal Processing', `Your cash-out is being processed. Payout will be sent to GCash.`, 'withdrawal_approved');
    recordAuditLog('WITHDRAWAL_PROCESSING_BO', 'ADMIN', `Flagged withdrawal claim ${withdrawalId} as Processing.`);
  };

  const handleCompleteWithdrawal = (withdrawalId: string, notes?: string) => {
    let witAmount = 0;
    let targetUserId = 'guest-id';
    setWithdrawals(prev => prev.map(w => {
      if (w.id === withdrawalId) {
        witAmount = w.amount;
        targetUserId = w.userId;
        return { ...w, status: 'Completed', completedAt: new Date().toISOString(), adminNotes: notes };
      }
      return w;
    }));

    setWallets(prev => prev.map(w => {
      if (w.userId === targetUserId) {
        return {
          ...w,
          pendingWithdrawal: Math.max(0, w.pendingWithdrawal - witAmount),
          totalWithdrawn: w.totalWithdrawn + witAmount
        };
      }
      return w;
    }));

    if (activeWallet && activeUser?.id === targetUserId) {
      setActiveWallet(prev => prev ? {
        ...prev,
        pendingWithdrawal: Math.max(0, prev.pendingWithdrawal - witAmount),
        totalWithdrawn: prev.totalWithdrawn + witAmount
      } : null);
    }

    throwNotification(targetUserId, 'Withdrawal Complete!', `₱${witAmount} manual GCash payout has successfully cleared. Check GCash.`, 'withdrawal_completed');
    recordAuditLog('WITHDRAWAL_COMPLETED_BO', 'ADMIN', `Dispatched withdrawal payout ref ${withdrawalId} of PHP ${witAmount}.`);
  };

  const handleRejectWithdrawal = (withdrawalId: string, notes?: string) => {
    let witAmount = 0;
    let targetUserId = 'guest-id';
    setWithdrawals(prev => prev.map(w => {
      if (w.id === withdrawalId) {
        witAmount = w.amount;
        targetUserId = w.userId;
        return { ...w, status: 'Rejected', completedAt: new Date().toISOString(), adminNotes: notes };
      }
      return w;
    }));

    // Void and return locked balances back to available
    setWallets(prev => prev.map(w => {
      if (w.userId === targetUserId) {
        return {
          ...w,
          balance: w.balance + witAmount,
          pendingWithdrawal: Math.max(0, w.pendingWithdrawal - witAmount)
        };
      }
      return w;
    }));

    if (activeWallet && activeUser?.id === targetUserId) {
      setActiveWallet(prev => prev ? {
        ...prev,
        balance: prev.balance + witAmount,
        pendingWithdrawal: Math.max(0, prev.pendingWithdrawal - witAmount)
      } : null);
    }

    throwNotification(targetUserId, 'Withdrawal Rejected', `₱${witAmount} payout request rejected. Balance returned. Reason: ${notes}`, 'withdrawal_rejected');
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

  const handleAddBettor = (username: string, email: string, initialBalance: number) => {
    const newId = 'bettor-' + Math.random().toString(36).substr(2, 9);
    const newBettor: User = {
      id: newId,
      email: email.trim().toLowerCase(),
      username: username.trim(),
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150`,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    const newWallet: Wallet = {
      userId: newId,
      currency: 'PHP',
      balance: initialBalance,
      pendingDeposit: 0,
      pendingWithdrawal: 0,
      totalDeposited: initialBalance,
      totalWithdrawn: 0,
      lifetimeProfitLoss: 0,
      grandLuckyPot: 120000.00
    };

    setUsers(prev => [...prev, newBettor]);
    setWallets(prev => [...prev, newWallet]);
    recordAuditLog('USER_CREATED_BO', 'ADMIN', `Created new Bettor: ${username} (${email}) with PHP ${initialBalance}`);
  };

  const handleDeleteBettor = (userId: string) => {
    if (userId === 'admin-id') {
      alert("Cannot delete the root administrator!");
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    setWallets(prev => prev.filter(w => w.userId !== userId));
    recordAuditLog('USER_DELETED_BO', 'ADMIN', `Removed Bettor ID: ${userId}`);
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

  // Secure route gateway interceptor for admin portal routing
  if (isAdminRouteActive && activeUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#090505] text-[#ECEFF1] flex flex-col justify-center items-center px-4 relative overflow-hidden" id="admin-security-auth-page">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#120505] rounded-3xl border border-red-500/30 p-8 md:p-10 shadow-[0_0_50px_rgba(239,68,68,0.1)] relative z-10">
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 via-rose-500 to-amber-600 rounded-2xl flex items-center justify-center transform rotate-6 animate-pulse">
              <ShieldAlert className="w-7 h-7 text-white -rotate-6" />
            </div>
            <div>
              <h2 className="text-2xl font-sans font-black tracking-tighter uppercase text-white leading-none">
                MGM <span className="text-red-500">BACK OFFICE</span>
              </h2>
              <p className="text-[10px] text-red-400 font-mono tracking-widest uppercase mt-2 font-black">
                SECURED PORTAL • AUTHORIZED STAFF ONLY
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal text-center mb-6 font-mono bg-red-950/20 p-3 rounded border border-red-500/10">
            This workspace routing is private. Standard player accounts cannot access this viewport. Enter secure staff credentials.
          </p>

          <form onSubmit={async (e) => {
            e.preventDefault();
            const emailClean = (e.currentTarget.elements.namedItem('adminEmail') as HTMLInputElement).value.trim().toLowerCase();
            const passwordClean = (e.currentTarget.elements.namedItem('adminPassword') as HTMLInputElement).value;
            
            if (emailClean === 'betplatform@bet.bet' && passwordClean === 'bet@bet123') {
              const rootAdmin: User = {
                id: 'admin-id',
                email: 'betplatform@bet.bet',
                username: 'BetMGMOberst',
                avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150',
                role: 'admin',
                status: 'active',
                createdAt: new Date().toISOString()
              };
              const rootWallet: Wallet = {
                userId: 'admin-id',
                currency: 'PHP',
                balance: 500000.00,
                pendingDeposit: 0,
                pendingWithdrawal: 0,
                totalDeposited: 500000,
                totalWithdrawn: 0,
                lifetimeProfitLoss: 0,
                grandLuckyPot: 500000.00
              };

              // Clear user session and set admin root
              localStorage.setItem('bp_current_user_session', JSON.stringify(rootAdmin));
              localStorage.setItem('bp_current_wallet_session', JSON.stringify(rootWallet));
              
              setActiveUser(rootAdmin);
              setActiveWallet(rootWallet);
              setCurrentUserRole('admin');
              setCurrentView('admin');
              alert("Secured login successful. Welcome back to Back Office operations console.");
            } else {
              alert("Access Denied: Invalid credentials.");
            }
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider mb-1.5 font-bold">
                Admin Email Address:
              </label>
              <input
                type="email"
                name="adminEmail"
                placeholder="root@betplatform.com"
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-red-500 transition-colors font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider mb-1.5 font-bold">
                Master Security Code:
              </label>
              <input
                type="password"
                name="adminPassword"
                placeholder="••••••••"
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-red-500 transition-colors font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 text-white font-sans font-extrabold text-xs rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition cursor-pointer uppercase tracking-wider"
            >
              Unlock Secure Control Node
            </button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-white/5">
            <button
              onClick={() => {
                window.location.hash = '';
                setIsAdminRouteActive(false);
                setCurrentView('lobby');
              }}
              className="text-xs text-slate-400 hover:text-gold hover:underline font-mono animate-pulse"
            >
              ← Return to Standard Casino Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#ECEFF1] relative overflow-hidden flex flex-col justify-between animate-fade-in" id="bet-landing-shell">
        {/* Subtle decorative glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#CD7F32]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Global Landing Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-zinc-950/60 backdrop-blur z-20 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gold to-gold-dark rounded flex items-center justify-center shadow-md">
              <span className="text-black font-black text-lg select-none">B</span>
            </div>
            <h1 className="text-md font-extrabold tracking-tighter uppercase text-white font-sans">
              Bet<span className="text-gold">Platform</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">PAGCOR AUTHORIZED 21+ ONLY</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-mono font-bold font-sans">DESK ONLINE</span>
          </div>
        </header>

        {/* Centerpiece Content: Visual Highlights & Auth Block */}
        <div className="flex-grow flex flex-col lg:flex-row items-center justify-center p-6 md:p-12 lg:p-16 gap-10 max-w-7xl mx-auto w-full z-10 relative">
          <div className="flex-1 space-y-6 max-w-xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-gold uppercase bg-gold/10 px-3 py-1 rounded-full border border-gold/30">
              <Sparkles className="w-3 h-3 text-gold animate-spin" /> SECURE DEPOSIT & CASINO LOBBY
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight text-white leading-tight uppercase font-sans">
              PHILIPPINES' PREMIER <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-dark to-bronze">
                MGM GOLDEN REELS
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans max-w-lg mx-auto lg:mx-0">
              Register an active seat on Manila's premium gaming broker. We host live blackjack deals, instant slots with custom multi-level hit multipliers, and full support-verified GCash ledger channels.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <div className="bg-zinc-900/50 border border-white/5 p-3.5 rounded-xl text-center lg:text-left">
                <span className="block text-lg font-mono font-black text-gold">₱120,000+</span>
                <span className="text-[9px] text-[#CD7F32] font-mono uppercase tracking-wider block mt-0.5">Lucky Pot Base</span>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 p-3.5 rounded-xl text-center lg:text-left">
                <span className="block text-lg font-mono font-black text-white">12 Symbols</span>
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block mt-0.5">Odds Scalable</span>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 p-3.5 rounded-xl text-center lg:text-left col-span-2 md:col-span-1 border-white/10">
                <span className="block text-lg font-mono font-black text-green-400">GCash</span>
                <span className="text-[9px] text-green-500/85 font-mono uppercase tracking-wider block mt-0.5">PHP Operational</span>
              </div>
            </div>

            {/* Credibility badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-slate-500 font-mono text-[10px] pt-4 font-sans">
              <span>• VERIFIED RNG SYSTEM</span>
              <span>• SAFE PROFIT LOCK</span>
              <span>• FAST MANILA WITHDRAWALS</span>
            </div>
          </div>

          <div className="w-full max-w-md bg-[#0d0d0d] border border-gold/25 p-6 rounded-3xl shadow-gold-sm relative">
            <div className="absolute top-3 right-4 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" />
              <span className="text-[8px] font-mono text-gold-dark font-extrabold uppercase font-sans">MGM AUTH GATE</span>
            </div>
            <AuthScreen onAuthSuccess={handleAuthSuccess} />
          </div>
        </div>

        {/* Dynamic Footer with responsive notices */}
        <footer className="bg-zinc-950 border-t border-white/5 p-4 text-center z-20 text-[10px] text-zinc-500 font-sans uppercase tracking-widest flex flex-col md:flex-row justify-between items-center gap-3 px-8">
          <span>🎰 BETPLATFORM PHILIPPINES ENTERTAINMENT ENGINE</span>
          <span className="text-[#CD7F32]">Keep Gaming Responsible • Player Limits Certified 21+</span>
        </footer>
      </div>
    );
  }

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

          {/* Secure Log-Out Control button */}
          {activeUser && (
            <button
              onClick={() => {
                localStorage.removeItem('bp_current_user_session');
                localStorage.removeItem('bp_current_wallet_session');
                setActiveUser(null);
                setActiveWallet(null);
                setCurrentView('lobby');
              }}
              title="Log Out Casino Session"
              className="p-2 bg-black/40 border border-red-500/30 rounded-full text-rose-500 hover:bg-rose-950/20 hover:text-rose-450 transition cursor-pointer flex items-center justify-center shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
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

                {/* Back Office Button (Shown if current role is admin and secure hash route is active) */}
                {currentUserRole === 'admin' && isAdminRouteActive && (
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
                  <div className="flex flex-wrap gap-2.5">
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
                        setCurrentView('game-emojiscatter' as any);
                      }}
                      className="px-5 py-3 bg-gradient-to-r from-red-600 to-amber-500 text-white hover:opacity-90 font-sans font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
                    >
                      EMOJI SCATTER BONANZA
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('game-blackjack' as any);
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

              {/* Grid: 3 Interactive Game Launcher Cards (Instead of in-lobby playable games) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Launch Card 1: Slots */}
                <div className="bg-[#111111] rounded-2xl border border-gold/20 p-6 flex flex-col justify-between hover:border-gold/50 transition-all group hover:-translate-y-1 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-4xl">🎰</span>
                      <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase bg-gold/15 text-gold border border-gold/30 px-2 py-0.5 rounded text-right">
                        Scatter Slots
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-serif font-black text-white group-hover:text-gold transition-colors">
                        MGM GOLD REELS
                      </h4>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1.5 font-normal">
                        High stakes progressive slots with lucky cherry multipliers, wildcard scatter bonuses, up to 150x payout rewards!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('game-slots' as any)}
                    className="w-full text-center py-2.5 bg-gradient-to-r from-gold to-gold-dark text-black font-sans font-black text-xs rounded-xl shadow-md uppercase tracking-wider cursor-pointer mt-6 hover:opacity-95"
                  >
                    Launch Fullscreen Game
                  </button>
                </div>

                {/* Launch Card 2: Emoji Scatter */}
                <div className="bg-[#111111] rounded-2xl border border-amber-500/20 p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all group hover:-translate-y-1 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-4xl">🟡</span>
                      <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase bg-red-650/15 text-red-405 border border-red-500/30 px-2 py-0.5 rounded text-right">
                        Min Bet ₱0.50
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-serif font-black text-white group-hover:text-red-400 transition-colors">
                        EMOJI SCATTER SPECIAL
                      </h4>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1.5 font-normal">
                        Brand new emoji scatter action under ₱0.50 floor limit. Trigger 10 free spins with 3 golden circles!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('game-emojiscatter' as any)}
                    className="w-full text-center py-2.5 bg-gradient-to-r from-red-600 to-amber-500 text-white font-sans font-black text-xs rounded-xl shadow-md uppercase tracking-wider cursor-pointer mt-6 hover:opacity-95"
                  >
                    Launch Fullscreen Game
                  </button>
                </div>

                {/* Launch Card 3: Blackjack */}
                <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-all group hover:-translate-y-1 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-4xl">♠️</span>
                      <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-right">
                        Vegas Rules
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-serif font-black text-white group-hover:text-slate-350 transition-colors">
                        VEGAS BLACKJACK CLUB
                      </h4>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1.5 font-normal">
                        Test card skills against dealing hands. Play split bets or double downs to multiply chips!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('game-blackjack' as any)}
                    className="w-full text-center py-2.5 bg-[#1C1C1C] hover:bg-white/5 border border-white/15 text-white font-sans font-black text-xs rounded-xl shadow-md uppercase tracking-wider cursor-pointer mt-6 hover:opacity-95"
                  >
                    Launch Fullscreen Game
                  </button>
                </div>

              </div>

              {/* Latest bets stream block */}
              <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-serif font-bold text-gold uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-gold animate-spin" /> My Personal Platform Bets Feed
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Personal Wager History Only</span>
                </div>
                
                <div className="overflow-x-auto">
                  {slotLogs.filter(log => log.userId === mainUser.id).length === 0 && blackjackLogs.filter(log => log.userId === mainUser.id).length === 0 ? (
                    <span className="text-xs text-slate-500 italic block py-4 text-center">No platform wagers registered under your current session yet. Launch a game and place a wager to fill your live ledger!</span>
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
                        {slotLogs
                          .filter(log => log.userId === mainUser.id)
                          .map((log) => (
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
                        {blackjackLogs
                          .filter(log => log.userId === mainUser.id)
                          .map((log) => (
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
              deposits={deposits.filter(d => d.userId === mainUser.id)}
              withdrawals={withdrawals.filter(w => w.userId === mainUser.id)}
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
              currentUserId={currentUserRole === 'admin' ? 'admin-id' : mainUser.id}
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

          {/* Dedicated Fullscreen Game Screen: slots */}
          {!checkIsSelfExcluded() && currentView === 'game-slots' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Back to lobby navigational row */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-[#111111] border border-gold/25 p-4 rounded-xl gap-4">
                <button
                  onClick={() => setCurrentView('lobby')}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-serif font-bold text-xs rounded-lg transition-transform hover:scale-[1.01] cursor-pointer flex items-center gap-2 border border-white/10"
                >
                  ← BACK TO LOBBY
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">My Balance:</span>
                  <span className="text-sm font-mono font-black text-gold">₱{mainWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <button
                    onClick={() => setCurrentView('profile')}
                    className="px-2.5 py-1 bg-gold hover:opacity-90 text-black font-sans font-black text-[10px] rounded uppercase"
                  >
                    + TOP UP
                  </button>
                </div>
              </div>

              {/* Game Layout */}
              <div id="slots-terminal" className="flex justify-center items-center py-4">
                <div className="w-full max-w-md">
                  <SlotsGame
                    balance={mainWallet.balance}
                    grandLuckyPot={mainWallet.grandLuckyPot ?? 120000.00}
                    symbols={slotsSymbols}
                    winChanceModifier={winChanceModifier}
                    safeProfitLock={safeProfitLock}
                    onUpdateBalance={(amount, action, detail) => handleUpdateWalletBalance(mainUser.id, amount, action, detail)}
                    onLogGame={logSlotsWagerOutcome}
                    onUpdateLuckyPot={(amount) => handleUpdateUserWalletPot(mainUser.id, amount)}
                    onRedirectToTopup={() => setCurrentView('profile')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dedicated Fullscreen Game Screen: Emojiscatter */}
          {!checkIsSelfExcluded() && currentView === 'game-emojiscatter' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Back to lobby navigational row */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-[#111111] border border-amber-500/20 p-4 rounded-xl gap-4">
                <button
                  onClick={() => setCurrentView('lobby')}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-serif font-bold text-xs rounded-lg transition-transform hover:scale-[1.01] cursor-pointer flex items-center gap-2 border border-white/10"
                >
                  ← BACK TO LOBBY
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">My Balance:</span>
                  <span className="text-sm font-mono font-black text-amber-500">₱{mainWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <button
                    onClick={() => setCurrentView('profile')}
                    className="px-2.5 py-1 bg-amber-500 hover:opacity-90 text-black font-sans font-black text-[10px] rounded uppercase"
                  >
                    + TOP UP
                  </button>
                </div>
              </div>

              {/* Game Layout */}
              <div id="emoji-scatter-widget" className="flex justify-center items-center py-2">
                <div className="w-full max-w-lg">
                  <EmojiScatterGame
                    balance={mainWallet.balance}
                    grandLuckyPot={mainWallet.grandLuckyPot ?? 120000.00}
                    winChanceModifier={winChanceModifier}
                    safeProfitLock={safeProfitLock}
                    onUpdateBalance={(amount, action, detail) => handleUpdateWalletBalance(mainUser.id, amount, action, detail)}
                    onLogGame={logEmojiScatterWagerOutcome}
                    onUpdateLuckyPot={(amount) => handleUpdateUserWalletPot(mainUser.id, amount)}
                    onRedirectToTopup={() => setCurrentView('profile')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dedicated Fullscreen Game Screen: Blackjack */}
          {!checkIsSelfExcluded() && currentView === 'game-blackjack' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Back to lobby navigational row */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-[#111111] border border-white/10 p-4 rounded-xl gap-4">
                <button
                  onClick={() => setCurrentView('lobby')}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-serif font-bold text-xs rounded-lg transition-transform hover:scale-[1.01] cursor-pointer flex items-center gap-2 border border-white/10"
                >
                  ← BACK TO LOBBY
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">My Balance:</span>
                  <span className="text-sm font-mono font-black text-white">₱{mainWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <button
                    onClick={() => setCurrentView('profile')}
                    className="px-2.5 py-1 bg-white hover:bg-white/90 text-black font-sans font-black text-[10px] rounded uppercase"
                  >
                    + TOP UP
                  </button>
                </div>
              </div>

              {/* Game Layout */}
              <div id="blackjack-terminal" className="flex justify-center items-center py-4">
                <div className="w-full max-w-md">
                  <BlackjackGame
                    balance={mainWallet.balance}
                    onUpdateBalance={(amount, action, detail) => handleUpdateWalletBalance(mainUser.id, amount, action, detail)}
                    onLogGame={logBlackjackWagerOutcome}
                    onRedirectToTopup={() => setCurrentView('profile')}
                  />
                </div>
              </div>
            </div>
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
              slotsSymbols={slotsSymbols}
              onUpdateSlotsSymbols={setSlotsSymbols}
              winChanceModifier={winChanceModifier}
              onSetWinChanceModifier={setWinChanceModifier}
              safeProfitLock={safeProfitLock}
              onSetSafeProfitLock={setSafeProfitLock}
              onUpdateUserWalletPot={handleUpdateUserWalletPot}
              onUpdateUserWalletBalance={handleUpdateUserWalletBalanceOverride}
              onAddBettor={handleAddBettor}
              onDeleteBettor={handleDeleteBettor}
            />
          )}
        </main>
      </div>
    </div>
  );
}
