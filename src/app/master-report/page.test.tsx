import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');

describe('master report life story integration', () => {
  it('offers the life story continuation after a report exists', () => {
    expect(source).toContain('/life-story');
    expect(source).toContain('把报告放回真实人生');
    expect(source).toContain('人生总结');
  });
});
