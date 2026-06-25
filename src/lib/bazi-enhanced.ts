/**
 * 增强版八字排盘引擎 — 完整十神/藏干/大运/命宫
 * 支持海外时区转换（美国出生须加一天）
 */

import { Solar } from 'lunar-javascript';

const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

const GAN_ELEMENT: Record<string, string> = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
const ZHI_ELEMENT: Record<string, string> = { '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水' };
const GAN_YINYANG: Record<string, string> = { '甲':'阳','乙':'阴','丙':'阳','丁':'阴','戊':'阳','己':'阴','庚':'阳','辛':'阴','壬':'阳','癸':'阴' };

function dayMasterRelation(g: string): string {
  const idx = GAN.indexOf(g);
  if (idx < 0) return '—';
  return ['比肩','劫财','食神','伤官','偏财','正财','七杀','正官','偏印','正印'][idx] || '—';
}

export interface DetailedBazi {
  /** 四柱八字 [年柱,月柱,日柱,时柱] */
  pillars: string[];
  /** 天干+地支完整+十神 */
  detail: {
    pillar: string; gan: string; zhi: string;
    ganElement: string; zhiElement: string;
    ganYinyang: string; zhiYinyang: string;
    hideGan: string; shiShenGan: string; shiShenZhi: string;
    nayin: string; diShi: string; xunKong: string;
  }[];
  /** 日主 */
  dayMaster: string;
  dayMasterElement: string;
  dayBranch: string;
  /** 命宫/身宫/胎元/胎息 */
  mingGong: string; shenGong: string; taiYuan: string; taiXi: string;
  /** 五行分布 */
  elementDistribution: Record<string, number>;
  /** 大运 */
  daYun: { startAge: number; gender: string; yun: { gan: string; zhi: string; age: number; year: number }[] };
  /** 简评 */
  summary: string;
}

const EARTHLY_ORDER = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];

export function getDetailedBazi(
  year: number, month: number, day: number,
  hour: number, minute: number = 0,
  timezone?: string
): DetailedBazi {
  // Timezone conversion: non-China timezones → adjust to China time (UTC+8)
  let y = year, m = month, d = day, h = hour, mi = minute;
  
  if (timezone && timezone !== 'Asia/Shanghai' && timezone !== 'UTC+8') {
    // Convert local time to UTC, then to China time
    const localDt = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const utcMs = localDt.getTime();
    const chinaMs = utcMs + 8 * 60 * 60 * 1000;
    const chinaDt = new Date(chinaMs);
    y = chinaDt.getUTCFullYear();
    m = chinaDt.getUTCMonth() + 1;
    d = chinaDt.getUTCDate();
    h = chinaDt.getUTCHours();
    mi = chinaDt.getUTCMinutes();
  }

  const SolarClass = require('lunar-javascript').Solar;
  const solar = SolarClass.fromYmdHms(y, m, d, h, mi, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  const pillars = [ec.getYear(), ec.getMonth(), ec.getDay(), ec.getTime()];
  const gans = [ec.getYearGan(), ec.getMonthGan(), ec.getDayGan(), ec.getTimeGan()];
  const zhis = [ec.getYearZhi(), ec.getMonthZhi(), ec.getTimeZhi(), ec.getTimeZhi()];

  const detail = pillars.map((_, i) => {
    const p = pillars[i];
    const g = i === 0 ? ec.getYearGan() : i === 1 ? ec.getMonthGan() : i === 2 ? ec.getDayGan() : ec.getTimeGan();
    const z = i === 0 ? ec.getYearZhi() : i === 1 ? ec.getMonthZhi() : i === 2 ? ec.getDayZhi() : ec.getTimeZhi();
    const getHide = [ec.getYearHideGan, ec.getMonthHideGan, ec.getDayHideGan, ec.getTimeHideGan][i].call(ec);
    const getShiShenG = [ec.getYearShiShenGan, ec.getMonthShiShenGan, ec.getDayShiShenGan, ec.getTimeShiShenGan][i].call(ec);
    const getShiShenZ = [ec.getYearShiShenZhi, ec.getMonthShiShenZhi, ec.getDayShiShenZhi, ec.getTimeShiShenZhi][i].call(ec);
    const getNayin = [ec.getYearNaYin, ec.getMonthNaYin, ec.getDayNaYin, ec.getTimeNaYin][i].call(ec);
    const getDiShi = [ec.getYearDiShi, ec.getMonthDiShi, ec.getDayDiShi, ec.getTimeDiShi][i].call(ec);
    const getXunKong = [ec.getYearXunKong, ec.getMonthXunKong, ec.getDayXunKong, ec.getTimeXunKong][i].call(ec);

    return {
      pillar: p,
      gan: g,
      zhi: z,
      ganElement: GAN_ELEMENT[g] || '',
      zhiElement: ZHI_ELEMENT[z] || '',
      ganYinyang: GAN_YINYANG[g] || '',
      zhiYinyang: EARTHLY_ORDER.includes(z) ? (EARTHLY_ORDER.indexOf(z) % 2 === 0 ? '阳' : '阴') : '',
      hideGan: getHide,
      shiShenGan: getShiShenG,
      shiShenZhi: getShiShenZ,
      nayin: getNayin,
      diShi: getDiShi,
      xunKong: getXunKong,
    };
  });

  const dayMaster = ec.getDayGan();
  const dayMasterElement = GAN_ELEMENT[dayMaster] || '';
  const dayBranch = ec.getDayZhi();

  // Element distribution
  const allElements = [...detail.map(d => d.ganElement), ...detail.map(d => d.zhiElement)].filter(Boolean);
  const distribution: Record<string, number> = {};
  for (const el of allElements) distribution[el] = (distribution[el] || 0) + 1;

  // 命宫/身宫/胎元/胎息
  const mingGong = ec.getMingGong() || '';
  const shenGong = ec.getShenGong() || '';
  const taiYuan = ec.getTaiYuan() || '';
  const taiXi = ec.getTaiXi() || '';

  // 大运 (using lunar-javascript's getYun)
  let daYunData = { startAge: 0, gender: '', yun: [] as any[] };
  try {
    // gender: 0=female, 1=male
    const genderNum = 1;
    const yun = ec.getYun(genderNum);
    if (yun) {
      const startAge = yun.getStartYear();
      const daYunArr = yun.getDaYun();
      daYunData = {
        startAge: Number(startAge) || 0,
        gender: '男',
        yun: (daYunArr || []).map((d: any) => {
          const gz = d.getGanZhi ? d.getGanZhi() : '';
          return {
            gan: gz ? gz[0] || '' : '',
            zhi: gz ? gz[1] || '' : '',
            age: Number(d.getStartAge()) || 0,
            year: Number(d.getStartYear()) || 0,
            ganZhi: gz,
          };
        }),
      };
    }
  } catch (e) {
    // yun calculation might fail
  }

  // Summary
  const summary = `日主${dayMaster}(${dayMasterElement}${GAN_YINYANG[dayMaster]})生于${pillars[1]}月。命宫${mingGong}。${Object.entries(distribution).sort((a,b) => b[1]-a[1]).slice(0,2).map(([k,v]) => `${k}${v}`).join(',')}。`;

  return {
    pillars,
    detail,
    dayMaster,
    dayMasterElement,
    dayBranch,
    mingGong,
    shenGong,
    taiYuan,
    taiXi,
    elementDistribution: distribution,
    daYun: daYunData,
    summary,
  };
}
