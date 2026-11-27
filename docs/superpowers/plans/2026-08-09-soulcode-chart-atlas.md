# SoulCode Chart Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不改变排盘数据、报告生成、登录和 PDF 接口的前提下，把人生总览中的人类图、八字、紫微斗数和五运六气改成原创、专业、可响应式阅读的图谱组件。

**Architecture:** 保留现有四个组件的 props 和数据来源，只替换展示层。人类图、八字和紫微继续使用 SVG 以保证缩放与打印清晰；五运六气使用紧凑的 HTML/SVG 摘要卡；`master-report/page.tsx` 负责新的信息层布局，不把排盘算法搬进组件。

**Tech Stack:** Next.js 15、React、TypeScript、Tailwind、原生 SVG、Vitest、现有 PDF 生成接口。

## Global Constraints

- 不修改 `/api/master-report` 和 `/api/master-report/stream` 的数据计算与模型调用。
- 不修改登录、注册、报告保存和付费逻辑。
- 不直接嵌入或热链本机参考图片；只使用原创 SVG/HTML 展示数据。
- 继续使用现有米白、墨色、深金视觉变量，并保持“您”的用户称谓。
- 所有改动先在本地完成；未通过桌面、手机、打印/PDF验收前不部署。

---

### Task 1: 建立图谱视觉基础与可测试的数据格式化函数

**Files:**
- Create: `src/components/chart-atlas/chart-atlas.ts`
- Create: `src/components/chart-atlas/chart-atlas.test.ts`
- Modify: `src/app/globals.css:1469-1600`

**Interfaces:**
- Consumes: `BaziChart` 的四柱/五行数据，`ZiWeiChart` 的宫位数据，`MasterPage` 的既有 CSS 变量。
- Produces: `formatPillar`, `getVisibleStars`, `getElementPercent`, `CHART_ATLAS_COLORS`，供后续组件保持一致的文字和颜色规则。

- [ ] **Step 1: Write failing tests**

```ts
it('keeps four pillar characters and returns a safe fallback', () => {
  expect(formatPillar('甲子')).toEqual({ stem: '甲', branch: '子' });
  expect(formatPillar('')).toEqual({ stem: '', branch: '' });
});

it('limits dense palace stars to the visible preview', () => {
  expect(getVisibleStars(['紫微', '天府', '武曲', '天相'], 2)).toEqual(['紫微', '天府']);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- src/components/chart-atlas/chart-atlas.test.ts`

Expected: FAIL because the new formatting module does not exist yet.

- [ ] **Step 3: Implement the small pure helpers and chart color tokens**

Implement `formatPillar(pillar: string)`, `getVisibleStars(stars: string[], limit = 3)`, and `getElementPercent(distribution: Record<string, number>, key: string)`. Use zero-safe totals and never invent missing values. Add the shared paper/ink/gold/element colors to the existing SoulCode variable section without changing unrelated pages.

- [ ] **Step 4: Run the focused test and CSS lint/build check**

Run: `npm test -- src/components/chart-atlas/chart-atlas.test.ts` and `npm run build`

Expected: PASS; build completes without TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/chart-atlas src/app/globals.css
git commit -m "feat: add chart atlas visual primitives"
```

### Task 2: 重做人类图 SVG 与八字四柱 SVG

**Files:**
- Modify: `src/components/BodygraphSVG.tsx:89-169`
- Modify: `src/components/BaziChart.tsx:18-58`
- Modify: `src/app/master-report/page.tsx` chart props and chart section

**Interfaces:**
- Consumes: 现有 `BodygraphSVGProps`、`BaziChartProps`，以及现有 `data.hd`、`data.bazi` 字段。
- Produces: 可缩放、浅底、高对比度的人类图和四柱图，不改变任何输入字段名。

- [ ] **Step 1: Add renderer-level assertions**

Add tests that render each component with empty and populated props and assert the SVG exists, has a viewBox, and contains the expected labels such as `年柱`, `月柱`, `日柱`, `时柱` and `人类图`.

- [ ] **Step 2: Run the focused tests and capture the current failure or missing labels**

Run: `npm test -- src/components/chart-atlas/chart-atlas.test.ts` plus the component test command created for this task.

Expected: the new label assertions identify the current compact/dark renderer as incomplete.

- [ ] **Step 3: Implement the original SVG atlas renderers**

For `BodygraphSVG`, retain the existing center/channel/gate coordinates and data mapping, but replace the dark fills with warm paper fills, stronger defined-center hierarchy, readable labels, a title rail, and a compact legend. For `BaziChart`, use four equal pillar columns with a large stem, branch, day-master focus, and horizontal five-element distribution strip. Keep all text within the SVG viewBox and use `fontFamily="var(--font-ui)"` or the existing serif display variable.

- [ ] **Step 4: Run tests and build**

Run: `npm test -- src/components` and `npm run build`

Expected: all component tests and the production build pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/BodygraphSVG.tsx src/components/BaziChart.tsx src/app/master-report/page.tsx
git commit -m "feat: redesign human design and bazi charts"
```

