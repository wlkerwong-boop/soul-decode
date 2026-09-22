import { describe, expect, it } from 'vitest';
import { localCivilTimeToUtc } from './astrology';

describe('astrology birthplace timezone conversion', () => {
  it('converts the birthplace local civil clock to UTC before ephemeris calculation', () => {
    expect(localCivilTimeToUtc(2020, 1, 2, 12, 0, 'Asia/Shanghai').toISOString())
      .toBe('2020-01-02T04:00:00.000Z');
    expect(localCivilTimeToUtc(2020, 1, 2, 12, 0, 'UTC').toISOString())
      .toBe('2020-01-02T12:00:00.000Z');
  });
});
