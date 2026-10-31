import { describe, expect, it } from 'vitest';
import {
  scoreBiographyReview,
  validateBiographyFacts,
  type BiographyFact,
} from './biography-validation';
import { getCelebrityFacts } from '../data/celebrity-validation';

const facts: BiographyFact[] = [
  {
    id: 'move-us-hk',
    personId: 'bruce-lee',
    eventYear: 1941,
    category: 'move',
    description: '幼年从旧金山随家人返回香港成长。',
    sourceUrl: 'https://www.archives.gov/san-francisco/highlights/bruce-lee',
    sourceGrade: 'official',
    distinctiveness: 'high',
    preRegistered: true,
  },
  {
    id: 'career-martial-arts-film',
    personId: 'bruce-lee',
    eventYear: 1959,
    category: 'career',
    description: '赴美国求学并开设武术学校，后来进入影视行业。',
    sourceUrl: 'https://www.history.com/this-day-in-history/november-27/bruce-lee',
    sourceGrade: 'reputable',
    distinctiveness: 'high',
    preRegistered: true,
  },
];

describe('biography validation domain', () => {
  it('ships pre-registered high-distinctiveness fixtures without birth-time claims', () => {
    for (const personId of ['bruce-lee', 'luxun', 'yao-ming']) {
      const fixture = getCelebrityFacts(personId);
      expect(fixture.length).toBeGreaterThanOrEqual(5);
      expect(fixture.every((fact) => fact.preRegistered)).toBe(true);
      expect(validateBiographyFacts(fixture).ok).toBe(true);
    }

    expect(getCelebrityFacts('luxun').some((fact) => /出生时刻|出生时间/.test(fact.description))).toBe(false);
  });

  it('requires pre-registered facts with traceable sources', () => {
    const result = validateBiographyFacts([
      { ...facts[0], preRegistered: false },
      { ...facts[1], sourceUrl: 'not-a-url' },
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('事实 move-us-hk 必须在报告生成前登记。');
      expect(result.errors).toContain('事实 career-martial-arts-film 的来源链接必须是 http(s) URL。');
    }
  });

  it('rejects duplicate fact IDs and missing descriptions', () => {
    const result = validateBiographyFacts([
      facts[0],
      { ...facts[0], description: '' },
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('事实 ID 不得重复：move-us-hk。');
      expect(result.errors).toContain('事实 move-us-hk 必须填写中性描述。');
    }
  });

  it('scores blind labels without calling the result prediction accuracy', () => {
    const score = scoreBiographyReview(facts, [
      { factId: 'move-us-hk', label: 'match', reviewerId: 'reviewer-a' },
      { factId: 'career-martial-arts-film', label: 'unscorable', reviewerId: 'reviewer-a' },
    ]);

    expect(score.personId).toBe('bruce-lee');
    expect(score.counts).toEqual({ total: 2, match: 1, mismatch: 0, neutral: 0, unscorable: 1 });
    expect(score.observedFitScore).toBe(100);
    expect(score.coveragePercent).toBe(50);
    expect(score.unscorablePercent).toBe(50);
    expect(score).not.toHaveProperty('accuracy');
  });

  it('requires exactly one review label per fact', () => {
    expect(() => scoreBiographyReview(facts, [
      { factId: 'move-us-hk', label: 'match' },
    ])).toThrow('每条事实都必须有且只有一条盲评标签');
  });

  it('produces a reproducible synthetic score for documentation', () => {
    const fiveFacts = getCelebrityFacts('bruce-lee');
    const score = scoreBiographyReview(fiveFacts, [
      { factId: fiveFacts[0].id, label: 'match' },
      { factId: fiveFacts[1].id, label: 'mismatch' },
      { factId: fiveFacts[2].id, label: 'neutral' },
      { factId: fiveFacts[3].id, label: 'unscorable' },
      { factId: fiveFacts[4].id, label: 'match' },
    ]);

    expect(score.counts).toEqual({ total: 5, match: 2, mismatch: 1, neutral: 1, unscorable: 1 });
    expect(score.weights).toEqual({ total: 15, reviewed: 12, match: 6, mismatch: 3, neutral: 3, unscorable: 3 });
    expect(score.observedFitScore).toBe(50);
    expect(score.coveragePercent).toBe(80);
    expect(score.unscorablePercent).toBe(20);
    expect(score.contradictionPercent).toBe(25);
  });
});
