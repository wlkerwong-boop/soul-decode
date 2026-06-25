'use client';

/**
 * Report access control for free/premium gating
 */

const PAID_REPORT_KEY = 'soul_decode_paid_reports';

export interface PaidReport {
  id: string;
  type: 'bazi' | 'health' | 'compatibility';
  phone: string;
  paidAt: string;
  amount: number;
}

export function isReportPaid(reportId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const paid: PaidReport[] = JSON.parse(localStorage.getItem(PAID_REPORT_KEY) || '[]');
    return paid.some(r => r.id === reportId);
  } catch { return false; }
}

export function markReportPaid(reportId: string, type: PaidReport['type']): void {
  if (typeof window === 'undefined') return;
  try {
    const user = JSON.parse(localStorage.getItem('soul_decode_user') || '{}');
    const paid: PaidReport[] = JSON.parse(localStorage.getItem(PAID_REPORT_KEY) || '[]');
    paid.push({
      id: reportId,
      type,
      phone: user.phone || '',
      paidAt: new Date().toISOString(),
      amount: 9.9,
    });
    localStorage.setItem(PAID_REPORT_KEY, JSON.stringify(paid));
  } catch { /* ignore */ }
}

export function isUserPremium(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const membership = localStorage.getItem('soul_decode_membership');
    if (!membership) return false;
    const mem = JSON.parse(membership);
    return mem.active && new Date(mem.expiresAt) > new Date();
  } catch { return false; }
}

export function getFreeFollowUpsUsed(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const key = 'soul_decode_followup_count';
    const today = new Date().toDateString();
    const stored = localStorage.getItem(key);
    if (!stored) return 0;
    const data = JSON.parse(stored);
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch { return 0; }
}

export function incrementFreeFollowUps(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const key = 'soul_decode_followup_count';
    const today = new Date().toDateString();
    const stored = localStorage.getItem(key);
    let count = 0;
    if (stored) {
      const data = JSON.parse(stored);
      count = data.date === today ? (data.count || 0) : 0;
    }
    count++;
    localStorage.setItem(key, JSON.stringify({ date: today, count }));
    return count;
  } catch { return 0; }
}
