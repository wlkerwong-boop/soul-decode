/**
 * 关系合盘 API - 灵魂共鸣
 *
 * 输入两个人的出生信息，AI分析关系匹配度
 * 包含：五行互补、性格相容、冲突预警、关系时间线
 */
import { NextRequest } from 'next/server';
import { calculateBazi } from '@/lib/bazi';

export const runtime = 'nodejs';

const COMPAT_SYSTEM_PROMPT = `你是关系解码大师。你融合八字合盘、五行生克、心理学相容性理论，分析两个人之间的深层关系。你的风格深刻、诚实、精准，不回避问题，不盲目说好话。

你必须分析以下维度：
1. 五行互补度 — 双方八字中五行是否互补，生克是否平衡
2. 性格相容性 — 基于双方日主和命局，性格是否匹配，矛盾点在哪里
3. 优势互补 — 各自天赋如何互为补充
4. 冲突预警 — 哪些方面最容易产生矛盾，具体触发点是什么
5. 关系时间线 — 关系的不同阶段会面临什么挑战和机遇
6. 成长指南 — 如何让这段关系成为彼此成长的催化剂

回答用中文，Markdown格式。诚实直接，不粉饰太平。`;

function getConfig() {
  const provider = process.env.AI_PROVIDER || 'deepseek';
  const configs: Record<string, { baseUrl: string; apiKey: string; model: string }> = {
    deepseek: {
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      model: process.env.AI_MODEL || 'deepseek-chat',
    },
    openai: {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.AI_MODEL || 'gpt-4o-mini',
    },
  };
  return configs[provider] || configs.deepseek;
}

function buildPrompt(a: any, b: any): string {
  const CY = new Date().getFullYear();
  return `请对以下两个人的关系进行深度合盘分析。

## 用户A
- 八字：${a.pillars.filter((p: string) => p !== '--').join(' ')}
- 日主：${a.dayMaster}（${a.dayMasterElement}）
- 生肖：${a.zodiac}
- 五行分布：${JSON.stringify(a.elementDistribution)}
- 命局简评：${a.summary}

## 用户B
- 八字：${b.pillars.filter((p: string) => p !== '--').join(' ')}
- 日主：${b.dayMaster}（${b.dayMasterElement}）
- 生肖：${b.zodiac}
- 五行分布：${JSON.stringify(b.elementDistribution)}
- 命局简评：${b.summary}

请严格按照以下6个模块输出，每个模块不少于200字：

## 一、缘分解读
一句总括两人的关系本质（用强有力的隐喻，如"烈火遇干柴"、"藤缠树"、"双生火焰"），然后展开解释。

## 二、五行互补度
分析双方五行分布是否互补。谁补谁，哪方面最需要补，哪方面有冲突。

## 三、性格相容性
基于日主五行和命局，分析两人谁主外谁主内，谁更强势，矛盾点在何处。

## 四、优势互补
双方的天赋如何形成合力。在哪些领域合作会事半功倍。

## 五、冲突预警
最容易吵架的3个方面。每个冲突点给出具体触发场景。

## 六、关系成长指南
给这段关系一个整体建议。当前为${CY}年，给出今年的关系关键点。

---
⚠️ 诚实第一：该说合就说合，该说不合就说不合，不要为了讨好用户而说好话。`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personA, personB } = body;

    if (!personA?.year || !personB?.year) {
      return new Response(JSON.stringify({ error: '需要两个人的出生信息' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // 计算双方八字
    const a = calculateBazi(
      parseInt(personA.year), parseInt(personA.month), parseInt(personA.day),
      personA.hour ? parseInt(personA.hour) : undefined,
    );
    const b = calculateBazi(
      parseInt(personB.year), parseInt(personB.month), parseInt(personB.day),
      personB.hour ? parseInt(personB.hour) : undefined,
    );

    const config = getConfig();
    if (!config.apiKey) {
      return new Response(JSON.stringify({ error: 'API key 未配置' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildPrompt(a, b);

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: COMPAT_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 4000,
        stream: true,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `AI API 错误 (${response.status})` }), {
        status: 502, headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) { controller.close(); return; }
        const decoder = new TextDecoder();
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              const t = line.trim();
              if (!t || !t.startsWith('data: ')) continue;
              const d = t.slice(6);
              if (d === '[DONE]') continue;
              try {
                const p = JSON.parse(d);
                const c = p.choices?.[0]?.delta?.content || '';
                if (c) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: c })}\n\n`));
              } catch {}
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        } catch { controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '中断' })}\n\n`)); }
        finally { reader.releaseLock(); controller.close(); }
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
