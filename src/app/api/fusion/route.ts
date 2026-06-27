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
  // 用带小时的Solar创建，getTimeInGanZhi才能正确
  const solar = (hour !== undefined ? (Solar as any).fromYmdHms(year, month, day, hour, 0, 0) : Solar.fromYmd(year, month, day)) as any;
  const lunar = solar.getLunar();

  const yearPillar = lunar.getYearInGanZhiExact();
  const monthPillar = lunar.getMonthInGanZhiExact();
  const dayPillar = lunar.getDayInGanZhiExact();
  const timePillar = hour !== undefined ? lunar.getTimeInGanZhi() : '--';
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
  y: number, m: number, d: number, h: number,
  bazi: ReturnType<typeof calculateBaziLocal>,
  hd: any,
  zodiac: string,
  tz?: string
): string {
  const elements = Object.entries(bazi.elementDistribution).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}${v}`).join('，') || '未知';
  const now = new Date();
  const age = now.getFullYear() - y - (now.getMonth()+1 < m || (now.getMonth()+1 === m && now.getDate() < d) ? 1 : 0);

  return `请为一位${age}岁的用户出具一份三系统融合人生指导报告。

    【用户数据】
    - 出生：${y}年${m}月${d}日 ${String(h).padStart(2,'0')}时${tz && tz !== 'Asia/Shanghai' ? '（原出生地时区：'+tz+'，已转换为中国标准时间）' : ''}（当前日期：${now.getFullYear()}年${now.getMonth()+1}月，当前${age}岁）
    - 八字：${bazi.pillars.join(' ')}，日主${bazi.dayMaster}
    - 五行：${elements}
    - 人类图：${hd.type}（类型），人生角色${hd.profile}，内在权威${hd.authority}
    - 策略：${hd.strategy} | 签名：${hd.signature} | 非自我：${hd.notSelfTheme}
    - 定义中心：${(hd.definedCenters||[]).join('、') || '无'}
    - 激活通道：${(hd.channels||[]).join('、') || '无'}
    - 太阳星座：${zodiac}

    【报告要求】
    以三系统融合为框架，撰写涵盖以下维度的全方位指导报告（不少于2000字）：

    1. 三系统交叉定位（核心总览）
       找出八字五行、人类图类型、太阳星座之间的共通点和互补点
       一句话定性——这个人最核心的生命密码

    2. 工作事业与学习成长
       结合人类图策略和八字十神，给出发展建议
       当前生命阶段的成长主题

    3. 人际关系
       能量交换模式（人类图开放中心的影响）
       合盘与社交建议

    4. 财富与健康
       五行平衡与能量管理建议
       适合的生活方式

    5. 人生风险提示
       非自我主题「${hd.notSelfTheme}」在哪些场景最容易出现
       需要规避的关键陷阱
       未来1-3年的重要决策节点

    6. 一句话核心建议
       用一句话总结最重要的生命指导

    【写作风格要求】
    - 语气温暖专业有力，像智慧长者谈心
    - 避免"根据提供的数据"等套话
    - 每个维度都要有具体的可操作建议
    - 三系统融合不是机械拼凑，要找到内在联系`;
    }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, location } = body;
    if (!year || !month || !day) return NextResponse.json({ error: '请填写完整的出生日期' }, { status: 400 });

    const y = parseInt(year), m = parseInt(month), d = parseInt(day), h = hour !== undefined ? parseInt(hour) : 12;
    const tz = body.timezone || 'Asia/Shanghai';

    // 时区转换：将当地时间转为中国时间（八字需用中国时间）
    const offsetMap: Record<string, number> = {
      'America/Los_Angeles': -7, 'America/New_York': -4,
      'Europe/London': 0, 'Europe/Paris': 1,
      'Australia/Sydney': 10, 'Asia/Tokyo': 9, 'Asia/Shanghai': 8,
    };
    const localOffset = offsetMap[tz] ?? 8;
    const chinaOffset = 8;
    const hourDiff = chinaOffset - localOffset;

    let baziH = h;
    let baziD = d;
    let baziM = m;
    let baziY = y;

    // 如果小时差不为0，需要调整日期
    if (hourDiff !== 0) {
      baziH = h + hourDiff;
      if (baziH >= 24) { baziH -= 24; baziD += 1; }
      else if (baziH < 0) { baziH += 24; baziD -= 1; }
      // 处理跨月跨年
      if (baziD < 1) { baziM -= 1; if (baziM < 1) { baziM = 12; baziY -= 1; } baziD = new Date(baziY, baziM, 0).getDate(); }
      else {
        const maxD = new Date(baziY, baziM, 0).getDate();
        if (baziD > maxD) { baziD = 1; baziM += 1; if (baziM > 12) { baziM = 1; baziY += 1; } }
      }
    }

    // 八字用转换后的中国时间
    const bazi = calculateBaziLocal(baziY, baziM, baziD, baziH);
    const zodiac = getZodiacSign(m, d); // 星座用人原本地日期

    // 坐标映射
    const LOC_COORDS: Record<string, [number, number]> = {
      '北京':[39.9,116.4],'山东':[36.4,116.6],'湖北':[30.6,114.3],'广东':[23.1,113.3],
      '上海':[31.2,121.5],'天津':[39.1,117.2],'重庆':[29.6,106.6],'江苏':[32.1,118.8],
      '浙江':[30.3,120.2],'安徽':[31.9,117.3],'福建':[26.1,119.3],'江西':[28.7,115.9],
      '河南':[34.8,113.7],'湖南':[28.2,112.9],'广西':[22.8,108.4],'海南':[20.0,110.4],
      '四川':[30.6,104.1],'贵州':[26.7,106.6],'云南':[25.0,102.7],'西藏':[29.7,91.1],
      '陕西':[34.3,108.9],'甘肃':[36.1,103.8],'青海':[36.6,101.8],'宁夏':[38.5,106.3],
      '新疆':[43.8,87.6],'香港':[22.3,114.2],'澳门':[22.2,113.5],'台湾':[25.0,121.5],
    };
    let lat = 39.9, lon = 116.4;
    if (location) {
      for (const [prov, coords] of Object.entries(LOC_COORDS)) {
        if ((location as string).includes(prov)) { lat = coords[0]; lon = coords[1]; break; }
      }
    }

    const hdMod = require('../../../lib/hd-engine-v5.cjs');
    const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const ts = `${String(h).padStart(2,'0')}:00`;
    const hdResult = hdMod.calculateBodygraph(ds, ts, tz, lat, lon);

    const prompt = buildPrompt(baziY, baziM, baziD, baziH, bazi, hdResult, zodiac, tz);

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
