import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  calculateJiugongV6,
  getJiugongStroke,
} from './jiugong-v6';

const FIXED_NOW = new Date('2026-07-29T12:00:00+08:00');
const comparisonCases = [
  { label: 'two-character name', input: { name: '李明', year: 1988, month: 3, day: 12 } },
  { label: 'three-character name', input: { name: '张伟民', year: 1992, month: 10, day: 8 } },
  { label: 'compound surname', input: { name: '欧阳修文', year: 2001, month: 1, day: 20 } },
] as const;

describe('jiugong v6 server engine', () => {
  beforeAll(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('keeps Wang Xianke at total 33 and ju 0', async () => {
    const result = await calculateJiugongV6(
      { name: '王献科', year: 1973, month: 6, day: 5 },
      FIXED_NOW,
    );

    expect(result.total).toBe(33);
    expect(result.ju).toBe(0);
  });

  it('uses the 献→獻 S2T path with 20 Kangxi strokes', async () => {
    expect(await getJiugongStroke('献')).toBe(20);
  });

  it('restores the v5-approved collision cycles as v6 output fields', async () => {
    const result = await calculateJiugongV6(
      { name: '王献科', year: 1973, month: 6, day: 5 },
      FIXED_NOW,
    );

    expect(result.upperColl).toHaveLength(9);
    expect(result.selfColl).toHaveLength(9);
    expect(result.lowerColl).toHaveLength(9);
    expect(result.upperColl.every((age, index, ages) => (
      index === 0 || age - ages[index - 1] === 10
    ))).toBe(true);
  });

  it.each(comparisonCases)('matches every legacy field for $label', async ({ input }) => {
    const server = await calculateJiugongV6(input, FIXED_NOW);
    const {
      upperColl: _upperColl,
      selfColl: _selfColl,
      lowerColl: _lowerColl,
      ...legacyFields
    } = server;
    void _upperColl;
    void _selfColl;
    void _lowerColl;
    expect({
      ...legacyFields,
      years: server.years.map((year) => ({
        age: year.age,
        year: year.year,
        yun: year.yun,
        chance: year.chance,
        gua: year.gua,
        koujue: year.koujue,
        jiedu: year.jiedu,
      })),
    }).toMatchSnapshot();
  });
});
