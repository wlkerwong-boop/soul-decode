/**
 * 关系合盘 API — 流式返回两人八字匹配分析
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `你是一位关系解码师，融合八字命理与心理学，分析两个人的关系匹配度。

你的任务是基于两个人的出生信息和八字四柱，生成一份灵魂共鸣·关系合盘报告。

报告结构：

## 灵魂匹配度
一个百分制综合评分（如"87分"），加上一句核心总结（如"你们是相互成就的黄金搭档"）

## 五行互补分析
分析两人五行（金木水火土）的互补与冲克关系，指出哪些方面相生、哪些需调和

## 性格相容性
基于各自日主特征，分析性格互动模式：谁主导、谁支持、潜在化学反应

## 优势组合
两人在一起能产生的独特化学反应——合则更强的方面（不少于3点）

## 冲突预警
可能产生摩擦的领域及原因（不少于3点），以及调和建议

## 关系时间线
关系发展的关键节点与阶段建议

## 一句话总结
一句掷地有声的话，概括这段关系的本质

要求：
- 用"TA"指代对方，营造对话感
- 诚实但不恐吓，即点出问题也给出希望
- 多用肯定句，少用"可能"、"或许"
- 每个部分至少2-3句话，总字数800-1500字
- 用Markdown格式输出`;

function getConfig() {
  const provider = process.env.AI_PROVIDER || 'deepseek';
  return {
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: 'deepseek-chat',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { person1, person2 } = body;

    if (!person1 || !person2) {
      return new Response(JSON.stringify({ error: '请提供两个人的出生信息' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const config = getConfig();
    if (!config.apiKey) {
      console.error('compatibility-decoded: DEEPSEEK_API_KEY 未配置');
      return new Response(JSON.stringify({ error: 'API key 未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = `请为以下两人生成关系合盘报告。

## 第一个人：${person1.name || 'TA'}（${person1.gender || '未知'}）
出生日期：${person1.year}年${person1.month}月${person1.day}日${person1.hour ? ' ' + person1.hour + '时' : ''}
${person1.dayMaster ? `八字日主：${person1.dayMaster}（${person1.dayMasterElement || ''}）` : ''}
${person1.pillars ? `八字四柱：${person1.pillars.filter((p: string) => p !== '--').join('/')}` : ''}

## 第二个人：${person2.name || 'TA'}（${person2.gender || '未知'}）
出生日期：${person2.year}年${person2.month}月${person2.day}日${person2.hour ? ' ' + person2.hour + '时' : ''}
${person2.dayMaster ? `八字日主：${person2.dayMaster}（${person2.dayMasterElement || ''}）` : ''}
${person2.pillars ? `八字四柱：${person2.pillars.filter((p: string) => p !== '--').join('/')}` : ''}

请严格按照报告结构输出完整合盘分析。`;

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 4000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`DeepSeek API error: ${response.status} ${errText.slice(0, 300)}`);
      return new Response(JSON.stringify({ error: '合盘分析失败' }), {
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
    return new Response(JSON.stringify({ error: error.message || '合盘失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
