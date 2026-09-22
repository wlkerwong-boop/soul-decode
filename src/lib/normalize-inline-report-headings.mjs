/**
 * Repairs Markdown headings that were concatenated to the preceding paragraph
 * by an upstream report segment. Only non-line-start `##` markers are moved;
 * headings that are already on their own line remain unchanged.
 */
export function normalizeInlineReportHeadings(report) {
  return report.replace(/([^\n])\s*##\s+(?=\S)/g, '$1\n\n## ');
}
