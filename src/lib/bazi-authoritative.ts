import { Solar } from 'lunar-javascript';

const STEM_ELEMENTS: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

const BRANCH_ELEMENTS: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

/**
 * The product contract is the civil clock at the birthplace.
 *
 * Timezone is intentionally not applied to Bazi or Ziwei: the user-entered
 * local date and local clock are the chart input. Human Design and astrology
 * use the same local input plus the IANA timezone when they need an absolute
 * instant. Keeping this helper explicit prevents accidental UTC/Beijing
 * conversion in one report route but not another.
 */
export function normalizeBirthplaceParts(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
) {
  return { year, month, day, hour, minute: minute || 0 };
}

export function calculateAuthoritativeBazi(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
  _timezone = 'Asia/Shanghai',
) {
  const local = normalizeBirthplaceParts(year, month, day, hour, minute);
  const lunar = (Solar as any)
    .fromYmdHms(local.year, local.month, local.day, local.hour, local.minute, 0)
    .getLunar();
  const pillars = [
    lunar.getYearInGanZhiExact(),
    lunar.getMonthInGanZhiExact(),
    lunar.getDayInGanZhiExact(),
    lunar.getTimeInGanZhi(),
  ];
  const elements = pillars.flatMap((pillar: string) => [
    STEM_ELEMENTS[pillar[0]],
    BRANCH_ELEMENTS[pillar[1]],
  ]).filter(Boolean);
  const elementDistribution = elements.reduce<Record<string, number>>((distribution, element) => {
    distribution[element] = (distribution[element] || 0) + 1;
    return distribution;
  }, {});
  const dayStem = lunar.getDayGan();
  return {
    pillars,
    ganElements: pillars.map((pillar: string) => STEM_ELEMENTS[pillar[0]]),
    zhiElements: pillars.map((pillar: string) => BRANCH_ELEMENTS[pillar[1]]),
    elements,
    elementDistribution,
    dayMaster: `${dayStem}（${STEM_ELEMENTS[dayStem]}）`,
    local,
  };
}
