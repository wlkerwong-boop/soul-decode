/**
 * 人类图深度解读 API v2 — Kimi级别深度报告
 * 调用DeepSeek AI生成个性化人类图深度报告
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

function buildHDPrompt(hd: any): string {
  return `你是一位资深的人类图（Human Design）导师，严格基于Ra Uru Hu创立的原始体系。请根据以下人类图数据，为来访者生成一份深度个性化解读报告。

【人类图数据】
类型：${hd.type || '未知'}
策略：${hd.strategy || '未知'}
内在权威：${hd.authority || '未知'}
人生角色：${hd.profile || '未知'}
定义：${hd.definition || '未知'}
轮回交叉：${hd.incarnationCross || '未知'}
签名：${hd.signature || '未知'}
非自我主题：${hd.notSelfTheme || '未知'}
定义中心：${(hd.definedCenters||[]).join('、') || '无'}
开放中心：${(hd.undefinedCenters||[]).join('、') || '无'}
激活通道：${(hd.channels||[]).join('、') || '无'}

【报告要求】
请用中文撰写，语气温暖、专业、深刻。篇幅约1500-2500字。

## 1. 类型深度解读
- 解释${hd.type}类型的本质
- 策略在实际生活中如何运用
- 签名与非自我主题在生活中的表现

## 2. 决策指南
- 如何运用${hd.authority}做出正确决策
- 给出具体的决策场景示例

## 3. 能量中心分析
- 定义中心（${(hd.definedCenters||[]).join('、')}）带来的稳定天赋
- 开放中心（${(hd.undefinedCenters||[]).join('、')}）带来的易受影响领域
- 如何在日常生活中运用这些认知

## 4. 人生角色${hd.profile}详解
- 意识人格和设计人格的具体表现
- 在不同人生阶段的变化

## 5. 通道与天赋
- 激活通道（${(hd.channels||[]).join('、')}）的具体天赋解读
- 如何在工作和生活中运用

## 6. 一句话核心建议

直接以导师的口吻书写，不要使用"根据提供的数据"等套话。`;
}

export async function POST(request: NextRequest) {
  try {
    const { bodygraph: hd } = await request.json();
    if (!hd || !hd.type) return Response.json({ error: '缺少人类图数据' }, { status: 400 });

    const prompt = buildHDPrompt(hd);
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com/v1';
    const model = process.env.AI_MODEL || 'deepseek-chat';
    let interpretation = '';
    let aiUsed = false;

    if (apiKey) {
      try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: '你是顶尖的人类图导师，严格基于Ra Uru Hu原始体系。你的解读温暖、精准、有深度，帮助来访者理解自己的能量设计并活出真实的自己。' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 4000,
            temperature: 0.7,
          }),
        });
        const data = await res.json();
        interpretation = data.choices?.[0]?.message?.content || '';
        aiUsed = true;
      } catch {}
    }

    if (!interpretation) {
      // Fallback template
      interpretation = `你的类型是${hd.type}，人生策略是「${hd.strategy}」，内在权威为${hd.authority}。你拥有${hd.definedCenters.length}个定义中心和${hd.undefinedCenters.length}个开放中心。激活了${hd.activatedGates.length}个闸门和${hd.channels.length}条通道。${hd.incarnationCross ? '你的轮回交叉是「'+hd.incarnationCross+'」' : ''}`;
    }

    return Response.json({ interpretation, aiGenerated: aiUsed });
  } catch {
    return Response.json({ error: '解读生成失败' }, { status: 500 });
  }
}
