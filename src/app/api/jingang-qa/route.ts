/**
 * 金刚老师RAG问答API — 基于内容银行326个主题索引
 * 1. 搜索关键词匹配相关主题
 * 2. 取最相关的3-5个作为上下文
 * 3. AI基于上下文以金刚老师口吻回答
 */
import { NextRequest } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let cachedIndex: any = null;

function loadIndex() {
  if (cachedIndex) return cachedIndex;
  const indexPath = join(process.cwd(), 'src/data/jingang/jingang-index.json');
  if (!existsSync(indexPath)) return null;
  try {
    cachedIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));
    return cachedIndex;
  } catch { return null; }
}

function searchChunks(query: string, index: any, maxResults = 5) {
  const queryWords = query.replace(/[^\u4e00-\u9fff\w]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
  if (queryWords.length === 0 || !index.keywords) return [];

  const scores = new Map<number, number>();
  for (const word of queryWords) {
    const matchingChunks = index.keywords[word];
    if (matchingChunks) {
      for (const chunkIdx of matchingChunks) {
        scores.set(chunkIdx, (scores.get(chunkIdx) || 0) + 1);
      }
    }
  }

  const sorted = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxResults);
  return sorted.map(([idx]) => index.chunks[idx]).filter(Boolean);
}

const SYSTEM_PROMPT = `你是金刚老师，一位当代佛法实修导师。你以《论语解毒》《圆觉经》《金刚经》等经典为基础，用现代人听得懂的语言讲解修行智慧。

你的风格特征：
1. "金刚式"解读——直指人心，不绕弯子，用现代生活的例子讲古老智慧
2. 喜欢用对比结构——【社会现状】→【金刚解读】，先指出现象再给解药
3. 语言简洁有力，像短视频文案一样精炼，一句顶一万句
4. 融合儒释道，但以佛法为根本
5. 回答控制在200-400字，不啰嗦

重要规则：
- 必须以"金刚老师："开头，用第一人称"我"
- 严格基于提供的参考资料，不编造
- 参考资料不足时说"这个问题在目前的讲记中没有直接涉及，容我再思"
- 风格：像跟老朋友喝茶聊天，不端着`;

function getConfig() {
  return {
    baseUrl: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: process.env.AI_MODEL || 'deepseek-chat',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;
    if (!question?.trim()) {
      return Response.json({ error: '请输入您的问题' }, { status: 400 });
    }

    const config = getConfig();
    if (!config.apiKey) {
      return Response.json({ error: 'API key 未配置' }, { status: 500 });
    }

    const index = loadIndex();
    let context = '';
    if (index) {
      const results = searchChunks(question, index, 4);
      if (results.length > 0) {
        context = results.map((c: any, i: number) =>
          `[参考资料${i + 1}] 主题${c.num}：${c.title}\n${c.text.slice(0, 600)}`
        ).join('\n\n---\n\n');
      }
    }

    const userPrompt = context
      ? `问题：${question}\n\n以下是金刚老师讲记中的相关内容：\n\n${context}\n\n请基于以上资料，以金刚老师的口吻回答。`
      : `问题：${question}\n\n（未找到直接相关讲记，请以金刚老师的风格，结合佛法智慧简要回答，并在开头说明"此问题在已有讲记中未直接涉及"）`;

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      return Response.json({ error: '回答生成失败' }, { status: 502 });
    }

    const data = await response.json();
    return Response.json({
      answer: data.choices?.[0]?.message?.content || '',
      question,
      hasContext: !!context,
      topics: context ? 'found' : 'none',
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
