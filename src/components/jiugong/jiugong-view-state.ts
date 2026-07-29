import type { AdviceTopic } from '../../lib/jiugong-advice';

export type JiugongTab = 'traits' | 'environment' | 'analysis';

export interface JiugongViewState {
  tab: JiugongTab;
  year: number;
  topic: AdviceTopic;
}

export type JiugongViewAction =
  | { type: 'select-tab'; tab: JiugongTab }
  | { type: 'select-year'; year: number }
  | { type: 'select-topic'; topic: AdviceTopic };

export function createJiugongViewState(year: number): JiugongViewState {
  return { tab: 'traits', year, topic: 'career' };
}

export function reduceJiugongViewState(
  state: JiugongViewState,
  action: JiugongViewAction,
): JiugongViewState {
  switch (action.type) {
    case 'select-tab':
      return { ...state, tab: action.tab };
    case 'select-year':
      return { ...state, year: action.year };
    case 'select-topic':
      return { ...state, topic: action.topic };
  }
}
