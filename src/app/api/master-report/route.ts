// 七系统融合报告 API — 人生总览
import { NextRequest, NextResponse } from 'next/server';

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
    const mod = require('../../../lib/hd-engine-v6.cjs');
    const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const ts = `${String(h).padStart(2,'0')}:00`;
    return mod.calculateBodygraph(ds, ts, tz, 0, 0);
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
      horoscope: r.horoscope || null,
    };
  } catch { return null; }
}

function calcZodiac(y: number, m: number, d: number) {
  const signs = ['摩羯','水瓶','双鱼','白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手'];
  const dayOfYear = Math.floor((Date.UTC(y,m-1,d) - Date.UTC(y,0,0)) / 86400000);
  const idx = Math.floor((dayOfYear - (y%4===0&&(y%100!==0||y%400===0)?79:80)) / 30.44);
  const sunSign = idx >= 0 && idx < 12 ? signs[idx] : '未知';
  return { sunSign, zodiac: `${sunSign}座` };
}

function calcWuyunLiuqi(y: number) {
  // 五运：天干化运
  const stem = ['庚','辛','壬','癸','甲','乙','丙','丁','戊','己'][(y-4) % 10];
  const stemYun: Record<string, string> = {甲:'土运',乙:'金运',丙:'水运',丁:'木运',戊:'火运',己:'土运',庚:'金运',辛:'水运',壬:'木运',癸:'火运'};
  // 六气：地支化气
  const branch = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][(y-4) % 12];
  const branchQi: Record<string, string> = {子:'少阴君火',丑:'太阴湿土',寅:'少阳相火',卯:'阳明燥金',辰:'太阳寒水',巳:'厥阴风木',午:'少阴君火',未:'太阴湿土',申:'少阳相火',酉:'阳明燥金',戌:'太阳寒水',亥:'厥阴风木'};
  return {
    year: y,
    stem, branch,
    wuyun: `${stem}年 → ${stemYun[stem]}`,
    liuqi: `${branch}年 → ${branchQi[branch]}`,
    description: `${y}年天干为${stem}，主${stemYun[stem]}；地支为${branch}，主${branchQi[branch]}。${stemYun[stem]}之年，${branchQi[branch]}为司天之气。`,
  };
}

function calcLiuNian(y: number, curYear: number) {
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const birthStem = stems[(y - 4) % 10];
  const birthBranch = branches[(y - 4) % 12];
  const curStem = stems[(curYear - 4) % 10];
  const curBranch = branches[(curYear - 4) % 12];
  return `出生：${birthStem}${birthBranch}年 | 当前流年：${curStem}${curBranch}年（${curYear}年）`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, day, hour, location, gender, timezone } = body;
    const y=parseInt(year), m=parseInt(month), d=parseInt(day), h=hour!==undefined?parseInt(hour):12;
    const tz = timezone || 'Asia/Shanghai';
    const g = gender === '女' ? '女' : '男';
    const now = new Date();
    const age = now.getFullYear() - y - (now.getMonth()+1<m||(now.getMonth()+1===m&&now.getDate()<d)?1:0);

    // 并行计算全部7个系统
    const [baziResult, hdResult, ziweiResult, zodiacResult] = await Promise.all([
      Promise.resolve(calcBazi(y, m, d, h)),
      Promise.resolve(calcHD(y, m, d, h, tz)),
      Promise.resolve(calcZiwei(y, m, d, h, g)),
      Promise.resolve(calcZodiac(y, m, d)),
    ]);
    
    const wuyunResult = calcWuyunLiuqi(y);
    const liunianResult = calcLiuNian(y, now.getFullYear());

    // 构建完整提示词
    const prompt = `你是一位修行数十年的命理导师，精通八字命理、人类图（Human Design）、西方占星、紫微斗数、五运六气五大体系。你的报告以温暖、接地气、有洞察力著称。

请为一位${age}岁的${g}性用户出具一份**七系统融合人生总览报告**。

【要求】
分析维度包括但不限于：天性禀赋、事业天赋、财富格局、人际关系、情感婚姻、健康体质、学习成长、人生风险提示、人生关键节点、当前流年运势、年度健康与运势建议。

- 用温暖接地气的语气，像修行多年的老师在跟朋友谈心
- 不要用任何AI模板套话
- 七系统要真正交叉融合，找到内在联系，而不是分段罗列
- 每部分给出具体的、可操作的建议
- 最后给出一句非常点睛的话

【用户数据】
- 出生：${y}年${m}月${d}日 ${String(h).padStart(2,'0')}时 ${tz!=='Asia/Shanghai'?'（原出生地：'+tz+'）':''}
- 当前：${now.getFullYear()}年${now.getMonth()+1}月，${age}岁

【一、八字命盘】
四柱：${baziResult.pillars.join(' ')}
日主：${baziResult.dayMaster}

${hdResult ? `【二、人类图】
类型：${hdResult.type}
人生角色：${hdResult.profile}
内在权威：${hdResult.authority}
策略：${hdResult.strategy}
签名：${hdResult.signature}
非自我主题：${hdResult.notSelfTheme}
定义中心：${(hdResult.definedCenters||[]).join('、')||'无'}
未定义中心：${(hdResult.undefinedCenters||[]).join('、')||'无'}
通道：${(hdResult.channels||[]).join('、')||'无'}` : ''}

${ziweiResult ? `【三、紫微斗数】
${ziweiResult.palaces.map((p:any)=>`${p.name}宫：${p.stars.slice(0,5).join('、')||'无主星'}`).join('\n')}` : ''}

【四、西方占星】
太阳星座：${zodiacResult.zodiac}

【五、五运六气】
${wuyunResult.description}

【六、流年运势】
${liunianResult}

【七、人生规划建议】
结合以上全部信息，给出5年内的人生关键节点提示与建议。`;

    // 调用DeepSeek V4 Pro
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com/v1';
    let report = '';

    if (apiKey) {
      try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-v4-pro',
            messages: [
              { role: 'system', content: '你是一位修行数十年的命理导师，精通八字、人类图、西方占星、紫微斗数、五运六气五大体系。你的报告温暖、精准、有深度，像长辈谈心一样自然。从不使用AI套话。' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 6000,
            temperature: 0.7,
          }),
        });
        const data = await res.json();
        report = data.choices?.[0]?.message?.content || '';
      } catch {}
    }

    return NextResponse.json({
      success: true,
      report,
      data: {
        bazi: baziResult,
        hd: hdResult ? { type: hdResult.type, profile: hdResult.profile, authority: hdResult.authority, channels: hdResult.channels } : null,
        ziwei: ziweiResult ? { palaces: ziweiResult.palaces } : null,
        zodiac: zodiacResult,
        wuyun: wuyunResult,
        liunian: liunianResult,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
