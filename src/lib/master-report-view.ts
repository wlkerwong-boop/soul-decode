export interface MasterReportViewState {
  report: string;
  data: unknown;
  showQuickInput: boolean;
  showFullReport: boolean;
  error: string;
}

export function beginNewReportView(state: MasterReportViewState): MasterReportViewState {
  return {
    ...state,
    report: '',
    data: null,
    showQuickInput: true,
    showFullReport: false,
    error: '',
  };
}
