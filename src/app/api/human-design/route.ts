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
    const mod = require('../../../lib/hd-engine-v5.cjs');
    const result = mod.calculateBodygraph(
      `${String(body.year).padStart(4,'0')}-${String(body.month).padStart(2,'0')}-${String(body.day).padStart(2,'0')}`,
      `${String(body.hour || '12').padStart(2,'0')}:00`,
      'Asia/Shanghai', 39.9, 116.4
    );

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
