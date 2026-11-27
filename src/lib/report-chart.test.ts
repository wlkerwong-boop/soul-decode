import { expect, it } from 'vitest';
import { calculateReportZiwei, describeReportYear } from './report-chart';

it('uses one factual year label for both report routes', () => {
  expect(describeReportYear(2014, 2026)).toBe('出生公历年：甲午年（八字年柱按立春分界） | 当前流年：丙午年（2026年）');
});

it('includes the same ordered palaces and supporting stars for both routes', () => {
  const chart = calculateReportZiwei(2014, 7, 20, 9, '女');
  expect(chart?.palaces.map(palace => palace.name)).toEqual([
    '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母',
  ]);
  expect(chart?.palaces[0].stars).toContain('太阳');
  expect(chart?.palaces[0].stars).toContain('蜚廉');
});
