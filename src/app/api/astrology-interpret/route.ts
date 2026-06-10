/**
 * 星座/占星 AI 深度解读 API
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `你是占星学的解读大师。你融合西方占星学、中国生肖文化和五行理论，为用户提供深刻的星座解读。

=== 铁律 ===
1. 用"你"直接对话
2. 结合太阳星座、上升星座概念和生肖特质给出综合解读
3. 指出性格中的光明面和阴影面，不可只说好话
4. 语言要有诗意和画面感，像星辰一样令人难忘
5. 给出与星座能量匹配的行动建议
6. 回答必须使用中文。`;

export async function POST(req: NextRequest) {
  try {
    const { year, month, day, zodiacName, zodiacEnglish, element, quality, rulingPlanet, chineseZodiac, chineseElement } = await req.json();

    const userContent = [
      `用户出生日期：${year}年${month}月${day}日`,
      `太阳星座：${zodiacName}（${zodiacEnglish}）`,
      `星座元素：${element}象`,
      `星座模式：${quality}星座`,
      `守护星：${rulingPlanet}`,
      `生肖：${chineseZodiac}`,
      `五行纳音：${chineseElement}`,
      '',
      '请根据以上信息，为用户生成一份深度的占星解读，包括：',
      '1. 核心性格画像 — 结合太阳星座和生肖的综合描述',
      '2. 星座能量解析 — 元素、模式和守护星的影响',
      '3. 天赋与优势 — 这个配置下最闪耀的天赋',
      '4. 需要注意的课题 — 成长中最需要突破的盲点',
      '5. 建议与指引 — 与星盘能量匹配的行动建议',
    ].join('\n');

    const config = {
      baseUrl: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
      apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '',
      model: process.env.AI_MODEL || 'deepseek-chat',
    };

    if (!config.apiKey) {
      return NextResponse.json({ error: 'API key 未配置' }, { status: 500 });
    }

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
          { role: 'user', content: userContent },
        ],
        temperature: 0.85,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `AI API 错误: ${error}` }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json({
      content: data.choices?.[0]?.message?.content || '',
      model: data.model,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
