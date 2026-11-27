import { expect, test } from 'vitest';
import { lastMasterReportKey, masterReportHistoryKey } from './master-report-storage';

test('life blueprint storage keys are isolated by account', () => {
  expect(masterReportHistoryKey('account-a')).toBe('master_report_history:account-a');
  expect(masterReportHistoryKey('account-b')).not.toBe(masterReportHistoryKey('account-a'));
  expect(lastMasterReportKey('account-a')).toBe('last_master_report:account-a');
  expect(lastMasterReportKey(undefined)).toBeNull();
});
