/**
 * 分享裂变系统 — 分享报告得免费次数
 */

const SHARE_KEY = 'soul_decode_shares';
const REFERRAL_KEY = 'soul_decode_referrals';

interface ShareRecord {
  code: string;
  phone: string;
  createdAt: string;
  usedCount: number;
  rewardsClaimed: number;
}

interface ReferralRecord {
  code: string;
  referredBy: string;
  claimed: boolean;
  claimedAt: string | null;
}

/**
 * 生成分享码
 */
export function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SOUL-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * 为用户创建分享记录
 */
export function createShareRecord(phone: string): string {
  if (typeof window === 'undefined') return '';
  const code = generateShareCode();
  const shares: ShareRecord[] = JSON.parse(localStorage.getItem(SHARE_KEY) || '[]');
  shares.push({
    code,
    phone,
    createdAt: new Date().toISOString(),
    usedCount: 0,
    rewardsClaimed: 0,
  });
  localStorage.setItem(SHARE_KEY, JSON.stringify(shares));
  return code;
}

/**
 * 获取用户的分享码
 */
export function getMyShareCode(phone: string): string | null {
  if (typeof window === 'undefined') return null;
  const shares: ShareRecord[] = JSON.parse(localStorage.getItem(SHARE_KEY) || '[]');
  const mine = shares.find(s => s.phone === phone);
  return mine?.code || null;
}

/**
 * 使用分享码（被分享者调用）
 */
export function useReferralCode(code: string, myPhone: string): { ok: boolean; message: string } {
  if (typeof window === 'undefined') return { ok: false, message: '浏览器不支持' };

  const shares: ShareRecord[] = JSON.parse(localStorage.getItem(SHARE_KEY) || '[]');
  const share = shares.find(s => s.code === code.toUpperCase());

  if (!share) return { ok: false, message: '分享码无效' };
  if (share.phone === myPhone) return { ok: false, message: '不能使用自己的分享码' };

  // Check if already used this code
  const referrals: ReferralRecord[] = JSON.parse(localStorage.getItem(REFERRAL_KEY) || '[]');
  if (referrals.some(r => r.code === code && r.claimed)) {
    return { ok: false, message: '该分享码已被使用过' };
  }

  // Record the referral
  referrals.push({
    code,
    referredBy: share.phone,
    claimed: true,
    claimedAt: new Date().toISOString(),
  });
  localStorage.setItem(REFERRAL_KEY, JSON.stringify(referrals));

  // Give the new user 1 free follow-up
  incrementFreeFollowUps(3);

  // Update share owner's count
  share.usedCount += 1;
  share.rewardsClaimed += 1;
  localStorage.setItem(SHARE_KEY, JSON.stringify(shares));

  return { ok: true, message: '🎉 成功获得3次免费追问！' };
}

function incrementFreeFollowUps(extra: number) {
  try {
    const key = 'soul_decode_followup_extra';
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(current + extra));
  } catch { /* ignore */ }
}

/**
 * 获取额外追问次数
 */
export function getExtraFollowUps(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem('soul_decode_followup_extra') || '0', 10);
  } catch { return 0; }
}

/**
 * 获取分享统计数据
 */
export function getShareStats(phone: string): { code: string | null; usedCount: number; rewardsClaimed: number } {
  const code = getMyShareCode(phone);
  const shares: ShareRecord[] = JSON.parse(localStorage.getItem(SHARE_KEY) || '[]');
  const mine = shares.find(s => s.phone === phone);
  return {
    code,
    usedCount: mine?.usedCount || 0,
    rewardsClaimed: mine?.rewardsClaimed || 0,
  };
}
