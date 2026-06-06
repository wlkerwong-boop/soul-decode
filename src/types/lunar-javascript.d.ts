declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    toFullString(): string;
    getLunar(): Lunar;
  }

  export class Lunar {
    getYearInGanZhiExact(): string;
    getMonthInGanZhiExact(): string;
    getDayInGanZhiExact(): string;
    getTimeInGanZhi(hour: string): string;
    getYearShengXiao(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getBaZi(hour?: string): string[];
    toFullString(): string;
  }

  export class LunarUtil {
    static WU_XING: Record<string, string>;
    static NAYIN: Record<string, string>;
  }
}
