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
 * 生成人生能量曲线数据（v2 升级版）
 *
 * 改进要点：
 * - 使用八字四柱的天干地支五行做个性化基线
 * - 大运过渡采用3年渐入/渐出而非突变
 * - 流年五行生克计算更精确
 * - 加入人生阶段标签
 * - 基于日主旺衰调整能量波动幅度
 */
export function generateLifeEnergy(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  dayMasterElement: string,
  distribution: Record<string, number>,
  pillars?: string[],
  ganElements?: string[],
  zhiElements?: string[],
): LifeLineData {
  const currentYear = new Date().getFullYear();

  // 五行生克关系（生我/我生/克我/我克）
  // 正值=生助/相合，负值=相克/相耗
  const generateRelation: Record<string, Record<string, number>> = {
    '木': { '木': 0.5, '火': 0.8, '土': -0.4, '金': -0.7, '水': 0.6 },
    '火': { '木': 0.6, '火': 0.5, '土': 0.7, '金': -0.3, '水': -0.8 },
    '土': { '木': -0.4, '火': 0.7, '土': 0.5, '金': 0.6, '水': -0.3 },
    '金': { '木': -0.7, '火': -0.4, '土': 0.8, '金': 0.5, '水': 0.6 },
    '水': { '木': 0.8, '火': -0.7, '土': -0.3, '金': 0.6, '水': 0.5 },
  };

  // 五行相生顺序（用于大运演进）
  const ELEMENT_CYCLE_GENERATE: Record<string, string> = {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
  };
  // 五行相克顺序
  const ELEMENT_CYCLE_CONTROL: Record<string, string> = {
    '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
  };

  const ELEMENT_CYCLE = ['木', '火', '土', '金', '水'];

  // ----- 计算大运起始元素 -----
  // 用月柱的天干五行决定大运起始方向
  let startLuckElement = dayMasterElement;
  if (ganElements && ganElements.length > 1 && ganElements[1] !== '—') {
    // 月干五行作为大运的起点偏移
    const monthGanIdx = ELEMENT_CYCLE.indexOf(ganElements[1]);
    if (monthGanIdx >= 0) {
      // 用月干偏移日主2位，产生"错位"效果使每个命盘曲线不同
      const dayMasterIdx = ELEMENT_CYCLE.indexOf(dayMasterElement);
      const offset = ((monthGanIdx - dayMasterIdx + 5) % 5);
      startLuckElement = ELEMENT_CYCLE[(dayMasterIdx + Math.floor(offset / 2)) % 5];
    }
  }

  // ----- 计算五行均衡度（影响曲线波动幅度） -----
  const elementCounts = Object.values(distribution);
  const maxCount = Math.max(...elementCounts, 1);
  const minCount = Math.min(...elementCounts, 0);
  const balanceRatio = 1 - (maxCount - minCount) / (maxCount + 1); // 0-1, 越高越均衡

  // 五行均衡的人波动小，不均衡的人波动大
  const volatilityMultiplier = 0.7 + (1 - balanceRatio) * 0.6;

  // ----- 计算初始能量基线 -----
  // 日主受月令(月支五行)的影响
  let baseEnergyOffset = 0;
  if (zhiElements && zhiElements.length > 1 && zhiElements[1] !== '—') {
    const monthElement = zhiElements[1];
    const monthRelation = generateRelation[dayMasterElement]?.[monthElement] || 0;
    baseEnergyOffset = monthRelation * 10;
  }

  // 受年支（社会环境）影响
  if (zhiElements && zhiElements.length > 0 && zhiElements[0] !== '—') {
    const yearElement = zhiElements[0];
    const yearRelation = generateRelation[dayMasterElement]?.[yearElement] || 0;
    baseEnergyOffset += yearRelation * 5;
  }

  const curve: EnergyPoint[] = [];
  const turningPoints: { year: number; age: number; label: string; significance: 'major' | 'minor' }[] = [];

  // 人生阶段标签
  const lifeStages = [
    { start: 0, end: 17, label: '🧒 成长探索期' },
    { start: 18, end: 25, label: '🚀 青年奋斗期' },
    { start: 26, end: 35, label: '🏗️ 立业深耕期' },
    { start: 36, end: 45, label: '👑 成就爆发期' },
    { start: 46, end: 55, label: '🧠 智慧沉淀期' },
    { start: 56, end: 65, label: '🌿 自在收放期' },
    { start: 66, end: 80, label: '🍂 圆满回甘期' },
  ];

  // 10年大运序列（基于日主五行和偏移计算）
  const luckSequence: string[] = [];
  let currentLuckEl = startLuckElement;
  for (let i = 0; i < 10; i++) {
    luckSequence.push(currentLuckEl);
    // 大运的变化方向：阴阳交替
    // 用顺逆结合产生更自然的序列
    if (i % 2 === 0) {
      currentLuckEl = ELEMENT_CYCLE_GENERATE[currentLuckEl];
    } else {
      currentLuckEl = ELEMENT_CYCLE_CONTROL[currentLuckEl];
    }
  }

  // 起运年龄（基于五行分布）
  const startLuckAge = 3 + Math.round((1 - balanceRatio) * 4);

  // 计算大运起止
  const majorLuckChanges: { age: number; element: string }[] = [];
  for (let i = 0; i < luckSequence.length; i++) {
    const luckStartAge = startLuckAge + i * 10;
    if (luckStartAge <= 80) {
      majorLuckChanges.push({
        age: luckStartAge,
        element: luckSequence[i],
      });
    }
  }

  // 计算每一年能量
  for (let age = 0; age <= 80; age++) {
    const year = birthYear + age;

    // ----- 大运能量 -----
    // 找到当前所在的大运
    let currentLuckEl = luckSequence[0];
    let currentLuckIndex = 0;
    let progressInLuck = 0; // 0-1, 当前大运的进度

    for (let i = majorLuckChanges.length - 1; i >= 0; i--) {
      if (age >= majorLuckChanges[i].age) {
        currentLuckEl = majorLuckChanges[i].element;
        currentLuckIndex = i;
        const luckStart = majorLuckChanges[i].age;
        const luckEnd = (i + 1 < majorLuckChanges.length) ? majorLuckChanges[i + 1].age : 80;
        progressInLuck = (age - luckStart) / (luckEnd - luckStart);
        break;
      }
    }

    // 大运与日主的关系
    const luckRelation = generateRelation[dayMasterElement]?.[currentLuckEl] || 0;

    // 大运过渡平滑：大运更替时有3年渐入/渐出
    let luckMultiplier = 1;
    for (const change of majorLuckChanges) {
      const yearsSinceChange = age - change.age;
      if (yearsSinceChange >= 0 && yearsSinceChange < 3) {
        // 新运渐入
        luckMultiplier = 0.6 + yearsSinceChange * 0.15; // 0.6 -> 1.0
      }
      if (yearsSinceChange >= -3 && yearsSinceChange < 0) {
        // 旧运渐出
        luckMultiplier = 1.0 + yearsSinceChange * 0.13; // 1.0 -> 0.6
      }
    }

    const baseFromLuck = 50 + luckRelation * 25 * luckMultiplier;

    // ----- 流年能量 -----
    // 流年天干基于年份的天干五行
    const yearGanIndex = (year - 4) % 10; // 甲=0
    const yearGanElement = ELEMENT_CYCLE[Math.floor(yearGanIndex / 2) % 5];
    const yearRelation = generateRelation[dayMasterElement]?.[yearGanElement] || 0;
    const yearBonus = yearRelation * 15;

    // ----- 季节能量（基于出生月份） -----
    const seasonFactor = Math.sin((age + birthMonth / 2) * 0.15) * 3;

    // ----- 综合波动 -----
    const waveAmplitude = 12 * volatilityMultiplier;
    const wave1 = Math.sin(age * 0.25 + currentLuckIndex * 1.5) * waveAmplitude;
    const wave2 = Math.cos(age * 0.12 + currentLuckIndex * 0.8) * waveAmplitude * 0.5;
    const noise = (Math.sin(age * 1.3) * 4 + Math.cos(age * 0.7) * 3);

    // 人生阶段基线偏移（中年后趋于平稳）
    let stageOffset = 0;
    if (age < 18) stageOffset = 5; // 青少年期偏高
    else if (age > 60) stageOffset = -3; // 老年略有下降

    const energy = Math.round(Math.max(5, Math.min(98,
      baseFromLuck + baseEnergyOffset + yearBonus + seasonFactor + wave1 + wave2 + noise + stageOffset
    )));

    // 类型分配
    let type: 'high' | 'low' | 'mid';
    if (energy > 65) type = 'high';
    else if (energy < 35) type = 'low';
    else type = 'mid';

    curve.push({
      age,
      year,
      energy,
      element: yearGanElement,
      period: `第${currentLuckIndex + 1}运·${currentLuckEl}运`,
      type,
    });
  }

  // ----- 标记转折点 -----
  for (const change of majorLuckChanges) {
    turningPoints.push({
      year: birthYear + change.age,
      age: change.age,
      label: `「${change.element}」运起`,
      significance: 'major',
    });
  }

  // 标记高能/低能年份（去重，取第1次出现）
  const seenLabels = new Set<string>();
  for (const point of curve) {
    if (point.energy >= 85 && !seenLabels.has(`高能${point.age}`)) {
      if (point.age >= 5) {
        seenLabels.add(`高能${point.age}`);
        turningPoints.push({
          year: point.year,
          age: point.age,
          label: '🌊 高能年',
          significance: 'major',
        });
      }
    }
    if (point.energy <= 18 && point.age >= 10) {
      if (!seenLabels.has(`蛰伏${point.age}`)) {
        seenLabels.add(`蛰伏${point.age}`);
        turningPoints.push({
          year: point.year,
          age: point.age,
          label: '⛰️ 蛰伏期',
          significance: 'minor',
        });
      }
    }
  }

  // 添加人生阶段标签
  for (const stage of lifeStages) {
    if (stage.start >= 0 && stage.start <= 80) {
      const existing = turningPoints.find(t => Math.abs(t.age - stage.start) <= 2);
      if (!existing) {
        turningPoints.push({
          year: birthYear + stage.start,
          age: stage.start,
          label: stage.label,
          significance: 'minor',
        });
      }
    }
  }

  // 排序并去重 + 限制数量
  const sorted = turningPoints
    .filter((p, i, arr) => arr.findIndex(t => Math.abs(t.age - p.age) <= 2 && t.label === p.label) === i)
    .sort((a, b) => a.age - b.age)
    .slice(0, 25);

  // 平均能量
  const averageEnergy = Math.round(
    curve.reduce((sum, p) => sum + p.energy, 0) / curve.length
  );

  return {
    curve,
    turningPoints: sorted,
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
