export const CHALLENGE_PROGRESS_VERSION = 1 as const;
export const LIFE_CHALLENGE_PROGRESS_KEY = 'life_story_challenges_v1';

export interface LifeChallengeChoice {
  id: string;
  label: string;
  pattern: string;
  action: string;
}

export interface LifeChallenge {
  id: string;
  title: string;
  axis: string;
  scenario: string;
  question: string;
  choices: LifeChallengeChoice[];
}

export interface ChallengeResponse {
  challengeId: string;
  choiceId: string;
  reflection: string;
  completedAt: string;
}

export interface ChallengeProgress {
  version: typeof CHALLENGE_PROGRESS_VERSION;
  startedAt: string;
  completedAt: string;
  responses: Record<string, ChallengeResponse>;
}

export interface ChallengeSummary {
  completedCount: number;
  patterns: string[];
  nextActions: string[];
  disclaimer: string;
}

type ProgressValidation =
  | { ok: true; value: ChallengeProgress }
  | { ok: false; errors: string[] };

const choice = (id: string, label: string, pattern: string, action: string): LifeChallengeChoice => ({ id, label, pattern, action });

export const TEN_CHALLENGES: LifeChallenge[] = [
  {
    id: 'identity', title: '第一关 · 身份之外', axis: '名',
    scenario: '你做成了一件事，周围人开始用一个固定标签定义你。这个标签带来认可，也让你不敢尝试别的方向。',
    question: '如果不需要证明自己，你今天会怎样选择？',
    choices: [
      choice('prove', '继续证明，先守住认可', '把外部评价当作安全感来源', '本周做一件不以展示为目的的事。'),
      choice('withdraw', '暂时退开，不再参与评价', '用退出换取短暂的轻松', '写下一个你仍然在乎、但不必表演的目标。'),
      choice('values', '保留能力，也重新定义标准', '把身份放回自己的价值排序', '为一个选择写出“我为什么要做”，而不是“别人会怎么看”。'),
    ],
  },
  {
    id: 'desire', title: '第二关 · 足够之后', axis: '欲',
    scenario: '你得到了一个更大的机会，但它需要你牺牲休息、关系或已经珍惜的生活。',
    question: '你如何判断“值得继续”和“已经足够”？',
    choices: [
      choice('grab', '先抓住机会，代价以后再处理', '把增长速度放在长期承受力之前', '列出这次机会的真实成本，并指定一条不可牺牲的底线。'),
      choice('deny', '拒绝变化，维持现在最安全', '把稳定等同于不改变', '只做一个两周可撤回的小实验，而不是立刻全盘改变。'),
      choice('enough', '先定义足够，再决定是否前进', '以长期价值而非短期欲望做选择', '写下“得到什么才算值得”，再与现实条件逐项核对。'),
    ],
  },
  {
    id: 'relationship', title: '第三关 · 关系与边界', axis: '情',
    scenario: '一个重要的人需要你的帮助，但对方的需要正在挤压你的时间和边界。',
    question: '你能否同时保留关心与边界？',
    choices: [
      choice('please', '先答应，别让对方失望', '用过度承担换取关系稳定', '回复前先写清楚你能提供的时间和范围。'),
      choice('cutoff', '直接切断，避免继续消耗', '用彻底退出保护自己', '在做决定前，先完成一次清晰而不攻击的表达。'),
      choice('dialogue', '说明边界，再一起协商', '把关系看成可以共同调整的系统', '本周进行一次 20 分钟边界对话，只讨论事实和请求。'),
    ],
  },
  {
    id: 'uncertainty', title: '第四关 · 不确定性', axis: '控',
    scenario: '你需要做一个重要决定，但信息永远不够完整，继续等待也会产生新的成本。',
    question: '你愿意用什么方式与不确定性共处？',
    choices: [
      choice('control', '继续收集，直到足够确定', '用信息累积替代真正选择', '给信息收集设一个明确截止时间。'),
      choice('avoid', '先不选，让事情自然发展', '把不行动当作降低风险', '写出不行动本身会带来的三个后果。'),
      choice('experiment', '把大决定拆成可撤回的实验', '用小反馈代替虚假的确定感', '设计一个 7 天实验，并写明停止条件。'),
    ],
  },
  {
    id: 'loss', title: '第五关 · 失去与留下', axis: '舍',
    scenario: '一段关系、一个身份或一条旧道路已经结束，但你还在用过去的投入证明它应该继续。',
    question: '你真正想留下的，是对象还是经验？',
    choices: [
      choice('hold', '继续抓住，不能让投入归零', '用沉没成本维持旧叙事', '把投入拆成可带走的能力、关系和教训。'),
      choice('replace', '立刻找新的东西填上空位', '用快速替代逃开失落感', '给自己留出一段不急于命名的空白时间。'),
      choice('grieve', '承认结束，再选择带走什么', '允许哀悼成为重新选择的前置步骤', '写一封不必寄出的告别信，并列出三样要带走的经验。'),
    ],
  },
  {
    id: 'comparison', title: '第六关 · 比较之火', axis: '比',
    scenario: '你看到同龄人快速获得了你也想要的东西，心里同时出现羡慕、焦虑和自我否定。',
    question: '你能否从比较中提取信息，而不是提取惩罚？',
    choices: [
      choice('chase', '加速追赶，不能落后', '把他人的时间线当成自己的标准', '只选一个可观察的能力指标，连续记录 7 天。'),
      choice('criticize', '强调对方的代价，让自己好受些', '用否定他人暂时修复自尊', '把评价改写成一个关于自己选择的问题。'),
      choice('learn', '承认羡慕，并拆解其中的线索', '把比较转化为可学习的样本', '向一个值得学习的人提出一个具体问题。'),
    ],
  },
  {
    id: 'conflict', title: '第七关 · 冲突时刻', axis: '嗔',
    scenario: '一次沟通让你感到被误解或被冒犯。你有足够的理由反击，但反击可能让问题扩大。',
    question: '你想赢下这场冲突，还是解决真正的问题？',
    choices: [
      choice('attack', '立刻指出对方的问题', '用正确性换取控制感', '先写下事实、感受、请求三行，再决定是否发送。'),
      choice('retreat', '暂时沉默，避免失控', '用撤退保护情绪，但留下误解', '约定一个稍后继续对话的时间。'),
      choice('name', '先说清自己的体验和需要', '把冲突转成可以处理的信息', '使用一次“当……时，我感到……我希望……”表达。'),
    ],
  },
  {
    id: 'doubt', title: '第八关 · 怀疑自己', axis: '疑',
    scenario: '你准备开始一件重要的事，却反复想起过去的失败，开始怀疑自己是否真的适合。',
    question: '你需要的是更多自信，还是一个更小的开始？',
    choices: [
      choice('wait', '等自己准备好再开始', '把自信当成行动的前提', '把第一步缩小到 15 分钟，并在日历上锁定时间。'),
      choice('seek', '先找权威确认我能不能做', '把判断权交给外部许可', '向一个具体的人寻求一条可执行反馈。'),
      choice('test', '用小规模行动获得证据', '让现实反馈替代想象中的审判', '完成一个最小版本，并记录事实而非评价。'),
    ],
  },
  {
    id: 'responsibility', title: '第九关 · 责任与自由', axis: '责',
    scenario: '很多人和事情都需要你。你把“不能让大家失望”当成可靠，却逐渐不知道自己想要什么。',
    question: '哪些责任是你的承诺，哪些只是你自动接下来的？',
    choices: [
      choice('carry', '全部扛住，先让系统正常运转', '用过度负责换取秩序', '列出所有责任，并标注可委托、可延后和必须亲自做的。'),
      choice('escape', '彻底放下，先恢复自由', '用一次性退出修复耗竭', '只暂停一个非核心承诺，而不是推翻全部关系。'),
      choice('choose', '重新选择值得承担的部分', '让责任回到有意识的承诺', '与相关的人重新确认一次边界和期限。'),
    ],
  },
  {
    id: 'return', title: '第十关 · 回到日常', axis: '行',
    scenario: '体验快结束了。你已经看见许多模式，但回到日常后，旧节奏仍然会拉你回去。',
    question: '你愿意把哪一个洞察变成一个可重复的日常动作？',
    choices: [
      choice('grand', '制定宏大计划，一次改变全部', '用强烈决心对抗旧惯性', '只保留一个能在最忙时也完成的动作。'),
      choice('quit', '把体验放下，回到原来的节奏', '把洞察当作一次情绪体验', '写下一个月后愿意重新检查的日期。'),
      choice('practice', '选一个小动作，连续练习', '让改变进入日常而不是停在理解', '把一个 7 天动作放进日历，并找人见证。'),
    ],
  },
];

