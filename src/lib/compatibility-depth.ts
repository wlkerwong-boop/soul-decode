import type { ReportSegment } from './report-depth';
import { describeChannels } from './hd-channels-map';

export interface CompatibilityMember {
  label: string;
  age: number;
  bazi: string;
  elementDistribution: Record<string, number>;
  hd?: {
    type?: string;
    profile?: string;
    authority?: string;
    channels?: string[];
  } | null;
}

export type CompatibilityType = 'couple' | 'family' | 'friend';

export function validateCompatibilityInput(persons: unknown, type: unknown): string | null {
  if (!Array.isArray(persons)) return '需要至少两个人的出生信息';
  if (!['couple', 'family', 'friend'].includes(String(type))) return '合盘类型无效';
  if ((type === 'couple' || type === 'friend') && persons.length !== 2) {
    return '情侣合盘和朋友合盘必须恰好填写两个人';
  }
  if (type === 'family' && persons.length < 3) return '家庭合盘至少需要一位孩子';
  if (persons.some((person) => !person || typeof person !== 'object')) return '成员出生信息不完整';

  const hasBirthFields = persons.some((person: Record<string, unknown>) => 'year' in person);
  const required = ['year', 'month', 'day', 'city'];
  if (hasBirthFields && persons.some((person: Record<string, unknown>) => required.some((key) => !String(person[key] || '').trim()))) {
    return '每位成员都必须填写出生年月日和出生城市';
  }
  return null;
}

export const COMPATIBILITY_SYSTEM_PROMPT = `你是严谨的关系解码者。全篇使用尊称“您”，不要使用“你”。只依据提供的排盘数据，不编造共享通道、宫位、星座或事件。关系报告不是给关系打分，而是帮助每个人看见互动模式。每个论断挂具体数据；指出互补，也诚实指出张力；建议必须给出可直接说出口的话术或可执行的家庭动作。通道与中心的连接关系只准引用数据声明中映射表给出的“X(中心) ↔ Y(中心)”字段，禁止自行改写或补造任何通道-中心连接。报告最后必须明确写出“仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议”。`;

export function normalizeCompatibilityAudience(report: string) {
  return report
    .replace(/你们/g, '您们')
    .replace(/你的/g, '您的')
    .replace(/你自己/g, '您自己')
    .replace(/你/g, '您');
}

export function buildCompatibilityPersonPayload(form: Record<string, string>, prefix: string) {
  return {
    year: form[`${prefix}_year`],
    month: form[`${prefix}_month`],
    day: form[`${prefix}_day`],
    hour: form[`${prefix}_hour`] || '12',
    minute: form[`${prefix}_minute`] || '0',
    gender: form[`${prefix}_gender`] || '男',
    continent: form[`${prefix}_continent`] || '',
    country: form[`${prefix}_country`] || '',
    province: form[`${prefix}_province`] || '',
    city: form[`${prefix}_city`] || '',
    location: form[`${prefix}_province`] || form[`${prefix}_country`] || '',
  };
}

export function consumeSseChunk(buffer: string, chunk: string) {
  const combined = buffer + chunk;
  const events = combined.split('\n\n');
  const remainder = events.pop() || '';
  const contents: string[] = [];
  let done = false;
  let error = '';
  for (const event of events) {
    const line = event.split('\n').find(item => item.startsWith('data: '));
    if (!line) continue;
    try {
      const payload = JSON.parse(line.slice(6));
      if (payload.content) contents.push(payload.content);
      if (payload.done) done = true;
      if (payload.error) error = payload.error;
      if (payload.verify_error) error = payload.verify_error;
    } catch {}
  }
  return { buffer: remainder, contents, done, error };
}

function memberData(members: CompatibilityMember[]) {
  return members.map(member => `${member.label}（${member.age}岁）
- 八字：${member.bazi}
- 五行：${JSON.stringify(member.elementDistribution)}
- 人类图：${member.hd ? `类型${member.hd.type}；角色${member.hd.profile}；权威${member.hd.authority}；关键通道${describeChannels(member.hd.channels)}` : '数据暂缺'}`).join('\n\n');
}

/**
 * 引擎注入的「## 0. 家庭排盘数据声明」节（K3 加固条款 §三·五，与个人报告同规）。
 * 所有数字/列表由代码从计算 JSON 直接拼装，禁止 AI 撰写；AI 只写第 1 节起叙事。
 */
export function buildFamilyDataDeclaration(members: CompatibilityMember[], type: string): string {
  const family = type === 'family';
  const heading = family ? '家庭排盘数据声明' : '双方排盘数据声明';
  const rows = members.map((member) => {
    const hd = member.hd
      ? `类型：${member.hd.type}｜角色：${member.hd.profile}｜权威：${member.hd.authority}｜关键通道：${describeChannels(member.hd.channels)}`
      : '数据暂缺';
    return `- **${member.label}**（${member.age}岁）：八字 ${member.bazi}｜五行 ${JSON.stringify(member.elementDistribution)}｜人类图 ${hd}`;
  }).join('\n');
  return [
    `## 0. ${heading}`,
    '',
    rows,
    '',
    '> 本声明节由系统依据排盘数据直接生成，以下解读均以此为准。',
    '',
  ].join('\n');
}

