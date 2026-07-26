import { describe, expect, it } from 'vitest';
import { centeredScrollTop } from './jiugong-scroll';

describe('centeredScrollTop', () => {
  it('centers the current year inside the scroll panel without moving the page', () => {
    expect(centeredScrollTop(1200, 40, 600)).toBe(920);
  });

  it('never scrolls above the beginning of the panel', () => {
    expect(centeredScrollTop(100, 40, 600)).toBe(0);
  });
});
