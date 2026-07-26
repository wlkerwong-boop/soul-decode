import { Solar } from 'lunar-javascript';

export interface ReportSegment {
  id: string;
  prompt: string;
  maxTokens: number;
}

export interface PersonalReportContext {
  age: number;
  gender: string;
  birth: string;
  location: string;
  bazi: {
    pillars: string[];
    dayMaster: string;
    elementDistribution: Record<string, number>;
  };
  hd: any;
  ziwei: any;
  astrology: any;
  wuyun: any;
  liunian: string;
}

export function calculateReportBazi(year: number, month: number, day: number, hour: number) {
  const lunar = (Solar as any).fromYmdHms(year, month, day, hour, 0, 0).getLunar();
  const pillars = [
    lunar.getYearInGanZhiExact(),
    lunar.getMonthInGanZhiExact(),
    lunar.getDayInGanZhiExact(),
    lunar.getTimeInGanZhi(),
  ];
  const stemElements: Record<string, string> = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
  const branchElements: Record<string, string> = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
  const ganElements = pillars.map(pillar => stemElements[pillar[0]]);
  const zhiElements = pillars.map(pillar => branchElements[pillar[1]]);
  const elements = [...ganElements, ...zhiElements];
  const elementDistribution = elements.reduce<Record<string, number>>((distribution, element) => {
    distribution[element] = (distribution[element] || 0) + 1;
    return distribution;
  }, {});
  const dayStem = lunar.getDayGan();
  return {
    pillars,
    ganElements,
    zhiElements,
    elements,
    elementDistribution,
    dayMaster: `${dayStem}（${stemElements[dayStem]}）`,
  };
}

export function calculateWuyunLiuqi(year: number) {
  const stem = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'][(year - 4) % 10];
  const branch = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][(year - 4) % 12];
  const movements: Record<string, string> = {甲:'土运',乙:'金运',丙:'水运',丁:'木运',戊:'火运',己:'土运',庚:'金运',辛:'水运',壬:'木运',癸:'火运'};
  const qi: Record<string, string> = {子:'少阴君火',丑:'太阴湿土',寅:'少阳相火',卯:'阳明燥金',辰:'太阳寒水',巳:'厥阴风木',午:'少阴君火',未:'太阴湿土',申:'少阳相火',酉:'阳明燥金',戌:'太阳寒水',亥:'厥阴风木'};
  const wuyun = movements[stem];
  const liuqi = qi[branch];
  return {
    year,
    stem,
    branch,
    wuyun,
    liuqi,
    description: `${year}年天干为${stem}，主${wuyun}；地支为${branch}，主${liuqi}。${wuyun}之年，${liuqi}为司天之气。`,
  };
}

export function formatElementDistribution(distribution: Record<string, number>) {
  const order = ['木', '火', '土', '金', '水'];
  const values = order.filter(element => distribution[element]).map(element => `${element}${distribution[element]}`);
  return values.length ? values.join(' ') : '（数据暂缺）';
}

function serializeContext(context: PersonalReportContext) {
  const hd = context.hd
    ? `类型${context.hd.type}；角色${context.hd.profile}；权威${context.hd.authority}；策略${context.hd.strategy}；通道${(context.hd.channels || []).join('、') || '无完整通道'}；定义中心${(context.hd.definedCenters || []).join('、') || '无'}`
    : '数据暂缺';
  const ziwei = context.ziwei
    ? context.ziwei.palaces.map((palace: any) => `${palace.name}：${(palace.stars || []).slice(0, 5).join('、') || '无主星'}`).join('；')
    : '数据暂缺';
  const planets = context.astrology?.planets?.map((planet: any) => `${planet.name}${planet.sign}座${planet.degree}°`).join('、') || context.astrology?.zodiac || '数据暂缺';
  return `出生：${context.birth}；出生地：${context.location}；当前年龄：${context.age}岁；性别：${context.gender}
八字：${context.bazi.pillars.join(' ')}；日主${context.bazi.dayMaster}；五行${formatElementDistribution(context.bazi.elementDistribution)}
人类图：${hd}
紫微斗数：${ziwei}
占星：${context.astrology?.zodiac || ''}；${planets}
五运六气：${context.wuyun.description}
流年：${context.liunian}`;
}

