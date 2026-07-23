/**
 * 梅花易数·白话解卦 API（流式返回）
 *
 * 基于 DeepSeek 生成参考风格的现代白话解读
 * 把卦象术语翻译成用户能懂的日常语言和生活建议
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const INTERPRET_SYSTEM_PROMPT = `你是梅花易数的白话解卦师。你能把深奥的卦象语言翻译成现代人一听就懂的生活洞察。

你的风格：
1. 用"你"直接对话，像一位智慧的朋友在帮你分析局面
2. 把卦象术语翻译成日常语言——"天地不交"翻译成"你的才华无法落地"
3. 每个结论都要有具体的人生关联，不空谈理论
4. 善用"这正是……"的句式，让用户觉得卦象说的就是他
5. 语言要有画面感，让人读完能记住

回答使用中文 Markdown。`;

function buildInterpretPrompt(params: {
  userName?: string;
  birthInfo: string;
  // 八字
  pillars: string[];
  dayMaster: string;
  dayMasterElement: string;
  elementDistribution: Record<string, number>;
  // 梅花易数
  primaryName: string;
  primaryJudgment: string;
  changingName: string;
  changingJudgment: string;
  mutualName: string;
  bodyTrigram: string;
  bodyElement: string;
  useTrigram: string;
  useElement: string;
  bodyUseRelation: string;
  movingLine: number;
  sixRelations: string[];
  // 其他
  lifePathNumber?: number;
  zodiac?: string;
}): string {
  return `请根据以下用户的八字命盘和梅花易数卦象，生成一份现代白话解读。

## 用户信息

出生信息：${params.birthInfo}
${params.lifePathNumber ? `生命路径数字：${params.lifePathNumber}` : ''}
生肖：${params.zodiac || '未知'}

## 八字命盘（关键信息）

${params.pillars.filter(p => p !== '--').join(' / ')}
日主：${params.dayMaster}（${params.dayMasterElement}）
五行分布：${Object.entries(params.elementDistribution)
  .map(([el, count]) => `${el}${count}`).join(' ')}

## 梅花易数卦象

本卦：${params.primaryName}
卦辞：「${params.primaryJudgment}」
变卦：${params.changingName}
卦辞：「${params.changingJudgment}」
互卦：${params.mutualName}
动爻：第${params.movingLine}爻
体卦：${params.bodyTrigram}（${params.bodyElement}）
用卦：${params.useTrigram}（${params.useElement}）
体用关系：${params.bodyUseRelation}
六亲分布：${params.sixRelations.join('、')}

---

请按以下结构输出白话解读，每个部分都要有具体的、可感知的生活关联，不要空谈理论：

## 白话解卦

### 一、本卦「${params.primaryName}」：你当下的处境
用现代语言解释本卦的核心含义。这个卦象对应到用户当下的什么状态？用具体的生活场景描述。

### 二、${params.movingLine}爻动：破局的关键
动爻在告诉你什么？用日常语言解释这个爻辞的含义。它指向的行动方向是什么？

### 三、变卦「${params.changingName}」：行动指南
变卦给出了什么方向？用户应该以什么态度行事？具体的行动建议。

### 四、体用关系：${params.bodyUseRelation}
外部环境对你来说是压制还是助力？如果是压制，如何以柔克刚？如果是助力，如何顺势而为？

### 五、给你的一句话
用一句简短有力的话总结——用户现在最需要记住什么？

注：每段控制在150字以内，整篇不超过1200字。语言要像朋友在聊天，不要像教科书。`;
}

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = getConfig();

    if (!config.apiKey) {
      console.error('plum-blossom-interpret: DEEPSEEK_API_KEY 未配置');
      return new Response(JSON.stringify({ error: 'API key 未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildInterpretPrompt(body);

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: INTERPRET_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`DeepSeek API error: ${response.status} ${errorText.slice(0, 300)}`);
      return new Response(JSON.stringify({ error: `AI API 错误 (${response.status})` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 流式返回
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
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch { /* ignore */ }
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '生成中断' })}\n\n`));
        } finally {
          reader?.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('梅花易数解读失败:', error);
    return new Response(JSON.stringify({ error: error.message || '生成失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
