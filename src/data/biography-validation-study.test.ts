import { describe, expect, it } from 'vitest';

import {
  BLIND_SAMPLE_IDS,
  getBlindBiographySample,
  getBlindReviewFacts,
} from './biography-validation-study';

describe('blind biography validation study', () => {
  it('projects three anonymous samples without leaking identity or sources', () => {
    expect(BLIND_SAMPLE_IDS).toEqual(['sample-a', 'sample-b', 'sample-c']);

    for (const sampleId of BLIND_SAMPLE_IDS) {
      const sample = getBlindBiographySample(sampleId);
      expect(sample).not.toBeNull();
      expect(sample?.facts).toHaveLength(5);
      expect(JSON.stringify(sample)).not.toMatch(/bruce|luxun|yao|sourceUrl|archives|museum|fiba/i);
      expect(sample?.facts.every((fact) => fact.id.startsWith(`${sampleId}-fact-`))).toBe(true);
    }
  });

  it('keeps scoring facts server-side while assigning stable anonymous IDs', () => {
    const facts = getBlindReviewFacts('sample-a');

    expect(facts).toHaveLength(5);
    if (!facts) return;
    expect(facts[0]).toHaveProperty('sourceUrl');
    expect(facts[0].personId).toBe('bruce-lee');
    expect(facts[0].id).toBe('sample-a-fact-1');
    expect(getBlindReviewFacts('sample-x')).toBeNull();
  });
});