export const PERSONAL_REPORT_SYSTEM_PROMPT = `你是严谨而温暖的生命蓝图解读者。你必须只依据输入的真实排盘数据写作，不补造通道、宫星、十神、行星、年龄节点或医学结论。

纪律：
1. 每个关键论断必须就近挂至少一个具体数据；优先给出通道编号、宫位主星、日主与五行数量、行星星座。
2. 主动交叉引用，例如“人类图的X，在八字里对应Y”；至少诚实指出一处系统张力并解释如何整合。
3. 第二人称、口语化且有专业密度；禁止“你很有魅力”一类无数据空话。
4. 所有建议必须落到动作、时辰、频次或可直接练习的话术。
5. 命理只作自我观察，不替代医疗、法律或财务建议。
6. 最终全文目标为6000-10000个中文字符。你只写本次指定章节，不重复前段，不预写后段。`;

export function buildPersonalReportSegments(context: PersonalReportContext): ReportSegment[] {
  const data = serializeContext(context);
  const minor = context.age < 18;
  const perspective = minor
    ? `对象未满18岁，全文采用家长视角。第三章写“成长阶段与学习风格”，第四章写“天赋保护与养育建议”，第六章写“家长行动清单”。尊重孩子的类型和节奏，禁止给孩子定性或制造焦虑。`
    : `对象已成年，第三章聚焦“此刻的人生”，第四章聚焦“天赋与方向”，第六章聚焦个人实践。`;
  const shared = `\n\n【唯一可信数据】\n${data}\n\n【视角】\n${perspective}\n\n全文总长度要求6000-10000字。`;

  return [
    {
      id: 'foundation',
      maxTokens: 7000,
      prompt: `这是三段报告的第1段。只输出以下三章，约2200-3200字：\n\n## 0. 排盘数据声明\n逐条列出出生信息、八字四柱与五行、人类图类型/角色/权威/通道、紫微命宫主星、占星行星星座、五运六气。末尾原样写：命理是地图不是判决书，七分天性三分环境，与真人不符之处以真人为准。\n\n## 1. 核心命盘总览\n用“系统 × 关键数据 × 一句话主题”的七行表格；收尾以“七个系统说的是同一个人：”给出综合画像。\n\n## 2. 交叉印证\n提炼3-5个核心特质。每个特质必须并列至少三个系统的具体证据，并写“给你的提醒”：阴影面 + 一句可执行动作。至少写一处系统矛盾及整合解释。${shared}`,
    },
    {
      id: 'direction',
      maxTokens: 7000,
      prompt: `这是三段报告的第2段。直接从第3章开始，不重复数据声明，约2200-3200字。\n\n## 3. ${minor ? '成长阶段与学习风格' : '此刻的人生'}\n解释当前年龄在人类图爻线阶段、紫微身命结构、八字大运/流年的含义。无可靠大运数据时明确说“本次数据未提供大运起运”，不得编造。\n\n## 4. ${minor ? '天赋保护与养育建议' : '天赋与方向'}\n提供天赋地图表；每个方向标注由哪几个系统共同指向；给出具体编号避坑清单。${minor ? '补充尊重孩子类型特质的教育方式与家长可直接使用的话术。' : ''}\n\n## 5. 健康与情绪养护\n结合八字五行、五运六气和开放/定义中心，写体质观察与情绪出口；每条建议落到时辰与每周频次，并明确非医疗诊断。${shared}`,
    },
    {
      id: 'practice',
      maxTokens: 6000,
      prompt: `这是三段报告的第3段。直接从第6章开始，约1600-2400字。\n\n## 6. ${minor ? '家长行动清单' : '实践纲领'}\n每日、每周、每月、每年各1-3条。每条包含具体做法、触发条件和完成标准；至少给出两句“练习说：……”的话术。\n\n## 7. 最终寄语\n第二人称，回扣报告中至少三个真实具体数据，有温度但不滥情，不承诺命运结果。结尾再次提醒把报告当地图而非判决书。${shared}`,
    },
  ];
}
