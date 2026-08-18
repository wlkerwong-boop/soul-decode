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
