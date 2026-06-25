/**
 * 人类图深度解读 API — 基于Ra Uru Hu原始体系
 * 参考来源：区分的科学、一本读懂人类图、图解人类图
 */
import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `你是人类图（Human Design）解读师，严格基于Ra Uru Hu创立的体系。

请根据用户的人类图数据，生成深度解读报告。输出格式为中文，包含：

## 一、你的类型与策略
解读能量类型和策略，说明如何实际运用。

## 二、你的内在权威
解读权威类型，说明做决定的正确方式。

## 三、你的人生角色
解读Profile含义及人生显现方式。

## 四、九大能量中心
列出定义和开放中心，解读天赋与学习之处。

## 五、闸门与通道
解读最重要的激活闸门和通道。

## 六、轮回交叉
解读人生使命主题。

要求：
-严格基于数据，不编造
-温暖实用直指人心
-每部分2-4句
-600-1000字中文`;

export async function POST(request: NextRequest) {
  try {
    const { bodygraph } = await request.json();
    if (!bodygraph) {
      return new Response(JSON.stringify({ error: '缺少人类图数据' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      // Fallback: generate a template-based interpretation
      const { type, strategy, authority, profile, signature, notSelfTheme } = bodygraph;
      const interp = `## 一、你的类型与策略\n\n你是${type}。你的策略是「${strategy}」。\n\n## 二、你的内在权威\n\n你的内在权威是${authority}。\n\n## 三、你的人生角色\n\n你的人生角色是${profile}。\n\n## 四、九大能量中心\n\n定义的中心有：${bodygraph.definedCenters?.join('、') || '无'}。\n开放的中心有：${bodygraph.undefinedCenters?.join('、') || '无'}。\n\n## 五、闸门与通道\n\n激活的闸门：${bodygraph.activatedGates?.join('、') || '无'}。\n\n## 六、轮回交叉\n\n你的人生使命是：${bodygraph.incarnationCross || '等待探索'}。\n\n---
*如需更深入的个性化解读，请配置DEEPSEEK_API_KEY环境变量。*`;
      
      return new Response(JSON.stringify({ interpretation: interp }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // AI-powered interpretation
    const userData = JSON.stringify({
      type: bodygraph.type, strategy: bodygraph.strategy,
      authority: bodygraph.authority, profile: bodygraph.profile,
      definition: bodygraph.definition, incarnationCross: bodygraph.incarnationCross,
      signature: bodygraph.signature, notSelfTheme: bodygraph.notSelfTheme,
      definedCenters: bodygraph.definedCenters,
      undefinedCenters: bodygraph.undefinedCenters,
      activatedGates: bodygraph.activatedGates,
      channels: bodygraph.channels,
    }, null, 2);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `用户的人类图数据：\n${userData}` },
        ],
        temperature: 0.75, max_tokens: 3000,
      }),
    });

    if (!response.ok) throw new Error('解读生成失败');
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ interpretation: content }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
