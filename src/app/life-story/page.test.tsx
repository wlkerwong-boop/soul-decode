import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
const wizardSource = readFileSync(new URL('../../components/life-story/LifeStoryWizard.tsx', import.meta.url), 'utf8');

describe('life story wizard page contract', () => {
  it('exposes the four reflective steps and local draft controls', () => {
    expect(wizardSource).toContain('我的起点');
    expect(wizardSource).toContain('我的路');
    expect(wizardSource).toContain('我的门槛');
    expect(wizardSource).toContain('我的此刻');
    expect(wizardSource).toContain('LIFE_STORY_DRAFT_KEY');
    expect(wizardSource).toContain('删除本地草稿');
  });

  it('keeps the experience framed as a reflective simulation', () => {
    expect(wizardSource).toContain('不是命运判决');
    expect(wizardSource).toContain('把报告放回真实人生');
    expect(wizardSource).toContain('/api/life-script/summary');
    expect(wizardSource).toContain('/api/life-script/generate');
  });
});
