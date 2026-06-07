/**
 * 免费码验证 API
 *
 * POST /api/verify-code
 * Body: { code: string }
 * Response: { valid: boolean, message: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { validateCode, markCodeUsed } from '@/data/free-codes';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, friendName } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: '请输入免费码' }, { status: 400 });
    }

    const result = validateCode(code);

    if (result.valid) {
      // 标记为已使用
      markCodeUsed(code, friendName);
      return NextResponse.json({ valid: true, message: '🎉 免费码验证通过，已解锁全部内容！' });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('验证免费码失败:', error);
    return NextResponse.json({ valid: false, message: '验证服务异常' }, { status: 500 });
  }
}
