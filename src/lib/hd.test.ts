import { describe, expect, it } from 'vitest';
import { assertHumanDesignResult, calculateBodygraph } from './hd';

describe('human design report guard', () => {
  it('rejects a missing engine result instead of silently continuing', () => {
    expect(() => assertHumanDesignResult(null)).toThrow('人类图引擎暂时不可用');
  });

  it('accepts a calculated bodygraph result', () => {
    expect(() => assertHumanDesignResult({ type: 'Projector', profile: '3/6' })).not.toThrow();
  });

  it.each([
    ['大女儿', '2010-12-04', '19:20', 'Asia/Shanghai', 'Manifesting Generator', '1/4'],
    ['二女儿', '2015-06-04', '19:45', 'America/Los_Angeles', 'Projector', '3/6'],
  ])('%s returns a complete bodygraph', async (_name, date, time, timezone, type, profile) => {
    const result = await calculateBodygraph(date, time, timezone, 0, 0);
    expect(result.type).toBe(type);
    expect(result.profile).toBe(profile);
    expect(result.channels.length).toBeGreaterThan(0);
    expect(result.activatedGates.length).toBeGreaterThan(0);
  });
});
