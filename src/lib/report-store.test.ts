import { afterEach, expect, test, vi } from 'vitest';
import { getAllReports, saveReport } from './report-store';

afterEach(() => vi.unstubAllGlobals());

test('personal report list does not reveal another account or legacy unowned reports', () => {
  const values = new Map<string, string>();
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });

  saveReport('私密 A', 'bazi', 'A 的报告', '', 'AAA111', 'account-a');
  saveReport('私密 B', 'bazi', 'B 的报告', '', 'BBB222', 'account-b');
  saveReport('旧报告', 'bazi', '旧报告', '', 'OLD333');

  expect(getAllReports('account-a').map(report => report.id)).toEqual(['AAA111']);
  expect(getAllReports('account-b').map(report => report.id)).toEqual(['BBB222']);
  expect(getAllReports('account-c')).toEqual([]);
});
