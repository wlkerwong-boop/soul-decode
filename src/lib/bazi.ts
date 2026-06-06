/**
 * 灵魂解码 · 八字排盘引擎
 *
 * 基于 lunar-javascript 库，计算用户的真实八字（四柱）
 * 并提供五行分析、能量评分、人生大运时间线
 */

import { Solar } from 'lunar-javascript';

export interface BaziResult {
  /** 四柱八字 [年柱, 月柱, 日柱, 时柱] */
  pillars: string[];
  /** 天干五行 */
  ganElements: string[];
  /** 地支五行 */
  zhiElements: string[];
  /** 生肖 */
  zodiac: string;
  /** 日主（日干） */
  dayMaster: string;
  /** 日主五行 */
  dayMasterElement: string;
  /** 日支 */
  dayBranch: string;
  /** 四柱纳音 */
  nayin: string[];
  /** 五行分布统计 */
  elementDistribution: Record<string, number>;
  /** 命局简评 */
  summary: string;
}

export interface EnergyPoint {
  age: number;
  year: number;
  /** 综合能量得分 (0-100) */
  energy: number;
  /** 五行属性 */
  element: string;
  /** 大运/流年名称 */
  period: string;
  /** 事件类型: 'opening'(开盘) 'high' 'low' 'closing'(收盘) */
  type: 'high' | 'low' | 'mid';
}

export interface LifeLineData {
  /** 能量曲线数据点 */
  curve: EnergyPoint[];
  /** 关键转折年份 */
  turningPoints: { year: number; age: number; label: string; significance: 'major' | 'minor' }[];
  /** 起运年龄 */
  startLuckAge: number;
  /** 平均能量水平 */
  averageEnergy: number;
}

// 天干五行映射
const GAN_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

const ELEMENT_COLORS: Record<string, string> = {
  '木': '#4ade80',
  '火': '#fb923c',
  '土': '#eab308',
  '金': '#e0e0e0',
  '水': '#60a5fa',
};

// 地支五行映射
const BRANCH_ELEMENT: Record<string, string> = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
};

// 地支藏干映射（简化版，只取主气）
const BRANCH_HIDDEN: Record<string, string> = {
  '子': '癸', '丑': '己', '寅': '甲',
  '卯': '乙', '辰': '戊', '巳': '丙',
  '午': '丁', '未': '己', '申': '庚',
  '酉': '辛', '戌': '戊', '亥': '壬',
};

/**
 * 计算真实八字
 */
export function calculateBazi(year: number, month: number, day: number, hour?: number): BaziResult {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  const hourStr = hour !== undefined && hour !== null ? String(hour) : undefined;

  // 四柱
  const yearPillar = lunar.getYearInGanZhiExact();
  const monthPillar = lunar.getMonthInGanZhiExact();
  const dayPillar = lunar.getDayInGanZhiExact();
  const timePillar = hourStr ? lunar.getTimeInGanZhi(hourStr) : '--';
  const pillars = [yearPillar, monthPillar, dayPillar, timePillar];

  // 天干五行
  const ganElements = [
    GAN_ELEMENT[yearPillar.charAt(0)] || '—',
    GAN_ELEMENT[monthPillar.charAt(0)] || '—',
    GAN_ELEMENT[dayPillar.charAt(0)] || '—',
    timePillar !== '--' ? (GAN_ELEMENT[timePillar.charAt(0)] || '—') : '—',
  ];

  // 地支五行
  const zhiElements = [
    BRANCH_ELEMENT[yearPillar.charAt(1)] || '—',
    BRANCH_ELEMENT[monthPillar.charAt(1)] || '—',
    BRANCH_ELEMENT[dayPillar.charAt(1)] || '—',
    timePillar !== '--' ? (BRANCH_ELEMENT[timePillar.charAt(1)] || '—') : '—',
  ];

  const dayMaster = lunar.getDayGan();
  const dayMasterElement = GAN_ELEMENT[dayMaster] || '—';
  const dayBranch = lunar.getDayZhi();

  // 纳音
  const nayin = [
    lunaryNayin(yearPillar),
    lunaryNayin(monthPillar),
    lunaryNayin(dayPillar),
    timePillar !== '--' ? lunaryNayin(timePillar) : '—',
  ];

  // 五行分布（将天干地支的五行都算上）
  const allElements = [...ganElements.filter(e => e !== '—'), ...zhiElements.filter(e => e !== '—')];
  const distribution: Record<string, number> = {};
  for (const el of allElements) {
    distribution[el] = (distribution[el] || 0) + 1;
  }

  // 命局简评
  const summary = generateSummary(dayMasterElement, distribution, yearPillar, monthPillar, dayPillar);

  return {
    pillars,
    ganElements,
    zhiElements,
    zodiac: lunar.getYearShengXiao(),
    dayMaster,
    dayMasterElement,
    dayBranch,
    nayin,
    elementDistribution: distribution,
    summary,
  };
}

/**
 * 纳音简化查找（60甲子纳音）
 */
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

function lunaryNayin(ganzhi: string): string {
  return NAYIN_MAP[ganzhi] || '未知';
}

/**
 * 生成命局简评
 */