const challengeMap = new Map(TEN_CHALLENGES.map((challenge) => [challenge.id, challenge]));

export function createEmptyChallengeProgress(): ChallengeProgress {
  return { version: CHALLENGE_PROGRESS_VERSION, startedAt: '', completedAt: '', responses: {} };
}

export function getChallengeById(id: string): LifeChallenge | undefined {
  return challengeMap.get(id);
}

export function recordChallengeResponse(
  progress: ChallengeProgress,
  response: ChallengeResponse,
): { ok: true; value: ChallengeProgress } | { ok: false; errors: string[] } {
  const challenge = getChallengeById(response.challengeId);
  if (!challenge) return { ok: false, errors: ['找不到这一重考验。'] };
  if (!challenge.choices.some((item) => item.id === response.choiceId)) return { ok: false, errors: ['请选择一个有效的回应。'] };
  if (response.reflection.length > 800) return { ok: false, errors: ['反思文字不能超过 800 字。'] };
  if (!response.completedAt.trim()) return { ok: false, errors: ['请稍后再提交这一关。'] };

  const next = {
    ...progress,
    startedAt: progress.startedAt || response.completedAt,
    responses: { ...progress.responses, [response.challengeId]: { ...response, reflection: response.reflection.trim() } },
  };
  return {
    ok: true,
    value: Object.keys(next.responses).length === TEN_CHALLENGES.length
      ? { ...next, completedAt: response.completedAt }
      : next,
  };
}

