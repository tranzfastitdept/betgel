/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet, Deposit, Withdrawal, GCashDetails } from '../types';
import { CreditCard, ArrowDownRight, ArrowUpRight, DollarSign, RefreshCw, Check, Clock, AlertCircle } from 'lucide-react';

interface ProfilePanelProps {
  wallet: Wallet;
  gcash: GCashDetails;
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  onSaveGCash: (details: GCashDetails) => void;
  onRequestDeposit: (amount: number, receiptUrl: string) => void;
  onRequestWithdrawal: (amount: number) => void;
}

export default function ProfilePanel({
  wallet,
  gcash,
  deposits,
  withdrawals,
  onSaveGCash,
  onRequestDeposit,
  onRequestWithdrawal
}: ProfilePanelProps) {
  // GCash Inputs
  const [gcashName, setGcashName] = useState(gcash.accountName);
  const [gcashNumber, setGcashNumber] = useState(gcash.accountNumber);
  const [isSavedGcash, setIsSavedGcash] = useState(false);

  // Financial Triggers Inputs
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [receiptUrl, setReceiptUrl] = useState('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=300');
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(100);

  const handleSaveGCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gcashName.trim() || !gcashNumber.trim()) {
      alert("Please fill GCash account name and number.");
      return;
    }
    onSaveGCash({
      accountName: gcashName.trim(),
      accountNumber: gcashNumber.trim()
    });
    setIsSavedGcash(true);
    setTimeout(() => setIsSavedGcash(false), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount < 20 || depositAmount > 1000) {
      alert("GCash deposits must strictly range between PHP 20 and PHP 1,000.");
      return;
    }
    if (!receiptUrl.trim()) {
      alert("Please designate a mock receipt screenshot URL.");
      return;
    }
    onRequestDeposit(depositAmount, receiptUrl.trim());
    alert(`Success! Manual GCash Deposit of PHP ${depositAmount} submitted to Back Office for review.`);
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gcash.accountName || !gcash.accountNumber) {
      alert("Please save your GCash profile credentials before claiming a manual payout.");
      return;
    }
    if (withdrawalAmount < 10 || withdrawalAmount > 5000) {
      alert("Manual withdrawals are capped at PHP 5,000 maximum per transaction.");
      return;
    }
    if (wallet.balance < withdrawalAmount) {
      alert("Insufficient available balance for this payout magnitude.");
      return;
    }
    onRequestWithdrawal(withdrawalAmount);
    alert(`Success! Withdrawal request of PHP ${withdrawalAmount} logged pending Admin checkout.`);
  };

  const selectSuggestedDeposit = (amount: number) => {
    setDepositAmount(amount);
  };

  const selectSuggestedWithdraw = (amount: number) => {
    setWithdrawalAmount(amount);
  };

  return (
    <div className="space-y-6" id="profiles-financial-center">
      {/* Prime Wallet Dashboard Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance Box */}
        <div className="bg-gradient-to-br from-gold to-gold-dark p-5 rounded-2xl text-black shadow-gold relative overflow-hidden border border-white/10">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-15">
            <DollarSign className="w-24 h-24 text-black" />
          </div>
          <span className="text-[10px] uppercase font-sans font-black tracking-wider opacity-80 block">
            Available PHP Balance
          </span>
          <span className="text-3xl font-sans font-black block tracking-tight my-1">
            ₱{wallet.balance.toFixed(2)}
          </span>
          <span className="text-[10px] bg-black/15 px-2 py-0.5 rounded-full inline-block font-mono tracking-widest text-black font-bold mt-2">
            PHP LIQUID CASH
          </span>
        </div>

        {/* Transaction In Flight state */}
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Pending Operations:</span>
            <div className="space-y-1 mt-1.5">
              <span className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                <ArrowDownRight className="w-3.5 h-3.5 text-gold" />
                Deposit: ₱{wallet.pendingDeposit.toFixed(2)}
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                Withdrawal: ₱{wallet.pendingWithdrawal.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="p-3 bg-black/40 rounded-full border border-white/5">
            <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        </div>

        {/* History Totals Box */}
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 font-mono space-y-1 text-xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Fulfillment Volumes:</span>
          <span className="block text-slate-400">Total Deposited: <span className="text-slate-100">₱{wallet.totalDeposited}</span></span>
          <span className="block text-slate-400">Total Cashed Out: <span className="text-slate-100">₱{wallet.totalWithdrawn}</span></span>
        </div>

        {/* Profit and Loss Ledger */}
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 font-mono flex flex-col justify-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Lifetime Profit/Loss:</span>
          <span className={`text-xl font-bold font-sans ${wallet.lifetimeProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {wallet.lifetimeProfitLoss >= 0 ? '+' : ''}₱{wallet.lifetimeProfitLoss.toFixed(2)}
          </span>
          <span className="text-[9px] text-slate-500">Gross gaming history aggregates</span>
        </div>
      </div>

      {/* Primary Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: GCash account details setup */}
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-sans font-bold text-gold uppercase tracking-widest flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-gold" /> Save My GCash Account
          </h3>
          <p className="text-[11px] text-slate-400 leading-normal">
            To claim manual payout, persist your GCash credentials. This acts as the destination wallet address for back office fulfillments.
          </p>

          <form onSubmit={handleSaveGCashSubmit} className="space-y-3.5" id="gcash-save-form">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">GCash Account Name:</label>
              <input
                type="text"
                value={gcashName}
                onChange={(e) => setGcashName(e.target.value)}
                placeholder="e.g. JUAN DELA CRUZ"
                className="w-full bg-black border border-white/10 rounded p-2 text-xs text-slate-205 focus:outline-none focus:border-gold"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">GCash Phone Number:</label>
              <input
                type="text"
                value={gcashNumber}
                onChange={(e) => setGcashNumber(e.target.value)}
                placeholder="e.g. 09171234567"
                className="w-full bg-black border border-white/10 rounded p-2 text-xs text-slate-205 font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-gold to-gold-dark text-black font-sans font-extrabold text-xs rounded-xl shadow-gold-sm hover:opacity-90 transition cursor-pointer"
            >
              {isSavedGcash ? '✓ SAVED CORRECTLY' : 'SAVE CASH-OUT DATA'}
            </button>
          </form>

          {/* Warning notice */}
          {(!gcash.accountName || !gcash.accountNumber) && (
            <div className="bg-red-950/20 rounded p-3 border border-red-500/10 flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-200 leading-normal font-mono font-bold">
                WARNING: Withdrawal commands remain disabled until GCash parameters are committed.
              </p>
            </div>
          )}
        </div>

        {/* Column 2: Manual GCash deposits trigger */}
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-sans font-bold text-gold uppercase tracking-widest flex items-center gap-1.5">
            <ArrowDownRight className="w-4 h-4 text-gold" /> Manual GCash Deposit
          </h3>
          <p className="text-[11px] text-slate-400 leading-normal">
            Rules: PHP 20 Min - PHP 1000 Max. Submit payment to the admin's number, paste your screenshot reference here.
          </p>

          <form onSubmit={handleDepositSubmit} className="space-y-3.5" id="deposit-request-form">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Deposit Magnitude (PHP):</label>
              <input
                type="number"
                min={20}
                max={1000}
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full bg-black border border-white/10 rounded p-2 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:border-gold"
                required
              />
              <div className="grid grid-cols-4 gap-1.5 mt-2 text-[9px] font-mono text-slate-300">
                {[50, 100, 500, 1000].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => selectSuggestedDeposit(val)}
                    className="p-1 bg-black rounded border border-white/10 hover:border-gold/30 hover:text-gold text-center cursor-pointer font-bold"
                  >
                    ₱{val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Mock Receipt Screenshot Link:</label>
              <input
                type="url"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                className="w-full bg-black border border-white/10 rounded p-2 text-[10px] text-slate-300 font-mono focus:outline-none focus:border-gold"
                required
              />
              <span className="block text-[9px] text-slate-500 font-mono mt-1">Prefilled with live dummy invoice.</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-gold to-gold-dark text-black font-sans font-extrabold text-xs rounded-xl shadow-gold-sm hover:opacity-90 transition cursor-pointer"
            >
              TRANSMIT PAYMENT PROOF
            </button>
          </form>
        </div>

        {/* Column 3: Withdrawal claim requests */}
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-sans font-bold text-gold uppercase tracking-widest flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-gold" /> Request Withdrawal
          </h3>
          <p className="text-[11px] text-slate-400 leading-normal">
            Claim PHP 10 Min - PHP 5000 Max. Verified directly into your saved GCash details.
          </p>

          <form onSubmit={handleWithdrawalSubmit} className="space-y-3.5" id="withdrawal-request-form">
            <div className="bg-black/40 p-3 rounded border border-white/5 text-[10px] text-slate-300 font-mono space-y-1">
              <span>Saved Payee: <strong className="text-gold">{gcash.accountName || 'Not Set'}</strong></span>
              <span className="block">Payee Mob: <strong className="text-gold">{gcash.accountNumber || 'Not Set'}</strong></span>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Claim Amount (PHP):</label>
              <input
                type="number"
                min={10}
                max={5000}
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                className="w-full bg-black border border-white/10 rounded p-2 text-xs text-slate-205 font-mono font-bold focus:outline-none focus:border-gold"
                required
              />
              <div className="grid grid-cols-4 gap-1.5 mt-2 text-[9px] font-mono text-slate-300">
                {[100, 500, 1000, 5000].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => selectSuggestedWithdraw(val)}
                    className="p-1 bg-black rounded border border-white/10 hover:border-gold/30 hover:text-gold text-center cursor-pointer font-bold"
                  >
                    ₱{val}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!gcash.accountName || !gcash.accountNumber}
              className="w-full py-2.5 bg-gradient-to-r from-white via-zinc-200 to-zinc-300 text-black font-sans font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed hover:bg-white"
            >
              INITIATE PAYOUT RETRIEVAL
            </button>
          </form>
        </div>
      </div>

      {/* History listing tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Deposit history list */}
        <div className="bg-[#141414] p-4 rounded-2xl border border-white/5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-2">My Deposit Logs:</span>
          <div className="overflow-x-auto">
            {deposits.length === 0 ? (
              <span className="text-xs text-slate-500 italic block py-4 text-center">No deposit receipts transmitted yet.</span>
            ) : (
              <table className="w-full text-left text-xs font-mono text-slate-350">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 text-[10px]">
                    <th className="pb-1.5">Date</th>
                    <th className="pb-1.5">Value</th>
                    <th className="pb-1.5 text-right">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {deposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-white/5">
                      <td className="py-2 text-[10px]">{new Date(dep.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 font-bold text-slate-200 font-sans">₱{dep.amount}</td>
                      <td className="py-2 text-right">
                        <span className={`inline-block px-2 py-0.5 text-[8.5px] rounded uppercase font-bold ${dep.status === 'Approved' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' : (dep.status === 'Rejected' ? 'bg-red-950/40 text-red-500 border border-red-550/10' : 'bg-gold/10 text-gold border border-gold/20')}`}>
                          {dep.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Withdrawal payout logs */}
        <div className="bg-[#141414] p-4 rounded-2xl border border-white/5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-2">My Cash-Out Logs:</span>
          <div className="overflow-x-auto">
            {withdrawals.length === 0 ? (
              <span className="text-xs text-slate-500 italic block py-4 text-center">No withdraw log requests recorded.</span>
            ) : (
              <table className="w-full text-left text-xs font-mono text-slate-350">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 text-[10px]">
                    <th className="pb-1.5">Date</th>
                    <th className="pb-1.5">Value</th>
                    <th className="pb-1.5 text-right">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawals.map((wit) => (
                    <tr key={wit.id} className="hover:bg-white/5">
                      <td className="py-2 text-[10px]">{new Date(wit.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 font-bold text-slate-200 font-sans">₱{wit.amount}</td>
                      <td className="py-2 text-right">
                        <span className={`inline-block px-2 py-0.5 text-[8.5px] rounded uppercase font-bold ${wit.status === 'Completed' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' : (wit.status === 'Rejected' ? 'bg-red-950/40 text-red-500 border border-red-550/10' : 'bg-gold/10 text-gold border border-gold/20')}`}>
                          {wit.status}
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
    </div>
  );
}
