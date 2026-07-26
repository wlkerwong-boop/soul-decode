import { describe, expect, it } from 'vitest';
import {
  buildPersonalReportSegments,
  calculateReportBazi,
  calculateWuyunLiuqi,
  formatElementDistribution,
} from './report-depth';

const adultContext = {
  age: 44,
  gender: '男',
  birth: '1982-10-19 10:00',
  location: '中国湖南永州',
  bazi: { pillars: ['壬戌', '庚戌', '乙亥', '辛巳'], dayMaster: '乙（木）', elementDistribution: { 木: 1, 火: 1, 土: 2, 金: 2, 水: 2 } },
  hd: { type: 'Projector', profile: '3/6', authority: 'Splenic', strategy: '等待邀请', channels: ['18-58'], definedCenters: ['脾', '根'] },
  ziwei: { palaces: [{ name: '命宫', stars: ['紫微', '七杀'] }], sihua: [] },
  astrology: { zodiac: '天秤座', planets: [{ name: '太阳', sign: '天秤', degree: 25 }] },
  wuyun: { description: '1982年天干为壬，主木运；地支为戌，主太阳寒水。' },
  liunian: '2026年：丙午年',
};

describe('report data mapping', () => {
  it('returns all eight stem and branch elements for the Bazi chart', () => {
    const result = calculateReportBazi(2015, 6, 4, 19);
    expect(result.pillars).toEqual(['乙未', '辛巳', '辛亥', '戊戌']);
    expect(result.elements).toHaveLength(8);
    expect(Object.values(result.elementDistribution).reduce((a, b) => a + b, 0)).toBe(8);
    expect(formatElementDistribution(result.elementDistribution)).not.toContain('数据暂缺');
  });

  it('keeps stem separate from the five-movement label', () => {
    const result = calculateWuyunLiuqi(1982);
    expect(result.stem).toBe('壬');
    expect(result.wuyun).toBe('木运');
    expect(`${result.stem}年 → ${result.wuyun}`).toBe('壬年 → 木运');
  });
});

describe('personal report prompt', () => {
  it('splits the report into three bounded segments with every v2 chapter', () => {
    const segments = buildPersonalReportSegments(adultContext);
    expect(segments).toHaveLength(3);
    const full = segments.map(segment => segment.prompt).join('\n');
    for (const heading of ['排盘数据声明', '核心命盘总览', '交叉印证', '此刻的人生', '天赋与方向', '健康与情绪养护', '实践纲领', '最终寄语']) {
      expect(full).toContain(heading);
    }
    expect(full).toContain('6000-10000');
    expect(full).toContain('18-58');
    expect(full).toContain('紫微');
    expect(full).toContain('命理是地图不是判决书');
  });

  it('switches minors to parent-facing growth and education guidance', () => {
    const segments = buildPersonalReportSegments({ ...adultContext, age: 11 });
    const full = segments.map(segment => segment.prompt).join('\n');
    expect(full).toContain('家长视角');
    expect(full).toContain('学习风格');
    expect(full).toContain('家长行动清单');
  });
});
