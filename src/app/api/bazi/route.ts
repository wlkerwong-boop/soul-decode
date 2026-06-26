/**
 * 八字排盘 + 大运流年 API (v3 · taibu-core)
 *
 * 使用 MIT 许可的 taibu-core 引擎，提供完整排盘
 * 包含：四柱、藏干、十神、纳音、地势、51种神煞、刑害合冲、大运、命宫
 */
import { NextRequest, NextResponse } from 'next/server';
import { calculateBazi, toBaziJson } from 'taibu-core/bazi';
import { calculateBaziDayun, toBaziDayunText } from 'taibu-core/bazi-dayun';
import { lookupCity } from '@/lib/city';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, minute = 0, location, gender = 'male', timezone = 'Asia/Shanghai' } = body;

    if (!year || !month || !day) {
      return NextResponse.json(
        { error: '请填写完整的出生日期' },
        { status: 400 }
      );
    }

    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const h = hour !== undefined && hour !== null ? parseInt(hour, 10) : 12;
    const mi = parseInt(minute, 10) || 0;

    // 城市信息
    const cityInfo = location ? lookupCity(location) : null;

    // taibu-core 八字排盘（51种神煞、完整藏干、刑害合冲）
    // 注意：timezone 由外部处理，taibu-core BaziInput 无 timezone 字段
    const chart = calculateBazi({
      gender: gender === 'female' ? 'female' : 'male',
      birthYear: y,
      birthMonth: m,
      birthDay: d,
      birthHour: h,
      birthMinute: mi,
      birthPlace: location || '',
    });

    // 大运计算
    const dayunInput = Object.assign(chart, { birthYear: y, birthMonth: m, birthDay: d, birthHour: h });
    const dayun = calculateBaziDayun(dayunInput);
    const dayunText = toBaziDayunText(dayun);

    // 人类可读的文本输出
    const jsonOutput = toBaziJson(chart);

    // 五行分布统计
    const elementMap: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    const ganElement: Record<string, string> = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
    const zhiElement: Record<string, string> = { '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水' };
    for (const p of ['year','month','day','hour'] as const) {
      const pillar = chart.fourPillars[p];
      if (pillar) {
        const ge = ganElement[pillar.stem];
        if (ge) elementMap[ge] = (elementMap[ge] || 0) + 1;
        const ze = zhiElement[pillar.branch];
        if (ze) elementMap[ze] = (elementMap[ze] || 0) + 1;
      }
    }

    // 四柱数组（兼容旧版前端）
    const pillars = [
      chart.fourPillars.year.stem + chart.fourPillars.year.branch,
      chart.fourPillars.month.stem + chart.fourPillars.month.branch,
      chart.fourPillars.day.stem + chart.fourPillars.day.branch,
      chart.fourPillars.hour.stem + chart.fourPillars.hour.branch,
    ];

    return NextResponse.json({
      success: true,
      source: 'taibu-core-v3',
      bazi: {
        pillars,
        dayMaster: chart.dayMaster,
        dayMasterElement: ganElement[chart.dayMaster] || '',
        dayBranch: chart.fourPillars.day.branch,
        ganElements: pillars.map(p => ganElement[p[0]] || ''),
        zhiElements: pillars.map(p => zhiElement[p[1]] || ''),
        nayin: Object.values(chart.fourPillars).map((p: any) => p.naYin),
        elementDistribution: elementMap,
        shensha: Object.fromEntries(
          Object.entries(chart.fourPillars).map(([key, p]: [string, any]) => [key, p.shenSha || []])
        ),
        hiddenStems: Object.fromEntries(
          Object.entries(chart.fourPillars).map(([key, p]: [string, any]) => [
            key,
            (p.hiddenStems || []).map((h: any) => ({ stem: h.stem, qiType: h.qiType, tenGod: h.tenGod }))
          ])
        ),
        relations: chart.relations || [],
        mingGong: chart.mingGong,
        taiYuan: chart.taiYuan,
        kongWang: chart.kongWang,
      },
      dayun: {
        startAge: dayun.startAge,
        startAgeDetail: dayun.startAgeDetail,
        list: dayun.list || [],
        text: dayunText,
      },
      meta: {
        cityTags: cityInfo?.tags || [],
        location,
      },
    });
  } catch (error: any) {
    console.error('八字排盘失败:', error);
    return NextResponse.json(
      { error: error.message || '八字排盘失败' },
      { status: 500 }
    );
  }
}
