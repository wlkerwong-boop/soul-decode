import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { POST as summaryPOST } from './summary/route';
import {
  buildLifeScriptPrompt,
  parseLifeScriptResponse,
} from '../../../lib/life-script-ai';
import { createEmptyLifeStory } from '../../../lib/life-story';

function requestOf(body: unknown, path = '/api/life-script/summary'): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function completeStory() {
  const story = createEmptyLifeStory();
  story.present.status = '正在重新安排工作与家庭的节奏。';
  story.present.change = '希望减少反复犹豫，把重要的事推进起来。';
  story.events.push({
    id: 'event-1',
    year: 2018,
    theme: 'career',
    title: '换了一条工作路径',
    whatHappened: '一次工作变化让我重新思考自己要把时间放在哪里。',
    choiceMade: '我选择先保留基本盘，再学习新的能力。',
    meaningNow: '我知道自己需要更清晰的优先级。',
  });
  story.consent = {
    reflectiveSimulation: true,
    confirmedAt: '2026-09-20T12:00:00.000Z',
  };
  return story;
}

const validModelJson = {
  summary: {
    headline: '你正在重新安排生活的优先级',
    strengths: ['能在变化中保留基本盘', '愿意复盘并学习'],
    patterns: ['重要选择前容易延长观察期'],
    tensions: ['稳定感与主动推进之间存在拉扯'],
    openQuestions: ['下一步要先保护什么，再主动改变什么？'],
  },
  paths: [
    {
      type: 'continuity',
      title: '惯性延续：继续用熟悉方法应对变化',
      premise: '如果保留目前的节奏，现有模式可能继续发挥作用。',
      signals: ['遇到不确定时先收集更多信息'],
      risks: ['重要行动被推迟'],
      opportunities: ['维持稳定并看见已有资源'],
      actions: ['每周复盘一次已完成的推进'],
    },
    {
      type: 'change',
      title: '主动改变：把优先级变成小步行动',
      premise: '如果围绕改变目标建立小步实验，生活可能出现新的反馈。',
      signals: ['愿意给一个选择设定截止时间'],
      risks: ['短期不适感增加'],
      opportunities: ['获得更快的现实反馈'],
      actions: ['本周选择一个目标', '为目标安排一次 30 分钟行动', '记录行动后的真实感受'],
    },
  ],
  sourceLabels: ['lifeStory', 'currentChoice', 'inference'],
  disclaimer: '这是一份反思性模拟，不是命运判决。',
};

describe('life script APIs and parser', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns deterministic summary validation errors for an incomplete payload', async () => {
    const response = await summaryPOST(requestOf({ lifeStory: createEmptyLifeStory() }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.errors).toContain('请先填写你此刻的状态。');
    expect(body.errors.join('')).not.toContain('正在');
  });

  it('returns a structured summary without requiring an AI key', async () => {
    const response = await summaryPOST(requestOf({ lifeStory: completeStory() }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.summary).toMatchObject({
      strengths: expect.any(Array),
      patterns: expect.any(Array),
      tensions: expect.any(Array),
      openQuestions: expect.any(Array),
    });
  });

  it('marks the guest summary response as non-cacheable at every proxy layer', async () => {
    const response = await summaryPOST(requestOf({ lifeStory: completeStory() }));

    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('cdn-cache-control')).toBe('no-store');
    expect(response.headers.get('surrogate-control')).toBe('no-store');
    expect(response.headers.get('pragma')).toBe('no-cache');
    expect(response.headers.get('expires')).toBe('0');
  });

  it('builds a bounded prompt with the source boundary included', () => {
    const prompt = buildLifeScriptPrompt(completeStory(), { type: 'birth-profile' }, validModelJson.summary);

    expect(prompt).toContain('出生画像');
    expect(prompt).toContain('不是命运判决');
    expect(prompt.length).toBeLessThan(14000);
  });

  it('parses fenced JSON and rejects malformed or deterministic output', () => {
    const parsed = parseLifeScriptResponse(`\`\`\`json\n${JSON.stringify(validModelJson)}\n\`\`\``);

    expect(parsed).toMatchObject({
      paths: expect.arrayContaining([
        expect.objectContaining({ type: 'continuity' }),
        expect.objectContaining({ type: 'change' }),
      ]),
    });
    expect(() => parseLifeScriptResponse('这是一段没有 JSON 的回答')).toThrow(/JSON/);
    expect(() => parseLifeScriptResponse(JSON.stringify({
      ...validModelJson,
      summary: { ...validModelJson.summary, headline: '你注定会成功' },
    }))).toThrow(/宿命化/);
  });
});
