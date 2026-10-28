// 七系统融合报告 API — 人生总览
import { NextRequest, NextResponse } from 'next/server';
import { validateReportBirth } from '@/lib/birth-validation';
import { createRequire } from 'node:module';
import { getBirthCoords } from '@/data/cities';
import { assertHumanDesignResult, calculateBodygraph } from '@/lib/hd';
import {
  buildPersonalReportSegments,
  calculateReportBazi,
  calculateWuyunLiuqi as calculateReportWuyunLiuqi,
  PERSONAL_REPORT_SYSTEM_PROMPT,
  preparePersonalReport,
} from '@/lib/report-depth';
import { buildLifeContext } from '@/lib/lifecycle';
import { formatBirthDateForLifecycle } from '@/lib/master-report-input';

const require = createRequire(import.meta.url);
const { assertReportVerified } = require('../../../lib/verify-report-core.mjs');

async function calcHD(y: number, m: number, d: number, h: number, mi: number, tz: string, lat: number, lon: number) {
  const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const ts = `${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`;
  return calculateBodygraph(ds, ts, tz, lat, lon);
}

function calcZiwei(y: number, m: number, d: number, h: number, gender: string) {
  try {
    const iztro = require('iztro');
    const ti = Math.floor((h + 1) / 2) % 12;
    const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const r = iztro.astro.bySolar(ds, ti, gender, true, 'zh-CN');
    if (!r?.palaces) return null;

    // 重排 palaces 为命宫/兄弟/... 标准顺序
    const STD_ORDER = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母'];
    const map = new Map<string, any>();
    for (const p of r.palaces) {
      // iztro 部分版本宫名以"宫"结尾（如"命宫宫"），标准化
      const key = p.name === '命宫宫' ? '命宫' : p.name;
      map.set(key, p);
    }
    if (!map.has('交友') && map.has('仆役')) map.set('交友', map.get('仆役'));

    return {
      palaces: STD_ORDER.map(name => {
        const p = map.get(name);
        if (!p) return { name, stars: [] };
        return {
          name,
          stars: [...((p.majorStars||[]).map((s:any) => typeof s==='object'?s.name:s)),
                  ...((p.minorStars||[]).map((s:any) => typeof s==='object'?s.name:s))].filter(Boolean),
        };
      }),
      horoscope: r.horoscope || null,
    };
  } catch { return null; }
}

function calcZodiac(y: number, m: number, d: number) {
  const signs: [number, number, string][] = [
    [1,20,'水瓶'],[2,19,'双鱼'],[3,21,'白羊'],[4,20,'金牛'],
    [5,21,'双子'],[6,21,'巨蟹'],[7,23,'狮子'],[8,23,'处女'],
    [9,23,'天秤'],[10,23,'天蝎'],[11,22,'射手'],[12,22,'摩羯'],
  ];
  for (let i = signs.length - 1; i >= 0; i--) {
    if (m > signs[i][0] || (m === signs[i][0] && d >= signs[i][1])) {
      return { sunSign: signs[i][2], zodiac: signs[i][2] + '座' };
    }
  }
  return { sunSign: '摩羯', zodiac: '摩羯座' };
}

function calcWuyunLiuqi(y: number) {
  // 五运：天干化运
  const stem = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'][(y-4) % 10];
  const stemYun: Record<string, string> = {甲:'土运',乙:'金运',丙:'水运',丁:'木运',戊:'火运',己:'土运',庚:'金运',辛:'水运',壬:'木运',癸:'火运'};
  // 六气：地支化气
  const branch = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][(y-4) % 12];
  const branchQi: Record<string, string> = {子:'少阴君火',丑:'太阴湿土',寅:'少阳相火',卯:'阳明燥金',辰:'太阳寒水',巳:'厥阴风木',午:'少阴君火',未:'太阴湿土',申:'少阳相火',酉:'阳明燥金',戌:'太阳寒水',亥:'厥阴风木'};
  return {
    year: y,
    stem, branch,
    wuyun: `${stem}年 → ${stemYun[stem]}`,
    liuqi: `${branch}年 → ${branchQi[branch]}`,
    description: `${y}年天干为${stem}，主${stemYun[stem]}；地支为${branch}，主${branchQi[branch]}。${stemYun[stem]}之年，${branchQi[branch]}为司天之气。`,
  };
}

