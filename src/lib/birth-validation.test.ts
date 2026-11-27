import { describe, expect, it } from 'vitest';
import { isSupportedBirthYear } from './birth-validation';

describe('historical birth validation', () => {
  it('accepts 1893 for historical cross-validation while rejecting years outside the engine range', () => {
    expect(isSupportedBirthYear(1893)).toBe(true);
    expect(isSupportedBirthYear(1799)).toBe(false);
    expect(isSupportedBirthYear(2101)).toBe(false);
  });
});
