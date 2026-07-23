/**
 * 流年详批 + 成长方案 API（流式返回）
 *
 * 融合八字排盘 + 梅花易数 + AI，生成可落地的年度成长方案
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const GROWTH_SYSTEM_PROMPT = `你是人生成长规划师。你融合东方命理（八字、梅花易数）、心理学原型与人生规划方法论。

你的任务是：基于用户的八字命盘和当前流年信息，生成一份**可落地实操的年度成长方案**。

=== 铁律 ===

1. 绝对诚实——指出用户的短板和成长盲区时，不可温和化处理
2. 方案必须可落地——每条建议都必须是用户明天就能开始做的具体行动
3. 融合智慧——将易经、八字、梅花易数的洞见转化为现代人听得懂的日常语言
4. 因人而异——方案必须基于用户本身的八字特质和天赋，不能通用模板
5. 以肯定句为主——"你需要做"、"你的路径是"、"这个月适合"

输出用中文，Markdown 格式排版。`;

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

function buildPrompt(context: string): string {
  const CY = new Date().getFullYear();
  return `请根据以下用户信息，生成一份完整的【年度成长方案】。

${context}

⚠️ 当前为 ${CY}年。方案聚焦 ${CY}年全年。

方案必须包含以下6个模块，每个模块不少于300字：

## 一、年度总览
- 本年度对用户而言的整体基调（用一句强有力的隐喻概括，如"扎根之年""破茧之年""淬火之年"）
- 年度关键词（1个词）
- 年度能量评级（从1-10分评估今年整体的「天时」有利程度）

## 二、十二个月逐月指引
- 每月用一个关键词概括
- 每月给出：核心主题、宜做事项、忌做事项、情绪状态
- 标注月份中的「吉日窗口期」和「风险时段」

## 三、天赋聚焦与深耕方向
- 基于用户八字日主五行和命局特点
- 指出今年最适合深耕的1-2个具体领域
- 每个领域给出3个本周内就能开始的行动

## 四、人际关系指南
- 今年在家人、伴侣、合作伙伴方面的注意事项
- 哪些类型的人今年对用户有帮助
- 哪些人际模式需要警惕

## 五、健康与身心调整
- 基于五行生克的健康建议
- 每个季节的调养重点
- 具体的作息、饮食、运动建议

## 六、可落地的100天行动计划
- 从今天起，每10天一个阶段
- 每个阶段一个核心任务
- 关键：必须是用户明天就能开始的第一小步

请确保每个模块都给出具体、可执行的内容，而不是泛泛的描述。`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, location, gender, targetYear } = body;

    if (!year || !month || !day) {
      return new Response(JSON.stringify({ error: '请填写出生日期' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const config = getConfig();
    if (!config.apiKey) {
      console.error('growth-plan: DEEPSEEK_API_KEY 未配置');
      return new Response(JSON.stringify({ error: 'API key 未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const target = targetYear || new Date().getFullYear();

    // 构建用户上下文
    const contextLines = [
      `【出生信息】`,
      `出生日期：${year}年${month}月${day}日`,
      hour ? `出生时辰：${hour}时` : '',
      location ? `出生地点：${location}` : '',
      gender ? `性别：${gender}` : '',
      '',
      `【分析目标】`,
      `目标年份：${target}年`,
      `需要：流年运势分析 + 可落地成长的行动方案`,
    ].filter(Boolean).join('\n');

    const prompt = buildPrompt(contextLines);

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: GROWTH_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 8000,
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
    console.error('成长方案生成失败:', error);
    return new Response(JSON.stringify({ error: error.message || '生成失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
