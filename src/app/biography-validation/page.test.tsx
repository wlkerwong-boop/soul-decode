import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
const workbenchSource = readFileSync(new URL('../../components/biography-validation/BiographyValidationWorkbench.tsx', import.meta.url), 'utf8');

describe('biography validation workbench contract', () => {
  it('keeps the reviewer flow anonymous and report-first', () => {
    expect(source).toContain('BiographyValidationWorkbench');
    expect(workbenchSource).toContain('样本 A');
    expect(workbenchSource).toContain('先粘贴报告');
    expect(workbenchSource).toContain('match');
    expect(workbenchSource).toContain('mismatch');
    expect(workbenchSource).toContain('unscorable');
    expect(workbenchSource).toContain('/api/biography-validation/review');
    expect(workbenchSource).toContain('不是科学验证结论');
  });
});
