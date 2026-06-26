/**
 * 西方占星命盘 API (taibu-core)
 */
import { NextRequest, NextResponse } from 'next/server';
import { calculateAstrology, toAstrologyJson } from 'taibu-core/astrology';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, minute = 0, location, timezone = 'Asia/Shanghai' } = body;

    if (!year || !month || !day) {
      return NextResponse.json({ error: '请填写完整的出生日期' }, { status: 400 });
    }

    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const h = hour !== undefined && hour !== null && hour !== '' ? parseInt(hour, 10) : 12;
    const mi = parseInt(minute, 10) || 0;

    // 日期校验
    if (isNaN(y) || isNaN(m) || isNaN(d) || y < 1900 || y > 2100) {
      return NextResponse.json({ error: '请填写有效的出生日期' }, { status: 400 });
    }
    const testDate = new Date(y, m - 1, d);
    if (testDate.getFullYear() !== y || testDate.getMonth() !== m - 1 || testDate.getDate() !== d) {
      return NextResponse.json({ error: '请填写有效的出生日期' }, { status: 400 });
    }

    const chart = calculateAstrology({
      birthYear: y,
      birthMonth: m,
      birthDay: d,
      birthHour: h,
      birthMinute: mi,
      birthPlace: location || '',
    });

    const jsonOutput = toAstrologyJson(chart);

    // 提取关键信息
    const natal = chart.natal;
    const sunSign = natal?.sunSign || { key: '', label: '' };
    const bodies = natal?.bodies || [];
    const aspects = chart.majorAspects || [];

    return NextResponse.json({
      success: true,
      source: 'taibu-core-astrology',
      astrology: {
        sunSign: { key: sunSign.key, label: sunSign.label, element: sunSign.element },
        bodies: bodies.map((b: any) => ({
          key: b.key,
          label: b.label,
          sign: { key: b.sign?.key, label: b.sign?.label, element: b.sign?.element },
          house: b.house,
          retrograde: b.retrograde,
          position: b.position?.withinSign || '',
        })),
        aspects: aspects.map((a: any) => ({
          body1: a.body1,
          body2: a.body2,
          type: a.type,
          orb: a.orb,
        })),
        houses: (chart.chartMeta?.houseSystem || 'placidus'),
        text: jsonOutput,
      },
    });
  } catch (error: any) {
    console.error('占星排盘失败:', error);
    return NextResponse.json({ error: error.message || '占星排盘失败' }, { status: 500 });
  }
}
