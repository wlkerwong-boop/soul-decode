import { describe, expect, it } from 'vitest';
import { normalizeInlineReportHeadings } from './normalize-inline-report-headings.mjs';

describe('normalizeInlineReportHeadings', () => {
  it('moves an inline numbered heading onto its own line', () => {
    const normalized = normalizeInlineReportHeadings('上一段结论。## 4. 关系全景\n下一段');

    expect(normalized).toContain('上一段结论。\n\n## 4. 关系全景');
    expect(normalized).not.toContain('。## 4.');
  });

  it('does not alter headings that already start a line', () => {
    const report = '## 1. 开始\n\n## 2. 继续';

    expect(normalizeInlineReportHeadings(report)).toBe(report);
  });
});