function generateSummary(dayMasterElement: string, distribution: Record<string, number>, ...pillars: string[]): string {
  const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0]?.[0] || '—';
  const second = sorted[1]?.[0] || '—';

  const descriptions: Record<string, string[]> = {
    '木': ['木主仁，生发向上', '你有天然的成长动力和创新精神'],
    '火': ['火主礼，光明热情', '你天生具有感染力和领导气质'],
    '土': ['土主信，厚重包容', '你稳如大地，值得信赖和依靠'],
    '金': ['金主义，刚毅果断', '你意志坚定，有强大的执行力'],
    '水': ['水主智，灵动变通', '你智慧深邃，善于随机应变'],
  };

  const mainDesc = descriptions[dayMasterElement]?.[0] || '';
  const mainTraits = descriptions[dayMasterElement]?.[1] || '';

  return `日主为「${dayMasterElement}」。${mainDesc}。${mainTraits}。命局以「${dominant}」气最盛${second ? `，「${second}」次之` : ''}。`;
}

/**
 * 生成人生能量曲线数据
 *
 * 模拟K线风格的能量走势：
 * - 基于日主五行与每年天干地支的生克关系计算能量波动
 * - 大运每10年一个转向，改变能量基线
 * - 流年作用于能量之上，产生年度波动
 */
export function generateLifeEnergy(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  dayMasterElement: string,
  distribution: Record<string, number>,
): LifeLineData {
  const currentYear = new Date().getFullYear();
  const startYear = birthYear;
  const endYear = birthYear + 80; // 80年生命跨度
  const birthAge = 0;

  // 五行生克关系
  const generateRelation: Record<string, Record<string, number>> = {
    '木': { '木': 0.5, '火': 0.8, '土': -0.3, '金': -0.7, '水': 0.6 },
    '火': { '木': 0.6, '火': 0.5, '土': 0.7, '金': -0.3, '水': -0.8 },
    '土': { '木': -0.4, '火': 0.7, '土': 0.5, '金': 0.6, '水': -0.3 },
    '金': { '木': -0.7, '火': -0.3, '土': 0.8, '金': 0.5, '水': 0.6 },
    '水': { '木': 0.8, '火': -0.7, '土': -0.3, '金': 0.6, '水': 0.5 },
  };

  // 各元素的流年年份周期影响
  // 每5年一个大周期
  const elementCycle = ['木', '火', '土', '金', '水'];

  const curve: EnergyPoint[] = [];
  const turningPoints: { year: number; age: number; label: string; significance: 'major' | 'minor' }[] = [];

  // 计算每一年能量
  for (let age = 0; age <= 80; age++) {
    const year = birthYear + age;

    // 大运周期：每10年一个运势转向
    const luckPeriod = Math.floor(age / 10);
    const luckElement = elementCycle[luckPeriod % 5];

    // 大运基点能量
    const baseRelation = generateRelation[dayMasterElement]?.[luckElement] || 0;
    const baseEnergy = 50 + baseRelation * 30;

    // 流年（每年天干对应的五行）
    const yearElement = elementCycle[(year - 4) % 5]; // 基准偏移
    const yearRelation = generateRelation[dayMasterElement]?.[yearElement] || 0;

    // 年度波动（正弦波 + 随机）
    const waveAmplitude = 15;
    const yearWave = Math.sin(age * 0.3 + luckPeriod * 1.2) * waveAmplitude;
    const yearBonus = yearRelation * 20;
    const noise = (Math.sin(age * 1.7) * 5 + Math.cos(age * 0.9) * 5);

    const energy = Math.max(5, Math.min(98, Math.round(baseEnergy + yearWave + yearBonus + noise)));

    // 类型分配（模拟K线的开高低收）
    let type: 'high' | 'low' | 'mid';
    if (energy > 65) type = 'high';
    else if (energy < 35) type = 'low';
    else type = 'mid';

    curve.push({
      age,
      year,
      energy,
      element: yearElement,
      period: `第${luckPeriod + 1}大运·${luckElement}运`,
      type,
    });

    // 标记重大转折点
    if (age % 10 === 0 && age > 0) {
      turningPoints.push({
        year,
        age,
        label: `${luckElement}运起`,
        significance: 'major',
      });
    }

    // 极端年份标记
    if (energy >= 85) {
      turningPoints.push({
        year,
        age,
        label: '🌊 高能年',
        significance: 'major',
      });
    } else if (energy <= 15) {
      turningPoints.push({
        year,
        age,
        label: '⛰️ 蛰伏期',
        significance: 'minor',
      });
    }
  }

  // 起运年龄（简化为3岁起运）
  const startLuckAge = 3;

  // 平均能量
  const averageEnergy = Math.round(
    curve.reduce((sum, p) => sum + p.energy, 0) / curve.length
  );

  return {
    curve,
    turningPoints: turningPoints.slice(0, 20), // 最多20个标记点
    startLuckAge,
    averageEnergy,
  };
}

/**
 * 获取五行对应的颜色
 */
export function getElementColor(element: string): string {
  return ELEMENT_COLORS[element] || '#c9a96e';
}

/**
 * 获取五行对应的Emoji
 */
export function getElementEmoji(element: string): string {
  const map: Record<string, string> = {
    '木': '🌲', '火': '🔥', '土': '⛰️', '金': '⚔️', '水': '🌊',
  };
  return map[element] || '✦';
}
