import { describe, expect, it } from 'vitest';

import type { LifeScriptResult } from './life-story';
import { buildLifeStoryCompanionInviteText, buildSafeLifeStoryShareText } from './life-story-growth';

const result: LifeScriptResult = {
  summary: {
    headline: '你正在学习把责任感变成有边界的选择',
    strengths: ['能在变化中继续行动'],
    patterns: ['习惯先照顾所有人的需要'],
    tensions: ['稳定与改变之间存在拉扯'],
    openQuestions: ['什么值得由你亲自选择？'],
  },
  paths: [
    {
      type: 'continuity',
      title: '继续沿用旧模式',
      premise: '熟悉的方式会继续带来熟悉的结果。',
      signals: ['再次把自己放到最后'],
      risks: ['精力持续被透支'],
      opportunities: ['看见旧模式'],
      actions: ['记录一次自动答应之前的真实感受'],
    },
    {
      type: 'change',
      title: '主动改变路径',
      premise: '从一个可承担的小改变开始。',
      signals: ['先表达边界'],
      risks: ['短期会感到不习惯'],
      opportunities: ['获得更真实的关系反馈'],
      actions: ['本周和一个重要的人进行一次边界对话'],
    },
  ],
  sourceLabels: ['lifeStory', 'currentChoice', 'inference'],
  disclaimer: '它只是一份可被现实修正的观察稿。',
};

describe('life story growth helpers', () => {
  it('builds a share card without exposing private birth or event data', () => {
    const text = buildSafeLifeStoryShareText(result, 'https://aisoulcode.cn/life-story');

    expect(text).toContain('SoulCode · 人生路径练习卡');
    expect(text).toContain(result.summary.headline);
    expect(text).toContain(result.paths[1].actions[0]);
    expect(text).toContain('不是命运判决');
    expect(text).toContain('https://aisoulcode.cn/life-story');
    expect(text).not.toContain('2018');
    expect(text).not.toContain('出生');
    expect(text).not.toContain('车祸');
  });

  it('builds a privacy-safe companion invitation with the three reflection questions', () => {
    const text = buildLifeStoryCompanionInviteText('https://aisoulcode.cn/life-story');

    expect(text).toContain('朋友同行');
    expect(text).toContain('https://aisoulcode.cn/life-story?mode=companion');
    expect(text).toContain('这份总结里，哪一句最像你？');
    expect(text).toContain('哪一句你不认同？现实证据是什么？');
    expect(text).toContain('未来 7 天各自做一个小实验，如何互相支持？');
    expect(text).not.toContain('出生');
    expect(text).not.toContain('车祸');
  });
});
