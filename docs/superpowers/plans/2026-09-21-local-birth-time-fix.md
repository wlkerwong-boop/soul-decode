# 出生地当地时间统一修复实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 统一 SoulCode 的出生时间契约，使八字、紫微斗数、人类图和占星都以出生地当地日期/时间为用户输入标准，并让中国与外国名人历史样本可以回归验证。

**Architecture:** 用户输入保存为出生地当地年月日时分和 IANA 时区。八字与紫微直接使用当地民用年月日时；人类图与占星使用同一当地时间和 IANA 时区计算绝对时刻。所有报告路由共享同一当地八字函数，不再经过北京时间换算。

**Tech Stack:** Next.js 16、TypeScript、Vitest、lunar-javascript、iztro、Human Design v6 engine。

**Spec:** 用户已确认“出生地当地日期作为七系统标准”，不得要求用户手动换算中国时间。

## Global Constraints

- 不改变用户输入的出生年月日时分。
- 时区字段使用 IANA 标识，如 `America/Los_Angeles`、`Pacific/Honolulu`、`Asia/Shanghai`。
- 不把未知地点静默当成北京；已有接口兼容性需要保留时，必须使用明确的 Asia/Shanghai 默认值并在代码注释中说明。
- 先写失败测试，再写生产代码。
- 保留工作区中与本任务无关的用户改动。

### Task 1: 锁定当地时间行为并扩大历史样本范围

**Files:**
- Create: `tests/local-birth-time.test.ts`
- Modify: `src/lib/report-depth.ts`
- Modify: `src/lib/bazi-authoritative.ts`
- Modify: `src/app/api/bazi/route.ts`

**Interfaces:**
- Produce `calculateReportBaziLocal(year, month, day, hour, minute)`，返回现有报告需要的 `pillars`、五行和 `dayMaster` 字段。
- 保留旧导出名 `calculateReportBaziForTimezone` 作为兼容包装，但其行为改为直接使用当地年月日时，不再换算北京时间。

- [ ] 写测试：洛杉矶 2015-06-04 19:45 的八字使用当地日期，不被改成 6 月 5 日；上海 2015-06-05 10:45 是另一组当地输入，结果允许不同。
- [ ] 写测试：`calculateAuthoritativeBazi` 的兼容调用也不再改变日期/时钟。
- [ ] 写测试：1893 年毛泽东样本不再被 `/api/bazi` 的年份下限拒绝；日期校验仍拒绝不存在的日期。
- [ ] 运行新增测试并确认在实现前失败。
- [ ] 实现当地八字函数，移除生产报告对 `toBeijingParts` 的依赖；将历史年份校验下限调整到 lunar-javascript 实际支持范围，并用测试确认。
- [ ] 运行新增测试并确认通过。

### Task 2: 统一报告与合盘 API

**Files:**
- Modify: `src/app/api/master-report/stream/route.ts`
- Modify: `src/app/api/master-report/route.ts`
- Modify: `src/app/api/compatibility/route.ts`

**Interfaces:**
- 所有报告和合盘调用同一个当地八字函数。
- 人类图继续接收当地日期、当地时分、IANA 时区。
- 紫微继续接收当地日期和当地时辰。

- [ ] 写接口级回归测试或可执行 smoke 脚本，验证流式和非流式报告的八字结果来自同一当地时间函数。
- [ ] 运行测试确认旧的流式跨午夜样本与北京时间等价输入仍然不同，这是新规则的预期行为。
- [ ] 替换两个报告路由的旧/时区版八字调用。
- [ ] 替换合盘路由的北京时间归一化调用。
- [ ] 运行测试确认各路由一致。

### Task 3: 修正前端时区值与历史人物输入范围

**Files:**
- Modify: `src/components/BirthInputForm.tsx`
- Modify: `src/app/master-report/page.tsx`
- Modify: `src/app/human-design/page.tsx`
- Modify: `src/data/cities.ts`

**Interfaces:**
- 所有页面提交 IANA 时区，不提交仅用于展示的中文标签。
- 主报告页面可选择 1800 年以来的历史人物。
- 韶山、湘潭、广安等本轮验证城市拥有可用坐标或明确省级回退。

- [ ] 写前端静态回归检查，确认选项值是 IANA 标识。
- [ ] 运行检查确认历史年份列表包含 1893、1904。
- [ ] 修改时区选项的 value/label 分离。
- [ ] 扩大年份下拉范围并补充中国历史样本城市坐标。
- [ ] 运行 lint/build 前端检查。

### Task 4: 线上与名人回归验证

**Files:**
- Create: `scripts/verify-local-birth-time.mjs`
- Create: `docs/reports/2026-09-21-local-birth-time-fix-report.md`

- [ ] 本地运行八字、流式/非流式共享函数检查。
- [ ] 线上验证美国当地日期不被自动改成中国日期。
- [ ] 线上重新运行姚明、邓小平、成龙、毛泽东以及 Obama、Jobs、Gates、Musk 样本。
- [ ] 对每个样本记录输入时区、可信度、七系统原始数据、报告是否引用已提供的人生事实。
- [ ] 运行最终测试、lint、build，并记录未解决限制。
