import type {
  BiographyCategory,
  BiographyDistinctiveness,
  BiographyFact,
} from '../lib/biography-validation';
import { getCelebrityFacts } from './celebrity-validation';

export const BLIND_SAMPLE_IDS = ['sample-a', 'sample-b', 'sample-c'] as const;
export type BlindSampleId = (typeof BLIND_SAMPLE_IDS)[number];

const SAMPLE_PERSON_IDS: Record<BlindSampleId, string> = {
  'sample-a': 'bruce-lee',
  'sample-b': 'luxun',
  'sample-c': 'yao-ming',
};

export interface BlindBiographyFact {
  id: string;
  eventYear?: number;
  category: BiographyCategory;
  description: string;
  distinctiveness: BiographyDistinctiveness;
}

export interface BlindBiographySample {
  id: BlindSampleId;
  facts: BlindBiographyFact[];
}

function withBlindIds(facts: BiographyFact[], sampleId: BlindSampleId): BiographyFact[] {
  return facts.map((fact, index) => ({
    ...fact,
    id: `${sampleId}-fact-${index + 1}`,
  }));
}

export function getBlindReviewFacts(sampleId: string): BiographyFact[] | null {
  if (!BLIND_SAMPLE_IDS.includes(sampleId as BlindSampleId)) return null;
  const typedSampleId = sampleId as BlindSampleId;
  return withBlindIds(getCelebrityFacts(SAMPLE_PERSON_IDS[typedSampleId]), typedSampleId);
}

export function getBlindBiographySample(sampleId: string): BlindBiographySample | null {
  if (!BLIND_SAMPLE_IDS.includes(sampleId as BlindSampleId)) return null;
  const typedSampleId = sampleId as BlindSampleId;
  const facts = getBlindReviewFacts(typedSampleId) || [];

  return {
    id: typedSampleId,
    facts: facts.map(({ id, eventYear, category, description, distinctiveness }) => ({
      id,
      eventYear,
      category,
      description,
      distinctiveness,
    })),
  };
}
