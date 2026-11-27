// 流式七系统报告 API — 边生成边返回
import { NextRequest } from 'next/server';
import { validateReportBirth } from '@/lib/birth-validation';
import { createRequire } from 'node:module';
import { getBirthCoords } from '@/data/cities';
import { assertHumanDesignResult, calculateBodygraph } from '@/lib/hd';
import { calcPlanetPositions } from '@/lib/astrology';
import { takeSseLines } from '@/lib/sse';
import {
  buildPersonalReportSegments,
  buildPersonalReportDataDeclaration,
  calculateReportBazi,
  calculateWuyunLiuqi,
  PERSONAL_REPORT_SYSTEM_PROMPT,
  finalizePersonalReport,
  normalizePersonalReportAudience,
} from '@/lib/report-depth';
import { buildLifeContext } from '@/lib/lifecycle';
import { calculateReportZiwei, describeReportYear } from '@/lib/report-chart';

const require = createRequire(import.meta.url);
const { assertReportVerified } = require('../../../../lib/verify-report-core.mjs');

async function calcHD(y: number, m: number, d: number, h: number, mi: number, tz: string, lat: number, lon: number) {
  const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const ts = `${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`;
  return calculateBodygraph(ds, ts, tz, lat, lon);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!validateReportBirth(body)) return Response.json({ error: '出生日期或时间无效，请检查输入。' }, { status: 400 });
  const { year, month, day, hour, location, gender, timezone } = body;
  const y = parseInt(year), m = parseInt(month), d = parseInt(day), h = hour === undefined || hour === null || hour === "" ? 12 : parseInt(hour);
  const mi = parseInt(body.minute) || 0;
  const tz = timezone || 'Asia/Shanghai';
  const { lat, lon } = getBirthCoords(body.city, location);
  const g = gender === '女' ? '女' : '男';
  const now = new Date();
  const life = buildLifeContext({
    birthDate: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    deathDate: body.deathDate,
    analysisDate: body.analysisDate || now,
    lifeStatus: body.lifeStatus,
    timeConfidence: hour === undefined || hour === null || hour === '' ? 'unknown' : body.timeConfidence,
  });
  // 生成日志仅记录运行状态与耗时，不记录出生资料或 IP。
  const startedAt = Date.now();
  const logLine = (status: string, extra = '') =>
    console.log(`[report-gen] ${new Date().toISOString()} status=${status} ${extra} ${Math.round((Date.now() - startedAt) / 1000)}s`);

  // 计算所有数据
  const baziResult = calculateReportBazi(y, m, d, h, mi);
  let hdResult: any;
  try {
    hdResult = await calcHD(y, m, d, h, mi, tz, lat, lon);
    assertHumanDesignResult(hdResult);
  } catch (error: any) {
    console.error('HD calc failed; report generation stopped:', error?.message || error);
    return new Response(JSON.stringify({ error: '人类图引擎暂时不可用，请稍后重试。' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const ziweiResult = calculateReportZiwei(y, m, d, h, g);
  const astrologyResult = await calcPlanetPositions(y, m, d, h, mi, lat, lon, tz);
  const wuyunResult = calculateWuyunLiuqi(y);
  const liunianResult = describeReportYear(y);

  const reportContext = {
    age: life.age ?? 0,
    life,
    gender: g,
    birth: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`,
    location: [location, body.city].filter(Boolean).join(' ') || '未提供',
    bazi: baziResult,
    hd: hdResult,
    ziwei: ziweiResult,
    astrology: astrologyResult,
    wuyun: wuyunResult,
    liunian: liunianResult,
  };
  const reportSegments = buildPersonalReportSegments(reportContext);
  const resultData = {
    bazi: baziResult,
    hd: hdResult ? { type: hdResult.type, profile: hdResult.profile, authority: hdResult.authority, strategy: hdResult.strategy, definedCenters: hdResult.definedCenters, channels: hdResult.channels, activatedGates: hdResult.activatedGates } : null,
    ziwei: ziweiResult ? { palaces: ziweiResult.palaces, horoscope: ziweiResult.horoscope, sihua: ziweiResult.sihua } : null,
    zodiac: astrologyResult,
    wuyun: wuyunResult,
    liunian: liunianResult,
    life,
  };

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com/v1';
  // 生产故障修复 2026-08-15（根因）：DeepSeek V4 系列默认开启 thinking 模式，
  // 思考链会吃光 max_tokens（3500）导致正文 content 输出 0 字（HTTP 200 但空报告）。
  // 正确做法：官方模型名 deepseek-v4-flash + 显式关闭 thinking。
  // （勿用 deepseek-chat 别名：2026-07-24 曾被 DeepSeek 废弃返回 400，随时可能再变。）
  const modelName = process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  // 创建流式响应
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let reportText = '';
        // K3 加固条款：引擎注入「## 0. 排盘数据声明」节，AI 只写第 1 节起叙事
        const declaration = buildPersonalReportDataDeclaration(reportContext);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: declaration })}\n\n`));
        reportText += declaration;
        for (const [index, segment] of reportSegments.entries()) {
          if (index > 0) {
            reportText += '\n\n';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '\n\n' })}\n\n`));
          }
          const res = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: modelName,
              messages: [
                { role: 'system', content: PERSONAL_REPORT_SYSTEM_PROMPT },
                { role: 'user', content: segment.prompt },
              ],
              max_tokens: segment.maxTokens,
              temperature: 0.65,
              stream: true,
              // V4 默认 thinking 会吃光 max_tokens 导致正文为空，报告场景显式关闭
              thinking: { type: 'disabled' },
            }),
          });

          if (!res.ok) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `DeepSeek API error: ${res.status} (${segment.id})` })}\n\n`));
            controller.close();
            return;
          }

          const reader = res.body?.getReader();
          if (!reader) throw new Error(`No response body (${segment.id})`);
          const decoder = new TextDecoder();
          let buffer = '';
          let truncated = false;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const parsedLines = takeSseLines(buffer);
            const lines = parsedLines.lines;
            buffer = parsedLines.remainder;
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const payload = line.slice(6).trim();
              if (payload === '[DONE]') continue;
              try {
                const parsed = JSON.parse(payload);
                if (parsed.choices?.[0]?.finish_reason === 'length') truncated = true;
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  const safeContent = normalizePersonalReportAudience(content);
                  reportText += safeContent;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: safeContent })}\n\n`));
                }
              } catch {}
            }
          }
          for (const line of takeSseLines(buffer, true).lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') continue;
            try {
              const parsed = JSON.parse(payload);
              if (parsed.choices?.[0]?.finish_reason === 'length') truncated = true;
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                const safeContent = normalizePersonalReportAudience(content);
                reportText += safeContent;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: safeContent })}\n\n`));
              }
            } catch {}
          }
          if (truncated) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `报告章节 ${segment.id} 内容被截断，请重新生成` })}\n\n`));
            controller.close();
            return;
          }
        }

        // reportContext 由外层（127 行）统一构造，此处复用（含声明节注入）
        const safeReportText = finalizePersonalReport(reportText, reportContext);
        if (safeReportText !== reportText) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: safeReportText.slice(reportText.length) })}\n\n`));
        }

        // 事实层护栏（任务3 fail-closed）：流式已发出内容无法撤回，
        // 校验失败时在 done 帧前补发 verify_error，客户端应判失败不落盘
        try {
          assertReportVerified(safeReportText, { hd: hdResult, bazi: baziResult });
        } catch (verifyError: any) {
          logLine('verify-fail', `issues=${(verifyError?.issues || []).map((i: any) => i.rule).join(',')}`);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            verify_error: verifyError?.message || '报告事实层校验未通过',
            issues: verifyError?.issues || [],
          })}\n\n`));
          controller.close();
          return;
        }

        // Send final data payload
        logLine('success', `chars=${safeReportText.length}`);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, ...resultData })}\n\n`));
        controller.close();
      } catch (e: any) {
        logLine('error');
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: e.message || 'Stream error' })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
