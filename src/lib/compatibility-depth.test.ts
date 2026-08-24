import { describe, expect, it } from 'vitest';
import { buildCompatibilityPersonPayload, buildCompatibilitySegments, consumeSseChunk, normalizeCompatibilityAudience, validateCompatibilityInput } from './compatibility-depth';

const members = [
  { label: '家长', age: 44, bazi: '壬戌 庚戌 乙亥 辛巳', elementDistribution: { 木: 1, 金: 0 }, city: '上海', hd: { type: 'Projector', profile: '3/6', authority: 'Splenic', channels: ['18-58'] } },
  { label: '孩子1', age: 11, bazi: '乙未 辛巳 辛亥 戊戌', elementDistribution: { 木: 0, 金: 2 }, city: '上海', hd: { type: 'Projector', profile: '3/6', authority: 'Splenic', channels: ['28-38'] } },
  { label: '孩子2', age: 8, bazi: '丙申 壬午 甲子 乙亥', elementDistribution: { 木: 2, 金: 1 }, city: '上海', hd: { type: 'Generator', profile: '4/6', authority: 'Sacral', channels: ['34-20'] } },
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

  it('includes declarations, energy comparison, shared imprints and practice', () => {
    const full = buildCompatibilitySegments(members, 'family').map(x => x.prompt).join('\n');
    expect(full).toContain('排盘数据声明');
    expect(full).toContain('能量结构对照表');
    expect(full).toContain('家族共享印记');
    expect(full).toContain('3对关系一张网');
    expect(full).toContain('家庭实践建议');
    expect(full).toContain('仅供自我观察与关系沟通参考');
    expect(full).toContain('妈妈也觉得这事没劲');
    expect(full).toContain('18-58');
  });

  it('keeps couple and friend prompts free of family-only member assumptions', () => {
    for (const type of ['couple', 'friend'] as const) {
      const full = buildCompatibilitySegments(members, type).map(x => x.prompt).join('\n');
      expect(full).toContain('双方');
      expect(full).not.toContain('家庭合盘报告');
      expect(full).not.toContain('亲子沟通与养育话术');
      expect(full).not.toContain('十对关系');
      expect(full).not.toContain('五个人');
    }
  });

  it('uses the single-line five-section structure for couple and friend prompts', () => {
    for (const type of ['couple', 'friend'] as const) {
      const full = buildCompatibilitySegments(members.slice(0, 2), type).map(x => x.prompt).join('\n');
      expect(full).toContain('## 1. 一眼看懂这段关系');
      expect(full).toContain('## 2. 三个核心关系命题');
      expect(full).toContain('## 3. 三个真实互动场景');
      expect(full).toContain('## 4. 关系实践计划');
      expect(full).toContain('## 5. 最终总结与使用边界');
      expect(full).toContain('8000-12000');
      expect(full).not.toContain('## 1. 双方能量结构对照表');
      expect(full).not.toContain('## 4. 关系全景');
      expect(full).not.toContain('## 6. 最终寄语与使用边界');
    }
  });

  it('pins terminology and bans untranslated narrative English in the pair prompt', () => {
    const full = buildCompatibilitySegments(members.slice(0, 2), 'couple').map(x => x.prompt).join('\n');
    expect(full).toContain('庚金克甲木在甲木日主语境中只能表述为七杀');
    expect(full).toContain('不得出现 visceral');
    expect(full).toContain('情侣/朋友模块禁止家庭化话术');
  });

  it('gives an explicit label-only gender-pronoun rewrite instruction', () => {
    const full = buildCompatibilitySegments(members.slice(0, 2), 'couple').map(x => x.prompt).join('\n');
    expect(full).toContain('全文不得出现“他/她”');
    expect(full).toContain('“他”→“用户A”');
    expect(full).toContain('所有指代一律改用成员标签');
  });

  it('requires a final full-text pronoun self-check before delivery', () => {
    const full = buildCompatibilitySegments(members.slice(0, 2), 'friend').map(x => x.prompt).join('\n');
    expect(full).toContain('成稿前全文检索“他/她”');
    expect(full).toContain('检索到后全部替换为成员标签');
  });

  it('rejects a family request that has no child data', () => {
    expect(validateCompatibilityInput(members.slice(0, 2), 'family')).toContain('至少需要一位孩子');
    expect(validateCompatibilityInput([...members, members[1]], 'family')).toBeNull();
  });

  it('preserves an SSE event split across network chunks', () => {
    const first = consumeSseChunk('', 'data: {\"content\":\"关');
    expect(first.contents).toEqual([]);
    const second = consumeSseChunk(first.buffer, '系密码\"}\n\n');
    expect(second.contents).toEqual(['关系密码']);
    expect(second.buffer).toBe('');
  });

  it('surfaces server-side report verification failures to the client parser', () => {
    const parsed = consumeSseChunk('', 'data: {"verify_error":"事实层校验失败"}\n\n');
    expect(parsed.error).toContain('事实层校验失败');
  });

  it('normalizes model language and asks for evidence-linked writing', () => {
    expect(normalizeCompatibilityAudience('你要先听你的回应，你们再决定。')).toBe('您要先听您的回应，您们再决定。');
    const full = buildCompatibilitySegments(members, 'family').map(x => x.prompt).join('\n');
    expect(full).toContain('每个论断必须紧跟具体数据');
    expect(full).toContain('禁止无证据的性格套话');
    expect(full).toContain('每一位成员都必须出现一次具体数据作为依据');
  });
});
