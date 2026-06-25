/**
 * 每日运势 API — 基于八字日主五行生成当日运势
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

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
    const { dayMaster, dayMasterElement, pillars, zodiac } = body;

    if (!dayMaster) {
      return new Response(JSON.stringify({ error: '缺少日主信息' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const config = getConfig();
    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDay()}日`;
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[today.getDay()];

    const prompt = `你是一位精通八字命理的每日运势师。

用户信息：
- 日主：${dayMaster}（${dayMasterElement}）
- 八字四柱：${pillars?.filter((p: string) => p !== '--').join('/') || '未知'}
- 生肖：${zodiac || '未知'}

今天是${dateStr}，星期${weekDay}。

请为这位用户生成一份今日运势指引，包含以下4个部分，每个部分2-3句话，用【】标注段落标题：

【今日总运】— 当日整体能量感受和注意事项
【事业/学习】— 当日适合做什么、注意什么
【人际/情感】— 当日社交运势和情感提示
【健康/生活】— 当日健康和生活小贴士

要求：
1. 风格温暖、有用、不恐吓
2. 结合用户的日主五行给出针对性建议
3. 结尾一句有共鸣的话
4. 总字数约200-300字`;

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: '你是每日运势师，给出温暖实用的当日指引。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.75,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: '运势生成失败' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({
      fortune: content,
      date: dateStr,
      weekDay,
      dayMaster,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
