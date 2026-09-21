import { describe, expect, it } from 'vitest';
import {
  buildLifeContext,
  getLifeModeInstruction,
  getTimeConfidenceLabel,
} from './lifecycle';

describe('life context', () => {
  it('calculates current age for a living person from the analysis date', () => {
    const context = buildLifeContext({
      birthDate: '1982-10-19',
      analysisDate: '2026-09-21',
      lifeStatus: 'alive',
      timeConfidence: 'exact',
    });

    expect(context.age).toBe(43);
    expect(context.ageLabel).toBe('当前年龄：43岁');
    expect(context.mode).toBe('current');
  });

  it('uses age at death and historical mode for a deceased person', () => {
    const context = buildLifeContext({
      birthDate: '1940-11-27',
      deathDate: '1973-07-20',
      analysisDate: '2026-09-21',
      lifeStatus: 'deceased',
      timeConfidence: 'exact',
    });

    expect(context.age).toBe(32);
    expect(context.ageLabel).toBe('享年：32岁（已故）');
    expect(context.mode).toBe('historical');
    expect(getLifeModeInstruction(context)).toContain('不得生成面向当前年份的未来规划');
  });

  it('marks unknown birth time as non-verifiable for time-sensitive systems', () => {
    const context = buildLifeContext({
      birthDate: '1881-09-25',
      analysisDate: '2026-09-21',
      lifeStatus: 'deceased',
      timeConfidence: 'unknown',
    });

    expect(getTimeConfidenceLabel(context.timeConfidence)).toBe('未知');
    expect(context.notices).toContain('出生时刻未知：人类图、紫微斗数时辰和其他时刻敏感结论不可作为精确验证。');
  });

  it('distinguishes approximate birth time from completely unknown time', () => {
    const context = buildLifeContext({
      birthDate: '1980-09-12',
      analysisDate: '2026-09-21',
      lifeStatus: 'alive',
      timeConfidence: 'approximate',
    });

    expect(context.notices).toContain('出生时刻为约数：宫位、时柱和其他分钟敏感结论仅作参考。');
    expect(context.notices).not.toContain('出生时刻未知：人类图、紫微斗数时辰和其他时刻敏感结论不可作为精确验证。');
  });
});
