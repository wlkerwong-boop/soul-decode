import { describe, expect, it } from 'vitest';
import { buildCompatibilityPersonPayload, buildCompatibilitySegments, consumeSseChunk } from './compatibility-depth';

const members = [
  { label: '家长', age: 44, bazi: '壬戌 庚戌 乙亥 辛巳', elementDistribution: { 木: 1, 金: 0 }, hd: { type: 'Projector', profile: '3/6', authority: 'Splenic', channels: ['18-58'] } },
  { label: '孩子1', age: 11, bazi: '乙未 辛巳 辛亥 戊戌', elementDistribution: { 木: 0, 金: 2 }, hd: { type: 'Projector', profile: '3/6', authority: 'Splenic', channels: ['28-38'] } },
];

describe('compatibility depth prompt', () => {
  it('keeps birthplace and timezone data needed for Human Design', () => {
    const form = {
      a_year: '2015', a_month: '6', a_day: '4', a_hour: '19', a_minute: '45',
      a_country: '美国', a_city: '洛杉矶', a_gender: '女',
    };
    expect(buildCompatibilityPersonPayload(form, 'a')).toMatchObject({
      year: '2015',
      city: '洛杉矶',
      location: '美国',
      gender: '女',
    });
  });

  it('includes declarations, energy comparison, relationship passwords and practice', () => {
    const full = buildCompatibilitySegments(members, 'family').map(x => x.prompt).join('\n');
    expect(full).toContain('排盘数据声明');
    expect(full).toContain('能量结构对照表');
    expect(full).toContain('关系密码');
    expect(full).toContain('相处密钥');
    expect(full).toContain('家庭实践建议');
    expect(full).toContain('妈妈也觉得这事没劲');
    expect(full).toContain('18-58');
  });

  it('preserves an SSE event split across network chunks', () => {
    const first = consumeSseChunk('', 'data: {\"content\":\"关');
    expect(first.contents).toEqual([]);
    const second = consumeSseChunk(first.buffer, '系密码\"}\n\n');
    expect(second.contents).toEqual(['关系密码']);
    expect(second.buffer).toBe('');
  });
});
