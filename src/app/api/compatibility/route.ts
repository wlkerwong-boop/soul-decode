/**
 * 关系合盘 API - 灵魂共鸣
 *
 * 输入两个人的出生信息，AI分析关系匹配度
 * 包含：五行互补、性格相容、冲突预警、关系时间线
 */
import { NextRequest } from 'next/server';
import { assertHumanDesignResult, calculateBodygraph } from '@/lib/hd';
import { CITY_TZ } from '@/data/cities';
import {
  buildCompatibilitySegments,
  COMPATIBILITY_SYSTEM_PROMPT,
  normalizeCompatibilityAudience,
  type CompatibilityMember,
} from '@/lib/compatibility-depth';
import { buildLocalCompatibilityReport } from '@/lib/compatibility-fallback';
import { calculateAuthoritativeBazi } from '@/lib/bazi-authoritative';

export const runtime = 'nodejs';

function getConfig() {
  const provider = process.env.AI_PROVIDER || 'deepseek';
  const configs: Record<string, { baseUrl: string; apiKey: string; model: string }> = {
    deepseek: {
      baseUrl: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      model: process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
    },
    openai: {
      baseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.AI_MODEL || 'gpt-4o-mini',
    },
  };
  return configs[provider] || configs.deepseek;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { persons, type } = body;

    // Support both old format (personA/personB) and new format (persons[])
    let personList: any[];
    if (persons && Array.isArray(persons)) {
      personList = persons;
    } else if (body.personA && body.personB) {
      personList = [body.personA, body.personB];
    } else {
      return new Response(JSON.stringify({ error: '需要至少两个人的出生信息' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    if (personList.length < 2) {
      return new Response(JSON.stringify({ error: '需要至少两个人的出生信息' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const labels = type === 'family'
      ? ['本人', '伴侣', ...Array.from({ length: personList.length - 2 }, (_, i) => `孩子${i + 1}`)]
      : personList.map((_: any, i: number) => i === 0 ? '用户A' : `用户${String.fromCharCode(65 + i)}`);
    const currentYear = new Date().getFullYear();
    // The HD WASM engine is stateful; concurrent calculations can deadlock on
    // a five-person family request. Calculate one member at a time.
    const members: CompatibilityMember[] = [];
    for (const [index, person] of personList.entries()) {
      const year = parseInt(person.year);
      const month = parseInt(person.month);
      const day = parseInt(person.day);
      const hour = parseInt(person.hour) || 12;
      const minute = parseInt(person.minute) || 0;
      const timezone = person.timezone || CITY_TZ[person.city] || 'Asia/Shanghai';
      const bazi = calculateAuthoritativeBazi(year, month, day, hour, minute, timezone);
      const hd = await calculateBodygraph(
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        timezone,
        0,
        0,
      );
      assertHumanDesignResult(hd);
      members.push({
        label: person.name || labels[index],
        age: currentYear - year,
        bazi: bazi.pillars.join(' '),
        elementDistribution: bazi.elementDistribution,
        hd: hd ? { type: hd.type, profile: hd.profile, authority: hd.authority, channels: hd.channels } : null,
      });
    }

    const config = getConfig();
    if (!config.apiKey) {
      console.error('compatibility: DEEPSEEK_API_KEY 未配置');
      return new Response(JSON.stringify({ error: 'API key 未配置' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    const segments = buildCompatibilitySegments(members, type || 'couple');

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let reportText = '';
        try {
          for (const segment of segments) {
            let segmentText = '';
            let upstreamError = '';
            const response = await fetch(`${config.baseUrl}/chat/completions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
              body: JSON.stringify({
                model: config.model,
...(String(config.model).includes('deepseek') || String(config.model).includes('v4') ? { thinking: { type: 'disabled' } } : {}),
                messages: [
                  { role: 'system', content: COMPATIBILITY_SYSTEM_PROMPT },
                  { role: 'user', content: segment.prompt },
                ],
                temperature: 0.7,
                max_tokens: segment.maxTokens,
                stream: false,
                }),
              signal: AbortSignal.timeout(15000),
            });
            if (!response.ok) {
              const detail = await response.text().catch(() => '');
              console.error(`compatibility upstream error ${response.status} ${segment.id}: ${detail.slice(0, 300)}`);
              throw new Error(`AI API 错误 (${response.status}, ${segment.id})`);
            }
            const payload = await response.json();
            if (payload.error?.message) upstreamError = String(payload.error.message);
            segmentText = normalizeCompatibilityAudience(payload.choices?.[0]?.message?.content || '');
            if (segmentText) {
              reportText += segmentText;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: segmentText })}\n\n`));
            }

            // DeepSeek occasionally closes an empty streamed segment. Retry the
            // same segment once in non-stream mode instead of falsely reporting
            // a complete family report with only its first half.
            if (!segmentText.trim() && upstreamError) {
              throw new Error(`AI返回错误 (${segment.id}): ${upstreamError}`);
            }
            if (!segmentText.trim()) {
              const retry = await fetch(`${config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
                body: JSON.stringify({
                  model: config.model,
...(String(config.model).includes('deepseek') || String(config.model).includes('v4') ? { thinking: { type: 'disabled' } } : {}),
                  messages: [
                    { role: 'system', content: COMPATIBILITY_SYSTEM_PROMPT },
                    { role: 'user', content: segment.prompt },
                  ],
                  temperature: 0.7,
                  max_tokens: segment.maxTokens,
                  stream: false,
                }),
                signal: AbortSignal.timeout(15000),
              });
              if (!retry.ok) {
                const detail = await retry.text().catch(() => '');
                console.error(`compatibility retry error ${retry.status} ${segment.id}: ${detail.slice(0, 300)}`);
                throw new Error(`AI重试失败 (${retry.status}, ${segment.id})`);
              }
              const retryPayload = await retry.json();
              if (retryPayload.error?.message) throw new Error(`AI重试返回错误 (${segment.id}): ${retryPayload.error.message}`);
              const retryText = normalizeCompatibilityAudience(retryPayload.choices?.[0]?.message?.content || '');
              if (!retryText.trim()) throw new Error(`AI未返回合盘正文 (${segment.id})`);
              reportText += retryText;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: retryText })}\n\n`));
            }
          }
          if (type === 'family' &&
            (!reportText.includes('## 7.') || !reportText.includes('仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议'))) {
            throw new Error('家庭合盘报告未完整生成：缺少第7节使用边界或免责声明');
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        } catch (error: any) {
          if (type === 'family') {
            const fallback = buildLocalCompatibilityReport(members, 'family');
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: fallback, source: 'structured-fallback' })}\n\n`));
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, source: 'structured-fallback' })}\n\n`));
          } else {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message || '中断' })}\n\n`));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
