import { generateModule } from './ai';
import {
  buildSummarySeed,
  type LifeScriptPath,
  type LifeScriptResult,
  type LifeScriptSummary,
  type LifeStoryProfile,
} from './life-story';

export const LIFE_SCRIPT_DISCLAIMER =
  '这是一份基于你提供的信息生成的反思性模拟，用来帮助你看见选择与行动，不是命运判决、诊断或对未来的保证。';

const PROHIBITED_WORDS = ['注定', '必然', '命中', '一定会', '灾难降临', '不可避免'];

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.trim().length > 0);

const isSummary = (value: unknown): value is LifeScriptSummary => {
  if (!value || typeof value !== 'object') return false;
  const summary = value as Record<string, unknown>;
  return (
    typeof summary.headline === 'string' &&
    summary.headline.trim().length > 0 &&
    isStringArray(summary.strengths) &&
    isStringArray(summary.patterns) &&
    isStringArray(summary.tensions) &&
    isStringArray(summary.openQuestions)
  );
};

const isPath = (value: unknown): value is LifeScriptPath => {
  if (!value || typeof value !== 'object') return false;
  const path = value as Record<string, unknown>;
  return (
    (path.type === 'continuity' || path.type === 'change') &&
    typeof path.title === 'string' &&
    typeof path.premise === 'string' &&
    isStringArray(path.signals) &&
    isStringArray(path.risks) &&
    isStringArray(path.opportunities) &&
    isStringArray(path.actions)
  );
};

const containsProhibitedWording = (value: unknown): boolean =>
  JSON.stringify(value).split(/\s+/).some((part) => PROHIBITED_WORDS.some((word) => part.includes(word)));

export function buildLifeScriptPrompt(
  profile: LifeStoryProfile,
  birthProfile: unknown,
  summary: LifeScriptSummary,
): string {
  const boundedBirthProfile = JSON.stringify(birthProfile ?? {}).slice(0, 4200);
  const boundedStory = buildSummarySeed(profile).slice(0, 9000);

  return `你是 SoulCode 的人生反思引导者。请根据用户主动提供的人生经历、当前状态和可选的出生画像，生成一份“可能路径”模拟。

重要边界：
1. 这不是命运判决，也不是医疗/法律/投资建议，不能保证未来发生什么。
2. 禁止使用“注定、必然、命中、一定会、不可避免”等宿命化表达；统一使用“倾向、可能、如果继续、可以尝试”。
3. 不诊断心理或身体疾病，不替用户做重大关系、医疗、法律或财务决定。
4. 只使用下列材料，不补写用户没有提供的隐私事实。

【出生画像（可选，来源标签：出生画像）】
${boundedBirthProfile}

【人生经历（来源标签：用户经历）】
${boundedStory}

【用户确认过的总结（来源标签：当前选择）】
${JSON.stringify(summary).slice(0, 3600)}

请只返回合法 JSON，不要 Markdown 代码围栏。结构必须严格为：
{
  "summary": { "headline": string, "strengths": string[], "patterns": string[], "tensions": string[], "openQuestions": string[] },
  "paths": [
    { "type": "continuity", "title": string, "premise": string, "signals": string[], "risks": string[], "opportunities": string[], "actions": string[] },
    { "type": "change", "title": string, "premise": string, "signals": string[], "risks": string[], "opportunities": string[], "actions": string[] }
  ],
  "sourceLabels": ["birthProfile", "lifeStory", "currentChoice", "inference"],
  "disclaimer": string
}

change 路径的 actions 至少 3 条，必须是 7 天内可以开始的小行动；两条路径都必须呈现风险和机会。`;
}

export function parseLifeScriptResponse(text: string): LifeScriptResult {
  const normalized = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  let parsed: unknown;

  try {
    parsed = JSON.parse(normalized);
  } catch {
    throw new Error('AI 返回的剧本不是合法 JSON。');
  }

  if (containsProhibitedWording(parsed)) {
    throw new Error('AI 返回包含宿命化表达，已安全拦截。');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI 返回的剧本结构不正确。');
  }

  const result = parsed as Record<string, unknown>;
  const paths = Array.isArray(result.paths) ? result.paths.filter(isPath) : [];
  const continuity = paths.find((path) => path.type === 'continuity');
  const change = paths.find((path) => path.type === 'change');

  if (!isSummary(result.summary) || !continuity || !change || !isStringArray(result.sourceLabels)) {
    throw new Error('AI 返回的剧本缺少必要字段。');
  }
  if (change.actions.length < 3) {
    throw new Error('主动改变路径至少需要 3 条可执行行动。');
  }

  const sourceLabels = result.sourceLabels.filter((label): label is LifeScriptResult['sourceLabels'][number] =>
    ['birthProfile', 'lifeStory', 'currentChoice', 'inference'].includes(label),
  );
  if (sourceLabels.length === 0) {
    throw new Error('剧本缺少来源标签。');
  }

  return {
    summary: result.summary,
    paths: [continuity, change],
    sourceLabels,
    disclaimer: LIFE_SCRIPT_DISCLAIMER,
  };
}

export function buildDeterministicSummary(profile: LifeStoryProfile): LifeScriptSummary {
  const firstEvent = profile.events[0];
  const focus = profile.present.change?.trim() || '把当前最重要的生活课题说清楚';

  return {
    headline: `你正在从“${profile.present.status.trim().slice(0, 32)}”出发，重新安排下一步`,
    strengths: [
      '你愿意回看已经走过的路，而不是只追逐一个抽象答案。',
      firstEvent ? `你曾经在“${firstEvent.title.trim().slice(0, 36)}”中做过选择，这说明你具备复盘经验。` : '你愿意把模糊感受整理成可以讨论的语言。',
    ],
    patterns: [
      '当重要问题缺少明确下一步时，你容易继续收集信息或等待更确定的时机。',
      '过去的经验既提供了保护，也可能让熟悉的应对方式持续占据优先级。',
    ],
    tensions: [
      `你想改变的方向是：${focus}。它与保持稳定之间需要一个可试错的过渡。`,
    ],
    openQuestions: [
      '接下来 7 天，哪个小行动能让你获得真实反馈？',
      '哪些是你真正想保留的资源，哪些只是因为熟悉而没有放下？',
    ],
  };
}

export async function generateLifeScript(
  profile: LifeStoryProfile,
  birthProfile: unknown,
  summary: LifeScriptSummary,
): Promise<LifeScriptResult> {
  const prompt = buildLifeScriptPrompt(profile, birthProfile, summary);
  const response = await generateModule(
    '你只负责输出满足用户结构要求的 JSON。任何时候都要尊重用户自主性，并避免宿命化、诊断化和保证式表达。',
    prompt,
  );
  return parseLifeScriptResponse(response.content);
}
