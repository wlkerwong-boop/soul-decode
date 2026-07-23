// 七系统融合报告 API — 人生总览
import { NextRequest, NextResponse } from 'next/server';
import { getBirthCoords } from '@/data/cities';
import { calculateBodygraph } from '@/lib/hd';

function calcBazi(y: number, m: number, d: number, h: number) {
  const { Solar } = require('lunar-javascript');
  const solar = Solar.fromYmdHms(y, m, d, h, 0, 0);
  const lunar = solar.getLunar();
  const pillars = [
    lunar.getYearInGanZhi(), lunar.getMonthInGanZhi(),
    lunar.getDayInGanZhi(), lunar.getTimeInGanZhi()
  ];
  const dayMaster = lunar.getDayGan();
  const elMap: Record<string, string> = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
  return { pillars, dayMaster: `${dayMaster}（${elMap[dayMaster]}）` };
}

async function calcHD(y: number, m: number, d: number, h: number, mi: number, tz: string, lat: number, lon: number) {
  try {
    const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const ts = `${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`;
    return await calculateBodygraph(ds, ts, tz, lat, lon);
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
  const stem = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'][(y-4) % 10];
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
    const mi = parseInt(body.minute) || 0;
    const tz = timezone || 'Asia/Shanghai';
    const { lat, lon } = getBirthCoords(body.city, location);
    const g = gender === '女' ? '女' : '男';
    const now = new Date();
    const age = now.getFullYear() - y - (now.getMonth()+1<m||(now.getMonth()+1===m&&now.getDate()<d)?1:0);

    // 并行计算全部7个系统
    const [baziResult, hdResult, ziweiResult, zodiacResult] = await Promise.all([
      Promise.resolve(calcBazi(y, m, d, h)),
      Promise.resolve(calcHD(y, m, d, h, mi, tz, lat, lon)),
      Promise.resolve(calcZiwei(y, m, d, h, g)),
      Promise.resolve(calcZodiac(y, m, d)),
    ]);
    
    const wuyunResult = calcWuyunLiuqi(y);
    const liunianResult = calcLiuNian(y, now.getFullYear());

    // 构建完整提示词（与阿里云 report-api 同步的七系统格式）
    const prompt = `你是一位修炼数十年的命理导师，精通八字、人类图、占星、紫微斗数、五运六气、流年、人生规划七大体系。你的报告像长辈跟孩子谈心——温暖、直接、有力。每个数据点转化为具体人生场景。交叉印证。禁止AI套话。字数10000-20000字。**必须完整生成所有章节，不得截断。**

【报告格式要求-严格按以下执行】
- 开头段：直接称呼用户（如"老王，你53岁"），简述核心命盘，自然引入
- 每个系统数据需配表格：八字四柱表（天干/地支/十神/藏干/纳音）、人类图数据表（类型/角色/权威/中心/通道/闸门）、紫微12宫全表（含辅星和意义列）
- 通道描述要详细：每条通道写Gate名称+功能说明，标注引用来源如[(Human Design HD)](https://humandesignhd.com) 或 [(Free Quantum Human Design)](https://freehumandesignchart.com)
- 紫微部分标注特定格局名称（如"七杀朝斗""紫府同宫"）
- 占星部分引用经典组合描述（如太阳天秤+上升狮子="优雅的君主"）
- 七系统交叉印证：Markdown表格，横轴为八字/人类图/占星/紫微，纵轴为核心本质/能量模式/人际/事业/挑战/优势。每格加粗核心词
- 流年运势：Markdown表格（维度/影响/建议），写出2026丙午年全年运势要点
- 财富配置：Markdown表格（五行/资产/配置依据/百分比建议）
- 健康养生：Markdown表格（调理维度/具体建议），包含能量管理策略
- 大运分析：写出当前大运和下一大运的具体起止年龄，每步大运的核心主题
- **时间窗口与人生规划**：给出未来1-3年的关键决策节点和最佳行动窗口。结合当年流年和八字大运，给出具体建议——"今年几月适合做重大决定""今年何时适合出差/学习/投资/休息"等
- **言行指引**：基于用户八字和HD，给出每日的普适性行动计划建议。包括但不限于：一日中各时段的能量走势、适合的工作类型、人际互动建议、决策最佳时间、应避免的行为模式。这部分要写具体，不要只讲概念。
- 关键风险提示：编号列表1-5项，每项含风险说明+应对建议
- 字体风格：段落之间空行，表格对齐，重点加粗
- 能量管理：针对开放中心给出具体保护建议
- 最后必须有一句「点睛金句」作为收尾（用**加粗**）
- 报告末尾标注：*本报告基于八字（lunar-javascript）、人类图（Jovian认证v6引擎）、占星（查表法）、紫微斗数（iztro引擎）、五运六气（天干化运/地支化气）七系统融合分析生成。*

请为一位${age}岁的${g}性出具一份七系统融合人生总览报告。用户未提供姓名，报告中称呼统一用"你"，禁止编造任何名字。数据如下：

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
${ziweiResult.palaces.map((p:any)=>`${p.name}宫：${p.stars.slice(0,5).join('、')||'无主星'}`).join('\\n')}` : '【三、紫微斗数】数据暂缺'}

【四、西方占星】
太阳星座：${zodiacResult.zodiac}

【五、五运六气】
${wuyunResult.description}

【六、流年运势】
${liunianResult}

请按以下7个章节撰写完整报告。每章必须七系统交叉印证+对比表。字数6000-8000字。
第一章 天性禀赋与人格底色
第二章 事业天赋与财富格局（含2026流年事业运势表）
第三章 人际关系与情感模式
第四章 学习成长与灵性发展
第五章 健康体质与养生策略（**最重要章节**：先天体质+五运六气+具体养生方案（饮食/起居/运动/环境）+流年健康风险）
第六章 人生关键节点与风险提示
第七章 终极建议（两个核心结论+点睛之言）
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
        body: JSON.stringify({ year, month, day, hour, minute: body.minute || '0', gender, timezone: tz, location, city: body.city, lat, lon }),
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
              { role: 'system', content: '你是修炼数十年的命理导师，精通八字、人类图、占星、紫微斗数、五运六气、流年、人生规划七大体系。你的报告像长辈跟孩子谈心——温暖、直接、有力。每个数据点转化为具体人生场景。交叉印证。禁止AI套话。字数10000-20000字。**必须完整生成所有章节，不得截断。**\n\n【报告格式要求】\n- 每个系统配表格：八字四柱表、人类图数据表、紫微12宫全表\n- 七系统交叉印证：Markdown表格\n- 流年运势/财富配置/健康养生：Markdown表格\n- 大运分析+时间窗口+言行指引+关键风险提示\n- 最后必须有一句「点睛金句」\n- 报告末尾标注七系统来源' },
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
        hd: hdResult ? { type: hdResult.type, profile: hdResult.profile, authority: hdResult.authority, definedCenters: hdResult.definedCenters, activatedGates: hdResult.activatedGates, channels: hdResult.channels } : null,
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
