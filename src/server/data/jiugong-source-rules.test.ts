import { describe, expect, it } from 'vitest';
import { JIUGONG_SOURCE_RULES } from './jiugong-source-rules';

describe('jiugong source rules', () => {
  it('requires traceable sources and actionable content for every rule', () => {
    expect(JIUGONG_SOURCE_RULES.length).toBeGreaterThanOrEqual(20);
    for (const rule of JIUGONG_SOURCE_RULES) {
      expect(rule.sourceIds.length).toBeGreaterThan(0);
      expect(rule.interpretation.length).toBeGreaterThan(10);
      expect(rule.actions.length).toBeGreaterThan(0);
    }
  });

  it('covers all four relationships', () => {
    expect(new Set(JIUGONG_SOURCE_RULES.map((rule) => rule.relationship)))
      .toEqual(new Set(['upper', 'self', 'lower', 'outer']));
  });
});
