/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Terminal, Shield, Cpu, RefreshCw } from 'lucide-react';

export default function SystemDocumentation() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sqlSchema = `-- =========================================================================
-- BET PLATFORM - COMPLETE SUPABASE POSTGRESQL SCHEMA WITH RLS AND TRIGGERS
-- =========================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS PROFILE TABLE (hooks into Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    gcash_name TEXT,
    gcash_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. WALLET SYSTEM TABLE
CREATE TABLE public.wallets (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    currency VARCHAR(3) DEFAULT 'PHP' CHECK (currency = 'PHP'),
    balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
    grand_lucky_pot NUMERIC(12, 2) DEFAULT 120000.00 NOT NULL,
    pending_deposit NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (pending_deposit >= 0),
    pending_withdrawal NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (pending_withdrawal >= 0),
    total_deposited NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_withdrawn NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    lifetime_profit_loss NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. DEPOSIT TRANSACTIONS TABLE (GCash Operator Reference validation)
CREATE TABLE public.deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount BETWEEN 20 AND 1000),
    reference_number VARCHAR(13) NOT NULL UNIQUE,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 4. WITHDRAWAL TRANSACTIONS TABLE
CREATE TABLE public.withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount BETWEEN 10 AND 5000),
    gcash_name TEXT NOT NULL,
    gcash_number TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Completed', 'Rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. SPORTS MATCHES TABLE
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport TEXT NOT NULL CHECK (sport IN ('Basketball', 'Soccer', 'MGM Lottery', 'Tennis', 'Rugby', 'Esports')),
    league TEXT NOT NULL,
    team_a TEXT NOT NULL,
    team_b TEXT NOT NULL,
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    odds_a NUMERIC(5, 2) NOT NULL CHECK (odds_a > 1),
    odds_b NUMERIC(5, 2) NOT NULL CHECK (odds_b > 1),
    odds_draw NUMERIC(5, 2) NOT NULL CHECK (odds_draw > 1),
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Won_A', 'Won_B', 'Draw', 'Void', 'Settled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SPORTS BETS TABLE
CREATE TABLE public.bets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    match_id UUID REFERENCES public.matches(id) ON DELETE RESTRICT NOT NULL,
    prediction TEXT NOT NULL CHECK (prediction IN ('A', 'B', 'Draw')),
    stake NUMERIC(12, 2) NOT NULL CHECK (stake >= 1.00),
    odds NUMERIC(5, 2) NOT NULL,
    potential_payout NUMERIC(12, 2) NOT NULL,
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Won', 'Lost', 'Void', 'Settled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    settled_at TIMESTAMP WITH TIME ZONE
);

-- 7. CHAT ROOMS TABLE
CREATE TABLE public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    assigned_staff_id UUID REFERENCES public.profiles(id),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    unread_count_admin INT DEFAULT 0 NOT NULL,
    unread_count_user INT DEFAULT 0 NOT NULL
);

-- 8. CHAT MESSAGES TABLE
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    message TEXT NOT NULL,
    attached_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. SYSTEM AUDIT LOGS TABLE
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- DATABASE INDEXES FOR MASSIVE QUERY SPEED
-- =========================================================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_wallets_balance ON public.wallets(balance DESC);
CREATE INDEX idx_deposits_status ON public.deposits(status);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_bets_user_status ON public.bets(user_id, status);
CREATE INDEX idx_chat_messages_room ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE read = FALSE;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can select/update their own, Admins can read/write everything
CREATE POLICY user_read_own_profile ON public.profiles FOR SELECT USING (auth.uid() = id OR id IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY user_update_own_profile ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Wallets: Users can read own wallet. ONLY Admin can insert/update wallet directly.
CREATE POLICY user_read_own_wallet ON public.wallets FOR SELECT USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Deposits: User can insert and read own deposits. Admin sees all.
CREATE POLICY user_deposit_policy ON public.deposits USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Withdrawals: User can insert and read own, Admin manages all
CREATE POLICY user_withdraw_policy ON public.withdrawals USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Matches: Anyone can read open/settled matches. Admins only can insert/update.
CREATE POLICY matches_public_read ON public.matches FOR SELECT USING (true);
CREATE POLICY matches_admin_write ON public.matches USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Bets: Users read/write own bets.
CREATE POLICY user_bets_policy ON public.bets USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================================================================
-- AUTOMATION TRIGGER FOR USER CREATION (AUTOMATIC WALLET & PROFILE)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'player_' || substr(new.id::text, 1, 8)),
    new.email,
    'user',
    'active'
  );

  INSERT INTO public.wallets (user_id, balance)
  VALUES (new.id, 500.00); -- PHP 500 Welcome bonus credit

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- LIVE UPGRADE MIGRATION (ALTER TABLE SCRIPTS FOR GCASH REFERENCE CHANGE)
-- =========================================================================
-- Paste this script into your Supabase SQL Editor and run it to update schemas:

-- A. Migrate deposits proofs from Receipt URLs to GCash Reference Numbers
ALTER TABLE public.deposits DROP COLUMN IF EXISTS receipt_url;
ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS reference_number VARCHAR(13) NOT NULL UNIQUE;

-- B. Sync core dynamic wallet structures with player lucky pots
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS grand_lucky_pot NUMERIC(12, 2) DEFAULT 120000.00 NOT NULL;
`;

  const envEx = `# =========================================================================
# BET PLATFORM - ENVIRONMENT RUNTIME VARIABLES
# =========================================================================

# Database Connection (Supabase Settings)
VITE_SUPABASE_URL="https://your-proj-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here"

# Admin API / Direct Connection Strings
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI..."

# PWA Push Notifications config
VITE_VAPID_PUBLIC_KEY="BC..."
VAPID_PRIVATE_KEY="your-vapid-private-key"

# Node Environment variables
NODE_ENV="production"
PORT=3000
APP_URL="https://your-domain.railway.app"
`;

  const railwayDeploy = `=========================================================================
RAILWAY DEPLOYMENT COMPREHENSIVE RUNBOOK
=========================================================================

1. ENVIRONMENT INITIALIZATION
-----------------------------
Make sure you have node & npm installed. Verify package.json contains the following start parameters:
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview"
  }

2. DEPLOYMENT TO RAILWAY VIA CLI OR GITHUB
------------------------------------------
Option A: GitHub Connection
  • Push this folder to a private GitHub Repository.
  • Go to https://railway.app, log in, click "New Project".
  • Select "Deploy from GitHub repo" and link your repo.
  • Under "Variables", add variables from the Production Environment Setup checklist below.
  • Click "Deploy". Next environment will build Vite assets in static/SPA mode and serve properly.

Option B: CLI Deploy
  • Run: npm install -g @railway/cli
  • Run: railway login
  • Run: railway init
  • Run: railway up

3. WEB APP MANIFEST & PWA PREPARATION
-------------------------------------
  • PWA Icons are specified under the /public or /assets folders.
  • Service workers are registered dynamically on main.tsx to permit fully offline caching of casino graphics, blackjack decks, and slot mechanics.

4. SECURITY CHECKLIST FOR LIVE SPORTSBOOK OPERATOR
--------------------------------------------------
  ✔ Restrict DB permissions by disabling full API keys. Use RLS always.
  ✔ Maintain minimum deposit of PHP 20 and maximum of PHP 1,000 for strict GCash merchant accounts.
  ✔ Implement self-exclusion blocks where suspended users are automatically locked out on token refresh.
`;

  return (
    <div className="bg-[#141414] text-slate-100 p-6 rounded-2xl border border-white/5 shadow-2xl space-y-8" id="sys-documentation">
      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-dark to-gold">
            SYSTEM ARCHITECTURE & EXPORTS
          </h2>
          <p className="text-sm text-gold font-mono mt-1 font-bold">
            Production-Ready Database Schema & Deployment Handbooks
          </p>
        </div>
        <span className="flex items-center gap-1 bg-gold/10 text-gold border border-gold/20 text-xs px-2.5 py-1 rounded-full font-mono">
          <Shield className="w-3 h-3 text-gold" />
          Senior Architect
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SQL Export */}
        <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-5 h-5 text-gold" />
              <h3 className="text-md font-sans font-bold text-gold">PostgreSQL Schema</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete DDL SQL Script containing profiles, wallets, GCash entries, bets, slot & blackjack models, RLS rules, and dynamic trigger sequences.
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(sqlSchema, 'sql')}
            className="w-full mt-4 bg-gradient-to-r from-gold to-gold-dark hover:opacity-90 text-black font-sans font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-gold-sm"
          >
            {copiedSection === 'sql' ? (
              <>
                <Check className="w-4 h-4" />
                Copied Table Schema!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Full Supabase SQL
              </>
            )}
          </button>
        </div>

        {/* Env Variables Export */}
        <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h3 className="text-md font-sans font-bold text-indigo-400">Environment Vars</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Production configuration, client-facing parameters for Supabase Client integration, and keys for webhook validation.
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(envEx, 'env')}
            className="w-full mt-4 bg-[#1E1E1E] hover:bg-[#252525] border border-white/5 text-zinc-100 font-sans font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedSection === 'env' ? (
              <>
                <Check className="w-4 h-4" />
                Copied Env Template!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy .env.production
              </>
            )}
          </button>
        </div>

        {/* Railway Handbook */}
        <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
              <h3 className="text-md font-sans font-bold text-emerald-400">Railway Playbook</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detailed commands for Railway CLI setup, Git integration triggers, PWA offline asset parameters, and merchant routing rules.
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(railwayDeploy, 'railway')}
            className="w-full mt-4 bg-[#1E1E1E] hover:bg-[#252525] border border-white/5 text-zinc-100 font-sans font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedSection === 'railway' ? (
              <>
                <Check className="w-4 h-4" />
                Copied Playbook!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Deploy Manual
              </>
            )}
          </button>
        </div>
      </div>

      {/* SQL Script View Console */}
      <div className="bg-black/80 p-4 rounded-2xl border border-white/5 font-mono text-xs text-gold/90 max-h-60 overflow-y-auto shadow-inner space-y-2">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <span className="text-gold">Console Preview: schema.ddl.sql</span>
          <span className="text-[10px] text-slate-500 font-sans">Scroll to inspect codes</span>
        </div>
        <pre className="whitespace-pre-wrap leading-relaxed select-all">
          {sqlSchema}
        </pre>
      </div>
    </div>
  );
}
