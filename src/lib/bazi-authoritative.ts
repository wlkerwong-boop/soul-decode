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
 * Convert a birth time to the Beijing clock used by SoulCode's existing
 * report corpus. The product keeps the user-entered Gregorian date and only
 * converts the clock portion; this preserves previously verified overseas
 * reports such as Los Angeles 2015-06-04 19:45 → 10:45 Beijing time.
 */
export function toBeijingParts(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone = 'Asia/Shanghai',
) {
  const guessUtc = Date.UTC(year, month - 1, day, hour, minute || 0, 0);
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts: Record<string, number> = {};
    formatter.formatToParts(new Date(guessUtc)).forEach((part) => {
      parts[part.type] = parseInt(part.value, 10);
    });
    const localAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour % 24,
      parts.minute,
      parts.second,
    );
    const offsetMinutes = (guessUtc - localAsUtc) / 60000;
    const beijingMinutes = hour * 60 + (minute || 0) + 8 * 60 + offsetMinutes;
    const normalizedMinutes = ((beijingMinutes % 1440) + 1440) % 1440;
    return {
      year,
      month,
      day,
      hour: Math.floor(normalizedMinutes / 60),
      minute: normalizedMinutes % 60,
    };
  } catch {
    // Unknown timezone: retain the historical product fallback of Beijing time.
    return { year, month, day, hour, minute };
  }
}

export function calculateAuthoritativeBazi(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
  timezone = 'Asia/Shanghai',
) {
  const beijing = toBeijingParts(year, month, day, hour, minute, timezone);
  const lunar = (Solar as any)
    .fromYmdHms(beijing.year, beijing.month, beijing.day, beijing.hour, beijing.minute, 0)
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
    beijing,
  };
}
