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
    // 使用v5引擎（无WASM依赖，Vercel上可靠运行）
    const mod = require('../../../lib/hd-engine-v5.cjs');
    const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const ts = `${String(h).padStart(2,'0')}:00`;
    const loc = tz === 'Asia/Shanghai' ? 39.9 : 0;
    return mod.calculateBodygraph(ds, ts, tz, loc, loc);
  } catch (e: any) {
    console.error('HD calc failed:', e.message);
    return null;
  }
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
  const signs: [number, number, string][] = [
    [1,20,'水瓶'],[2,19,'双鱼'],[3,21,'白羊'],[4,20,'金牛'],
    [5,21,'双子'],[6,21,'巨蟹'],[7,23,'狮子'],[8,23,'处女'],
    [9,23,'天秤'],[10,23,'天蝎'],[11,22,'射手'],[12,22,'摩羯'],
  ];
  for (let i = signs.length - 1; i >= 0; i--) {
    if (m > signs[i][0] || (m === signs[i][0] && d >= signs[i][1])) {
      return { sunSign: signs[i][2], zodiac: signs[i][2] + '座' };
    }
  }
  return { sunSign: '摩羯', zodiac: '摩羯座' };
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
    const prompt = `你是一位修炼数十年的命理导师，精通八字命理、人类图(HumanDesign)、西方占星、紫微斗数、五运六气、流年运势、人生规划七大体系。

【核心要求】
- 你写的是「人生传记」而非「算法报告」——每个数据点都要转化成具体的人生场景和可操作建议
- 七系统必须交叉印证，找到内在联系，不能分段罗列
- 语言要像长辈跟孩子谈心——温暖、直接、有力，绝不回避尖锐话题

【输出规范】
- 总字数：5000-8000字
- 每个分析维度不能少于400字
- 每个维度结尾必须有一句可以立即执行的具体建议
- 最后必须有「一句话点睛」

【铁律】
1. 禁止使用：「让我们来看看」「首先」「其次」「在当今这个时代」「值得一提的是」「总的来说」「综上所述」
2. 每个数据必须对应具体人生场景
3. 必须对数据不足的部分标注「基于现有信息」

请为一位${age}岁的${g}性撰人生总览报告。

【一、八字命盘】
四柱：${baziResult.pillars.join(' ')}
日主：${baziResult.dayMaster}

${hdResult ? `【二、人类图】
类型：${hdResult.type} | 人生角色：${hdResult.profile}
内在权威：${hdResult.authority}
策略：${hdResult.strategy} | 签名：${hdResult.signature} | 非自我：${hdResult.notSelfTheme}
定义中心：${(hdResult.definedCenters||[]).join('、')||'无'} | 未定义：${(hdResult.undefinedCenters||[]).join('、')||'无'}
通道：${(hdResult.channels||[]).join('、')||'无'}
激活闸门：${(hdResult.activatedGates||[]).join('、')||'无'}` : '【二、人类图】数据暂缺'}

${ziweiResult ? `【三、紫微斗数】
${ziweiResult.palaces.map((p:any)=>`${p.name}宫：${p.stars.slice(0,5).join('、')||'无主星'}`).join('\n')}` : '【三、紫微斗数】数据暂缺'}

【四、西方占星】
太阳星座：${zodiacResult.zodiac}

【五、五运六气】
${wuyunResult.description}

【六、流年运势】
${liunianResult}

【七、报告结构要求】
请按以下七个维度撰写，每个维度不少于400字，要有具体数据和场景：
1. 天性禀赋与人格底色（八字日主+人类图类型+星座的交叉印证）
2. 事业天赋与财富格局
3. 人际关系与情感模式
4. 学习成长与灵性发展
5. 健康体质与五运六气
6. 人生关键节点与风险提示（结合流年大运）
7. 给${age}岁${g}性的终极建议
`;

    // 调用DeepSeek V4 Pro
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com/v1';
    let report = '';

    // 优先使用阿里云API（无超时限制）
    const aliyunUrl = 'http://47.102.142.225/api/master-report';
    try {
      const aliRes = await fetch(aliyunUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, day, hour, minute: body.minute || '0', gender, timezone: tz, location }),
        signal: AbortSignal.timeout(180000), // 180s超时
      });
      const aliData = await aliRes.json();
      if (aliData.success && aliData.report) {
        report = aliData.report;
      }
    } catch (e) {
      console.log('Aliyun API unavailable, falling back to local:', (e as Error).message);
    }

    // 阿里云API不可用时退回到DeepSeek直连
    if (!report && apiKey) {
      try {
        const modelName = process.env.AI_MODEL || 'deepseek-chat';
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: '你是修炼数十年的命理导师，精通八字命理、人类图、西方占星、紫微斗数、五运六气、流年运势、人生规划七大体系。你的报告要写成「人生传记」而非「算法报告」。语言温暖、直接、有力。总字数5000-8000字。禁止AI套话。**必须完整生成所有章节，不得截断。**' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 24000,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(180000),
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
