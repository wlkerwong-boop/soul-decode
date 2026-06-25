/**
 * 人类图深度解读 API
 * 基于Ra Uru Hu原始体系 + 区分的科学参考
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const INTERP_PROMPT = `你是一位人类图（Human Design）解读师。你的分析严格基于Ra Uru Hu创立的原始体系。

请根据用户的人类图数据，生成一份深度解读报告。

报告结构如下：

## 一、你的类型与策略
解释用户的能量类型（Generator/Manifestor/Projector/Reflector），和对应的策略如何在实际生活中运用。

## 二、你的内在权威
解释用户的内在权威类型（情绪/荐骨/脾/自我/环境等），以及如何依此做决定。

## 三、你的人生角色
解读用户的Profile号码组合的含义，以及这个角色如何在人生中显现。

## 四、能量中心分析
列出定义和开放的能量中心，解释哪些是稳定的天赋，哪些是接收外界影响的地方。

## 五、闸门与通道
解读最重要的几个激活闸门和通道的含义。

## 六、轮回交叉
解释用户的Incarnation Cross（轮回交叉）所代表的人生使命主题。

要求：
- 严格基于用户提供的数据，不要编造
- 风格温暖、实用、直指人心
- 每部分2-4句话
- 总字数600-1000字
- 使用中文`;

function getConfig() {
  return {
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: 'deepseek-chat',
  };
}

export async function POST(request: NextRequest) {
  try {
    const { bodygraph } = await request.json();
    if (!bodygraph) {
      return new Response(JSON.stringify({ error: '缺少人类图数据' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const config = getConfig();
    const userData = JSON.stringify({
      type: bodygraph.type,
      strategy: bodygraph.strategy,
      authority: bodygraph.authority,
      profile: bodygraph.profile,
      definition: bodygraph.definition,
      signature: bodygraph.signature,
      notSelfTheme: bodygraph.notSelfTheme,
      incarnationCross: bodygraph.incarnationCross,
      definedCenters: bodygraph.definedCenters,
      undefinedCenters: bodygraph.undefinedCenters,
      activatedGates: bodygraph.activatedGates,
      channels: bodygraph.channels,
      circuitries: bodygraph.circuitries,
    }, null, 2);

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: INTERP_PROMPT },
          { role: 'user', content: `以下是用户的人类图数据：\n${userData}\n\n请生成深度解读报告。` },
        ],
        temperature: 0.75,
        max_tokens: 3000,
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
