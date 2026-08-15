import type { ReportSegment } from './report-depth';

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

export const COMPATIBILITY_SYSTEM_PROMPT = `你是严谨的关系解码者。全篇使用尊称“您”，不要使用“你”。只依据提供的排盘数据，不编造共享通道、宫位、星座或事件。关系报告不是给关系打分，而是帮助每个人看见互动模式。每个论断挂具体数据；指出互补，也诚实指出张力；建议必须给出可直接说出口的话术或可执行的家庭动作。报告最后必须明确写出“仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议”。`;

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
    } catch {}
  }
  return { buffer: remainder, contents, done, error };
}

function memberData(members: CompatibilityMember[]) {
  return members.map(member => `${member.label}（${member.age}岁）
- 八字：${member.bazi}
- 五行：${JSON.stringify(member.elementDistribution)}
- 人类图：${member.hd ? `类型${member.hd.type}；角色${member.hd.profile}；权威${member.hd.authority}；关键通道${(member.hd.channels || []).join('、') || '无完整通道'}` : '数据暂缺'}`).join('\n\n');
}

export function buildCompatibilitySegments(members: CompatibilityMember[], type: string): ReportSegment[] {
  const family = type === 'family';
  const data = memberData(members);
  return [
    {
      id: 'compat-foundation',
      maxTokens: 6500,
      prompt: `输出家庭合盘报告第1段，约2500-3500字。全篇使用“您”，不要使用“你”。这是“人生传记”式的家庭合盘：把数据编织成这个家独有的故事，而不是罗列数据。每个论断必须紧跟具体数据（成员+字段），禁止无证据的性格套话。\n\n## 0. 家庭排盘数据声明\n逐人列出八字与人类图数据（类型/角色/权威/关键通道）。\n\n## 1. 能量结构对照表\n表头：成员、类型、角色、权威、关键通道、五行重心。\n\n## 2. 一眼看懂这个家（家族能量生态）\n用一两句凝练的话概括这个家的整体气质。然后分别解读：①类型组合（几台“发动机”几个“眼睛”——能量型与非能量型的配比意味着什么）；②权威组合（几个荐骨/情绪/直觉——这个家该用什么方式做决定）；③角色分布（5爻/1爻/3爻等各几人，意味着什么家传课题）。\n\n## 3. 写在血脉里的密码（家族共享印记）\n挖掘至少4组“印记”，每一组必须跨系统验证：①共享通道（如父母同有34-57=定海神针；母女共享28-38=意义之火；姐妹共享4-63=为什么联盟），写明通道名+共享成员+对这个家的意义；②相同日柱/生肖/天干（如两姐妹同日柱=同款内核）；③紫微同构（如一人命宫主星=另一人财帛/官禄宫主星=事业互补；夫妻宫位呼应）；④同爻线/同角色课题。每组印记写成“这个家的饭桌上”可感知的具体画面。\n\n【数据】\n${data}`,
    },
    {
      id: 'compat-practice',
      maxTokens: 6500,
      prompt: `输出家庭合盘报告第2段，不重复排盘声明，约2500-3500字。全篇使用“您”，不要使用“你”。延续“人生传记”风格：温暖、具体、可执行。每一位成员都必须出现一次具体数据作为依据。\n\n## 4. 十对关系一张网（关系全景表）\n五个人十对关系，用表格列出每对：关系对、核心密码（类型组合+共享印记）、一句话点睛（如“行动同频，语言互译”）。表格后挑3-4对重点关系展开：张力在哪、如何化解（给可直接说出口的话术）。\n\n## 5. 亲子沟通与养育话术\n每个孩子独立分析：结合其类型（Projector需要被邀请/Generator需要回应）与权威，给出父母各自“不要说/可以说”的场景话术至少6组。必须包含这句示范并结合孩子数据解释：“妈妈也觉得这事没劲，我们来看看哪部分值得做”。\n\n## 6. 家庭实践建议\n每日/每周/每月各1-3条，写清频次、执行人和完成标准。结合能量型/非能量型成员的需求（如“永远不要用忙作为这个家的价值标尺”）。\n\n## 7. 最终寄语（家族金句）\n像长辈对全家说的一段话：回扣每个成员的具体数据，把差异写成互补、把冲突写成淬炼，不粉饰、不宣判。结尾一句点睛金句。\n\n## 8. 使用边界与免责声明\n必须原样写出：仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议。\n\n【数据】\n${data}`,
    },
  ];
}
