/**
 * 人类图知识库问答 API
 * 基于hd-knowledge.json参考数据+AI回答
 */
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// 加载知识库
let KB: any = null;
function loadKB() {
  if (KB) return KB;
  try {
    const f = fs.readFileSync(path.join(process.cwd(), 'public/hd-knowledge.json'), 'utf-8');
    KB = JSON.parse(f);
  } catch { KB = { centers: [], types: [], authorities: [], profiles: [], key_concepts: [], selected_gates: [], channels: [] }; }
  return KB;
}

function searchKB(query: string): string {
  const kb = loadKB();
  const q = query.toLowerCase();
  const results: string[] = [];

  // Search all sections
  for (const c of kb.centers || []) {
    if (c.name_cn.includes(query) || c.name?.toLowerCase()?.includes(q) || c.description.includes(query))
      results.push(`【${c.name_cn}】${c.description}`);
  }
  for (const t of kb.types || []) {
    if (t.name_cn.includes(query) || t.name?.toLowerCase()?.includes(q) || t.description.includes(query))
      results.push(`【${t.name_cn}】${t.description} | 策略:${t.strategy} 签名:${t.signature}`);
  }
  for (const a of kb.authorities || []) {
    if (a.name_cn.includes(query) || a.name?.toLowerCase()?.includes(q))
      results.push(`【${a.name_cn}】${a.description}`);
  }
  for (const p of kb.profiles || []) {
    if (p.name?.includes(query) || p.name_cn?.includes(query))
      results.push(`【${p.name} ${p.name_cn}】${p.description}`);
  }
  for (const k of kb.key_concepts || []) {
    if (k.term.includes(query))
      results.push(`【${k.term}】${k.definition}`);
  }
  for (const g of kb.selected_gates || []) {
    if (g.name?.includes(query) || (g.num && query.includes(String(g.num))))
      results.push(`【闸门${g.num} ${g.name}】${g.description}`);
  }
  for (const ch of kb.channels || []) {
    if (ch.name_cn?.includes(query) || ch.key?.includes(query))
      results.push(`【${ch.name_cn}】${ch.description} 连接${ch.centers?.join('→')}`);
  }

  return results.slice(0, 5).join('\n\n');
}

const SYSTEM_PROMPT = `你是人类图（Human Design）导师助手，基于Ra Uru Hu的原始体系回答。
请用中文回答，语气温和、启发式。如果用户问的问题不在知识库范围内，诚实地告知。`;

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query || query.trim().length < 2) {
      return Response.json({ answer: '请输入您的问题（如：什么是投射者？荐骨权威是什么意思？）' });
    }

    // Search local KB
    const context = searchKB(query);
    
    if (!context) {
      return Response.json({ 
        answer: '关于这个问题，我建议您查阅《区分的科学》或《一本读懂人类图》等参考书籍。我目前的知识库中暂时没有这方面的详细信息。' 
      });
    }

    // Try AI for better answer
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT + '\n\n参考知识：\n' + context },
              { role: 'user', content: query }
            ],
            max_tokens: 1000,
            temperature: 0.3,
          }),
        });
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) {
          return Response.json({ answer: data.choices[0].message.content, context: 'AI解读' });
        }
      } catch {}
    }

    // Fallback to KB answer
    return Response.json({ answer: context, context: '知识库匹配' });
  } catch {
    return Response.json({ error: '查询失败' }, { status: 500 });
  }
}
