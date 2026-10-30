import { calculateAuthoritativeBazi } from './bazi-authoritative';
import { describeChannels } from './hd-channels-map';
import { getLifeModeInstruction, getTimeConfidenceLabel, type LifeContext } from './lifecycle';

export interface ReportSegment {
  id: string;
  prompt: string;
  maxTokens: number;
}

export interface PersonalReportContext {
  age: number;
  life?: LifeContext;
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

export function calculateReportBazi(year: number, month: number, day: number, hour: number, minute = 0) {
  return calculateAuthoritativeBazi(year, month, day, hour, minute, 'Asia/Shanghai');
}

/**
 * Backward-compatible name for callers that still pass a timezone. The
 * product standard is the birthplace's local civil date and clock, so the
 * timezone is retained only for API compatibility and is not applied here.
 */
export function calculateReportBaziForTimezone(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
  _timezone = 'Asia/Shanghai',
) {
  return calculateReportBazi(year, month, day, hour, minute);
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
    ? `类型${context.hd.type}；角色${context.hd.profile}；权威${context.hd.authority}；策略${context.hd.strategy}；通道${describeChannels(context.hd.channels)}；定义中心${(context.hd.definedCenters || []).join('、') || '无'}`
    : '数据暂缺';
  const ziwei = context.ziwei
    ? context.ziwei.palaces.map((palace: any) => `${palace.name}：${(palace.stars || []).slice(0, 5).join('、') || '无主星'}`).join('；')
    : '数据暂缺';
  const planets = context.astrology?.planets?.map((planet: any) => `${planet.name}${planet.sign}座${planet.degree}°`).join('、') || context.astrology?.zodiac || '数据暂缺';
  const life = context.life;
  const ageLabel = life?.ageLabel || `当前年龄：${context.age}岁`;
  const lifeLine = life
    ? `生命周期：${life.status}；分析模式：${life.mode}；出生时刻可信度：${getTimeConfidenceLabel(life.timeConfidence)}；分析日期：${life.analysisDate}`
    : '生命周期：在世当前人生模式；出生时刻可信度：精确';
  return `出生：${context.birth}；出生地：${context.location}；${ageLabel}；性别：${context.gender}
${lifeLine}
八字：${context.bazi.pillars.join(' ')}；日主${context.bazi.dayMaster}；五行${formatElementDistribution(context.bazi.elementDistribution)}
人类图：${hd}
紫微斗数：${ziwei}
占星：${context.astrology?.zodiac || ''}；${planets}
五运六气：${context.wuyun.description}
流年：${context.liunian}`;
}

/**
 * 引擎注入的「## 0. 排盘数据声明」节（K3 加固条款 §三·五）。
 * 所有数字/列表由代码从计算 JSON 直接拼装，禁止 AI 撰写任何数据；
 * AI 只写第 1 节起的叙事，本声明节由调用方在报告最前注入。
 */
export function buildPersonalReportDataDeclaration(context: PersonalReportContext): string {
  const hd = context.hd
    ? `类型：${context.hd.type}｜人生角色：${context.hd.profile}｜内在权威：${context.hd.authority}｜策略：${context.hd.strategy}｜签名：${context.hd.signature || '—'}｜非自我主题：${context.hd.notSelfTheme || '—'}｜通道：${describeChannels(context.hd.channels)}｜定义中心：${(context.hd.definedCenters || []).join('、') || '无'}`
    : '数据暂缺';
  const ziwei = context.ziwei
    ? context.ziwei.palaces.map((palace: any) => `${String(palace.name).endsWith('宫') ? palace.name : `${palace.name}宫`}：${(palace.stars || []).slice(0, 5).join('、') || '无主星'}`).join('；')
    : '数据暂缺';
  const planets = context.astrology?.planets?.map((planet: any) => `${planet.name}${planet.sign}座${planet.degree}°`).join('、') || context.astrology?.zodiac || '数据暂缺';
  const life = context.life;
  const ageLabel = life?.ageLabel || `当前年龄：${context.age}岁`;
  const lifeLine = life
    ? `- 生命周期：${life.status}｜分析模式：${life.mode}｜出生时刻可信度：${getTimeConfidenceLabel(life.timeConfidence)}｜分析日期：${life.analysisDate}`
    : '- 生命周期：alive｜分析模式：current｜出生时刻可信度：精确';
  const notices = life?.notices?.length ? `\n- 重要边界：${life.notices.join('；')}` : '';
  return [
    '## 0. 排盘数据声明',
    '',
    `- 出生：${context.birth}｜出生地：${context.location}｜${ageLabel}｜性别：${context.gender}`,
    lifeLine + notices,
    `- 八字四柱：${context.bazi.pillars.join(' ')}｜日主：${context.bazi.dayMaster}｜五行：${formatElementDistribution(context.bazi.elementDistribution)}`,
    `- 人类图：${hd}`,
    `- 紫微斗数：${ziwei}`,
    `- 占星：${context.astrology?.zodiac || ''}｜${planets}`,
    `- 五运六气：${context.wuyun.description}`,
    `- 流年：${context.liunian}`,
    '',
    '> 本声明节由系统依据排盘数据直接生成，以下解读均以此为准。命理是地图不是判决书，七分天性三分环境，与真人不符之处以真人为准。',
    '',
  ].join('\n');
}

export const PERSONAL_REPORT_SYSTEM_PROMPT = `你是严谨而温暖的生命蓝图解读者。你必须只依据输入的真实排盘数据写作，不补造通道、宫星、十神、行星、年龄节点或医学结论。

纪律：
1. 每个关键论断必须就近挂至少一个具体数据；优先给出通道编号、宫位主星、日主与五行数量、行星星座。
2. 不同传统体系可作为象征性观察视角，不能互相验证，也不能证明人的性格、能力或未来；避免把推测写成事实。
3. 全篇使用尊称“您”，不要使用“你”；口语化但有专业密度；禁止“您很有魅力”一类无数据空话。
4. 所有建议必须落到动作、时辰、频次或可直接练习的话术。
5. 命理只作自我观察，不替代医疗、法律或财务建议。
6. 最终全文目标约3500-5000个中文字符，以信息清晰、避免重复为优先。你只写本次指定章节，不重复前段，不预写后段。
7. 对任何人尤其是儿童，不凭出生数据推断智力、学习风格、疾病、职业或学校适配，不作为择校或教育决策的依据。对儿童提出的观察问题以实际行为和家长、孩子的意愿为准，不贴标签。
8. 正文必须包含“使用边界与免责声明”小节，明确本报告仅供自我观察、个人成长与关系沟通参考，不构成医疗、法律、教育或投资建议。
9. 通道与中心的连接关系**只准引用数据声明中映射表给出的“X(中心) ↔ Y(中心)”字段**，禁止自行改写或补造任何通道-中心连接；映射表缺项的通道只写编号，不描述连接。`;

export const PERSONAL_REPORT_DISCLAIMER =
  '\n\n---\n\n## 使用边界与免责声明\n\n本报告仅供自我观察、个人成长与关系沟通参考，不构成医疗、法律、教育或投资建议。';

/** Keep the tone respectful and deterministic across model chunks. */
export function normalizePersonalReportAudience(report: string) {
  return report
    .replace(/你们/g, '您们')
    .replace(/你的/g, '您的')
    .replace(/你自己/g, '您自己')
    .replace(/你/g, '您');
}

function appendPersonalDataCheck(report: string, context: PersonalReportContext) {
  const required = [
    ...context.bazi.pillars,
    context.hd?.type,
    context.hd?.profile,
    context.hd?.authority,
  ].filter(Boolean) as string[];
  const missing = required.filter((value) => !report.includes(value));
  if (!missing.length) return report;

  const hd = context.hd
    ? `${context.hd.type} · ${context.hd.profile} · ${context.hd.authority} · 通道${describeChannels(context.hd.channels)}`
    : '数据暂缺';
  return `${report.trimEnd()}\n\n## 数据核验卡\n\n为避免解读文字遮蔽原始数据，本报告最后保留一份可复核摘要：\n\n- 八字四柱：${context.bazi.pillars.join(' ')}\n- 日主：${context.bazi.dayMaster}\n- 人类图：${hd}\n- 本次缺少或未在正文完整出现的字段：${missing.join('、')}\n\n若正文叙述与此卡片不一致，请以排盘数据和您本人实际体验为准。`;
}

export function appendPersonalReportDisclaimer(report: string) {
  if (report.includes('本报告仅供自我观察、个人成长与关系沟通参考')) return report;
  return `${report.trimEnd()}${PERSONAL_REPORT_DISCLAIMER}`;
}

export function finalizePersonalReport(report: string, context: PersonalReportContext) {
  const normalized = normalizePersonalReportAudience(report);
  return appendPersonalReportDisclaimer(appendPersonalDataCheck(normalized, context));
}

/**
 * Normalize both the current local-generation path and the legacy report-api
 * path to one verifiable report contract. The legacy service predates the
 * engine-owned declaration section, so inject it here before finalization.
 */
export function preparePersonalReport(report: string, context: PersonalReportContext) {
  const hasDeclaration = /##\s*0[.、．]\s*(?:家庭排盘数据声明|双方排盘数据声明|排盘数据声明)/.test(report);
  const withDeclaration = hasDeclaration
    ? report
    : `${buildPersonalReportDataDeclaration(context)}\n${report.trimStart()}`;
  return finalizePersonalReport(withDeclaration, context);
}

/** A stable parent guide for minors. Birth charts stay in the data appendix. */
export function buildChildObservationReport(context: PersonalReportContext) {
  const body = `## 1. 如何使用这份报告

孩子目前${context.age}岁。第0章是按出生资料计算的文化兴趣数据，不能证明孩子的性格、能力、学习方式、健康状况或未来，也不能用于判断哪所学校适合孩子。正文是一份家长观察手册：它提出要核对的问题，不替孩子回答。做决定时，请同时听孩子的表达、看实际行为、向老师核实学校现场，并考虑家庭的时间、经济和生活条件。

## 2. 孩子的真实兴趣与感受

选连续两周作观察期，每天只记一两个具体片段。可以问：“这周哪件事是您自己想再做一次的？”“什么时候您想停一停？”“遇到难题时，您希望大人怎样帮忙？”不要从一次回答给孩子贴标签。

记录四类事实：孩子主动提起的活动；参与前后的精力和情绪；同伴相处中孩子自己描述的事件；求助时孩子说过的原话。把“孩子不合群”改写成“本周午休有两次独自待着，孩子说想安静一会儿”。如果家长与老师的观察不同，先问发生的时间和场景，再继续观察。

## 3. 当前学习环境

探校时，请看一堂普通课和一次课间，而不只看展示活动。可向学校核对：学生能否提问、老师如何回应不同进度、作业反馈如何给出、孩子遇到冲突时找谁、学校怎样处理休息与运动。请学校举一个具体例子，说明制度如何在日常执行。

回家后单独问孩子：“您在哪个环节愿意参与？哪个环节不舒服？还想知道什么？”把孩子说的和您看到的分别记录。一次参观只是一个片段；如果正在考虑转学，可进一步了解长期作息、通勤、费用、课程衔接和实际在校家庭的经验。这里不生成学校排名或匹配分数。

## 4. 兴趣探索与支持

与孩子商量两项愿意尝试的小活动，每项先做四周，不要求长期承诺。第一周请孩子自己选时间和最低可完成量；第二、三周记录是否愿意继续、遇到什么障碍、休息后是否愿意再试；第四周请孩子先说“想保留、调整还是停止”，家长再补充观察。

活动记录只写选择、参与和感受，不写“天赋好坏”。若孩子想更换，先分清是内容不喜欢、时间不合适、同伴关系不舒服，还是确实想探索别的事。活动的目的在于练习表达意愿和小范围决策，不能据此推断学习能力或安排学校路径。

## 5. 情绪与作息

用具体事件开启对话，例如“昨天做作业到几点？哪一部分最费力？”孩子不愿说时，可约定晚饭后散步十分钟再聊，不连环追问。留意睡眠、餐食、运动和可自由支配的时间是否被日程挤掉。不同家庭的节奏不同，以孩子的实际状态为准。

若持续出现明显低落、睡眠紊乱、强烈抗拒上学或身体不适，先关心和记录实际情况，再向学校或合适的儿科、心理专业人员寻求帮助。出生排盘不能用于解释症状，也不能替代诊断。

## 6. 家长行动清单

- **今天**：请孩子讲一个喜欢和一个不喜欢的学校片段。只复述，不评价；记下孩子自己的措辞。
- **本周**：与老师核对一个具体场景，同时记录课堂、课间、回家后三处观察是否一致。把不一致处留作问题，不急于定论。
- **本月**：和孩子复盘两项自选活动。保留孩子想继续的部分，调整让孩子疲惫的安排；若考虑学校变化，逐项核对课程、支持、通勤、费用与孩子意愿。

每次复盘都可以问：“我们看到的事实是什么？还有什么没问到？下一步由谁去核实？”让记录帮助沟通，而不是成为评价孩子的档案。

## 7. 最终寄语

孩子的想法会随着经历变化，家长也可以不断修正判断。一份好的观察记录，不是替孩子写好答案，而是让孩子在被认真倾听时有机会说出自己的答案。请把第0章留作文化资料，把真正的选择交还给真实生活中的孩子、家庭和教育现场。

本报告不能作为择校、分班或能力筛选依据。`;
  return preparePersonalReport(body, context);
}

export function buildPersonalReportSegments(context: PersonalReportContext): ReportSegment[] {
  const data = serializeContext(context);
  const mode = context.life?.mode || 'current';
  const minor = mode === 'current' && context.age < 18;
  if (minor) throw new Error('未成年人报告应使用 buildChildObservationReport');
  const perspective = mode === 'historical'
    ? `对象为已故人物，采用历史回顾视角。第三章写“人生阶段与公开经历回顾”，第四章写“天赋与影响的历史主题”，第五章只做文本中的文化观察，不给出现实健康判断，第六章写“可供读者反思的行动提问”。不得生成面向当前年份的未来规划、退休建议、健康安排或在世行动清单。`
    : mode === 'uncertain'
      ? `对象的生命周期状态未知，禁止断言其在世或已故。第三章避免依赖当前年龄的现实推断，第六章只写条件式反思问题。${context.life?.notices.join(' ') || ''}`
      : minor
    ? `对象未满18岁，全文采用家长视角。不得用于择校录取、能力筛选或给孩子贴标签，学习建议要以实际观察为依据。第三章写“成长阶段与学习环境”，第四章写“天赋保护与养育建议”，第六章写“家长行动清单”。尊重孩子的类型和节奏，禁止给孩子定性或制造焦虑。`
    : `对象已成年，第三章聚焦“此刻的人生”，第四章聚焦“天赋与方向”，第六章聚焦个人实践。`;
  const lifeInstruction = context.life ? getLifeModeInstruction(context.life) : '这是在世对象的当前人生模式。';
  const shared = `\n\n【唯一可信数据】\n${data}\n\n【视角】\n${perspective}\n\n【生命周期规则】\n${lifeInstruction}\n\n全文总长度目标3500-5000字。每章聚焦最有价值的2-3点，优先短段落和清晰表格，避免重复、长篇铺陈和同义反复。`;

  return [
    {
      id: 'foundation',
      // 2200-3200 中文字 ≈ 3300-4800 token（含 markdown/表格），3500 会被截断。
      // 2026-08-15 修复：提到 6000，并禁止本段写免责声明/收尾语（finalize 统一追加）。
      maxTokens: 4000,
      prompt: `这是三段报告的第1段。**注意：「## 0. 排盘数据声明」已由系统依据排盘数据直接生成在报告开头，禁止你重复输出或改写任何排盘数字、列表、通道连接**。只输出以下两章，约700-900字：\n\n## 1. 核心命盘总览\n用“系统 × 关键数据 × 一句话主题”的七行表格；收尾以“七个系统说的是同一个人：”给出开放式观察问题；不得断言多个体系相互验证。\n\n## 2. 多视角观察\n提炼3-5个核心特质。每个特质可以列出不同体系的象征解释，但不能将它们称为独立证据或科学验证，并写“给你的提醒”：阴影面 + 一句可执行动作。至少写一处系统矛盾及整合解释。\n\n**本段结束时直接结束，禁止写免责声明、禁止写任何收尾语或总结——后续章节会继续。**${shared}`,
    },
    {
      id: 'direction',
      maxTokens: 4000,
      prompt: `这是三段报告的第2段。直接从第3章开始，不重复数据声明，约900-1200字。\n\n## 3. ${mode === 'historical' ? '人生阶段与公开经历回顾' : minor ? '成长阶段与学习环境' : mode === 'uncertain' ? '条件式人生观察' : '此刻的人生'}\n解释${mode === 'historical' ? '已发生的人生阶段和公开影响，不写当前年龄的现实规划' : '当前年龄在人类图爻线阶段、紫微身命结构、八字大运/流年的含义'}。无可靠大运数据时明确说“本次数据未提供大运起运”，不得编造。\n\n## 4. ${mode === 'historical' ? '天赋与历史影响主题' : minor ? '天赋保护与养育建议' : '天赋与方向'}\n提供天赋地图表；每个方向写作可以探索的可能性，并以实际兴趣和经历核对，不作为能力结论；给出具体编号避坑清单。${minor ? '补充尊重孩子类型特质的教育方式与家长可直接使用的话术。' : ''}\n\n## 5. ${mode === 'historical' ? '文本中的健康与情绪主题边界' : '健康与情绪养护'}\n${mode === 'historical' ? '只说明报告文本中的象征性主题，不对已故人物作医学、现实健康或未来寿命判断。' : '不依据出生数据推断体质、疾病或健康风险；提供一般性的情绪觉察和休息建议，明确不构成诊断或治疗。'}\n\n**本段结束时直接结束，禁止写免责声明、禁止写任何收尾语或总结——后续章节会继续。**${shared}`,
    },
    {
      id: 'practice',
      maxTokens: 3500,
      prompt: `这是三段报告的第3段（最后一段）。直接从第6章开始，约700-900字。\n\n## 6. ${mode === 'historical' ? '可供读者反思的行动提问' : minor ? '家长行动清单' : mode === 'uncertain' ? '条件式反思清单' : '实践纲领'}\n${mode === 'historical' ? '围绕公开人生主题提出每日、每周、每月各1-3个供读者反思的问题，不写已故人物当下行动建议。' : mode === 'uncertain' ? '使用“如果对象目前在世/如果对象正在经历某阶段”的条件式表达，不把状态未知写成事实。' : '每日、每周、每月、每年各1-3条。每条包含具体做法、触发条件和完成标准；至少给出两句“练习说：……”的话术。'}\n\n## 7. 最终寄语\n第二人称，回扣报告中至少三个真实具体数据，有温度但不滥情，不承诺命运结果。${mode === 'historical' ? '明确这是历史回顾，不向已故人物发出未来指令。' : ''}结尾再次提醒把报告当地图而非判决书。**这是报告最后一段，请务必写完整第6、7两章，以完整的第7章最终寄语自然结束。**${shared}`,
    },
  ];
}
