/**
 * 人类图计算 API — 终版
 * 使用 sweph 瑞士星历 + @it-healer/bodygraph 精准计算
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day } = body;
    if (!year || !month || !day) {
      return new Response(JSON.stringify({ error: '请填写完整的出生日期' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Dynamic require CJS engine
    const mod = require('../../../lib/hd-engine.cjs');
    const result = await mod.calculateHD(body);

    return new Response(JSON.stringify({ success: true, bodygraph: result }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('HD API error:', error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || '生成失败' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
