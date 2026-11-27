import type { LifeScriptResult } from './life-story';

const DEFAULT_ORIGIN = '/life-story';

export const LIFE_STORY_COMPANION_QUESTIONS = [
  '这份总结里，哪一句最像你？',
  '哪一句你不认同？现实证据是什么？',
  '未来 7 天各自做一个小实验，如何互相支持？',
] as const;

function firstAction(result: LifeScriptResult): string {
  const change = result.paths.find((path) => path.type === 'change');
  const continuity = result.paths.find((path) => path.type === 'continuity');
  return change?.actions[0] || continuity?.actions[0] || '给自己留一个小而真实的行动。';
}

/**
 * Builds a deliberately narrow share card. The function only accepts the
 * generated result, so raw birth data and original life events cannot leak
 * into a shared message by accident.
 */
export function buildSafeLifeStoryShareText(result: LifeScriptResult, origin = DEFAULT_ORIGIN): string {
  return [
    'SoulCode · 人生路径练习卡',
    '',
    `我的当前观察：${result.summary.headline}`,
    `我准备尝试：${firstAction(result)}`,
    '',
    '这不是命运判决，而是一份可以被现实修正的反思材料。',
    `开始你的体验：${origin}`,
  ].join('\n');
}

/**
 * Builds a shareable invitation for two people to complete the reflection separately.
 * It intentionally contains no result, birth profile, or life-event data.
 */
export function buildLifeStoryCompanionInviteText(origin = DEFAULT_ORIGIN): string {
  const companionUrl = origin.includes('?') ? `${origin}&mode=companion` : `${origin}?mode=companion`;

  return [
    'SoulCode · 朋友同行人生总结',
    '',
    '我们各自完成一份人生总结，再带着真实反馈见面聊聊。',
    '这不是替朋友算命，也不是互相评判；请只填写自己愿意分享的内容。',
    '',
    ...LIFE_STORY_COMPANION_QUESTIONS,
    '',
    `开始你的独立体验：${companionUrl}`,
  ].join('\n');
}
