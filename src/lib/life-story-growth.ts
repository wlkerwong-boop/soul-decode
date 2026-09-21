import type { LifeScriptResult } from './life-story';

const DEFAULT_ORIGIN = '/life-story';

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
