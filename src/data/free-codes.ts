/**
 * 免费名额数据
 *
 * 管理员可以在此预生成免费码，分配给好友使用
 * 格式：{ code: 'XXX-XXXX', used: boolean, friendName: string }
 */
export interface FreeCodeEntry {
  code: string;
  used: boolean;
  friendName: string;
  createdAt: string;
}

// 预生成一批免费码，管理员可在管理后台手动添加更多
export const FREE_CODES: FreeCodeEntry[] = [
  { code: 'SOUL-GIFT-001', used: false, friendName: '', createdAt: '2026-06-07' },
  { code: 'SOUL-GIFT-002', used: false, friendName: '', createdAt: '2026-06-07' },
  { code: 'SOUL-GIFT-003', used: false, friendName: '', createdAt: '2026-06-07' },
  { code: 'SOUL-GIFT-004', used: false, friendName: '', createdAt: '2026-06-07' },
  { code: 'SOUL-GIFT-005', used: false, friendName: '', createdAt: '2026-06-07' },
  { code: 'SOUL-GIFT-006', used: false, friendName: '', createdAt: '2026-06-07' },
  { code: 'SOUL-GIFT-007', used: false, friendName: '', createdAt: '2026-06-07' },
  { code: 'SOUL-GIFT-008', used: false, friendName: '', createdAt: '2026-06-07' },
  { code: 'SOUL-GIFT-009', used: false, friendName: '', createdAt: '2026-06-07' },
  { code: 'SOUL-GIFT-010', used: false, friendName: '', createdAt: '2026-06-07' },
];

/**
 * 验证免费码
 * 返回：{ valid: boolean, message: string }
 */
export function validateCode(input: string): { valid: boolean; message: string } {
  const trimmed = input.trim().toUpperCase();
  const entry = FREE_CODES.find(c => c.code === trimmed);
  if (!entry) return { valid: false, message: '无效的免费码' };
  if (entry.used) return { valid: false, message: '该免费码已被使用' };
  return { valid: true, message: '验证通过' };
}

/**
 * 标记免费码为已使用
 */
export function markCodeUsed(input: string, friendName?: string): boolean {
  const trimmed = input.trim().toUpperCase();
  const entry = FREE_CODES.find(c => c.code === trimmed);
  if (!entry || entry.used) return false;
  entry.used = true;
  if (friendName) entry.friendName = friendName;
  return true;
}
