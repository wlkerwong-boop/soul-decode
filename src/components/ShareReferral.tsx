'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { getMyShareCode, createShareRecord, getShareStats, useReferralCode, getExtraFollowUps } from '@/lib/referral';

export default function ShareReferral() {
  const { user } = useAuth();
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [stats, setStats] = useState<{ code: string | null; usedCount: number; rewardsClaimed: number }>({ code: null, usedCount: 0, rewardsClaimed: 0 });
  const [referralInput, setReferralInput] = useState('');
  const [referralResult, setReferralResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [extra, setExtra] = useState(0);

  useEffect(() => {
    if (!user) return;
    const extraTokens = getExtraFollowUps();
    setExtra(extraTokens);
    const existingCode = getMyShareCode(user.phone);
    if (existingCode) {
      setShareCode(existingCode);
      setStats(getShareStats(user.phone));
    }
  }, [user]);

  const handleGenerateCode = () => {
    if (!user) return;
    const code = createShareRecord(user.phone);
    setShareCode(code);
    setStats(getShareStats(user.phone));
  };

  const handleCopy = async () => {
    if (!shareCode) return;
    try {
      await navigator.clipboard.writeText(
        `🔮 我刚刚在灵魂解码做了人生解读！\n输入我的分享码「${shareCode}」可额外获得3次AI追问机会\n👉 https://soul-decode.vercel.app`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleRedeem = () => {
    if (!user || !referralInput.trim()) return;
    const result = useReferralCode(referralInput.trim(), user.phone);
    setReferralResult(result);
    if (result.ok) {
      setExtra(getExtraFollowUps());
      setStats(getShareStats(user.phone));
    }
  };

  if (!user) return null;

  return (
    <div className="card-jade overflow-hidden" style={{ background: 'var(--bg-card)' }}>
      <div className="px-5 py-4 border-b border-[var(--border-color)]">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span>🎁</span> 邀请好友 · 得免费追问
        </h3>
      </div>
      <div className="px-5 py-4 space-y-4">
        {extra > 0 && (
          <div className="px-3 py-2 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-accent)] text-sm text-[var(--text-accent)] text-center">
            🎉 额外追问次数：{extra}
          </div>
        )}

        {/* Share section */}
        {shareCode ? (
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-2">你的分享码：</p>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-accent)] text-center font-mono font-bold text-lg tracking-widest text-[var(--text-primary)]">
                {shareCode}
              </div>
              <button onClick={handleCopy} className="px-4 py-2.5 rounded-lg bg-[var(--text-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                {copied ? '✅' : '复制'}
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 text-center opacity-70">
              分享给好友，TA输入此码各得3次追问
            </p>
          </div>
        ) : (
          <button onClick={handleGenerateCode} className="btn-jade text-sm py-2.5">
            🎁 生成我的分享码
          </button>
        )}

        <div className="border-t border-[var(--border-color)] pt-4">
          {/* Redeem section */}
          <p className="text-xs text-[var(--text-secondary)] mb-2">朋友给的分享码：</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralInput}
              onChange={e => { setReferralInput(e.target.value.toUpperCase()); setReferralResult(null); }}
              placeholder="输入SOUL-XXXX"
              className="input-jade flex-1 text-sm text-center font-mono tracking-wider"
              maxLength={10}
            />
            <button
              onClick={handleRedeem}
              disabled={referralInput.length < 9}
              className="px-4 py-2 rounded-lg bg-[var(--text-accent)] text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              兑换
            </button>
          </div>
          {referralResult && (
            <p className={`text-xs mt-1 text-center ${referralResult.ok ? 'text-[var(--text-accent)]' : 'text-red-500'}`}>
              {referralResult.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
