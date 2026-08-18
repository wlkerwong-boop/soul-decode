/**
 * 人类图计算 API — 本地引擎直接计算（v6.6）
 *
 * 历史：原实现转发到 bell.aisoulcode.cn/api/human-design（report-api），
 * 该路由被移除后公网 404（双轨漂移事故同型）。
 * 改为与 master-report 同款本地引擎（src/lib/hd.ts → hd-engine-v6.cjs），
 * 响应保持 { success, bodygraph } 契约，经纬度经 cities 解析、未知地点北京兜底。
 */
import { NextRequest } from 'next/server';
import { assertHumanDesignResult, calculateBodygraph } from '@/lib/hd';
import { getBirthCoords } from '@/data/cities';

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

    const hour = parseInt(body.hour) || 12;
    const minute = parseInt(body.minute) || 0;
    const timezone = body.timezone || 'Asia/Shanghai';
    // location 可为"省份/城市"文本，解析不到坐标时兜底北京（与排盘页表单一致）
    const { lat, lon } = getBirthCoords(body.location);

    const ds = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const ts = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    const bodygraph = await calculateBodygraph(ds, ts, timezone, lat, lon);
    assertHumanDesignResult(bodygraph);

    return new Response(JSON.stringify({ success: true, bodygraph }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('HD API 本地计算失败:', error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || '生成失败' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
