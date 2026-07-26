/**
 * 关系合盘 API - 灵魂共鸣
 *
 * 输入两个人的出生信息，AI分析关系匹配度
 * 包含：五行互补、性格相容、冲突预警、关系时间线
 */
import { NextRequest } from 'next/server';
import { calculateBodygraph } from '@/lib/hd';
import { getBirthCoords, CITY_TZ } from '@/data/cities';
import { calculateReportBazi } from '@/lib/report-depth';
import {
  buildCompatibilitySegments,
  COMPATIBILITY_SYSTEM_PROMPT,
  type CompatibilityMember,
} from '@/lib/compatibility-depth';

export const runtime = 'nodejs';

function getConfig() {
  const provider = process.env.AI_PROVIDER || 'deepseek';
  const configs: Record<string, { baseUrl: string; apiKey: string; model: string }> = {
    deepseek: {
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      model: process.env.AI_MODEL || 'deepseek-v4-pro',
    },
    openai: {
      baseUrl: 'https://api.openai.com/v1',
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
    const members: CompatibilityMember[] = await Promise.all(personList.map(async (person: any, index: number) => {
      const year = parseInt(person.year);
      const month = parseInt(person.month);
      const day = parseInt(person.day);
      const hour = parseInt(person.hour) || 12;
      const minute = parseInt(person.minute) || 0;
      const bazi = calculateReportBazi(year, month, day, hour);
      const { lat, lon } = getBirthCoords(person.city, person.location);
      const timezone = person.timezone || CITY_TZ[person.city] || 'Asia/Shanghai';
      let hd = null;
      try {
        hd = await calculateBodygraph(
          `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
          timezone,
          lat,
          lon,
        );
      } catch {}
      return {
        label: labels[index],
        age: currentYear - year,
        bazi: bazi.pillars.join(' '),
        elementDistribution: bazi.elementDistribution,
        hd: hd ? { type: hd.type, profile: hd.profile, authority: hd.authority, channels: hd.channels } : null,
      };
    }));

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
        try {
          for (const segment of segments) {
            const response = await fetch(`${config.baseUrl}/chat/completions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
              body: JSON.stringify({
                model: config.model,
                messages: [
                  { role: 'system', content: COMPATIBILITY_SYSTEM_PROMPT },
                  { role: 'user', content: segment.prompt },
                ],
                temperature: 0.7,
                max_tokens: segment.maxTokens,
                stream: true,
              }),
            });
            if (!response.ok) throw new Error(`AI API 错误 (${response.status}, ${segment.id})`);
            const reader = response.body?.getReader();
            if (!reader) throw new Error(`AI无响应 (${segment.id})`);
            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              for (const line of lines) {
                const text = line.trim();
                if (!text.startsWith('data: ')) continue;
                const payload = text.slice(6);
                if (payload === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(payload);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                } catch {}
              }
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        } catch (error: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message || '中断' })}\n\n`));
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
