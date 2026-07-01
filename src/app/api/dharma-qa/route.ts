/**
 * 法藏RAG问答API — 基于630万字寂如师父开示索引
 * 1. 搜索关键词匹配相关块
 * 2. 取最相关的3-5块作为上下文
 * 3. AI基于上下文回答问题
 */
import { NextRequest } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let cachedIndex: any = null;
let cachedYangshan: any = null;

function loadIndex() {
  if (cachedIndex) return cachedIndex;
  const indexPath = join(process.cwd(), 'src/data/dharma/dharma-index.json');
  if (!existsSync(indexPath)) return null;
  try { cachedIndex = JSON.parse(readFileSync(indexPath, 'utf-8')); return cachedIndex; }
  catch { return null; }
}

function loadYangshan() {
  if (cachedYangshan) return cachedYangshan;
  const path = join(process.cwd(), 'src/data/dharma/yangshan-index.json');
  if (!existsSync(path)) return null;
  try { cachedYangshan = JSON.parse(readFileSync(path, 'utf-8')); return cachedYangshan; }
  catch { return null; }
}

function searchChunks(query: string, index: any, maxResults = 5) {
  const queryWords = new Set(
    query.replace(/[^\u4e00-\u9fff\w]/g, ' ').split(/\s+/).filter(w => w.length >= 2)
  );

  if (queryWords.size === 0 || !index.keywords) {
    // Fallback: search by title/text directly
    return index.chunks
      .filter((c: any) =>
        c.title.includes(query) || c.text.includes(query)
      )
      .slice(0, maxResults);
  }

  // Score chunks by keyword matches
  const scores = new Map<number, number>();
  for (const word of queryWords) {
    const matchingChunks = index.keywords[word];
    if (matchingChunks) {
      for (const chunkIdx of matchingChunks) {
        scores.set(chunkIdx, (scores.get(chunkIdx) || 0) + 1);
      }
    }
  }

  // Sort by score descending
  const sorted = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxResults);

  return sorted.map(([idx]) => index.chunks[idx]).filter(Boolean);
}

const SYSTEM_PROMPT = `你是一位佛法导师，基于寂如师父的开示内容回答修行问题。

你的角色：
1. 回答必须严格基于提供的参考资料，不要编造
2. 如果参考资料不足以回答问题，诚实地说"这段开示中没有直接涉及"
3. 风格温和、实用、直指人心，像一位有经验的修行者在指导
4. 将佛法智慧与现代生活结合，给出可实践的建议

重要规则：
- 必须以"根据寂如师父开示"开头
- 引用时注明来源文件名
- 不要冒充寂如师父本人
- 回答用中文，200-500字`;

function getConfig() {
  const provider = process.env.AI_PROVIDER || 'deepseek';
  return {
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: 'deepseek-chat',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || !question.trim()) {
      return new Response(JSON.stringify({ error: '请输入您的问题' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const config = getConfig();
    if (!config.apiKey) {
      return new Response(JSON.stringify({ error: 'API key 未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Load index and search both sources
    const index = loadIndex();
    const yangshan = loadYangshan();
    let context = '';
    let sourceInfo = '';
    let resultCount = 0;

    // Search main dharma index
    if (index) {
      const results = searchChunks(question, index, 4);
      resultCount += results.length;
      if (results.length > 0) {
        context += results.map((c: any, i: number) =>
          `[开示${i + 1}] 来自：${c.title}\n${c.text.slice(0, 800)}`
        ).join('\n\n');
        sourceInfo += results.map((c: any) => `《${c.title}》`).join('、');
      }
    }

    // Search 阳山书院 supplementary articles
    if (yangshan) {
      const ysResults = searchChunks(question, yangshan, 3);
      if (ysResults.length > 0) {
        if (context) context += '\n\n---\n\n';
        context += '【阳山书院最新开示】\n' + ysResults.map((c: any, i: number) =>
          `[阳山${i + 1}] ${c.title}\n${c.text.slice(0, 800)}`
        ).join('\n\n');
        if (sourceInfo) sourceInfo += '、';
        sourceInfo += ysResults.map((c: any) => `阳山·《${c.title}》`).join('、');
        resultCount += ysResults.length;
      }
    }

    if (!context) {
      // Fallback: try direct text search in yangshan
      if (yangshan) {
        const direct = yangshan.chunks.filter((c: any) =>
          c.text.includes(question) || c.title.includes(question)
        ).slice(0, 3);
        if (direct.length > 0) {
          context = '【阳山书院】\n' + direct.map((c: any) => c.text.slice(0, 1000)).join('\n\n');
          sourceInfo = direct.map((c: any) => `阳山·《${c.title}》`).join('、');
          resultCount = direct.length;
        }
      }
    }

    const userPrompt = context
      ? `问题：${question}\n\n以下是寂如师父开示中的相关内容：\n\n${context}\n\n请基于以上参考资料回答问题。`
      : `问题：${question}\n\n（未找到直接相关的参考资料，请基于你对寂如师父开示体系的理解回答，并在回答开头说明"没有找到直接对应的开示内容"）`;

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
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: '回答生成失败' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({
      answer: content + (sourceInfo ? `\n\n📖 引用来源：${sourceInfo}` : ''),
      question,
      hasContext: !!context,
      sources: context ? resultCount : 0,
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
