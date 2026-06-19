/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Wallet {
  userId: string;
  currency: 'PHP';
  balance: number;
  pendingDeposit: number;
  pendingWithdrawal: number;
  totalDeposited: number;
  totalWithdrawn: number;
  lifetimeProfitLoss: number;
  grandLuckyPot?: number;
}

export interface GCashDetails {
  accountName: string;
  accountNumber: string;
}

export interface Match {
  id: string;
  sport: 'Basketball' | 'Soccer' | 'MGM Lottery' | 'Tennis' | 'Rugby' | 'Esports';
  league: string;
  teamA: string;
  teamB: string;
  startDate: string;
  startTime: string;
  oddsA: number;
  oddsB: number;
  oddsDraw: number;
  status: 'Open' | 'Won_A' | 'Won_B' | 'Draw' | 'Void' | 'Settled';
  createdAt: string;
}

export interface Bet {
  id: string;
  userId: string;
  username: string;
  matchId: string;
  sport: string;
  teamA: string;
  teamB: string;
  prediction: 'A' | 'B' | 'Draw';
  stake: number;
  odds: number;
  potentialPayout: number;
  status: 'Open' | 'Won' | 'Lost' | 'Void' | 'Settled';
  createdAt: string;
  settledAt?: string;
}

export interface Deposit {
  id: string;
  userId: string;
  username: string;
  amount: number;
  referenceNumber: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  adminNotes?: string;
  reviewedAt?: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  amount: number;
  gcashName: string;
  gcashNumber: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Rejected';
  createdAt: string;
  adminNotes?: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'user';
  message: string;
  attachedUrl?: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  userId: string;
  username: string;
  status: 'open' | 'closed';
  assignedStaffId?: string;
  lastMessageAt: string;
  unreadCountAdmin: number;
  unreadCountUser: number;
}

export interface SlotLog {
  id: string;
  userId: string;
  username: string;
  betAmount: number;
  winAmount: number;
  reels: string[];
  createdAt: string;
}

export interface BlackjackHand {
  cards: string[];
  score: number;
}

export interface BlackjackLog {
  id: string;
  userId: string;
  username: string;
  betAmount: number;
  winAmount: number;
  playerHand: string[];
  dealerHand: string[];
  status: 'Won' | 'Lost' | 'Push' | 'Blackjack';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'deposit_approved' | 'deposit_rejected' | 'withdrawal_approved' | 'withdrawal_rejected' | 'withdrawal_completed' | 'bet_won' | 'bet_lost' | 'announcement';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  createdAt: string;
}
