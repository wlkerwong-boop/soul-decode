import { beforeAll, describe, expect, it } from 'vitest';
import { calculateJiugongV6, type JiugongFull } from '../server/jiugong-v6';
import { selectYearEnvironment } from './jiugong-environment';

let gold: JiugongFull;

describe('selectYearEnvironment', () => {
  beforeAll(async () => {
    gold = await calculateJiugongV6(
      { name: '王献科', year: 1973, month: 6, day: 5 },
      new Date('2026-07-29T12:00:00+08:00'),
    );
  });

  it('selects the requested year only from API-returned v6 data', () => {
    const environment = selectYearEnvironment(gold, 2026);

    expect(environment).toMatchObject({
      year: 2026,
      age: 54,
      upperQi: expect.any(String),
      selfQi: expect.any(String),
      lowerQi: expect.any(String),
      outerQi: expect.any(String),
      ageStar: expect.any(String),
      group: expect.objectContaining({ name: expect.any(String) }),
    });
  });

  it('returns null instead of calculating outside the API data', () => {
    expect(selectYearEnvironment(gold, 2200)).toBeNull();
  });

  it('reads collision state from v6 collision arrays', () => {
    const environment = selectYearEnvironment(gold, 2026);

    expect(environment?.collisions).toEqual({
      upper: gold.upperColl.includes(54),
      self: gold.selfColl.includes(54),
      lower: gold.lowerColl.includes(54),
    });
  });
});
