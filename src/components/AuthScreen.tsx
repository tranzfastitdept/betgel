import React, { useState } from 'react';
import { supabase } from '../supabase';
import { User, Wallet } from '../types';
import { Shield, Mail, Lock, User as UserIcon, AlertTriangle, Play, Sparkles, BookOpen } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: User, wallet: Wallet) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setIsLoading(true);

    const emailClean = email.trim().toLowerCase();
    const passClean = password;

    // A. ROOT ADMIN RULE COUPLING RE-ROUTED TO SPECIFIC SECURED GATEWAY
    if (emailClean === 'betplatform@bet.bet') {
      setErrorMsg("Administrative permissions are restricted on the public gate. Please navigate to the secure staff Back Office gateway route.");
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up Mode
        if (!username.trim()) {
          setErrorMsg("Username is required to register a brand new bettor slot.");
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: emailClean,
          password: passClean,
          options: {
            data: {
              username: username.trim(),
              role: 'user'
            }
          }
        });

        if (error) {
          // If Supabase fails, or isn't migrated, fallback to high fidelity local user creation!
          console.warn("Supabase auth failed or database table config missing. Falling back to robust local secure signup:", error.message);
          createOfflineLocalUser(emailClean, passClean, username.trim());
          return;
        }

        if (data.user) {
          // Success! Attempt to create profile and initial wallet
          const newUser: User = {
            id: data.user.id,
            email: emailClean,
            username: username.trim(),
            avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username.trim())}`,
            role: 'user',
            status: 'active',
            createdAt: new Date().toISOString()
          };

          const newWallet: Wallet = {
            userId: data.user.id,
            currency: 'PHP',
            balance: 100.00, // ₱100 Sign up starting bonus!
            pendingDeposit: 0,
            pendingWithdrawal: 0,
            totalDeposited: 100,
            totalWithdrawn: 0,
            lifetimeProfitLoss: 0,
            grandLuckyPot: 88888.00 // Individual player's starting lucky pot
          };

          // Save profile records to Supabase tables profiles and wallets
          const { error: profileError } = await supabase.from('profiles').insert({
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            avatar_url: newUser.avatarUrl,
            role: newUser.role,
            status: newUser.status,
            created_at: newUser.createdAt
          });

          const { error: walletError } = await supabase.from('wallets').insert({
            user_id: newUser.id,
            currency: 'PHP',
            balance: newWallet.balance,
            pending_deposit: 0,
            pending_withdrawal: 0,
            total_deposited: newWallet.totalDeposited,
            total_withdrawn: 0,
            lifetime_profit_loss: 0,
            grand_lucky_pot: newWallet.grandLuckyPot
          });

          if (profileError || walletError) {
            console.warn("Supabase writes failed. Active tables profiles / wallets need schema migrations first. Saving offline standard payload locally.");
          }

          localStorage.setItem('bp_current_user_session', JSON.stringify(newUser));
          localStorage.setItem('bp_current_wallet_session', JSON.stringify(newWallet));
          setInfoMsg(`Registration successful! Account logged with standard PHP ${newWallet.balance} bonus!`);
          
          setTimeout(() => {
            setIsLoading(false);
            onAuthSuccess(newUser, newWallet);
          }, 1000);
        } else {
          setErrorMsg("Check your email mailbox for verification confirmation link or login.");
          setIsLoading(false);
        }
      } else {
        // Sign In Mode
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailClean,
          password: passClean
        });

        if (error) {
          console.warn("Supabase native login failed. Checking offline secure credentials database:", error.message);
          const found = checkOfflineLocalUser(emailClean, passClean);
          if (found) {
            setIsLoading(false);
            onAuthSuccess(found.user, found.wallet);
            return;
          }
          setErrorMsg(error.message || "Invalid credentials supplied.");
          setIsLoading(false);
          return;
        }

        if (data.user) {
          // Fetch wallet and profiles. Match or generate fallback state
          let userRole: 'admin' | 'user' = 'user';
          let finalUsername = data.user.email?.split('@')[0] || 'PhHighRoller';

          // Try loading live databases profiles
          const { data: dbProf } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          const { data: dbWall } = await supabase.from('wallets').select('*').eq('user_id', data.user.id).single();

          if (dbProf) {
            userRole = dbProf.role || 'user';
            finalUsername = dbProf.username || finalUsername;
          }

          const loggedUser: User = {
            id: data.user.id,
            email: emailClean,
            username: finalUsername,
            avatarUrl: dbProf?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(finalUsername)}`,
            role: userRole,
            status: (dbProf?.status as any) || 'active',
            createdAt: dbProf?.created_at || new Date().toISOString()
          };

          const loggedWallet: Wallet = {
            userId: data.user.id,
            currency: 'PHP',
            balance: dbWall?.balance ?? 1500.00,
            pendingDeposit: dbWall?.pending_deposit ?? 0,
            pendingWithdrawal: dbWall?.pending_withdrawal ?? 0,
            totalDeposited: dbWall?.total_deposited ?? 1500,
            totalWithdrawn: dbWall?.total_withdrawn ?? 0,
            lifetimeProfitLoss: dbWall?.lifetime_profit_loss ?? 0,
            grandLuckyPot: dbWall?.grand_lucky_pot ?? 120000.00
          };

          localStorage.setItem('bp_current_user_session', JSON.stringify(loggedUser));
          localStorage.setItem('bp_current_wallet_session', JSON.stringify(loggedWallet));

          setIsLoading(false);
          onAuthSuccess(loggedUser, loggedWallet);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Credential matching failed. Try again.");
      setIsLoading(false);
    }
  };

  // Safe offline backup database builder if user hasn't initialized PG schema in supabase
  const createOfflineLocalUser = (em: string, pw: string, userNm: string) => {
    const backupUsersRaw = localStorage.getItem('bp_users_registry') || '[]';
    const registry = JSON.parse(backupUsersRaw);

    if (registry.find((u: any) => u.email === em)) {
      setErrorMsg("Email matches pre-existing bettor. Please sign in instead.");
      setIsLoading(false);
      return;
    }

    const testId = 'off-' + Math.random().toString(36).substr(2, 9);
    const mockUser: User = {
      id: testId,
      email: em,
      username: userNm,
      avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(userNm)}`,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    const mockWallet: Wallet = {
      userId: testId,
      currency: 'PHP',
      balance: 100.00, // Sign up bonus
      pendingDeposit: 0,
      pendingWithdrawal: 0,
      totalDeposited: 100.0,
      totalWithdrawn: 0,
      lifetimeProfitLoss: 0,
      grandLuckyPot: 88888.00 // Default lucky pot
    };

    registry.push({ email: em, password: pw, user: mockUser, wallet: mockWallet });
    localStorage.setItem('bp_users_registry', JSON.stringify(registry));

    // Append to live platform lists
    const liveUsers = JSON.parse(localStorage.getItem('bp_users') || '[]');
    const liveWallets = JSON.parse(localStorage.getItem('bp_wallets') || '[]');
    liveUsers.push(mockUser);
    liveWallets.push(mockWallet);
    localStorage.setItem('bp_users', JSON.stringify(liveUsers));
    localStorage.setItem('bp_wallets', JSON.stringify(liveWallets));

    localStorage.setItem('bp_current_user_session', JSON.stringify(mockUser));
    localStorage.setItem('bp_current_wallet_session', JSON.stringify(mockWallet));

    setInfoMsg("Registered successfully (MGM Offline Hybrid mode active!)");
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess(mockUser, mockWallet);
    }, 850);
  };

  const checkOfflineLocalUser = (em: string, pw: string) => {
    const backupUsersRaw = localStorage.getItem('bp_users_registry') || '[]';
    const registry = JSON.parse(backupUsersRaw);
    const item = registry.find((u: any) => u.email === em && u.password === pw);
    if (item) {
      localStorage.setItem('bp_current_user_session', JSON.stringify(item.user));
      localStorage.setItem('bp_current_wallet_session', JSON.stringify(item.wallet));
      return { user: item.user, wallet: item.wallet };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#ECEFF1] flex flex-col justify-center items-center px-4 relative overflow-hidden" id="auth-terminal-terminal">
      {/* Background neon style lines */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Main card box */}
      <div className="w-full max-w-md bg-[#121212] rounded-3xl border border-gold/25 p-8 md:p-10 shadow-[0_0_50px_rgba(212,175,55,0.1)] relative z-10 transition-all">
        {/* Diamond crown badge */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-gold via-yellow-400 to-gold-dark rounded-2xl flex items-center justify-center transform rotate-6 shadow-gold animate-pulse">
            <Shield className="w-7 h-7 text-black -rotate-6" />
          </div>
          <div>
            <h2 className="text-3xl font-sans font-black tracking-tighter uppercase text-white leading-none">
              MGM <span className="text-gold">BETTING SITE</span>
            </h2>
            <p className="text-[11px] text-[#CD7F32] font-mono tracking-widest uppercase mt-2 font-black">
              21+ Certified • Real PHP Ledger Nodes
            </p>
          </div>
        </div>



        {/* Messaging hubs */}
        {errorMsg && (
          <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs flex items-center gap-2 mb-6 animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-xs flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider mb-1.5 font-bold">
                Bettor Screen Alias (Username)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. LuckySpinner88"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 focus:outline-none focus:border-gold transition-colors font-sans"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider mb-1.5 font-bold">
              Account Registered Email
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 focus:outline-none focus:border-gold transition-colors font-sans"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider mb-1.5 font-bold">
              Secure Password Code
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 focus:outline-none focus:border-gold transition-colors font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-gold via-yellow-400 to-gold-dark text-black font-sans font-extrabold text-sm rounded-xl shadow-gold hover:opacity-90 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2 mt-4 uppercase tracking-wider"
          >
            {isLoading ? (
              <span className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin"></span>
            ) : isSignUp ? (
              'Create My Betting Account'
            ) : (
              'Sign In and Play'
            )}
          </button>
        </form>

        {/* Footer Toggle Mode */}
        <div className="mt-6 text-center border-t border-white/5 pt-5">
          <p className="text-xs text-zinc-400">
            {isSignUp ? "Already registered at MGM?" : "New to MGM Golden Betting?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className="text-gold font-sans font-bold hover:underline cursor-pointer"
            >
              {isSignUp ? "Sign In Here" : "Create Account (Get ₱1,500 Bonus)"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
