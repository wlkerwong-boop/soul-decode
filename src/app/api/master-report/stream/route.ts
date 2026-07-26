// 流式七系统报告 API — 边生成边返回
import { NextRequest } from 'next/server';
import { getBirthCoords } from '@/data/cities';
import { calculateBodygraph } from '@/lib/hd';
import { calcPlanetPositions } from '@/lib/astrology';
import {
  buildPersonalReportSegments,
  calculateReportBazi,
  calculateWuyunLiuqi,
  PERSONAL_REPORT_SYSTEM_PROMPT,
} from '@/lib/report-depth';

async function calcHD(y: number, m: number, d: number, h: number, mi: number, tz: string, lat: number, lon: number) {
  try {
    const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const ts = `${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`;
    return await calculateBodygraph(ds, ts, tz, lat, lon);
  } catch { return null; }
}

function calcZiwei(y: number, m: number, d: number, h: number, gender: string) {
  try {
    const iztro = require('iztro');
    const ti = Math.floor((h + 1) / 2) % 12;
    const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const r = iztro.astro.bySolar(ds, ti, gender, true, 'zh-CN');
    if (!r?.palaces) return null;

    // iztro 返回的 palaces 不以命宫为起点，需按标准顺序重排
    const STD_ORDER = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母'];
    function reorderPalaces(rawPalaces: any[]) {
      const map = new Map<string, any>();
      for (const p of rawPalaces) {
        // iztro 部分版本宫名以"宫"结尾（如"命宫宫"），标准化去重
        const key = p.name === '命宫宫' ? '命宫' : p.name;
        map.set(key, p);
      }
      // "仆役"是 iztro 对"交友"的命名，做映射
      if (!map.has('交友') && map.has('仆役')) map.set('交友', map.get('仆役'));
      return STD_ORDER.map(name => {
        const p = map.get(name);
        if (!p) return { name, stars: [] };
        return {
          name,
          stars: [...((p.majorStars||[]).map((s:any) => typeof s==='object'?s.name:s)),
                  ...((p.minorStars||[]).map((s:any) => typeof s==='object'?s.name:s)),
                  ...((p.adjectiveStars||[]).map((s:any) => typeof s==='object'?s.name:s))].filter(Boolean),
        };
      });
    }

    // Collect 四化 (stars with mutagen: 禄/权/科/忌)
    const sihua: { star: string; mutagen: string; palace: string }[] = [];
    for (const p of r.palaces) {
      for (const s of [...(p.majorStars||[]), ...(p.minorStars||[]), ...(p.adjectiveStars||[])]) {
        if (s.mutagen) sihua.push({ star: s.name, mutagen: s.mutagen, palace: p.name });
      }
    }

    return {
      palaces: reorderPalaces(r.palaces),
      horoscope: {
        mingZhu: r.soul || null,
        shenZhu: r.body || null,
        wuXing: r.fiveElementsClass || null,
      },
      sihua,
    };
  } catch { return null; }
}

function calcZodiac(y: number, m: number, d: number) {
  const signs: [number, number, string][] = [
    [1,20,'水瓶'],[2,19,'双鱼'],[3,21,'白羊'],[4,20,'金牛'],
    [5,21,'双子'],[6,21,'巨蟹'],[7,23,'狮子'],[8,23,'处女'],
    [9,23,'天秤'],[10,23,'天蝎'],[11,22,'射手'],[12,22,'摩羯'],
  ];
  for (let i = signs.length - 1; i >= 0; i--)
    if (m > signs[i][0] || (m === signs[i][0] && d >= signs[i][1]))
      return { zodiac: signs[i][2] + '座' };
  return { zodiac: '摩羯座' };
}

function calcLiuNian(y: number) {
  const stems = '甲乙丙丁戊己庚辛壬癸', branches = '子丑寅卯辰巳午未申酉戌亥';
  const cy = new Date().getFullYear();
  const n = (cy - 4) % 60;
  return `${cy}年: ${stems[n%10]}${branches[n%12]}年 | ${(n%12===6||n%12===0)?'变动之年':'稳健之年'}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { year, month, day, hour, location, gender, timezone } = body;
  const y = parseInt(year), m = parseInt(month), d = parseInt(day), h = parseInt(hour) || 12;
  const mi = parseInt(body.minute) || 0;
  const tz = timezone || 'Asia/Shanghai';
  const { lat, lon } = getBirthCoords(body.city, location);
  const g = gender === '女' ? '女' : '男';
  const now = new Date();
  const age = now.getFullYear() - y - (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d) ? 1 : 0);

  // 计算所有数据
  const baziResult = calculateReportBazi(y, m, d, h);
  const hdResult = await calcHD(y, m, d, h, mi, tz, lat, lon);
  const ziweiResult = calcZiwei(y, m, d, h, g);
  const astrologyResult = await calcPlanetPositions(y, m, d, h, mi, lat, lon);
  const wuyunResult = calculateWuyunLiuqi(y);
  const liunianResult = calcLiuNian(y);

  const reportSegments = buildPersonalReportSegments({
    age,
    gender: g,
    birth: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`,
    location: [location, body.city].filter(Boolean).join(' ') || '未提供',
    bazi: baziResult,
    hd: hdResult,
    ziwei: ziweiResult,
    astrology: astrologyResult,
    wuyun: wuyunResult,
    liunian: liunianResult,
  });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com/v1';
  const modelName = process.env.AI_MODEL || 'deepseek-v4-pro';

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  // 创建流式响应
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (const segment of reportSegments) {
          const res = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: modelName,
              messages: [
                { role: 'system', content: PERSONAL_REPORT_SYSTEM_PROMPT },
                { role: 'user', content: segment.prompt },
              ],
              max_tokens: segment.maxTokens,
              temperature: 0.65,
              stream: true,
            }),
          });

          if (!res.ok) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `DeepSeek API error: ${res.status} (${segment.id})` })}\n\n`));
            controller.close();
            return;
          }

          const reader = res.body?.getReader();
          if (!reader) throw new Error(`No response body (${segment.id})`);
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const payload = line.slice(6).trim();
              if (payload === '[DONE]') continue;
              try {
                const parsed = JSON.parse(payload);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              } catch {}
            }
          }
        }

        // Send final data payload
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          done: true,
          bazi: baziResult,
          hd: hdResult ? { type: hdResult.type, profile: hdResult.profile, authority: hdResult.authority, definedCenters: hdResult.definedCenters, channels: hdResult.channels, activatedGates: hdResult.activatedGates } : null,
          ziwei: ziweiResult ? { palaces: ziweiResult.palaces, horoscope: ziweiResult.horoscope, sihua: ziweiResult.sihua } : null,
          zodiac: astrologyResult,
          wuyun: wuyunResult,
          liunian: liunianResult,
        })}\n\n`));
        controller.close();
      } catch (e: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: e.message || 'Stream error' })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