export function validateChallengeProgress(input: unknown): ProgressValidation {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, errors: ['十重考验进度格式不正确。'] };
  const value = input as Record<string, unknown>;
  if (value.version !== CHALLENGE_PROGRESS_VERSION || !value.responses || typeof value.responses !== 'object' || Array.isArray(value.responses)) {
    return { ok: false, errors: ['十重考验进度版本不兼容。'] };
  }
  const responses = value.responses as Record<string, unknown>;
  const errors: string[] = [];
  for (const [challengeId, raw] of Object.entries(responses)) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      errors.push('考验回应格式不正确。');
      continue;
    }
    const response = raw as Record<string, unknown>;
    if (challengeId !== response.challengeId || typeof response.choiceId !== 'string' || typeof response.reflection !== 'string' || typeof response.completedAt !== 'string') {
      errors.push('考验回应缺少必要字段。');
      continue;
    }
    if (!getChallengeById(challengeId) || !getChallengeById(challengeId)?.choices.some((item) => item.id === response.choiceId)) errors.push('考验回应不是有效选项。');
    if (response.reflection.length > 800) errors.push('反思文字不能超过 800 字。');
  }
  return errors.length ? { ok: false, errors: Array.from(new Set(errors)) } : { ok: true, value: input as ChallengeProgress };
}

export function buildChallengeSummary(progress: ChallengeProgress): ChallengeSummary {
  const selected = Object.values(progress.responses).map((response) => {
    const challenge = getChallengeById(response.challengeId);
    return challenge?.choices.find((item) => item.id === response.choiceId);
  }).filter((item): item is LifeChallengeChoice => Boolean(item));
  const patterns = Array.from(new Set(selected.map((item) => item.pattern))).slice(0, 4);
  const nextActions = Array.from(new Set(selected.map((item) => item.action)));

  return {
    completedCount: selected.length,
    patterns: patterns.length ? patterns : ['还没有足够的回应，先完成一关，再观察自己的第一反应。'],
    nextActions: nextActions.slice(0, 5),
    disclaimer: '十重考验是反思性游戏，不是命运判决，也不是对人格、健康或未来的诊断。',
  };
}