export function buildCompatibilitySegments(members: CompatibilityMember[], type: string): ReportSegment[] {
  const family = type === 'family';
  const data = memberData(members);
  if (!family) {
    const relationship = type === 'friend' ? '朋友' : '情侣';
    return [
      {
        id: 'compat-foundation',
        maxTokens: 6500,
        prompt: `输出${relationship}合盘报告第1段，约2500-3500字。全篇使用“您”，不要使用“你”。这是双方的“人生传记”式关系合盘：把两个人的数据编织成这段关系独有的故事，而不是罗列数据。每个论断必须紧跟具体数据（成员+字段），禁止无证据的性格套话。注意：「## 0. 双方排盘数据声明」已由系统依据排盘数据直接生成在报告开头；你只输出以下三章（## 1 至 ## 3），禁止输出任何「## 0」标题或声明节，禁止重复或改写任何排盘数字、列表、通道连接。报告只允许讨论下列双方，不得创建未提供的成员或关系对象。\n\n## 1. 双方能量结构对照表\n表头：成员、类型、角色、权威、关键通道、五行重心。\n\n## 2. 一眼看懂这段关系\n概括双方整体气质，分别解读类型、权威、角色和五行的互补与张力，并明确引用成员与字段。\n\n## 3. 写在关系里的密码\n挖掘至少3组双方共享或互补的印记，每一组必须跨系统验证：共享通道、相同日柱/生肖/天干、紫微同构或同爻线/同角色课题。每组写成双方日常相处中可感知的具体画面，不编造未提供的盘面数据。\n\n【数据】\n${data}`,
      },
      {
        id: 'compat-practice',
        maxTokens: 6500,
        prompt: `输出${relationship}合盘报告第2段，不重复排盘声明，约2500-3500字。全篇使用“您”，不要使用“你”。延续“人生传记”风格：温暖、具体、可执行。双方都必须出现具体数据作为依据。报告只允许讨论已提供的两位成员，不得写家庭、亲子、孩子或多成员关系网。\n\n## 4. 关系全景\n用表格列出双方的核心密码、互补点、张力点和一句话点睛。展开重要互动场景：张力在哪、如何化解，并给出可直接说出口的话术。\n\n## 5. 双方实践建议\n给出每日/每周/每月各1-3条建议，写清频次、执行人和完成标准；指出双方如何在冲突、决策和亲密互动中保留彼此空间。\n\n## 6. 最终寄语与使用边界\n回扣双方的具体数据，把差异写成互补、把冲突写成淬炼，不粉饰、不宣判。最后必须原样写出：仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议。\n\n【数据】\n${data}`,
      },
    ];
  }

  const childCount = Math.max(members.length - 2, 0);
  const pairCount = (members.length * (members.length - 1)) / 2;
  return [
    {
      id: 'compat-foundation',
      maxTokens: 6500,
      prompt: `输出家庭合盘报告第1段，约2500-3500字。全篇使用“您”，不要使用“你”。这是“人生传记”式的家庭合盘：把数据编织成这个家独有的故事，而不是罗列数据。每个论断必须紧跟具体数据（成员+字段），禁止无证据的性格套话。只允许讨论系统提供的${members.length}位成员，不得创建额外的父母、孩子或其他成员。注意：「## 0. 家庭排盘数据声明」已由系统依据排盘数据直接生成在报告开头；你只输出以下三章（## 1 至 ## 3），禁止输出任何「## 0」标题或声明节，禁止重复或改写任何排盘数字、列表、通道连接。\n\n## 1. 能量结构对照表\n表头：成员、类型、角色、权威、关键通道、五行重心。\n\n## 2. 一眼看懂这个家（家族能量生态）\n概括这个家的整体气质，分别解读类型组合、权威组合和角色分布。\n\n## 3. 写在血脉里的密码（家族共享印记）\n挖掘至少4组跨系统印记，只使用数据声明中存在的字段，每组印记写成“这个家的饭桌上”可感知的具体画面。\n\n【数据】\n${data}`,
    },
    {
      id: 'compat-practice',
      maxTokens: 6500,
      prompt: `输出家庭合盘报告第2段，不重复排盘声明，约2500-3500字。全篇使用“您”，不要使用“你”。延续“人生传记”风格：温暖、具体、可执行。每一位成员都必须出现一次具体数据作为依据。\n\n## 4. ${pairCount}对关系一张网（关系全景表）\n列出全部${pairCount}对成员关系：关系对、核心密码（类型组合+共享印记）、一句话点睛。不得生成数据中不存在的成员。表格后挑3-4对重点关系展开：张力在哪、如何化解（给可直接说出口的话术）。\n\n## 5. 亲子沟通与养育话术\n只为这${childCount}位已提供的孩子分别分析：结合其类型与权威，给出父母各自“不要说/可以说”的场景话术。不得新增孩子，也不得将成人写成孩子。必须包含这句示范并结合孩子数据解释：“妈妈也觉得这事没劲，我们来看看哪部分值得做”。\n\n## 6. 家庭实践建议\n每日/每周/每月各1-3条，写清频次、执行人和完成标准。结合能量型/非能量型成员的需求。\n\n## 7. 最终寄语（家族金句）\n像长辈对全家说的一段话：回扣每个成员的具体数据，把差异写成互补、把冲突写成淬炼，不粉饰、不宣判。结尾一句点睛金句。\n\n## 8. 使用边界与免责声明\n必须原样写出：仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议。\n\n【数据】\n${data}`,
    },
  ];
}
