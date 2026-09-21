import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { getCelebrityFacts } from '../../../data/celebrity-validation';
import { POST } from './route';

function requestOf(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/biography-validation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('biography validation API', () => {
  it('scores a complete blind review and disables caching', async () => {
    const facts = getCelebrityFacts('bruce-lee').slice(0, 2);
    const response = await POST(requestOf({
      facts,
      reviews: facts.map((fact) => ({ factId: fact.id, label: 'match' })),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body).toMatchObject({ ok: true, score: { personId: 'bruce-lee', observedFitScore: 100 } });
  });

  it('returns review validation errors instead of scoring partial evidence', async () => {
    const facts = getCelebrityFacts('luxun').slice(0, 2);
    const response = await POST(requestOf({
      facts,
      reviews: [{ factId: facts[0].id, label: 'match' }],
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.errors[0]).toContain('每条事实都必须有且只有一条盲评标签');
  });
});
