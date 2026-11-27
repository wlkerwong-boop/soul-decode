import { describe, expect, it } from 'vitest';

import {
  buildSummarySeed,
  createEmptyLifeStory,
  validateLifeStory,
} from './life-story';

function validStory() {
  const story = createEmptyLifeStory();
  story.present.status = '正在重新梳理工作节奏，也想改善与家人的沟通。';
  story.events.push({
    id: 'event-1',
    year: 2018,
    theme: 'health',
    title: '一次重要转折',
    whatHappened: '那一年发生了一件让我重新安排生活优先级的事。',
    choiceMade: '我选择先照顾身体，再重新规划工作。',
    meaningNow: '我更能看见长期节奏的重要性。',
  });
  story.consent = {
    reflectiveSimulation: true,
    confirmedAt: '2026-09-20T12:00:00.000Z',
  };
  return story;
}

describe('life story domain model', () => {
  it('creates a versioned empty profile with bounded sections', () => {
    const story = createEmptyLifeStory();

    expect(story.version).toBe(1);
    expect(story.events).toEqual([]);
    expect(story.present.status).toBe('');
    expect(story.consent.reflectiveSimulation).toBe(false);
  });

  it('requires current status and at least one meaningful event', () => {
    const result = validateLifeStory(createEmptyLifeStory());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('请先填写你此刻的状态。');
      expect(result.errors).toContain('至少记录一个对你有意义的关键事件。');
      expect(result.errors).toContain('请确认你了解这是反思性模拟，不是命运判决。');
    }
  });

  it('accepts a complete story and produces a compact summary seed', () => {
    const story = validStory();
    const result = validateLifeStory(story);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const seed = buildSummarySeed(result.value);
      expect(seed).toContain('当前状态：正在重新梳理工作节奏');
      expect(seed).toContain('2018｜一次重要转折');
      expect(seed.length).toBeLessThan(9000);
    }
  });

  it('rejects more than eight events and years outside the safe range', () => {
    const story = validStory();
    story.events = Array.from({ length: 9 }, (_, index) => ({
      ...story.events[0],
      id: `event-${index}`,
      year: index === 0 ? 1899 : 2027,
    }));

    const result = validateLifeStory(story);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('关键事件最多记录 8 个。');
      expect(result.errors).toContain('关键事件的年份需在 1900 年至明年之间。');
    }
  });

  it('rejects overlong fields instead of silently truncating a life story', () => {
    const story = validStory();
    story.present.status = 'a'.repeat(1201);

    const result = validateLifeStory(story);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('当前状态不能超过 1200 字。');
    }
  });
});
