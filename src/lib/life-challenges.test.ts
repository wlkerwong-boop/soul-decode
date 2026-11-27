import { describe, expect, it } from 'vitest';

import {
  buildChallengeSummary,
  createEmptyChallengeProgress,
  getChallengeById,
  recordChallengeResponse,
  TEN_CHALLENGES,
  validateChallengeProgress,
} from './life-challenges';

describe('ten reflective challenges', () => {
  it('ships ten ordered challenges with a scenario and choices', () => {
    expect(TEN_CHALLENGES).toHaveLength(10);
    expect(TEN_CHALLENGES[0].title).toContain('第一关');
    expect(TEN_CHALLENGES.every((challenge) => challenge.choices.length >= 3)).toBe(true);
  });

  it('creates an empty versioned progress record', () => {
    const progress = createEmptyChallengeProgress();

    expect(progress.version).toBe(1);
    expect(progress.responses).toEqual({});
    expect(progress.completedAt).toBe('');
  });

  it('records only valid choices and bounds the reflection text', () => {
    const progress = createEmptyChallengeProgress();
    const challenge = TEN_CHALLENGES[0];
    const choice = challenge.choices[1];

    const next = recordChallengeResponse(progress, {
      challengeId: challenge.id,
      choiceId: choice.id,
      reflection: '我发现自己常常先考虑别人怎么看。',
      completedAt: '2026-09-20T12:00:00.000Z',
    });

    expect(next.ok).toBe(true);
    if (next.ok) expect(next.value.responses[challenge.id].choiceId).toBe(choice.id);

    const invalid = recordChallengeResponse(progress, {
      challengeId: challenge.id,
      choiceId: 'not-a-choice',
      reflection: 'x'.repeat(801),
      completedAt: '2026-09-20T12:00:00.000Z',
    });
    expect(invalid.ok).toBe(false);
  });

  it('recognizes completion and produces an action-oriented summary', () => {
    let progress = createEmptyChallengeProgress();
    for (const challenge of TEN_CHALLENGES) {
      const recorded = recordChallengeResponse(progress, {
        challengeId: challenge.id,
        choiceId: challenge.choices[2].id,
        reflection: '',
        completedAt: '2026-09-20T12:00:00.000Z',
      });
      expect(recorded.ok).toBe(true);
      if (recorded.ok) progress = recorded.value;
    }

    const validation = validateChallengeProgress(progress);
    expect(validation.ok).toBe(true);
    const summary = buildChallengeSummary(progress);
    expect(summary.completedCount).toBe(10);
    expect(summary.nextActions.length).toBeGreaterThanOrEqual(3);
    expect(summary.disclaimer).toContain('不是命运判决');
    expect(getChallengeById('identity')?.id).toBe('identity');
  });
});
