/**
 * verify-report-core.test.mjs — V6 声明节规则单测（P7：合盘声明节引擎注入 + V6 标题适配）
 *
 * 覆盖：
 *  - 家庭合盘标题「## 0. 家庭排盘数据声明」V6 不再误报（P7 缺陷#2）
 *  - 双人「## 0. 双方排盘数据声明」兼容
 *  - 声明节恰好出现 1 次（AI 重复写声明节 → V6 FAIL，P7 缺陷#1 回归护栏）
 *  - 声明节必须含引擎注入标记（AI 重写版 → V6 FAIL）
 *  - 个人报告标题「## 0. 排盘数据声明」回归不受影响
 *
 * 真数据纪律：全部用例用脱敏假数据（假四柱/假通道），不含任何真实出生数据。
 */
import { describe, expect, it } from 'vitest';
import { verifyReportText } from './verify-report-core.mjs';
import { buildFamilyDataDeclaration } from './compatibility-depth';

const FAKE_TRUTH = {
  hd: { channels: ['18-58', '28-38'] },
  bazi: { pillars: ['甲子', '乙丑', '丙寅', '丁卯'] },
};

const fakeMembers = [
  {
    label: '家长',
    age: 44,
    bazi: '甲子 乙丑 丙寅 丁卯',
    elementDistribution: { 木: 1, 金: 0 },
    hd: { type: 'Projector', profile: '3/6', authority: 'Splenic', channels: ['18-58', '28-38'] },
  },
];

const NARRATIVE = `## 1. 能量结构对照表

| 成员 | 类型 | 角色 | 权威 | 关键通道 | 五行重心 |
|---|---|---|---|---|---|
| 家长 | Projector | 3/6 | Splenic | 18-58、28-38 | 木金 |

正文叙事示例。

## 8. 使用边界与免责声明

仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议。`;

const COUPLE_TRUTH = {
  compatibilityType: 'couple',
  members: [
    {
      label: '用户A',
      age: 44,
      bazi: '辛酉 辛丑 庚戌 丁丑',
      elementDistribution: { 金: 4, 土: 3, 火: 1 },
      hd: { type: 'Generator', profile: '5/1', authority: '荐骨权威', channels: ['24-61', '34-57'] },
    },
    {
      label: '用户B',
      age: 44,
      bazi: '壬戌 庚戌 甲申 辛未',
      elementDistribution: { 水: 1, 土: 3, 金: 3, 木: 1 },
      hd: { type: 'Generator', profile: '3/5', authority: '荐骨权威', channels: ['27-50', '28-38', '34-57'] },
    },
  ],
  hd: { channels: ['24-61', '34-57', '27-50', '28-38'] },
  bazi: { pillars: ['辛酉', '辛丑', '庚戌', '丁丑', '壬戌', '庚戌', '甲申', '辛未'] },
};

const COUPLE_DECLARATION = buildFamilyDataDeclaration(COUPLE_TRUTH.members, 'couple');
const COUPLE_VALID_REPORT = `${COUPLE_DECLARATION}
## 1. 一眼看懂这段关系

双方都是 Generator，A 为 5/1，B 为 3/5。

## 2. 三个核心关系命题

共同通道 34-57 带来直觉同步；A 的 24-61 与 B 的 28-38形成思考与行动的互补；B 的 27-50提醒双方把照顾与边界说清楚。

## 3. 三个真实互动场景

共同决策、冲突后修复、照顾与独立。

## 4. 关系实践计划

每日一次身体报告，每周一次复盘，每月一次关系回顾。

## 5. 最终总结与使用边界

这段关系需要把差异翻译成可执行的沟通接口。

仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议。`;

const FAMILY_TRUTH = {
  compatibilityType: 'family',
  members: [
    { label: '成员甲', age: 44, bazi: '甲子 乙丑 丙寅 丁卯', elementDistribution: { 木: 1, 金: 0 }, hd: { type: 'Projector', profile: '3/6', authority: 'Splenic', channels: ['18-58'] } },
    { label: '成员乙', age: 42, bazi: '乙丑 丙寅 丁卯 戊辰', elementDistribution: { 木: 1, 金: 0 }, hd: { type: 'Projector', profile: '3/6', authority: 'Splenic', channels: ['28-38'] } },
    { label: '成员丙', age: 11, bazi: '丙寅 丁卯 戊辰 己巳', elementDistribution: { 木: 1, 金: 0 }, hd: { type: 'Generator', profile: '4/6', authority: 'Sacral', channels: ['34-20'] } },
  ],
  hd: { channels: ['18-58', '28-38', '34-20'] },
  bazi: { pillars: ['甲子', '乙丑', '丙寅', '丁卯', '乙丑', '丙寅', '丁卯', '戊辰', '丙寅', '丁卯', '戊辰', '己巳'] },
};

