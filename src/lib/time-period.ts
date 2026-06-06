/**
 * 出生时辰的五行/能量属性映射
 * 
 * 中国古代十二时辰与能量属性对应关系
 */

export interface TimePeriodResult {
  periodName: string;       // 时辰名称（如"丑时"）
  timeRange: string;        // 时间范围（如"01:00-03:00"）
  element: string;          // 五行属性
  energyType: string;       // 能量气质描述
  description: string;      // 完整描述
}

const timePeriods: TimePeriodResult[] = [
  {
    periodName: '子时',
    timeRange: '23:00-01:00',
    element: '水',
    energyType: '水象内省',
    description: '子时，阴极阳生，万籁俱寂。此时出生的人具有深邃的内在直觉，如水般流动的感知力，内心世界极为丰富。你天生对能量的变化敏感，需要独处来充电。'
  },
  {
    periodName: '丑时',
    timeRange: '01:00-03:00',
    element: '土',
    energyType: '土象承载',
    description: '丑时，土气当令，厚德载物。此时出生的人骨子里有一种沉稳坚韧的力量，如大地般承载包容。你坚韧不拔，脚踏实地，但有时也会因过于承载他人而忽略自己。'
  },
  {
    periodName: '寅时',
    timeRange: '03:00-05:00',
    element: '木',
    energyType: '木象开创',
    description: '寅时，黎明前的黑暗，木气生发。此时出生的人具备强大的开创力和生命力，如破土而出的新芽。你不甘平庸，天生带着改变现状的冲动与勇气。'
  },
  {
    periodName: '卯时',
    timeRange: '05:00-07:00',
    element: '木',
    energyType: '木象生长',
    description: '卯时，旭日东升，万物生长。此时出生的人如春天的树木，充满生机与活力。你乐观积极，善于开启新事物，有天然的感染力。'
  },
  {
    periodName: '辰时',
    timeRange: '07:00-09:00',
    element: '土',
    energyType: '土象化育',
    description: '辰时，阳光普照，土气化育万物。此时出生的人稳重中带着进取心，既有大地的沉稳，又有阳光的温暖。你善于整合资源，让事物从无序走向有序。'
  },
  {
    periodName: '巳时',
    timeRange: '09:00-11:00',
    element: '火',
    energyType: '火象明照',
    description: '巳时，日近中天，火气旺盛。此时出生的人如正午的阳光，热情主动，行动力强。你天生具有领导气质，善于点燃他人的热情。'
  },
  {
    periodName: '午时',
    timeRange: '11:00-13:00',
    element: '火',
    energyType: '火象鼎盛',
    description: '午时，日正中天，阳气至极。此时出生的人气场强大，自信耀眼。你天生具有舞台感和表现力，但需注意阳极而阴的平衡之道。'
  },
  {
    periodName: '未时',
    timeRange: '13:00-15:00',
    element: '土',
    energyType: '土象滋养',
    description: '未时，日过中天，土气滋养。此时出生的人温和包容，如同午后阳光照射的沃土。你善于滋养他人，有天然的疗愈能力，是团队中不可或缺的稳定力量。'
  },
  {
    periodName: '申时',
    timeRange: '15:00-17:00',
    element: '金',
    energyType: '金象锐利',
    description: '申时，金气当令，锐不可当。此时出生的人思维敏捷，判断精准，如刀锋般锐利。你善于分析、决策和切割，是天生的战略家。'
  },
  {
    periodName: '酉时',
    timeRange: '17:00-19:00',
    element: '金',
    energyType: '金象收藏',
    description: '酉时，日落西山，金气收敛。此时出生的人内敛而精致，如精心打磨的玉石。你追求品质与完美，有天然的艺术审美和鉴赏力。'
  },
  {
    periodName: '戌时',
    timeRange: '19:00-21:00',
    element: '土',
    energyType: '土象包容',
    description: '戌时，夜幕降临，土气包容万物。此时出生的人包容豁达，有极强的适应力。你善于在黑暗中找到方向，在混沌中建立秩序。'
  },
  {
    periodName: '亥时',
    timeRange: '21:00-23:00',
    element: '水',
    energyType: '水象流动',
    description: '亥时，夜深人静，水气流动。此时出生的人直觉敏锐，思维流动如暗河。你拥有丰富的内心世界和创造力，适合从事需要灵感和想象力的工作。'
  },
];

export function getTimePeriod(hour?: number): TimePeriodResult | null {
  if (hour === undefined || hour === null) return null;

  if (hour >= 23 || hour < 1) return timePeriods[0];   // 子时 23-01
  if (hour >= 1 && hour < 3) return timePeriods[1];    // 丑时 01-03
  if (hour >= 3 && hour < 5) return timePeriods[2];    // 寅时 03-05
  if (hour >= 5 && hour < 7) return timePeriods[3];    // 卯时 05-07
  if (hour >= 7 && hour < 9) return timePeriods[4];    // 辰时 07-09
  if (hour >= 9 && hour < 11) return timePeriods[5];   // 巳时 09-11
  if (hour >= 11 && hour < 13) return timePeriods[6];  // 午时 11-13
  if (hour >= 13 && hour < 15) return timePeriods[7];  // 未时 13-15
  if (hour >= 15 && hour < 17) return timePeriods[8];  // 申时 15-17
  if (hour >= 17 && hour < 19) return timePeriods[9];  // 酉时 17-19
  if (hour >= 19 && hour < 21) return timePeriods[10]; // 戌时 19-21
  return timePeriods[11];                               // 亥时 21-23
}
