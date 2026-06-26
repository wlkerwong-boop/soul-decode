/**
 * 融合分析 API
 * 并行计算八字（lunar-javascript）并调用本地人类图 API，
 * 返回整合后的命理与人类图融合解读。
 */
import { NextRequest, NextResponse } from 'next/server';
import { Solar } from 'lunar-javascript';

export const runtime = 'nodejs';

import path from 'path';

const GAN_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

const BRANCH_ELEMENT: Record<string, string> = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
};

const NAYIN_MAP: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金',
  '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木',
  '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金',
  '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水',
  '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金',
  '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水',
  '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火',
  '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水',
  '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火',
  '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土',
  '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火',
  '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土',
  '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木',
  '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土',
  '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木',
  '壬戌': '大海水', '癸亥': '大海水',
};

function calculateBaziLocal(year: number, month: number, day: number, hour?: number) {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  const hourStr = hour !== undefined && hour !== null ? String(hour) : undefined;

  const yearPillar = lunar.getYearInGanZhiExact();
  const monthPillar = lunar.getMonthInGanZhiExact();
  const dayPillar = lunar.getDayInGanZhiExact();
  const timePillar = hourStr ? lunar.getTimeInGanZhi(hourStr) : '--';
  const pillars = [yearPillar, monthPillar, dayPillar, timePillar];

  const ganElements = [
    GAN_ELEMENT[yearPillar.charAt(0)] || '—',
    GAN_ELEMENT[monthPillar.charAt(0)] || '—',
    GAN_ELEMENT[dayPillar.charAt(0)] || '—',
    timePillar !== '--' ? (GAN_ELEMENT[timePillar.charAt(0)] || '—') : '—',
  ];

  const zhiElements = [
    BRANCH_ELEMENT[yearPillar.charAt(1)] || '—',
    BRANCH_ELEMENT[monthPillar.charAt(1)] || '—',
    BRANCH_ELEMENT[dayPillar.charAt(1)] || '—',
    timePillar !== '--' ? (BRANCH_ELEMENT[timePillar.charAt(1)] || '—') : '—',
  ];

  const dayMaster = lunar.getDayGan();
  const dayMasterElement = GAN_ELEMENT[dayMaster] || '—';

  const nayin = [
    NAYIN_MAP[yearPillar] || '—',
    NAYIN_MAP[monthPillar] || '—',
    NAYIN_MAP[dayPillar] || '—',
    timePillar !== '--' ? (NAYIN_MAP[timePillar] || '—') : '—',
  ];

  const allElements = [...ganElements.filter(e => e !== '—'), ...zhiElements.filter(e => e !== '—')];
  const elementDistribution: Record<string, number> = {};
  for (const el of allElements) {
    elementDistribution[el] = (elementDistribution[el] || 0) + 1;
  }

  const detail = [
    `生肖：${lunar.getYearShengXiao()}`,
    `日主：${dayMaster}（${dayMasterElement}）`,
    `纳音：${nayin.join(' / ')}`,
    `天干五行：${ganElements.join(' / ')}`,
    `地支五行：${zhiElements.join(' / ')}`,
    `五行统计：${Object.entries(elementDistribution).map(([k, v]) => `${k}${v}`).join('，')}`,
  ].join('；');

  return {
    pillars,
    detail,
    dayMaster: `${dayMaster}（${dayMasterElement}）`,
    elementDistribution,
  };
}

function generateFusionText(
  bazi: ReturnType<typeof calculateBaziLocal>,
  humanDesign: { type: string; profile: string; authority: string; channels: string[] }
): string {
  const elements = Object.entries(bazi.elementDistribution)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
    .join('、') || '未知';

  const hdDesc = humanDesign.type
    ? `人类图类型为「${humanDesign.type}」，人生角色${humanDesign.profile}，内在权威是${humanDesign.authority}。`
    : '人类图信息暂缺。';

  return `你的八字四柱为「${bazi.pillars.join(' ')}」，日主${bazi.dayMaster}，五行能量以${elements}为主。${hdDesc}` +
    `从融合视角看，八字揭示了你先天的能量质地与五行喜忌，人类图则描述了你独特的决策机制与能量交换方式。` +
    `建议在日常生活中，结合日主五行与自然节律做选择，同时尊重人类图的策略与权威，让内在一致性成为行动指南。`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, location } = body;

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

    const [baziResult, hdResponse] = await Promise.all([
      calculateBaziLocal(y, m, d, h),
      // Use internal import instead of fetch — direct call to the engine
      (async () => {
        const hdMod = require(path.join(process.cwd(), 'src/lib/hd-engine-v5.cjs'));
        const ds = `${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const ts = `${String(h || '12').padStart(2,'0')}:00`;
        const result = hdMod.calculateBodygraph(ds, ts, 'Asia/Shanghai', 39.9, 116.4);
        return { bodygraph: result };
      })(),
    ]);

    const bodygraph = hdResponse?.bodygraph || {};
    const humanDesign = {
      type: bodygraph.type || '',
      profile: bodygraph.profile || '',
      authority: bodygraph.authority || '',
      channels: Array.isArray(bodygraph.channels) ? bodygraph.channels : [],
    };

    const fusion = generateFusionText(baziResult, humanDesign);

    return NextResponse.json({
      success: true,
      bazi: baziResult,
      humanDesign,
      fusion,
    });
  } catch (error: any) {
    console.error('融合分析失败:', error);
    return NextResponse.json(
      { error: error.message || '融合分析失败' },
      { status: 500 }
    );
  }
}
