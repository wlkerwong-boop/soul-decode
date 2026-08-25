/**
 * 关系合盘 API - 灵魂共鸣
 *
 * 输入两个人的出生信息，AI分析关系匹配度
 * 包含：五行互补、性格相容、冲突预警、关系时间线
 */
import { NextRequest } from 'next/server';
import { createRequire } from 'node:module';
import { assertHumanDesignResult, calculateBodygraph } from '@/lib/hd';
import { CITY_TZ } from '@/data/cities';
import {
  buildCompatibilitySegments,
  buildFamilyDataDeclaration,
  COMPATIBILITY_SYSTEM_PROMPT,
  normalizeCompatibilityAudience,
  shouldRetryCompatibilityVerification,
  validateCompatibilityInput,
  type CompatibilityMember,
} from '@/lib/compatibility-depth';
import { buildLocalCompatibilityReport } from '@/lib/compatibility-fallback';
import { calculateAuthoritativeBazi } from '@/lib/bazi-authoritative';

const require = createRequire(import.meta.url);
const { assertReportVerified } = require('../../../lib/verify-report-core.mjs');

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

    const compatibilityType = type || 'couple';
    const inputError = validateCompatibilityInput(personList, compatibilityType);
    if (inputError) {
      return new Response(JSON.stringify({ error: inputError }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const labels = compatibilityType === 'family'
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

    const segments = buildCompatibilitySegments(members, compatibilityType);
    const verificationTruth = {
      compatibilityType,
      members: members.map((member) => ({
        label: member.label,
        bazi: member.bazi,
        elementDistribution: member.elementDistribution,
        hd: member.hd,
      })),
      hd: { channels: members.flatMap((member) => member.hd?.channels || []) },
      bazi: { pillars: members.map((member) => member.bazi.split(' ')).flat() },
    };

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // K3 加固条款：引擎注入「## 0. 排盘数据声明」节，AI 只写第 1 节起叙事
          const declaration = buildFamilyDataDeclaration(members, compatibilityType);
          for (let verificationAttempt = 0; verificationAttempt <= 2; verificationAttempt += 1) {
            let reportText = declaration;
            const acceptedChunks = [declaration];
            try {
              for (const segment of segments) {
            let segmentText = '';
            let upstreamError = '';
            const segmentPrompt = verificationAttempt > 0
              ? `${segment.prompt}\n\n这是第${verificationAttempt}次质量重生成：请把全文中的“他/她”逐处替换为对应成员标签，完成全文检索与自查后再交付。`
              : segment.prompt;
            const response = await fetch(`${config.baseUrl}/chat/completions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
              body: JSON.stringify({
                model: config.model,
...(String(config.model).includes('deepseek') || String(config.model).includes('v4') ? { thinking: { type: 'disabled' } } : {}),
                messages: [
                  { role: 'system', content: COMPATIBILITY_SYSTEM_PROMPT },
                  { role: 'user', content: segmentPrompt },
                ],
                temperature: 0.7,
                max_tokens: segment.maxTokens,
                stream: false,
                }),
              signal: AbortSignal.timeout(180000),
              });
              if (!response.ok) {
              const detail = await response.text().catch(() => '');
              console.error(`compatibility upstream error ${response.status} ${segment.id}: ${detail.slice(0, 300)}`);
              throw new Error(`AI API 错误 (${response.status}, ${segment.id})`);
            }
            const payload = await response.json();
            if (payload.error?.message) upstreamError = String(payload.error.message);
            segmentText = normalizeCompatibilityAudience(payload.choices?.[0]?.message?.content || '');
            // 🔒 免责声明去重：AI 常按 system prompt 在段 1 末尾额外写免责（粗体），
            // 剥掉中间出现的，统一只保留报告最后 1 次（由最终章节输出）。
            if (segment.id === 'compat-foundation') {
              segmentText = segmentText.replace(/\*{0,2}仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议\*{0,2}/g, '');
            }
            if (segmentText) {
              reportText += segmentText;
              acceptedChunks.push(segmentText);
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
                    { role: 'user', content: segmentPrompt },
                  ],
                  temperature: 0.7,
                  max_tokens: segment.maxTokens,
                  stream: false,
                }),
                  signal: AbortSignal.timeout(180000),
                });
                if (!retry.ok) {
                const detail = await retry.text().catch(() => '');
                console.error(`compatibility retry error ${retry.status} ${segment.id}: ${detail.slice(0, 300)}`);
                throw new Error(`AI重试失败 (${retry.status}, ${segment.id})`);
              }
              const retryPayload = await retry.json();
              if (retryPayload.error?.message) throw new Error(`AI重试返回错误 (${segment.id}): ${retryPayload.error.message}`);
              let retryText = normalizeCompatibilityAudience(retryPayload.choices?.[0]?.message?.content || '');
              if (!retryText.trim()) throw new Error(`AI未返回合盘正文 (${segment.id})`);
              if (segment.id === 'compat-foundation') {
                // 重试路径同样剥除段 1 的多余免责声明（与上方主路径一致）
                retryText = retryText.replace(/\*{0,2}仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议\*{0,2}/g, '');
              }
              reportText += retryText;
              acceptedChunks.push(retryText);
            }
          }
          const completionMarker = compatibilityType === 'family' ? '## 7.' : '## 5.';
          if (!reportText.includes(completionMarker) || !reportText.includes('仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议')) {
            throw new Error(`${compatibilityType === 'family' ? '家庭' : '双方'}合盘报告未完整生成：缺少最终章节或免责声明`);
          }
          assertReportVerified(reportText, verificationTruth);
          for (const content of acceptedChunks) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          return;
            } catch (verificationError: any) {
              if (shouldRetryCompatibilityVerification(compatibilityType, verificationError?.issues, verificationAttempt)) {
                console.warn(`合盘报告仅命中代词闸门，自动重生成 ${verificationAttempt + 1}/2`);
                continue;
              }
              throw verificationError;
            }
          }
        } catch (error: any) {
          if (compatibilityType === 'family') {
            const fallback = buildLocalCompatibilityReport(members, 'family');
            try {
              if (!fallback.includes('## 7.') || !fallback.includes('仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议')) {
                throw new Error('结构化家庭合盘缺少最终章节或免责声明');
              }
              assertReportVerified(fallback, verificationTruth);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: fallback, source: 'structured-fallback' })}\n\n`));
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, source: 'structured-fallback' })}\n\n`));
            } catch (fallbackError: any) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: fallbackError?.message || '合盘报告质量校验未通过' })}\n\n`));
            }
          } else {
            const errorPayload = {
              error: error.message || '中断',
              ...(error?.issues ? { verify_error: error.message || '报告事实层校验未通过', issues: error.issues } : {}),
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorPayload)}\n\n`));
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
