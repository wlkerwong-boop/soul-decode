import { describe, expect, it } from 'vitest';
import { formatPillar, getElementPercent, getVisibleStars } from './chart-atlas';

describe('chart atlas helpers', () => {
  it('keeps four pillar characters and returns a safe fallback', () => {
    expect(formatPillar('甲子')).toEqual({ stem: '甲', branch: '子' });
    expect(formatPillar('')).toEqual({ stem: '', branch: '' });
  });

  it('limits dense palace stars to the visible preview', () => {
    expect(getVisibleStars(['紫微', '天府', '武曲', '天相'], 2)).toEqual(['紫微', '天府']);
  });

  it('calculates a zero-safe percentage from five-element distribution', () => {
    expect(getElementPercent({ 木: 2, 火: 1 }, '木')).toBe(67);
    expect(getElementPercent({}, '木')).toBe(0);
  });
});
