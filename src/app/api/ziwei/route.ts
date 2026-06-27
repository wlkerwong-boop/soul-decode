// 紫微斗数排盘 API
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, day, hour, gender, isLeap } = body;

    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = hour !== undefined ? parseInt(hour) : 12;

    // 时辰转换（0-23时 → 子丑寅卯...）
    const timeIndex = Math.floor((h + 1) / 2) % 12;
    const ti = timeIndex === 0 ? 0 : timeIndex;
    const timeNames = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

    const dateStr = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const g = gender === '女' ? '女' : '男';

    const iztro = require('iztro');
    const result = iztro.astro.bySolar(dateStr, ti, g, !!isLeap, 'zh-CN');

    return NextResponse.json({
      success: true,
      data: {
        date: dateStr,
        time: `${h}时（${timeNames[ti]}时）`,
        gender: g,
        palaces: result.palaces?.map((p: any) => ({
          name: p.name,
          majorStars: (p.majorStars || []).map((s: any) => typeof s === 'object' ? s.name : s),
          minorStars: (p.minorStars || []).map((s: any) => typeof s === 'object' ? s.name : s),
          stars: [...((p.majorStars||[]).map((s:any) => typeof s === 'object' ? s.name : s)),
                   ...((p.minorStars||[]).map((s:any) => typeof s === 'object' ? s.name : s))],
        })) || [],
        horoscope: result.horoscope ? {
          age: result.horoscope.age,
          heavenly: result.horoscope.heavenly,
          earthly: result.horoscope.earthly,
          ganZhi: result.horoscope.ganZhi,
        } : null,
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
