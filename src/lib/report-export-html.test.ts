import { describe, expect, it } from 'vitest';
import { buildPersonalPdfHtml, renderReportMarkdown } from './report-export-html';

describe('report export', () => {
  it('exports every chapter from the full report and keeps Markdown tables and quotations', () => {
    const report = '## 0. 排盘数据声明\n\n> 系统生成\n\n| 字段 | 值 |\n|---|---|\n| 年柱 | 辛酉 |\n\n## 7. 最终寄语\n完整结尾';
    const html = buildPersonalPdfHtml(report, {}, '人生总览报告');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<table>');
    expect(html).toContain('完整结尾');
    expect(html).not.toContain('继续阅读');
  });

  it('renders model-supplied HTML as text', () => {
    expect(renderReportMarkdown('说明<script>alert(1)</script>')).not.toContain('<script>');
  });
});
