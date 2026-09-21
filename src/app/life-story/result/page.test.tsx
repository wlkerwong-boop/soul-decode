import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
const viewSource = readFileSync(new URL('../../../components/life-story/LifeScriptResult.tsx', import.meta.url), 'utf8');

describe('life script result page contract', () => {
  it('renders both paths, source labels, and the reflective disclaimer', () => {
    expect(viewSource).toContain('不改变路径');
    expect(viewSource).toContain('主动改变路径');
    expect(viewSource).toContain('来源标签');
    expect(viewSource).toContain('7 天行动');
    expect(viewSource).toContain('/life-story/challenges');
    expect(viewSource).toContain('不是命运判决');
  });

  it('has a recoverable empty-session state and short-lived result storage', () => {
    expect(source).toContain('LifeScriptResult');
    expect(viewSource).toContain('LIFE_SCRIPT_RESULT_KEY');
    expect(viewSource).toContain('重新填写人生总结');
    expect(viewSource).toContain('sessionStorage');
  });
});
