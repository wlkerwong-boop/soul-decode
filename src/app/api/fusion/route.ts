/**
 * 融合分析 API v2
 * 八字 + 人类图 + 占星 三系统融合报告
 * 调用DeepSeek AI生成Kimi级别的深度个性化报告
 */
import { NextRequest, NextResponse } from 'next/server';
import { Solar } from 'lunar-javascript';

export const runtime = 'nodejs';

const GAN_ELEMENT: Record<string, string> = {
  '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水',
};

const ZODIAC_SIGNS = [
  {sign:'摩羯座',start:'01-01',end:'01-19'},{sign:'水瓶座',start:'01-20',end:'02-18'},
  {sign:'双鱼座',start:'02-19',end:'03-20'},{sign:'白羊座',start:'03-21',end:'04-19'},
  {sign:'金牛座',start:'04-20',end:'05-20'},{sign:'双子座',start:'05-21',end:'06-20'},
  {sign:'巨蟹座',start:'06-21',end:'07-22'},{sign:'狮子座',start:'07-23',end:'08-22'},
  {sign:'处女座',start:'08-23',end:'09-22'},{sign:'天秤座',start:'09-23',end:'10-22'},
  {sign:'天蝎座',start:'10-23',end:'11-21'},{sign:'射手座',start:'11-22',end:'12-21'},
  {sign:'摩羯座',start:'12-22',end:'12-31'},
];

function getZodiacSign(month: number, day: number): string {
  const md = `${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  for (const z of ZODIAC_SIGNS) {
    if (md >= z.start && md <= z.end) return z.sign;
  }
  return '未知';
}

function calculateBaziLocal(year: number, month: number, day: number, hour?: number) {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const hourStr = hour !== undefined ? String(hour) : undefined;
  const yearPillar = lunar.getYearInGanZhiExact();
  const monthPillar = lunar.getMonthInGanZhiExact();
  const dayPillar = lunar.getDayInGanZhiExact();
  const timePillar = hourStr ? lunar.getTimeInGanZhi(hourStr) : '--';
  const pillars = [yearPillar, monthPillar, dayPillar, timePillar];
  const dayMaster = lunar.getDayGan();
  const dayMasterElement = GAN_ELEMENT[dayMaster] || '—';

  const ganElements = pillars.map(p => GAN_ELEMENT[p.charAt(0)] || '—');
  const allElements = [...ganElements.filter(e => e !== '—')];
  const elementDistribution: Record<string, number> = {};
  for (const el of allElements) elementDistribution[el] = (elementDistribution[el] || 0) + 1;

  return { pillars, dayMaster: `${dayMaster}（${dayMasterElement}）`, elementDistribution };
}

function buildPrompt(
  year: number, month: number, day: number, hour: number,
  bazi: ReturnType<typeof calculateBaziLocal>,
  hd: any,
  zodiac: string
): string {
  const elements = Object.entries(bazi.elementDistribution)
    .sort((a,b) => b[1]-a[1])
    .map(([k,v]) => `${k}${v}`).join('，') || '未知';

  return `你是一位融合八字命理、人类图（Human Design）与西方占星学的三系统命理导师。请根据以下个人数据，为ta生成一份**完整的三系统融合人生指导报告**。

【用户数据】
出生日期：${year}年${month}月${day}日 ${String(hour).padStart(2,'0')}时
八字四柱：${bazi.pillars.join(' ')}
日主：${bazi.dayMaster}
五行分布：${elements}
人类图类型：${hd.type || '未知'}
策略：${hd.strategy || '未知'}
内在权威：${hd.authority || '未知'}
人生角色：${hd.profile || '未知'}
定义中心：${(hd.definedCenters||[]).join('、') || '无'}
开放中心：${(hd.undefinedCenters||[]).join('、') || '无'}
激活通道：${(hd.channels||[]).join('、') || '无'}
太阳星座：${zodiac}

【报告要求】
请用中文撰写，语气温暖、专业、有洞察力。篇幅约1500-3000字。内容结构如下：

## 1. 核心命盘总览：三系统交叉定位
- 八字：解读日主五行、四柱特质、五行喜忌
- 人类图：类型本质、人生角色、权威类型如何影响决策
- 占星：太阳星座的核心特质，与八字/人类图的能量关系
- 三系统能量印证：找出八字五行、人类图类型、太阳星座之间的共通点和互补点

## 2. 工作事业
- 结合人类图策略和八字五行，给出事业发展的核心建议
- 指出天赋优势和潜在陷阱

## 3. 决策指南
- 如何运用内在权威做正确的人生决策
- 结合八字喜用神和人类图策略给出具体建议

## 4. 健康与能量管理
- 五行平衡建议
- 人类图能量中心定义的强弱项
- 适合的生活节奏

## 5. 成长路径
- 当前所处的生命阶段（结合人类图人生角色+八字大运）
- 下一阶段的发展方向
- 需要规避的陷阱

## 6. 一句话核心建议
用一句话总结这个人最应该记住的人生指导。

不要使用"根据提供的数据"、"基于上述信息"等套话。直接以导师的口吻书写。`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, location } = body;
    if (!year || !month || !day) return NextResponse.json({ error: '请填写完整的出生日期' }, { status: 400 });

    const y = parseInt(year), m = parseInt(month), d = parseInt(day), h = hour !== undefined ? parseInt(hour) : 12;

    // 并行计算八字 + 人类图
    const bazi = calculateBaziLocal(y, m, d, h);
    const zodiac = getZodiacSign(m, d);

    const hdMod = require('../../../lib/hd-engine-v5.cjs');
    const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const ts = `${String(h).padStart(2,'0')}:00`;
    const hdResult = hdMod.calculateBodygraph(ds, ts, 'Asia/Shanghai', 39.9, 116.4);

    const prompt = buildPrompt(y, m, d, h, bazi, hdResult, zodiac);

    // 调用DeepSeek
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com/v1';
    const model = process.env.AI_MODEL || 'deepseek-chat';
    let fusion = '';
    let aiUsed = false;

    if (apiKey) {
      try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: '你是顶级的三系统命理导师，融合八字、人类图、占星三大体系给出来访者的人生指导。你的语言温暖、精准、有深度。' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 4000,
            temperature: 0.7,
          }),
        });
        const data = await res.json();
        fusion = data.choices?.[0]?.message?.content || '';
        aiUsed = true;
      } catch (e: any) {
        console.error('DeepSeek call failed:', e.message);
      }
    }

    return NextResponse.json({
      success: true,
      bazi,
      humanDesign: {
        type: hdResult.type,
        profile: hdResult.profile,
        authority: hdResult.authority,
        definedCenters: hdResult.definedCenters,
        channels: hdResult.channels,
      },
      zodiac,
      fusion: fusion || '（AI报告生成暂不可用，请稍后再试或联系管理员配置DeepSeek API Key）',
      aiGenerated: aiUsed,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '融合分析失败' }, { status: 500 });
  }
}
