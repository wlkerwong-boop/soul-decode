export function masterReportHistoryKey(userId: string | undefined) {
  return userId ? `master_report_history:${userId}` : null;
}

export function lastMasterReportKey(userId: string | undefined) {
  return userId ? `last_master_report:${userId}` : null;
}