### Task 3: 重做紫微斗数与五运六气，并整理报告区布局

**Files:**
- Modify: `src/components/ZiWeiChart.tsx:38-133`
- Modify: `src/app/master-report/page.tsx:430-520`
- Modify: `src/app/globals.css:1479-1600`

**Interfaces:**
- Consumes: 现有 `ZiWeiChartProps`、`horoscope`、`data.wuyun`，不新增后端字段。
- Produces: 十二宫图谱、中心命盘摘要、紧凑双指标五运六气卡，以及桌面/移动端稳定的结果区布局。

- [ ] **Step 1: Write failing layout assertions**

Add a focused view test for `MasterPage` chart output that asserts the four sections have stable semantic labels and the wuyun section contains both `出生年运` and `出生气化` without a fixed empty height.

- [ ] **Step 2: Implement the Ziwei atlas**

Keep the twelve palace order and existing star arrays. Increase palace typography, use a warm paper grid, highlight the life palace and only show a bounded star preview. Move `mingZhu`, `shenZhu`, and `wuXing` into a clear center summary panel.

- [ ] **Step 3: Implement the Wuyun/Liuqi summary card and report layout**

Replace the blank large card with two prominent values, a small original line motif, and a short data-available note. Change the report chart region to a primary/secondary grid that collapses to one column on narrow screens. Keep existing report controls and download callbacks intact.

- [ ] **Step 4: Run tests and build**

Run: `npm test` and `npm run build`

Expected: all existing tests pass and the build produces the same report/API routes.

- [ ] **Step 5: Commit**

```bash
git add src/components/ZiWeiChart.tsx src/app/master-report/page.tsx src/app/globals.css
git commit -m "feat: redesign ziwei and wuyun report atlas"
```

### Task 4: 桌面、手机、打印和 PDF 验收

**Files:**
- Create: `docs/superpowers/verification/2026-08-09-soulcode-chart-atlas-acceptance.md`
- Modify: chart components only when a documented verification failure is found.

**Interfaces:**
- Consumes: local built site, existing report test fixture, and the real PDF fixture supplied by the user.
- Produces: a dated acceptance report with pass/fail evidence; no production deployment.

- [ ] **Step 1: Run the full automated checks**

Run: `npm test`, `npm run build`, `git diff --check`.

- [ ] **Step 2: Capture desktop and mobile screenshots**

Use the existing browser verification workflow at 1280×900 and 390×844. Check that no title, chart label, report control, or table line overlaps; check that the page has no horizontal scroll.

- [ ] **Step 3: Verify PDF output**

Generate a real report PDF and a minimal Chinese-text PDF. Open both and confirm Chinese glyphs, chart labels, report headings, and download controls are readable; confirm no private family data is copied into repository documents.

- [ ] **Step 4: Write the acceptance report and record known limits**

Record exact commands, viewport sizes, results, screenshots, and any remaining issue. A failed check stays marked as failed; it is not described as complete.

- [ ] **Step 5: Commit the acceptance report**

```bash
git add docs/superpowers/verification/2026-08-09-soulcode-chart-atlas-acceptance.md
git commit -m "test: accept soulcode chart atlas locally"
```
