/**
 * 人类图（Human Design）计算 API
 * 调用CLI子进程（swisseph原生插件兼容性问题）
 */
import { NextRequest } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  '北京': { lat: 39.9042, lon: 116.4074 },
  '上海': { lat: 31.2304, lon: 121.4737 },
  '天津': { lat: 39.3434, lon: 117.3616 },
  '重庆': { lat: 29.4316, lon: 106.9123 },
  '河北': { lat: 38.0455, lon: 114.5020 },
  '山西': { lat: 37.8570, lon: 112.5626 },
  '内蒙古': { lat: 40.8174, lon: 111.7652 },
  '辽宁': { lat: 41.8057, lon: 123.4315 },
  '吉林': { lat: 43.8962, lon: 125.3267 },
  '黑龙江': { lat: 45.8038, lon: 126.5350 },
  '江苏': { lat: 32.0603, lon: 118.7969 },
  '浙江': { lat: 30.2741, lon: 120.1551 },
  '安徽': { lat: 31.8206, lon: 117.2272 },
  '福建': { lat: 26.0745, lon: 119.2965 },
  '江西': { lat: 28.6829, lon: 115.8582 },
  '山东': { lat: 36.6683, lon: 116.9972 },
  '河南': { lat: 34.7656, lon: 113.7518 },
  '湖北': { lat: 30.5928, lon: 114.3055 },
  '湖南': { lat: 28.2282, lon: 112.9388 },
  '广东': { lat: 23.1292, lon: 113.2644 },
  '广西': { lat: 22.8150, lon: 108.3270 },
  '海南': { lat: 20.0174, lon: 110.3492 },
  '四川': { lat: 30.5728, lon: 104.0668 },
  '贵州': { lat: 26.6474, lon: 106.6302 },
  '云南': { lat: 25.0453, lon: 102.7064 },
  '西藏': { lat: 29.6500, lon: 91.1000 },
  '陕西': { lat: 34.2658, lon: 108.9542 },
  '甘肃': { lat: 36.0611, lon: 103.8343 },
  '青海': { lat: 36.6230, lon: 101.7804 },
  '宁夏': { lat: 38.4680, lon: 106.2728 },
  '新疆': { lat: 43.8256, lon: 87.6168 },
  '香港': { lat: 22.3193, lon: 114.1694 },
  '澳门': { lat: 22.1987, lon: 113.5439 },
  '台湾': { lat: 25.0330, lon: 121.5654 },
};

const TZ_MAP: Record<string, string> = {
  '中国标准时间(CST, UTC+8)': 'Asia/Shanghai',
  '美国东部(EST, UTC-5)': 'America/New_York',
  '美国西部(PST, UTC-8)': 'America/Los_Angeles',
  '英国(GMT, UTC+0)': 'Europe/London',
  '澳洲东部(AEST, UTC+10)': 'Australia/Sydney',
  '日本(JST, UTC+9)': 'Asia/Tokyo',
  '欧洲中部(CET, UTC+1)': 'Europe/Berlin',
};

function getCoords(location: string): { lat: number; lon: number } {
  if (!location) return { lat: 39.9042, lon: 116.4074 };
  for (const [prov, coords] of Object.entries(CITY_COORDS)) {
    if (location.includes(prov)) return coords;
  }
  return { lat: 39.9042, lon: 116.4074 };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, location, timezone } = body;

    if (!year || !month || !day) {
      return new Response(JSON.stringify({ error: '请填写完整的出生日期' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const coords = getCoords(location);
    const tz = TZ_MAP[timezone || ''] || 'Asia/Shanghai';
    const time = hour ? `${hour.padStart(2, '0')}:30` : '12:00';
    const dateStr = `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;

    // Call CLI as child process
    const cliPath = path.join(process.cwd(), 'node_modules/@it-healer/human-design-calculator/src/index.js');
    const svgOut = `/tmp/hd-svg-${Date.now()}.svg`;
    const cmd = `node "${cliPath}" ${dateStr} ${time} ${tz} ${coords.lat} ${coords.lon} ${svgOut}`;

    const output = execSync(cmd, { timeout: 30000, encoding: 'utf-8' });

    // Parse JSON from CLI output (first JSON object)
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('无法解析人类图数据');

    const bodygraph = JSON.parse(jsonMatch[0]);

    // Read SVG
    let svg = '';
    try {
      svg = require('fs').readFileSync(svgOut, 'utf-8');
    } catch { /* SVG optional */ }

    return new Response(JSON.stringify({
      success: true,
      bodygraph,
      svg,
      config: { date: dateStr, time, timezone: tz, ...coords },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('HD error:', error.message);
    return new Response(JSON.stringify({ error: error.message || '人类图生成失败' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
