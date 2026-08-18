import { describe, expect, it } from 'vitest';
import { calculateBazi } from './bazi';
import { calculateAuthoritativeBazi } from './bazi-authoritative';

describe('八字岁首立春派统一（任务2）', () => {
  it('王献科 1982-01-27（立春 2/4 前）→ 辛酉年辛丑月（K3 锚点，病灶#5 根因回归）', () => {
    const r = calculateAuthoritativeBazi(1982, 1, 27, 12, 0, 'Asia/Shanghai');
    expect(r.pillars[0]).toBe('辛酉');
    expect(r.pillars[1]).toBe('辛丑');
  });

  it('旧实现 bazi.ts（getYearInGanZhiExact）同样为立春派', () => {
    const r = calculateBazi(1982, 1, 27, 12);
    expect(r.pillars[0]).toBe('辛酉');
  });

  it('立春后同一年份年柱切换为壬戌（验证 Exact 换年正确）', () => {
    const r = calculateAuthoritativeBazi(1982, 2, 5, 12, 0, 'Asia/Shanghai');
    expect(r.pillars[0]).toBe('壬戌');
  });

  it('一然 LA 2015-06-04 19:45 → 时柱癸巳（K3 裁决）', () => {
    const r = calculateAuthoritativeBazi(2015, 6, 4, 19, 45, 'America/Los_Angeles');
    expect(r.pillars[3]).toBe('癸巳');
  });

  it('master-report 全量回归：五口四柱与金标准一致', () => {
    const cases: [string, number, number, number, number, number, string, string[]][] = [
      ['王献科', 1982, 1, 27, 12, 0, 'Asia/Shanghai', ['辛酉', '辛丑', '庚戌', '壬午']],
      ['一斐', 2010, 12, 4, 19, 0, 'Asia/Shanghai', ['庚寅', '丁亥', '戊子', '壬戌']],
      ['一然', 2015, 6, 4, 19, 45, 'America/Los_Angeles', ['乙未', '辛巳', '辛亥', '癸巳']],
      ['一如', 2017, 11, 2, 10, 0, 'Asia/Shanghai', ['丁酉', '庚戌', '癸巳', '丁巳']],
      ['晓霞', 1985, 7, 15, 8, 0, 'Asia/Shanghai', ['乙丑', '癸未', '乙卯', '庚辰']],
    ];
    for (const [label, y, m, d, h, mi, tz, expected] of cases) {
      const r = calculateAuthoritativeBazi(y, m, d, h, mi, tz);
      expect(r.pillars, `${label} 四柱`).toEqual(expected);
    }
  });
});
