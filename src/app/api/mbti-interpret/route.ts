/**
 * MBTI AI 深度解读 API
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { type, scores, answers } = await req.json();

    const MBTI_TYPES: Record<string, any> = {
      'ISTJ': { name: '物流师', title: '务实守纪的检查者', strengths: ['可靠负责', '做事有条理', '注重细节和质量', '忠诚坚定', '执行力强'] },
      'ISFJ': { name: '守护者', title: '温暖可靠的捍卫者', strengths: ['极度可靠', '善于观察和照顾他人', '注重细节', '忠诚', '务实且有耐心'] },
      'INFJ': { name: '提倡者', title: '洞察人心的引路人', strengths: ['深刻的洞察力', '强烈的使命感', '善解人意', '创造力丰富', '坚定且执着'] },
      'INTJ': { name: '建筑师', title: '独立思考的策略家', strengths: ['战略思维', '高度独立', '追求卓越', '理性果断', '善于规划长远'] },
      'ISTP': { name: '鉴赏家', title: '冷静灵活的问题解决者', strengths: ['临危不乱', '动手能力强', '理性客观', '善于观察', '灵活变通'] },
      'ISFP': { name: '探险家', title: '安静优雅的创作者', strengths: ['艺术天赋', '敏感且富有同理心', '随和包容', '善于观察美', '忠诚于自己的价值观'] },
      'INFP': { name: '调停者', title: '理想主义的诗意灵魂', strengths: ['丰富的想象力', '深刻的同理心', '忠于核心价值观', '善于理解他人', '创造力出众'] },
      'INTP': { name: '逻辑学家', title: '求知若渴的思考者', strengths: ['分析能力超群', '创新思维', '客观理性', '求知欲强', '善于抽丝剥茧'] },
      'ESTP': { name: '企业家', title: '精力充沛的实干家', strengths: ['行动力强', '善于说服', '随机应变', '观察敏锐', '社交达人'] },
      'ESFP': { name: '表演者', title: '热情洋溢的社交明星', strengths: ['感染力强', '善于社交', '乐观积极', '善于表演和表达', '乐于助人'] },
      'ENFP': { name: '竞选者', title: '热情四射的创意策源', strengths: ['创造力爆棚', '善于洞察人心', '热情洋溢', '善于沟通', '适应力强'] },
      'ENTP': { name: '辩论家', title: '智慧锋利的创新推手', strengths: ['思维敏捷', '创新能力强', '善于辩论', '好奇心旺盛', '适应变化'] },
      'ESTJ': { name: '总经理', title: '果断高效的组织者', strengths: ['领导力强', '组织能力出色', '果断决策', '勤奋可靠', '责任感强'] },
      'ESFJ': { name: '执政官', title: '热心慷慨的社交家', strengths: ['善于社交', '责任感强', '体贴周到', '组织能力强', '忠诚可靠'] },
      'ENFJ': { name: '主人公', title: '魅力超凡的引领者', strengths: ['领导魅力', '善于激励他人', '同理心强', '组织策划能力', '沟通高手'] },
      'ENTJ': { name: '指挥官', title: '果敢睿智的战略领袖', strengths: ['战略眼光', '领导力卓越', '果断决策', '执行力强', '自信坚定'] },
    };

    const typeInfo = MBTI_TYPES[type];
    if (!typeInfo) {
      return NextResponse.json({ error: '无效的MBTI类型' }, { status: 400 });
    }

    const scoreSummary = scores ? Object.entries(scores).map(([k, v]: any) =>
      `${k}: ${v.first}/${v.first + v.second} (${Math.round(v.first / (v.first + v.second) * 100)}%)`
    ).join('\n') : '';

    const SYSTEM_PROMPT = `你是MBTI人格类型的深度解码者。你结合心理学原型理论、MBTI官方类型描述和真实的性格发展规律，为用户提供精准的人格分析。

=== 铁律 ===
1. 用"你"直接对话，像认识他多年的导师
2. 指出弱点时必须直接，不可温和化
3. 善用隐喻和画面感强的语言
4. 以肯定句为主：不用"你可能""或许"，用"你是""你的核心是"
5. 必须结合MBTI的认知功能栈（主导功能、辅助功能、第三功能、 inferior功能）来解析

回答必须使用中文。`;

    const userContent = [
      `用户的MBTI类型：${type}（${typeInfo.name} - ${typeInfo.title}）`,
      `用户性格特质：${typeInfo.strengths?.join('、')}`,
      scoreSummary ? `\n维度得分：\n${scoreSummary}` : '',
      answers ? `\n用户回答数据：\n${JSON.stringify(answers)}` : '',
      `\n请根据以上信息，为用户生成一份深度的MBTI性格解读，包括：
1. 核心性格画像（用一个强有力的隐喻来定义）
2. 认知功能栈分析（主导/辅助/第三/inferior功能如何运作）
3. 人际与事业中的优势模式
4. 最需要警惕的盲点和成长方向
5. 与类型匹配的行动建议`,
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
