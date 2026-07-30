import { describe, expect, it } from 'vitest';
import { calculateJiugongV6 } from '../server/jiugong-v6';
import { selectYearEnvironment } from './jiugong-environment';
import { buildRelationshipDetails } from './jiugong-relationships';

async function makeDetails(
  input: { name: string; year: number; month: number; day: number },
  selectedYear = 2026,
) {
  const data = await calculateJiugongV6(
    input,
    new Date('2026-07-30T12:00:00+08:00'),
  );
  return buildRelationshipDetails(
    data,
    selectYearEnvironment(data, selectedYear)!,
  );
}

describe('personalized jiugong relationships', () => {
  it('builds four readable and traceable layers for Wang Xianke', async () => {
    const details = await makeDetails({
      name: '王献科',
      year: 1982,
      month: 1,
      day: 27,
    });

    expect(details.map((item) => item.key))
      .toEqual(['upper', 'self', 'lower', 'outer']);
    for (const item of details) {
      expect(item.meaning.length).toBeGreaterThan(20);
      expect(item.annualContext.length).toBeGreaterThan(30);
      expect(item.personalFit.length).toBeGreaterThan(50);
      expect(item.strengths.length).toBeGreaterThanOrEqual(2);
      expect(item.risks.length).toBeGreaterThanOrEqual(2);
      expect(item.actions.length).toBeGreaterThanOrEqual(2);
      expect(item.sourceIds.length).toBeGreaterThan(0);
    }
  });

  it('does not give three structurally different people the same personal analysis', async () => {
    const samples = await Promise.all(
      ['王献科', '欧阳明德', '陈美华'].map((name) => makeDetails({
        name,
        year: 1982,
        month: 1,
        day: 27,
      })),
    );
    const signatures = samples.map((details) => (
      details.map((item) => item.personalFit).join('|')
    ));

    expect(new Set(signatures).size).toBe(3);
  });

  it('changes annual context and actions when the selected year changes', async () => {
    const first = await makeDetails({
      name: '王献科',
      year: 1982,
      month: 1,
      day: 27,
    }, 2026);
    const second = await makeDetails({
      name: '王献科',
      year: 1982,
      month: 1,
      day: 27,
    }, 2027);

    expect(first.map((item) => item.annualContext))
      .not.toEqual(second.map((item) => item.annualContext));
  });
});