const FAMILY_VALID_REPORT = `${buildFamilyDataDeclaration(FAMILY_TRUTH.members, 'family')}
## 1. 能量结构对照表

成员结构对照。

## 2. 一眼看懂这个家

家庭整体互动。

## 3. 写在血脉里的密码

共享印记。

## 4. 3对关系一张网

关系全景。

## 5. 亲子沟通与养育话术

沟通建议。

## 6. 家庭实践建议

实践建议。

## 7. 最终寄语（家族金句）

最终寄语。

## 8. 使用边界与免责声明

仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议。`;

function issuesFor(reportText, truth = FAKE_TRUTH) {
  return verifyReportText(reportText, truth).filter((i) => i.rule === 'V6');
}

describe('verify-report V6（P7 声明节规则）', () => {
  it('家庭合盘：引擎注入声明节 + 家庭标题 → V6 全绿（P7 缺陷#2 修复）', () => {
    const declaration = buildFamilyDataDeclaration(fakeMembers, 'family');
    const report = `${declaration}${NARRATIVE}`;
    const issues = verifyReportText(report, FAKE_TRUTH);
    expect(issues.filter((i) => i.rule === 'V6')).toEqual([]);
  });

  it('双人合盘：双方排盘数据声明标题 → V6 全绿', () => {
    const declaration = buildFamilyDataDeclaration(fakeMembers, 'couple');
    const report = `${declaration}${NARRATIVE}`;
    expect(issuesFor(report)).toEqual([]);
  });

  it('个人报告：排盘数据声明标题 → V6 全绿（回归不受影响）', () => {
    const declaration = `## 0. 排盘数据声明

- 八字四柱：甲子 乙丑 丙寅 丁卯
- 人类图：类型：Projector｜通道：18-58（18(脾) ↔ 58(根部) 批评/挑战-审判的通道）、28-38（28(脾) ↔ 38(根部) 挣扎/意义的通道）

> 本声明节由系统依据排盘数据直接生成，以下解读均以此为准。

`;
    const report = `${declaration}${NARRATIVE}`;
    expect(issuesFor(report)).toEqual([]);
  });

  it('AI 重复写声明节（引擎注入版 + AI 重写版两个 ## 0）→ V6 FAIL 恰好一次规则（P7 缺陷#1 回归护栏）', () => {
    const engineDecl = buildFamilyDataDeclaration(fakeMembers, 'family');
    const aiRewrite = `## 0. 家庭排盘数据声明

- **家长**（44岁）：八字 甲子 乙丑 丙寅 丁卯｜人类图 Projector 3/6 Splenic，关键通道 18-58、28-38

`;
    const report = `${engineDecl}${aiRewrite}${NARRATIVE}`;
    const v6 = issuesFor(report);
    expect(v6.length).toBeGreaterThan(0);
    expect(v6[0].message).toContain('出现 2 次');
  });

  it('声明节缺引擎注入标记（AI 重写版）→ V6 FAIL 注入标记规则', () => {
    const aiRewrite = `## 0. 家庭排盘数据声明

- **家长**（44岁）：八字 甲子 乙丑 丙寅 丁卯｜人类图 Projector 3/6 Splenic，关键通道 18-58、28-38

`;
    const report = `${aiRewrite}${NARRATIVE}`;
    const v6 = issuesFor(report);
    expect(v6.length).toBeGreaterThan(0);
    expect(v6.some((i) => i.message.includes('引擎注入标记'))).toBe(true);
  });

  it('报告缺声明节 → V6 FAIL 缺少声明节（既有规则回归）', () => {
    const v6 = issuesFor(NARRATIVE);
    expect(v6.length).toBeGreaterThan(0);
    expect(v6[0].message).toContain('缺少');
  });
});