function calcLiuNian(y: number, curYear: number) {
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const birthStem = stems[(y - 4) % 10];
  const birthBranch = branches[(y - 4) % 12];
  const curStem = stems[(curYear - 4) % 10];
  const curBranch = branches[(curYear - 4) % 12];
  return `出生：${birthStem}${birthBranch}年 | 当前流年：${curStem}${curBranch}年（${curYear}年）`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!validateReportBirth(body)) return NextResponse.json({ success: false, error: '出生日期或时间无效，请检查输入。' }, { status: 400 });
    const { year, month, day, hour, location, gender, timezone } = body;
    const y=parseInt(year), m=parseInt(month), d=parseInt(day), h=hour === undefined || hour === null || hour === '' ? 12 : parseInt(hour);
    const mi = parseInt(body.minute) || 0;
    const tz = timezone || 'Asia/Shanghai';
    const { lat, lon } = getBirthCoords(body.city, location);
    const g = gender === '女' ? '女' : '男';
    const now = new Date();
    const life = buildLifeContext({
      birthDate: formatBirthDateForLifecycle(y, m, d),
      deathDate: body.deathDate,
      analysisDate: body.analysisDate || now,
      lifeStatus: body.lifeStatus,
      timeConfidence: hour === undefined || hour === null || hour === '' ? 'unknown' : body.timeConfidence,
    });
    const age = life.age ?? 0;

    // 并行计算全部7个系统
    const [baziResult, hdResult, ziweiResult, zodiacResult] = await Promise.all([
      Promise.resolve(calculateReportBazi(y, m, d, h, mi)),
      Promise.resolve(calcHD(y, m, d, h, mi, tz, lat, lon)),
      Promise.resolve(calcZiwei(y, m, d, h, g)),
      Promise.resolve(calcZodiac(y, m, d)),
    ]);
    // 不允许在人类图失败时继续生成“数据暂缺”的完整报告。
    assertHumanDesignResult(hdResult);
    
    const wuyunResult = calculateReportWuyunLiuqi(y);
    const liunianResult = calcLiuNian(y, now.getFullYear());
    const reportContext = {
      age,
      life,
      gender: g,
      birth: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`,
      location: [body.location, body.city].filter(Boolean).join(' ') || '未提供',
      bazi: baziResult,
      hd: hdResult,
      ziwei: ziweiResult,
      astrology: zodiacResult,
      wuyun: wuyunResult,
      liunian: liunianResult,
    };

    // 与流式入口共用同一组分段提示词及事实校验。
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com/v1';
    let report = '';

    if (!apiKey) console.error('master-report: DEEPSEEK_API_KEY 未配置');
    if (apiKey) {
      try {
        // 与 stream 通道完全一致：三段生成 + finalize（2026-08-16 统一手机/桌面质量）
        const modelName = process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';
        const elMap: Record<string, string> = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
        const elementDistribution: Record<string, number> = {};
        baziResult.pillars.forEach((p: string) => {
          [...p].forEach((ch: string) => {
            const wx = elMap[ch];
            if (wx) elementDistribution[wx] = (elementDistribution[wx] || 0) + 1;
          });
        });
        const localReportContext = { ...reportContext, bazi: { ...baziResult, elementDistribution } };
        const segments = buildPersonalReportSegments(localReportContext);
        let fullReport = '';
        for (const segment of segments) {
          const res = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: modelName,
              ...(String(modelName).includes('deepseek') || String(modelName).includes('v4') ? { thinking: { type: 'disabled' } } : {}),
              messages: [
                { role: 'system', content: PERSONAL_REPORT_SYSTEM_PROMPT },
                { role: 'user', content: segment.prompt },
              ],
              max_tokens: segment.maxTokens,
              temperature: 0.7,
              stream: false,
            }),
            signal: AbortSignal.timeout(180000),
          });
          if (!res.ok) {
            const errText = await res.text().catch(() => '');
            console.error(`DeepSeek API error: ${res.status} ${segment.id} ${errText.slice(0, 200)}`);
            break;
          }
          const data = await res.json();
          fullReport += data.choices?.[0]?.message?.content || '';
        }
        if (fullReport.length > 500) {
          // 引擎注入「## 0. 排盘数据声明」节（K3 加固条款：AI 不写数字/列表）
          report = preparePersonalReport(fullReport, localReportContext);
        }
      } catch (e) {
        console.error('DeepSeek fallback error:', (e as Error).message);
      }
    }

    if (!report || !report.trim()) {
      return NextResponse.json({ success: false, error: '报告生成失败：报告内容为空，请稍后重试' }, { status: 502 });
    }

    // 事实层护栏（任务3 fail-closed）：校验不过 → 报错重生成，禁止带病交付
    try {
      assertReportVerified(report, {
        hd: hdResult,
        bazi: baziResult,
      });
    } catch (verifyError: any) {
      console.error('报告事实层校验未通过，拒绝交付:', verifyError?.issues?.map((i: any) => i.message).join('; ') || verifyError?.message);
      return NextResponse.json({ success: false, error: verifyError?.message || '报告事实层校验未通过' }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      report,
      data: {
        bazi: baziResult,
        hd: hdResult ? { type: hdResult.type, profile: hdResult.profile, authority: hdResult.authority, strategy: hdResult.strategy, definedCenters: hdResult.definedCenters, activatedGates: hdResult.activatedGates, channels: hdResult.channels } : null,
        ziwei: ziweiResult ? { palaces: ziweiResult.palaces } : null,
        zodiac: zodiacResult,
        wuyun: wuyunResult,
        liunian: liunianResult,
        life,
      },
    });
  } catch (e: any) {
    const status = e?.name === 'HumanDesignEngineError' ? 503 : 500;
    return NextResponse.json({ success: false, error: e.message }, { status });
  }
}
