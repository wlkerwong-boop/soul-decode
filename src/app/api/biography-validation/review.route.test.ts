import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { BLIND_SAMPLE_IDS, getBlindBiographySample } from '../../../data/biography-validation-study';
import { POST } from './review/route';

function requestOf(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/biography-validation/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('blind biography review API', () => {
  it('scores an anonymous sample and redacts the real person ID', async () => {
    const sample = getBlindBiographySample('sample-a');
    const response = await POST(requestOf({
      sampleId: 'sample-a',
      reviews: sample?.facts.map((fact) => ({ factId: fact.id, label: 'match' })),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body).toMatchObject({ ok: true, score: { personId: 'anonymous', observedFitScore: 100 } });
    expect(JSON.stringify(body)).not.toContain('bruce');
  });

  it('rejects unknown samples and incomplete labels', async () => {
    const unknown = await POST(requestOf({ sampleId: 'sample-x', reviews: [] }));
    expect(unknown.status).toBe(400);

    const sample = getBlindBiographySample(BLIND_SAMPLE_IDS[1]);
    const incomplete = await POST(requestOf({
      sampleId: 'sample-b',
      reviews: [{ factId: sample?.facts[0].id, label: 'match' }],
    }));
    const body = await incomplete.json();
    expect(incomplete.status).toBe(400);
    expect(body.errors[0]).toContain('每条事实都必须有且只有一条盲评标签');
  });
});
