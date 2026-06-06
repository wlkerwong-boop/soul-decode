/**
 * AI 深度报告生成 API（流式返回）
 *
 * 使用 DeepSeek API 的 streaming 模式，逐块返回报告内容
 * 浏览器可以逐字显示，减少等待感
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// Master system prompt
const MASTER_SYSTEM_PROMPT = `你是一位灵魂解码者。你融合心理学原型理论、生命数字学、东方命理逻辑与人生模式分析学。你的解读风格诚实、深刻、精准，绝不泛泛而谈。你像一个认识用户多年的导师，能看穿他们深层的性格、隐藏的优势与弱点、人生的核心使命与课题。

你的每次回复，都需要让用户产生一种"这说的就是我"的震撼感。你必须避免模棱两可的套话，而是给出针对性的、可落地的洞察与指引。

语言要求：
1. 使用"你"作为称呼，直接面向用户对话
2. 诚实不回避，指出弱点时必须直接，不可温和化处理
3. 善用隐喻和画面感强的语言，有诗意与力量感
4. 以肯定句为主，避免"你可能"、"或许"，多用"你是"、"你注定"、"你的使命是"
5. 每个模块结尾，需有一句掷地有声、鼓舞用户行动的话语

回答必须使用中文，用 Markdown 格式排版。`;

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

function buildReportPrompt(userContext: string): string {
  return `请根据以下用户信息，生成一份完整的【灵魂解码】人生使命解读报告。

${userContext}

报告需严格按照以下6个模块的结构输出：

## 一、核心性格解码
- 核心生命路径数字解读
- 外显性格与内隐性格的矛盾与张力
- 深层人格构造描述

## 二、隐藏优势与弱点
- 三大隐藏优势（命名如"第一刃/第二刃/第三刃"）
- 三大致命弱点（与优势一一对应，注明是哪个优势的阴影面）
- 此生核心功课（一个关键词+解释）

## 三、职业天赋与道路
- 职业天赋三把利刃
- 决策风格
- 深层职业动机
- 三条适配道路（含具体方向+成功关键）
- 一个必须避免的领域（含预警信号）

## 四、爱情与关系解码
- 最相容的人类型（2-3类）
- 需要学习的爱情功课（2-3个）
- 关系在人生中的角色定位
- 精准伴侣画像

## 五、财富密码解码
- 天生财务个性原型
- 阻碍财富的隐蔽错误（2-3个）
- 真正适合的财富策略（2-3个）
- 财富年龄阶段指引
- 地理机遇区域

## 六、人生时间线与年度指引
- 过去阶段回顾（2-3个关键阶段）
- 当下核心转折点
- 起当前年份起未来5年逐年拆解（每年含：年度主题、道路方向、关键行动、成长标志）

请用 Markdown 格式输出完整报告。`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, location, gender, timezone } = body;

    if (!year || !month || !day) {
      return new Response(JSON.stringify({ error: '请填写完整的出生日期' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const config = getConfig();
    if (!config.apiKey) {
      return new Response(JSON.stringify({ error: 'API key 未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 构建用户上下文（简化版，不需要重复计算 numerology/bazi）
    const userContextLines = [
      `【出生信息】`,
      `出生日期：${year}年${month}月${day}日`,
      hour ? `出生时辰：${hour}时` : '',
      location ? `出生地点：${location}` : '',
      gender ? `性别：${gender}` : '',
      timezone ? `时区：${timezone}` : '',
    ].filter(Boolean).join('\n');

    const prompt = buildReportPrompt(userContextLines);

    // 调用 DeepSeek streaming API
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: MASTER_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 4000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
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
        if (!reader) {
          controller.close();
          return;
        }

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
              } catch {
                // ignore parse errors for partial chunks
              }
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '生成中断' })}\n\n`));
        } finally {
          reader.releaseLock();
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
    console.error('报告生成失败:', error);
    return new Response(JSON.stringify({ error: error.message || '生成失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
