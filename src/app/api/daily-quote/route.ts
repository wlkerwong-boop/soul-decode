/**
 * 每日一言 API — 从金刚老师内容银行随机取一句（零 AI 成本，秒回）
 * 数据源与 jingang-qa 共用：src/data/jingang/jingang-index.json
 */
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
  } catch {
    return null;
  }
}

export async function GET() {
  const index = loadIndex();
  if (!index || !Array.isArray(index.chunks) || index.chunks.length === 0) {
    return Response.json({ error: '内容银行未就绪' }, { status: 503 });
  }

  const chunks = index.chunks;
  // 最多尝试 8 次，找一个能提取出合格句子的主题
  for (let attempt = 0; attempt < 8; attempt++) {
    const c = chunks[Math.floor(Math.random() * chunks.length)];
    const text: string = c.text || '';
    // 按句切分，过滤：长度 12-90 字、不以【开头、不含【】
    const sentences = text
      .split(/[。！？!?]/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 12 && s.length <= 90 && !s.startsWith('【') && !s.includes('【'));

    if (sentences.length > 0) {
      const quote = sentences[Math.floor(Math.random() * sentences.length)];
      return Response.json({ quote, source: c.title, num: c.num });
    }
  }

  return Response.json({ error: '没有合适的语录' }, { status: 503 });
}
