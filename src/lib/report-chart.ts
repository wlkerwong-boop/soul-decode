import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const PALACE_ORDER = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'];

export function calculateReportZiwei(year: number, month: number, day: number, hour: number, gender: string) {
  try {
    const iztro = require('iztro');
    const timeIndex = Math.floor((hour + 1) / 2) % 12;
    const date = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const chart = iztro.astro.bySolar(date, timeIndex, gender, true, 'zh-CN');
    if (!Array.isArray(chart?.palaces)) return null;

    const palaceMap = new Map<string, any>();
    for (const palace of chart.palaces) {
      palaceMap.set(palace.name === '命宫宫' ? '命宫' : palace.name, palace);
    }
    if (!palaceMap.has('交友') && palaceMap.has('仆役')) palaceMap.set('交友', palaceMap.get('仆役'));

    const starsOf = (palace: any) => [
      ...(palace?.majorStars || []),
      ...(palace?.minorStars || []),
      ...(palace?.adjectiveStars || []),
    ];
    const palaces = PALACE_ORDER.map(name => ({
      name,
      stars: starsOf(palaceMap.get(name)).map((star: any) => typeof star === 'object' ? star.name : star).filter(Boolean),
    }));
    const sihua: { star: string; mutagen: string; palace: string }[] = [];
    for (const palace of chart.palaces) {
      for (const star of starsOf(palace)) {
        if (star?.mutagen) sihua.push({ star: star.name, mutagen: star.mutagen, palace: palace.name });
      }
    }
    return {
      palaces,
      horoscope: { mingZhu: chart.soul || null, shenZhu: chart.body || null, wuXing: chart.fiveElementsClass || null },
      sihua,
    };
  } catch {
    return null;
  }
}

export function describeReportYear(birthYear: number, currentYear = new Date().getFullYear()) {
  const stems = '甲乙丙丁戊己庚辛壬癸';
  const branches = '子丑寅卯辰巳午未申酉戌亥';
  const yearLabel = (year: number) => `${stems[(year - 4) % 10]}${branches[(year - 4) % 12]}`;
  return `出生公历年：${yearLabel(birthYear)}年（八字年柱按立春分界） | 当前流年：${yearLabel(currentYear)}年（${currentYear}年）`;
}
