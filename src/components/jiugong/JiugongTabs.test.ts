import { describe, expect, it } from 'vitest';
import {
  createJiugongViewState,
  reduceJiugongViewState,
} from './jiugong-view-state';

describe('jiugong tab view state', () => {
  it('starts on trait analysis with the current available year', () => {
    expect(createJiugongViewState(2026)).toEqual({
      tab: 'traits',
      year: 2026,
      topic: 'career',
    });
  });

  it('keeps the active question when the analysis year changes', () => {
    const state = {
      tab: 'analysis' as const,
      year: 2026,
      topic: 'wealth' as const,
    };

    expect(reduceJiugongViewState(state, {
      type: 'select-year',
      year: 2027,
    })).toEqual({
      tab: 'analysis',
      year: 2027,
      topic: 'wealth',
    });
  });

  it('switches tabs and topics independently', () => {
    const initial = createJiugongViewState(2026);
    const analysis = reduceJiugongViewState(initial, {
      type: 'select-tab',
      tab: 'analysis',
    });
    const health = reduceJiugongViewState(analysis, {
      type: 'select-topic',
      topic: 'health',
    });

    expect(health).toMatchObject({ tab: 'analysis', topic: 'health' });
  });
});
