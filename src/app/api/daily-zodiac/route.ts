/**
 * 每日生肖运势 API
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const zodiacMap: Record<string, string> = {
  rat: '鼠', ox: '牛', tiger: '虎', rabbit: '兔', dragon: '龙', snake: '蛇',
  horse: '马', goat: '羊', monkey: '猴', rooster: '鸡', dog: '狗', pig: '猪',
};

function getConfig() {
  return {
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: 'deepseek-chat',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zodiac } = body;
    const zodiacLabel = zodiacMap[zodiac] || zodiac;

    const config = getConfig();
    const today = new Date();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 星期${weekDays[today.getDay()]}`;

    const prompt = `请为属${zodiacLabel}的用户生成今日（${dateStr}）运势指引。

格式要求，严格按照以下结构输出，每个部分2-3句话：

【今日总运】— 整体能量感受和注意事项
【事业财运】— 当日事业和财务运势
【人际情感】— 社交和感情运势
【健康生活】— 健康和生活小贴士

要求：温暖、有用、不恐吓，结合属相特点。总字数200-300字。`;

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: '你是每日运势师，给出温暖实用的当日生肖运势指引。' },
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
      zodiac: zodiacLabel,
      date: dateStr,
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
