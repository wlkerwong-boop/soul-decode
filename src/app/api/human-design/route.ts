/**
 * 人类图计算 API（@swisseph/node 精准引擎）
 */
import { NextRequest } from 'next/server';
import { calculateHumanDesign } from '@/lib/human-design';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  '北京': { lat: 39.9042, lon: 116.4074 },
  '上海': { lat: 31.2304, lon: 121.4737 },
  '广州': { lat: 23.1292, lon: 113.2644 },
  '深圳': { lat: 22.5431, lon: 114.0579 },
};

export async function POST(request: NextRequest) {
  try {
    const { year, month, day, hour, location } = await request.json();
    if (!year || !month || !day) {
      return new Response(JSON.stringify({ error: '请填写完整的出生日期' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    let lat = 39.9042, lon = 116.4074;
    if (location) {
      for (const [city, coords] of Object.entries(CITY_COORDS)) {
        if (location.includes(city)) { lat = coords.lat; lon = coords.lon; break; }
      }
    }

    const bodygraph = await calculateHumanDesign(
      parseInt(year), parseInt(month), parseInt(day),
      hour ? parseInt(hour) : 12, lat, lon
    );

    return new Response(JSON.stringify({ success: true, bodygraph }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || '生成失败' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
