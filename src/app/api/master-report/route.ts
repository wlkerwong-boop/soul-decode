// 七系统融合报告 API — 人生总览
import { NextRequest, NextResponse } from 'next/server';
import { validateReportBirth } from '@/lib/birth-validation';
import { createRequire } from 'node:module';
import { getBirthCoords } from '@/data/cities';
import { assertHumanDesignResult, calculateBodygraph } from '@/lib/hd';
import { calcPlanetPositions } from '@/lib/astrology';
import {
  buildPersonalReportSegments,
  calculateReportBazi,
  calculateWuyunLiuqi as calculateReportWuyunLiuqi,
  PERSONAL_REPORT_SYSTEM_PROMPT,
  preparePersonalReport,
} from '@/lib/report-depth';
import { buildLifeContext } from '@/lib/lifecycle';
import { calculateReportZiwei, describeReportYear } from '@/lib/report-chart';
import { formatBirthDateForLifecycle } from '@/lib/master-report-input';

const require = createRequire(import.meta.url);
const { assertReportVerified } = require('../../../lib/verify-report-core.mjs');

async function calcHD(y: number, m: number, d: number, h: number, mi: number, tz: string, lat: number, lon: number) {
  const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const ts = `${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`;
  return calculateBodygraph(ds, ts, tz, lat, lon);
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
      Promise.resolve(calculateReportZiwei(y, m, d, h, g)),
      calcPlanetPositions(y, m, d, h, mi, lat, lon, tz),
    ]);
    // 不允许在人类图失败时继续生成“数据暂缺”的完整报告。
    assertHumanDesignResult(hdResult);
    
    const wuyunResult = calculateReportWuyunLiuqi(y);
    const liunianResult = describeReportYear(y, now.getFullYear());
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

    if (!report && !apiKey) console.error('master-report: DEEPSEEK_API_KEY 未配置');
    if (!report && apiKey) {
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
          if (data.choices?.[0]?.finish_reason === 'length') {
            throw new Error(`报告章节 ${segment.id} 被模型截断`);
          }
          const segmentText = String(data.choices?.[0]?.message?.content || '').trim();
          if (segmentText) fullReport += `${fullReport ? '\n\n' : ''}${segmentText}`;
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
