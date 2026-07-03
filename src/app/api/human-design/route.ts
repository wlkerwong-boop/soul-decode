/**
 * 人类图计算 API — 转发到阿里云 report-api
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALIYUN_API = 'https://bell.aisoulcode.cn/api/human-design';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day } = body;
    if (!year || !month || !day) {
      return new Response(JSON.stringify({ error: '请填写完整的出生日期' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const resp = await fetch(ALIYUN_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('HD API proxy error:', error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || '生成失败' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
