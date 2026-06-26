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
    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) {
      return new Response(JSON.stringify({ error: '无效的日期参数' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Dynamic require CJS engine
    const mod = require('../../../lib/hd-engine-v5.cjs');
    const tz = body.timezone || 'Asia/Shanghai';
    // 位置→经纬度映射
    const LOC_COORDS: Record<string, [number, number]> = {
      '北京':[39.9,116.4],'上海':[31.2,121.5],'天津':[39.1,117.2],'重庆':[29.6,106.6],
      '河北':[38.0,114.5],'山西':[37.9,112.5],'内蒙古':[40.8,111.8],'辽宁':[41.8,123.4],
      '吉林':[43.9,125.3],'黑龙江':[45.8,126.5],'江苏':[32.1,118.8],'浙江':[30.3,120.2],
      '安徽':[31.9,117.3],'福建':[26.1,119.3],'江西':[28.7,115.9],'山东':[36.7,117.0],
      '河南':[34.8,113.7],'湖北':[30.6,114.3],'湖南':[28.2,112.9],'广东':[23.1,113.3],
      '广西':[22.8,108.4],'海南':[20.0,110.3],'四川':[30.6,104.1],'贵州':[26.6,106.7],
      '云南':[25.0,102.7],'西藏':[29.7,91.1],'陕西':[34.3,108.9],'甘肃':[36.0,103.8],
      '青海':[36.6,101.8],'宁夏':[38.5,106.3],'新疆':[43.8,87.6],'香港':[22.3,114.2],
      '澳门':[22.2,113.5],'台湾':[25.0,121.5],'美国':[34.1,-118.2],'洛杉矶':[34.1,-118.2],
      '纽约':[40.7,-74.0],'伦敦':[51.5,-0.1],'巴黎':[48.9,2.3],'东京':[35.7,139.7],
      '悉尼':[-33.9,151.2],
    };
    const loc = body.location || '北京';
    const coords = LOC_COORDS[loc] || LOC_COORDS['北京'];
    const [lat, lon] = coords;
    const result = mod.calculateBodygraph(
      `${String(body.year).padStart(4,'0')}-${String(body.month).padStart(2,'0')}-${String(body.day).padStart(2,'0')}`,
      `${String(body.hour || '12').padStart(2,'0')}:00`,
      tz, lat, lon
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
