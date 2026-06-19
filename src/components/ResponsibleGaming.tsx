/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, CheckSquare, Clock, HeartHandshake, FileText, HelpCircle, Lock } from 'lucide-react';

interface ResponsibleGamingProps {
  onSelfExclude: (hours: number) => void;
  isSelfExcluded: boolean;
  exclusionTimeLeft: number; // in milliseconds
  currentUserEmail?: string;
}

export default function ResponsibleGaming({ onSelfExclude, isSelfExcluded, exclusionTimeLeft, currentUserEmail }: ResponsibleGamingProps) {
  const [agreeAge, setAgreeAge] = useState(false);
  const [selfExcludePeriod, setSelfExcludePeriod] = useState<number>(24);
  const [activeTab, setActiveTab] = useState<'tips' | 'terms' | 'privacy' | 'help'>('tips');

  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return '0 seconds';
    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="bg-[#141414] text-[#F5F5F5] p-6 rounded-2xl border border-gold/20 shadow-2xl max-w-5xl mx-auto space-y-6" id="responsible-gaming">
      <div className="border-b border-white/5 pb-4 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <ShieldAlert className="w-8 h-8 text-gold animate-pulse" />
          <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gold to-gold-dark">
            RESPONSIBLE GAMING & COMPLIANCE
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          We promote safe, fun, and reliable betting as a premium entertainment service. PHP Currencies only.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alerts & Self Exclusion */}
        <div className="lg:col-span-1 space-y-6">
          {/* Warning Card */}
          <div className="bg-gold/5 p-5 rounded-xl border border-gold/20 space-y-3">
            <h3 className="text-gold font-sans font-bold text-lg flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-gold" />
              Legal Advisory
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Betting is strictly forbidden under the age of 21. By placing real-money PHP stakes on our sportsbook, slots, or blackjack terminals, you verify execution of safe funds and confirm legal verification.
            </p>
            <div className="bg-black/55 p-3 rounded border border-gold/15 flex items-start gap-2">
              <input
                id="age-confirm"
                type="checkbox"
                checked={agreeAge}
                onChange={(e) => setAgreeAge(e.target.checked)}
                className="mt-1 accent-gold rounded cursor-pointer"
              />
              <label htmlFor="age-confirm" className="text-[11px] text-slate-300 leading-snug cursor-pointer select-none">
                I confirm that I am 21 years of age or older and agree to hold myself responsible for financial limits.
              </label>
            </div>
          </div>

          {/* Self-Exclusion Tool */}
          <div className="bg-charcoal p-5 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-slate-100 font-sans font-bold text-md flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold" />
              Self-Exclusion Lockout
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Need a break? Configure an account exclusion period. This blocks slot machines, blackjack cards, and sportsbook slips instantly. <strong>This action is persistent and irreversible.</strong>
            </p>

            {isSelfExcluded ? (
              <div className="bg-red-950/40 p-4 rounded-lg border border-red-500/20 text-center space-y-2">
                <Lock className="w-8 h-8 text-red-500 mx-auto animate-bounce" />
                <span className="block text-red-400 text-sm font-bold">Lockout Period Active</span>
                <span className="block text-xs text-slate-300">Time remaining:</span>
                <span className="block font-mono text-lg text-red-400 font-bold tracking-widest">{formatTimeLeft(exclusionTimeLeft)}</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-mono">Exclusion Duration:</label>
                  <select
                    value={selfExcludePeriod}
                    onChange={(e) => setSelfExcludePeriod(Number(e.target.value))}
                    className="w-full bg-black border border-white/15 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-gold font-mono"
                  >
                    <option value={1}>1 Minute Break (Test/Demo)</option>
                    <option value={24}>24 Hours Lockout</option>
                    <option value={72}>72 Hours Lockout</option>
                    <option value={168}>7 Days (1 Week) Exclusion</option>
                    <option value={720}>30 Days Custom Timeout</option>
                  </select>
                </div>
                <button
                  onClick={() => onSelfExclude(selfExcludePeriod)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-sans font-bold py-2 rounded text-xs transition cursor-pointer"
                >
                  Confirm Immediate Exclusion Lock
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Policies and Legal Docs tabs */}
        <div className="lg:col-span-2 bg-[#1A1A1A] p-5 rounded-xl border border-white/5 flex flex-col min-h-[350px]">
          <div className="flex border-b border-white/5 pb-2 mb-4 overflow-x-auto gap-2">
            <button
              onClick={() => setActiveTab('tips')}
              className={`px-3 py-1.5 rounded text-xs font-sans font-bold transition whitespace-nowrap cursor-pointer ${activeTab === 'tips' ? 'bg-gradient-to-r from-gold to-gold-dark text-black font-extrabold shadow-gold-sm' : 'text-slate-400 hover:text-slate-100 bg-black/40 border border-white/10'}`}
            >
              Play Safe Tips
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-3 py-1.5 rounded text-xs font-sans font-bold transition whitespace-nowrap cursor-pointer ${activeTab === 'terms' ? 'bg-gradient-to-r from-gold to-gold-dark text-black font-extrabold shadow-gold-sm' : 'text-slate-400 hover:text-slate-100 bg-black/40 border border-white/10'}`}
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1.5 rounded text-xs font-sans font-bold transition whitespace-nowrap cursor-pointer ${activeTab === 'privacy' ? 'bg-gradient-to-r from-gold to-gold-dark text-black font-extrabold shadow-gold-sm' : 'text-slate-400 hover:text-slate-100 bg-black/40 border border-white/10'}`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`px-3 py-1.5 rounded text-xs font-sans font-bold transition whitespace-nowrap cursor-pointer ${activeTab === 'help' ? 'bg-gradient-to-r from-gold to-gold-dark text-black font-extrabold shadow-gold-sm' : 'text-slate-400 hover:text-slate-100 bg-black/40 border border-white/10'}`}
            >
              Help Center
            </button>
          </div>

          <div className="flex-1 text-xs text-slate-350 leading-relaxed overflow-y-auto pr-1">
            {activeTab === 'tips' && (
              <div className="space-y-4">
                <h4 className="text-sm font-sans font-bold text-gold flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-gold" /> Healthy Player Habits
                </h4>
                <ul className="space-y-2 list-disc list-inside text-slate-300 pl-2">
                  <li><strong>Set Limits:</strong> Determine a fixed maximum stake amount before you play.</li>
                  <li><strong>Never Chase Losses:</strong> If you lose a blackjack deal or a slot reel layout, close the tab and play again another day.</li>
                  <li><strong>Balance Time:</strong> Do not let sports outcome speculation distract you from real-world responsibilities and relationships.</li>
                  <li><strong>Play sober:</strong> Avoid slot spin decisions when under the influence of strong emotion or substances.</li>
                </ul>
                <div className="bg-black/30 p-4 rounded-lg border border-white/5 text-[11px] text-slate-400 mt-4 leading-normal">
                  Need external counseling? Reach out with absolute confidence and confidentiality. We do not store, analyze, or process private counseling profiles. Safe, transparent sportsmanship is our absolute code of operation.
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-3">
                <h4 className="text-sm font-sans font-bold text-gold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-gold" /> User Terms Of Usage
                </h4>
                <p>
                  1. <strong>Bet Platform Services:</strong> We offer manual GCash processing. Our slot machines operate purely on secure cryptographic random-generation (RNG). Absolutely no AI models are used to manipulate, predict, or schedule symbol patterns.
                </p>
                <p>
                  2. <strong>RNG Declaration:</strong> We guarantee the integrity of our software. Every slot machine cycle and standard blackjack deck shuffle is executed through independent clientside pseudo-random float generation matching high-entropy system feeds.
                </p>
                <p>
                  3. <strong>Manual Financial Operations:</strong> All deposit assets require admin validation. Max PHP 1,000 deposits and PHP 5,000 withdrawals are enforced to shield against financial risk and secure immediate merchant liquidity.
                </p>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-3">
                <h4 className="text-sm font-sans font-bold text-gold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-gold" /> Secure Data Privacy Declaration
                </h4>
                <p>
                  We guarantee absolute privacy. We do not sell or lease profile information, phone numbers, or GCash receipt transaction metadata to marketing aggregators:
                </p>
                <p>
                  • <strong>Encryption:</strong> Critical payment names, GCash credentials, and support screenshots are saved natively using high-grade standards.
                </p>
                <p>
                  • <strong>Tracking:</strong> No third-party behavioral cookies are integrated. We respect your security footprint.
                </p>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="space-y-3">
                <h4 className="text-sm font-sans font-bold text-gold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-gold" /> Support Knowledge Base
                </h4>
                <p className="font-semibold text-slate-200">Q: My GCash deposit is still pending. How long does approval take?</p>
                <p className="text-slate-400 pl-3 pb-2 border-b border-white/5">
                  A: Back Office (BO) operators process withdrawals and deposits manually via Live Chat. Usually tickets are approved or reviewed within 1 to 10 minutes.
                </p>
                <p className="font-semibold text-slate-200">Q: Are the casino odds fair?</p>
                <p className="text-slate-400 pl-3 pb-2 border-b border-white/5">
                  A: Our slot machines offer a 96.8% Return To Player (RTP) payout, which is among the highest in premium digital venues. Blackjack matches match standard Vegas 1-deck dealer soft-17 rules with deep deck random shuffles.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
