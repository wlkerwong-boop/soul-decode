/**
 * AI API 集成模块
 * 
 * 支持 DeepSeek API（默认）和 OpenAI 兼容接口
 * 可在 .env.local 中配置 PROVIDER 切换
 */

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

function getConfig() {
  const provider = process.env.AI_PROVIDER || 'deepseek';
  
  const configs: Record<string, { baseUrl: string; apiKey: string; model: string }> = {
    deepseek: {
      baseUrl: DEEPSEEK_BASE_URL,
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      model: process.env.AI_MODEL || 'deepseek-chat',
    },
    openai: {
      baseUrl: OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.AI_MODEL || 'gpt-4o-mini',
    },
    // 可扩展其他 provider
  };

  return configs[provider] || configs.deepseek;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * 调用 AI API 生成单个报告模块
 */
export async function generateModule(
  systemPrompt: string,
  userContext: string,
): Promise<AIResponse> {
  const config = getConfig();
  
  if (!config.apiKey) {
    throw new Error(`API key 未配置。请在 .env.local 中设置 ${process.env.AI_PROVIDER === 'openai' ? 'OPENAI_API_KEY' : 'DEEPSEEK_API_KEY'}`);
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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContext },
      ],
      temperature: 0.85,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API 错误 (${response.status}): ${error}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content || '',
    model: data.model || config.model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  };
}

/**
 * 生成完整的6模块报告
 * 每个模块独立调用 AI，以获取最精准的角色化输出
 */
export async function generateFullReport(params: {
  systemPrompts: string[];
  userContext: string;
}): Promise<string[]> {
  const results = await Promise.all(
    params.systemPrompts.map(prompt => generateModule(prompt, params.userContext))
  );
  return results.map(r => r.content);
}

const MASTER_SYSTEM_PROMPT = `你是一位灵魂解码者。你融合心理学原型理论、生命数字学、东方命理逻辑与人生模式分析学。你的解读风格诚实、深刻、精准，绝不泛泛而谈。你像一个认识用户多年的导师，能看穿他们深层的性格、隐藏的优势与弱点、人生的核心使命与课题。

你的每次回复，都需要让用户产生一种"这说的就是我"的震撼感。你必须避免模棱两可的套话，而是给出针对性的、可落地的洞察与指引。

语言要求：
1. 使用"你"作为称呼，直接面向用户对话
2. 诚实不回避，指出弱点时必须直接，不可温和化处理
3. 善用隐喻和画面感强的语言，有诗意与力量感
4. 以肯定句为主，避免"你可能"、"或许"，多用"你是"、"你注定"、"你的使命是"
5. 每个模块结尾，需有一句掷地有声、鼓舞用户行动的话语

回答必须使用中文，用 Markdown 格式排版。`;

/**
 * 一次调用生成完整6模块报告（节省 API 次数）
 */
export async function generateReportInOneCall(
  userContext: string,
): Promise<string> {
  const config = getConfig();

  if (!config.apiKey) {
    throw new Error(`API key 未配置。请在 .env.local 中设置 ${process.env.AI_PROVIDER === 'openai' ? 'OPENAI_API_KEY' : 'DEEPSEEK_API_KEY'}`);
  }

  const fullPrompt = `请根据以下用户信息，生成一份完整的【灵魂解码】人生使命解读报告。

${userContext}

报告需严格按照以下6个模块的结构输出，每个模块需要有明确的标题：

## 一、核心性格解码
- 核心生命路径数字解读
- 外显性格与内隐性格的矛盾与张力
- 深层人格构造描述

## 二、隐藏优势与弱点
- 三大隐藏优势（命名如"第一刃/第二刃/第三刃"）
- 三大致命弱点（与优势一一对应，注明是哪个优势的阴影面）
- 此生核心功课（一个关键词+解释）

## 三、职业天赋与道路
- 职业天赋三把利刃
- 决策风格
- 深层职业动机
- 三条适配道路（含具体方向+成功关键）
- 一个必须避免的领域（含预警信号）

## 四、爱情与关系解码
- 最相容的人类型（2-3类）
- 需要学习的爱情功课（2-3个）
- 关系在人生中的角色定位
- 精准伴侣画像

## 五、财富密码解码
- 天生财务个性原型
- 阻碍财富的隐蔽错误（2-3个）
- 真正适合的财富策略（2-3个）
- 财富年龄阶段指引
- 地理机遇区域

## 六、人生时间线与年度指引
- 过去阶段回顾（2-3个关键阶段）
- 当下核心转折点
- 2026-2030年逐年拆解（每年含：年度主题、道路方向、关键行动、成长标志）

请用 Markdown 格式输出完整报告。`;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: MASTER_SYSTEM_PROMPT },
        { role: 'user', content: fullPrompt },
      ],
      temperature: 0.85,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API 错误 (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