describe('verify-report P1 内容层闸门', () => {
  it('accepts a concise couple report with one declaration, one disclaimer and unique five sections', () => {
    expect(verifyReportText(COUPLE_VALID_REPORT, COUPLE_TRUTH)).toEqual([]);
  });

  it('rejects member-level five-element claims that contradict the declaration', () => {
    const report = `${COUPLE_VALID_REPORT}\n用户B的五行格局五行齐全。`;
    const issues = verifyReportText(report, COUPLE_TRUTH);
    expect(issues.some((i) => i.rule === 'V7' && i.message.includes('五行'))).toBe(true);
  });

  it('rejects fabricated day-stem claims and wrong ten-god terminology', () => {
    const report = `${COUPLE_VALID_REPORT}\n双方相同日柱天干“辛”与“庚”，庚金克甲木属于正官。`;
    const issues = verifyReportText(report, COUPLE_TRUTH);
    expect(issues.some((i) => i.rule === 'V7' && i.message.includes('日柱'))).toBe(true);
    expect(issues.some((i) => i.rule === 'V8' && i.message.includes('七杀'))).toBe(true);
  });

  it('rejects a channel or profile assigned to the wrong member', () => {
    const report = `${COUPLE_VALID_REPORT}\n用户A的角色是3/5，并且用户A拥有27-50通道。`;
    const issues = verifyReportText(report, COUPLE_TRUTH);
    expect(issues.filter((i) => i.rule === 'V7').length).toBeGreaterThanOrEqual(2);
  });

  it('does not attribute a channel across adjacent Chinese clauses', () => {
    const report = `${COUPLE_VALID_REPORT}\n用户A拥有24-61通道，用户B拥有28-38通道。`;
    const issues = verifyReportText(report, COUPLE_TRUTH);
    expect(issues.filter((i) => i.rule === 'V7')).toEqual([]);
  });

  it('uses the nearest member label when two member clauses share one sentence', () => {
    const report = `${COUPLE_VALID_REPORT}\n用户A提及用户B的28-38通道，而用户A拥有24-61通道。`;
    const issues = verifyReportText(report, COUPLE_TRUTH);
    expect(issues.filter((i) => i.rule === 'V7')).toEqual([]);
  });

  it('uses the nearest member label when one sentence contains two labeled channel clauses', () => {
    const report = `${COUPLE_VALID_REPORT}\n用户A说用户B有28-38通道，同时用户A有24-61通道。`;
    const issues = verifyReportText(report, COUPLE_TRUTH);
    expect(issues.filter((i) => i.rule === 'V7')).toEqual([]);
  });

  it('keeps the nearest member label across a comma when the subject is omitted', () => {
    const report = `${COUPLE_VALID_REPORT}\n用户A拥有24-61通道，同时28-38通道也与之相连。`;
    const issues = verifyReportText(report, COUPLE_TRUTH);
    expect(issues.some((i) => i.rule === 'V7' && i.message.includes('用户A') && i.message.includes('28-38'))).toBe(true);
  });

  it('keeps family member-channel ownership isolated by clause as well', () => {
    const report = `${FAMILY_VALID_REPORT}\n成员甲拥有18-58通道，成员乙拥有28-38通道，成员丙拥有34-20通道。`;
    const issues = verifyReportText(report, FAMILY_TRUTH);
    expect(issues.filter((i) => i.rule === 'V7')).toEqual([]);
  });

  it('normalizes inline headings before V9 structure validation', () => {
    const report = COUPLE_VALID_REPORT.replace('\n## 3. 三个真实互动场景', '。## 3. 三个真实互动场景');
    const issues = verifyReportText(report, COUPLE_TRUTH);
    expect(issues.filter((i) => i.rule === 'V9')).toEqual([]);
  });

  it('does not treat a child metaphor as couple or friend family contamination', () => {
    const report = `${COUPLE_VALID_REPORT}\n用户A被当成需要全方位照看的孩子。`;
    const issues = verifyReportText(report, COUPLE_TRUTH);
    expect(issues.filter((i) => i.rule === 'V8' && i.message.includes('家庭化'))).toEqual([]);
  });

  it('still blocks a definite child reference next to an exempt metaphor', () => {
    const report = `${COUPLE_VALID_REPORT}\n用户A像个需要照看的孩子，但孩子会不会累仍需讨论。`;
    const issues = verifyReportText(report, COUPLE_TRUTH);
    expect(issues.some((i) => i.rule === 'V8' && i.message.includes('孩子'))).toBe(true);
  });

  it('keeps blocking gender pronouns when attached to Chinese words', () => {
    const report = `${COUPLE_VALID_REPORT}\n让他先说完，再由用户B回应。`;
    const issues = verifyReportText(report, COUPLE_TRUTH);
    expect(issues.some((i) => i.rule === 'V8' && i.message.includes('性别代词'))).toBe(true);
  });

  it('allows common possessive and collective words containing 他 or 她', () => {
    const report = `${COUPLE_VALID_REPORT}\n照顾他人、他们、其他和其它，也会保存他的资料与她的选择。`;
    const issues = verifyReportText(report, COUPLE_TRUTH);
    expect(issues.filter((i) => i.rule === 'V8' && i.message.includes('性别代词'))).toEqual([]);
  });

  it('rejects untranslated English and family-only phrases in a couple report', () => {
    const report = `${COUPLE_VALID_REPORT}\n用户B出现visceral反应，孩子会不会累是需要讨论的家庭动作。`;
    const issues = verifyReportText(report, COUPLE_TRUTH);
    expect(issues.some((i) => i.rule === 'V8' && i.message.includes('英文'))).toBe(true);
    expect(issues.some((i) => i.rule === 'V8' && i.message.includes('家庭化'))).toBe(true);
  });

  it('rejects duplicate sections, duplicate disclaimer and oversized reports', () => {
    const duplicated = `${COUPLE_VALID_REPORT}\n## 1. 一眼看懂这段关系\n再次开始。\n仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议。`;
    const duplicateIssues = verifyReportText(duplicated, COUPLE_TRUTH);
    expect(duplicateIssues.some((i) => i.rule === 'V9' && i.message.includes('章节'))).toBe(true);
    expect(duplicateIssues.some((i) => i.rule === 'V9' && i.message.includes('免责声明'))).toBe(true);

    const oversized = `${COUPLE_VALID_REPORT}${'长'.repeat(18001)}`;
    expect(verifyReportText(oversized, COUPLE_TRUTH).some((i) => i.rule === 'V9' && i.message.includes('字数'))).toBe(true);
  });
});
