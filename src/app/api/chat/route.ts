/**
 * AI 追问对话 API — 用户可在报告生成后持续追问
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `你是一位灵魂解码者。你融合心理学原型理论、生命数字学、东方命理逻辑与人生模式分析学。

用户已经看过自己的完整命理解读报告，现在针对报告中的内容提出追问。
你的任务是：
1. 基于用户已有的八字信息，给出针对性的深度解答
2. 保持与报告一致的风格——诚实、精准、深刻
3. 用"你"直接对话，像认识多年的导师
4. 回答简洁但有力量，每句都击中要害
5. 如果你需要更多信息才能给出准确判断，可以请求用户补充

回答使用中文，可以用少量 Markdown 排版。`;

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
    const { message, context, history } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: '请输入您的问题' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const config = getConfig();
    if (!config.apiKey) {
      console.error('chat: DEEPSEEK_API_KEY 未配置');
      return new Response(JSON.stringify({ error: 'API key 未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build messages array with context
    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Include user context if available
    if (context) {
      messages.push({
        role: 'system',
        content: `用户的上一次命理解读上下文：\n${context}`,
      });
    }

    // Include conversation history
    if (history && Array.isArray(history)) {
      messages.push(...history.slice(-10)); // Last 10 messages
    }

    // Current question
    messages.push({ role: 'user', content: message });

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
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

    // Stream response
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
    return new Response(JSON.stringify({ error: error.message || '对话失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
