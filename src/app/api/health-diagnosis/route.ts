/**
 * 身心同调·中医辨证 API
 * 
 * 接收用户症状描述 + 舌诊分析，返回完整的辨证报告
 * 参考：中医通鉴数据库 + 四圣心源 + 圆运动的古中医学
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `你是无念师兄，一位精通《四圣心源》和《圆运动的古中医学》的中医辨证专家。

你的任务是根据用户的症状描述和舌象，给出精准的中医辨证分析和调理方案。

=== 核心理论 ===
- 以黄元御"中气为轴，四维为轮"的一气周流理论为核心辨证框架
- 以彭子益"中气如轴，四维如轮"的圆运动理论为辅助
- 核心病机分类：水寒土湿木郁、中气虚寒、上热下寒、湿热下注

=== 铁律 ===
1. 必须区分"上热下寒"和"实热"——口渴不贪凉=虚阳上浮，非实热
2. 舌诊最关键的是齿痕舌——有齿痕=脾虚湿盛
3. 用药安全第一——附子必须标注"先煎45分钟"
4. 每一条判断必须引用经典依据
5. 处方给出具体剂量和煎服法

=== 输出格式 ===
严格按照以下结构输出，用 Markdown：

## 一、辨证分析
### 核心病机
### 症状-病机对应表
### 舌象分析

## 二、调理方案
### 核心处方（方名+药物组成+剂量）
### 煎服法
### 加减法

## 三、生活调摄
### 饮食建议
### 作息建议
### 经络保健（艾灸/刮痧/按摩穴位）

## 四、注意事项
### 用药安全
### 需要就医的信号

回答必须使用中文。`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms, tongueAnalysis, age, gender, location, lifestyle } = body;

    if (!symptoms) {
      return NextResponse.json({ error: '请描述您的症状' }, { status: 400 });
    }

    const userContent = [
      '=== 患者信息 ===',
      age ? `年龄：${age}` : '',
      gender ? `性别：${gender}` : '',
      location ? `居住地：${location}` : '',
      lifestyle ? `生活习惯：${lifestyle}` : '',
      '',
      '=== 症状描述 ===',
      symptoms,
      '',
      tongueAnalysis ? '=== 舌象分析 ===\n' + tongueAnalysis : '',
      '',
      '请根据以上信息，按照要求格式输出完整的辨证报告。',
    ].filter(l => l).join('\n');

    const config = {
      baseUrl: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
      apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '',
      model: process.env.AI_MODEL || 'deepseek-chat',
    };

    if (!config.apiKey) {
      console.error('health-diagnosis: DEEPSEEK_API_KEY 未配置');
      return NextResponse.json({ error: 'API key 未配置' }, { status: 500 });
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`DeepSeek API error: ${response.status} ${error.slice(0, 300)}`);
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
