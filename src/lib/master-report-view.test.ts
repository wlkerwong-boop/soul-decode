import { describe, expect, it } from 'vitest';
import { beginNewReportView } from './master-report-view';

describe('beginNewReportView', () => {
  it('returns to the input form without deleting saved report history', () => {
    const previous = {
      report: '旧报告',
      data: { hd: { type: 'Projector' } },
      showQuickInput: false,
      showFullReport: true,
      error: '旧错误',
    };

    expect(beginNewReportView(previous)).toEqual({
      report: '',
      data: null,
      showQuickInput: true,
      showFullReport: false,
      error: '',
    });

    expect(previous.report).toBe('旧报告');
  });
});
