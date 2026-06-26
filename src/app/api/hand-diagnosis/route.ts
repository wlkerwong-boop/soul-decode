/**
 * 中医手诊 API — 基于文章知识库 + DeepSeek AI辨证
 */
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// 加载手诊知识库
const KB = fs.readFileSync(path.join(process.cwd(), 'public/hand-diagnosis-kb.md'), 'utf-8');

export async function POST(request: NextRequest) {
  try {
    const { symptoms, questions } = await request.json();
    
    const userDesc = questions || symptoms || '请描述你的手部状况';

    const prompt = `你是一位资深的中医手诊医师。以下是中医手诊的完整知识体系，请基于此进行辨证分析。

【知识体系】
${KB.slice(0, 6000)}

【用户描述】
${userDesc}

【任务】
1. 分析用户描述的手部特征，判断可能的体质类型和脏腑问题
2. 给出具体的调理建议（饮食、作息、穴位按摩等）
3. 指出需要关注的健康风险
4. 给出下一步建议

请用中文回答，语气温和专业。篇幅500-1000字。`;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return Response.json({ diagnosis: 'AI诊断功能暂不可用' });

    const baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com/v1';
    const model = process.env.AI_MODEL || 'deepseek-chat';

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: '你是资深中医手诊医师，精通望诊辨证，善于通过手部特征判断体质和脏腑状态。你的建议温和、实用、专业。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
        temperature: 0.5,
      }),
    });

    const data = await res.json();
    const diagnosis = data.choices?.[0]?.message?.content || '分析生成失败';

    return Response.json({ diagnosis });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
