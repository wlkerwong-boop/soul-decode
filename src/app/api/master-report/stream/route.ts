// 流式七系统报告 API — 边生成边返回
import { NextRequest } from 'next/server';

function calcBazi(y: number, m: number, d: number, h: number) {
  const { Solar } = require('lunar-javascript');
  const solar = Solar.fromYmdHms(y, m, d, h, 0, 0);
  const lunar = solar.getLunar();
  const pillars = [
    lunar.getYearInGanZhiExact(), lunar.getMonthInGanZhiExact(),
    lunar.getDayInGanZhiExact(), lunar.getTimeInGanZhi()
  ];
  const dayMaster = lunar.getDayGan();
  const elMap: Record<string, string> = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
  return { pillars, dayMaster: `${dayMaster}（${elMap[dayMaster]}）` };
}

function calcHD(y: number, m: number, d: number, h: number, tz: string) {
  try {
    const mod = require('../../../lib/hd-engine-v5.cjs');
    const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const ts = `${String(h).padStart(2,'0')}:00`;
    const loc = tz === 'Asia/Shanghai' ? 39.9 : 0;
    return mod.calculateBodygraph(ds, ts, tz, loc, loc);
  } catch { return null; }
}

function calcZiwei(y: number, m: number, d: number, h: number, gender: string) {
  try {
    const iztro = require('iztro');
    const ti = Math.floor((h + 1) / 2) % 12;
    const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const r = iztro.astro.bySolar(ds, ti, gender, true, 'zh-CN');
    if (!r?.palaces) return null;
    return {
      palaces: r.palaces.map((p: any) => ({
        name: p.name,
        stars: [...((p.majorStars||[]).map((s:any) => typeof s==='object'?s.name:s)),
                 ...((p.minorStars||[]).map((s:any) => typeof s==='object'?s.name:s))].filter(Boolean),
      })),
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

function calcWuyunLiuqi(y: number) {
  const stem = ['庚','辛','壬','癸','甲','乙','丙','丁','戊','己'][(y-4) % 10];
  const branch = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][(y-4) % 12];
  const yun: Record<string, string> = {甲:'土运',乙:'金运',丙:'水运',丁:'木运',戊:'火运',己:'土运',庚:'金运',辛:'水运',壬:'木运',癸:'火运'};
  const qi: Record<string, string> = {子:'少阴君火',丑:'太阴湿土',寅:'少阳相火',卯:'阳明燥金',辰:'太阳寒水',巳:'厥阴风木',午:'少阴君火',未:'太阴湿土',申:'少阳相火',酉:'阳明燥金',戌:'太阳寒水',亥:'厥阴风木'};
  return { year: y, stem, branch, wuyun: `${stem}年 → ${yun[stem]}`, liuqi: `${branch}年 → ${qi[branch]}`, description: `${y}年天干为${stem}，主${yun[stem]}；地支为${branch}，主${qi[branch]}。${yun[stem]}之年，${qi[branch]}为司天之气。` };
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
  const tz = timezone || 'Asia/Shanghai';
  const g = gender === '女' ? '女' : '男';
  const age = new Date().getFullYear() - y;

  // 计算所有数据
  const baziResult = calcBazi(y, m, d, h);
  const hdResult = calcHD(y, m, d, h, tz);
  const ziweiResult = calcZiwei(y, m, d, h, g);
  const zodiacResult = calcZodiac(y, m, d);
  const wuyunResult = calcWuyunLiuqi(y);
  const liunianResult = calcLiuNian(y);

  // 构建提示词（精简版，流式不需完整格式约束——交给 system message）
  const userPrompt = `请为一位${age}岁的${g}性出具一份七系统融合人生总览报告。

数据：
八字四柱：${baziResult.pillars.join(' ')}
日主：${baziResult.dayMaster}
${hdResult ? `人类图：${hdResult.type} ${hdResult.profile}，${hdResult.authority}，策略：${hdResult.strategy}，定义中心：${(hdResult.definedCenters||[]).join('、')}，通道：${(hdResult.channels||[]).join('、')}` : '人类图：数据暂缺'}
${ziweiResult ? `紫微斗数：${ziweiResult.palaces.map((p:any)=>`${p.name}宫${p.stars.slice(0,4).join('、')}`).join('，')}` : '紫微：数据暂缺'}
星座：${zodiacResult.zodiac}
${wuyunResult.description}
流年：${liunianResult}`;

  const systemPrompt = `你是修炼数十年的命理导师，精通八字、人类图、占星、紫微斗数、五运六气、流年、人生规划七大体系。报告像长辈谈心——温暖、直接、有力。字数10000-20000字。禁止AI套话。

【格式要求】
- 开头直接称呼用户，简述核心命盘
- 八字四柱表+人类图数据表+紫微12宫表+七系统交叉印证表
- 流年运势表+财富配置表+健康养生表+大运分析
- 时间窗口与人生规划+每日言行指引+关键风险提示
- 最后点睛金句（加粗）
- 末尾标注七系统来源`;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com/v1';
  const modelName = process.env.AI_MODEL || 'deepseek-chat';

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  // 创建流式响应
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 24000,
            temperature: 0.7,
            stream: true,
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `DeepSeek API error: ${res.status}` })}\n\n`));
          controller.close();
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'No response body' })}\n\n`));
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {}
            }
          }
        }

        // Send final data payload
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          done: true,
          bazi: baziResult,
          hd: hdResult ? { type: hdResult.type, profile: hdResult.profile, authority: hdResult.authority, definedCenters: hdResult.definedCenters, channels: hdResult.channels, activatedGates: hdResult.activatedGates } : null,
          ziwei: ziweiResult ? { palaces: ziweiResult.palaces } : null,
          zodiac: zodiacResult,
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
