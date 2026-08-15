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
      prompt: `输出合盘报告第1段，约2200-3000字。全篇使用“您”，不要使用“你”。每个结论后紧跟对应成员和字段，不能用没有证据的性格套话。\n\n## 0. 双方/家庭排盘数据声明\n逐人列出八字与人类图数据。\n\n## 1. 能量结构对照表\n表头至少包含：成员、类型、角色、权威、关键通道、五行重心。\n\n## 2. 关系密码\n${family ? '家庭版必须分三组分析：①夫妻组（父母之间）：分析两人八字日主五行生克关系（谁生谁、谁克谁、有无通关之五行），结合双方人类图类型组合（如双Generator的Sacral共鸣、Projector与Generator的邀请关系），指出核心张力与化解方式；②亲子组（父母×孩子）：每个孩子与父母各一行的互动要点表，结合孩子类型（Projector需要被邀请/Generator需要回应）给出父亲、母亲各自需做的调整；③姐妹组（三姐妹之间）：逐对分析五行互动（生/克/比和）与类型组合（Projector×Projector、Projector×Generator等）的协作模式。' : '按共享通道、相同爻线、五行与权威的互补/冲突组织。'}只有输入中确实相同或可组成完整通道时才可写“共享/电磁通道”；证据不足必须明说。\n\n【数据】\n${data}`,
    },
    {
      id: 'compat-practice',
      maxTokens: 6500,
      prompt: `输出合盘报告第2段，不重复排盘声明，约2200-3000字。全篇使用“您”，不要使用“你”。每一位成员都必须出现一次具体数据作为依据；建议要写清场景、执行人和完成标准，不只写抽象祝福。\n\n## 3. 每个人的相处密钥\n每人独立一段：被看见的方式、冲突触发点、修复动作。\n\n## 4. ${family ? '亲子沟通与养育话术' : '关系沟通与修复话术'}\n给出至少6组“场景—不要说—可以说”。${family ? '必须包含这句示范并结合孩子数据解释：“妈妈也觉得这事没劲，我们来看看哪部分值得做”。' : ''}\n\n## 5. ${family ? '家庭实践建议' : '关系实践建议'}\n每日/每周/每月各1-3条，写清频次、执行人和完成标准。\n\n## 6. 最终寄语\n分别回扣每人的具体数据，不粉饰冲突，不宣判关系结果。\n\n## 7. 使用边界与免责声明\n必须原样写出：仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议。\n\n【数据】\n${data}`,
    },
  ];
}
