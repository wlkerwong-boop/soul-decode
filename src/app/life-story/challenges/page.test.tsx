import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
const viewSource = readFileSync(new URL('../../../components/life-story/TenChallenges.tsx', import.meta.url), 'utf8');

describe('ten challenge game page contract', () => {
  it('exposes the ten-stage reflective game and progress persistence', () => {
    expect(pageSource).toContain('TenChallenges');
    expect(viewSource).toContain('十重考验');
    expect(viewSource).toContain('LIFE_CHALLENGE_PROGRESS_KEY');
    expect(viewSource).toContain('下一关');
    expect(viewSource).toContain('完成十重考验');
  });

  it('keeps the game framed as voluntary reflection rather than a verdict', () => {
    expect(viewSource).toContain('反思性游戏');
    expect(viewSource).toContain('不是命运判决');
    expect(viewSource).toContain('暂停体验');
  });
});
