# 人生剧本模拟 P1.5 市场化体验与增长 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有“人生总结 → 双路径模拟 → 十重考验”链路上补齐低阻力入口、信任边界、安全分享和商业化交付文档，并用测试与线上复核证明可用。

**Architecture:** 继续使用现有 Next.js 客户端组件与 `src/lib` 纯函数边界，不引入支付 SDK、第三方分析 SDK 或新的数据库。新增一个纯函数模块负责安全分享文案，入口/结果页只负责展示与浏览器能力适配；商业化策略单独落在设计和开发报告中，待支付主体与运营流程确认后再实现。

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, existing CSS, browser Web Share API and Clipboard API.

**Spec:** `docs/superpowers/specs/2026-09-21-life-story-p1.5-market-growth-design.md`

## Global Constraints

- 结果只能作为反思材料，不能使用宿命化、医疗诊断、投资承诺或改命保证。
- 分享摘要不得包含出生资料、出生画像、原始人生事件或其他可识别敏感内容。
- 草稿仍只写入当前浏览器，不新增服务端保存。
- 本轮不接入真实支付、订阅或广告追踪。
- 所有新增行为先写失败测试，再写最小实现。
- 保留工作区中已有的 AGENTS.md、docs/guides、docs/reports 和其他未跟踪文件。

### Task 1: 安全分享文案的领域函数

**Files:**
- Create: `src/lib/life-story-growth.ts`
- Test: `src/lib/life-story-growth.test.ts`

**Interfaces:**
- Consumes: `LifeScriptResult` from `src/lib/life-story.ts`.
- Produces: `buildSafeLifeStoryShareText(result: LifeScriptResult, origin?: string): string`.

- [x] **Step 1: Write the failing test**

  Add a test fixture with a private headline, paths, source labels, and an action. Assert the output contains the headline, an action, the reflective disclaimer, and the product entry path; assert it does not contain birth dates, locations, or a raw event string.

- [x] **Step 2: Run test to verify it fails**

  Run `npm test -- src/lib/life-story-growth.test.ts`.
  Expected: FAIL because `src/lib/life-story-growth.ts` and the exported function do not exist.

- [x] **Step 3: Write minimal implementation**

  Implement the function using only `result.summary.headline`, the first available `change.actions` item (or continuity action), a short fixed boundary statement, and `origin || '/life-story'`. Do not accept or stringify the original story or birth profile.

- [x] **Step 4: Run test to verify it passes**

  Run `npm test -- src/lib/life-story-growth.test.ts`.
  Expected: PASS.

- [x] **Step 5: Commit**

  Run `git add src/lib/life-story-growth.ts src/lib/life-story-growth.test.ts && git commit -m "feat: add safe life story share copy"`.

### Task 2: 入口价值与信任文案

**Files:**
- Modify: `src/components/life-story/LifeStoryWizard.tsx`
- Modify: `src/components/life-story/life-story.css`
- Test: `src/app/life-story/page.test.tsx`

**Interfaces:**
- Consumes: existing wizard state and local draft behavior.
- Produces: visible entry promise with expected time, outputs, save boundary, and pause language.

- [x] **Step 1: Write the failing test**

  Extend the existing page contract test to assert the wizard source contains `8–12 分钟`, `双路径`, `当前浏览器`, and `反思实验`.

- [x] **Step 2: Run test to verify it fails**

  Run `npm test -- src/app/life-story/page.test.tsx`.
  Expected: FAIL because the new entry copy is absent.

- [x] **Step 3: Write minimal implementation**

  Add a compact `life-story-value-strip` below the header paragraph with three items: estimated time and pause, outputs, and browser-only draft storage. Add only the CSS needed for desktop and mobile. Do not alter validation or API payloads.

- [x] **Step 4: Run test to verify it passes**

  Run `npm test -- src/app/life-story/page.test.tsx`.
  Expected: PASS.

- [x] **Step 5: Commit**

  Run `git add src/components/life-story/LifeStoryWizard.tsx src/components/life-story/life-story.css src/app/life-story/page.test.tsx && git commit -m "feat: clarify life story entry value"`.

### Task 3: 结果页安全分享与后续行动 CTA

**Files:**
- Modify: `src/components/life-story/LifeScriptResult.tsx`
- Modify: `src/components/life-story/life-story.css`
- Test: `src/app/life-story/result/page.test.tsx`

**Interfaces:**
- Consumes: `buildSafeLifeStoryShareText` and stored `LifeScriptResult`.
- Produces: a client-only share/copy action and a visible “把行动带回现实” block before the existing ten-challenges CTA.

- [x] **Step 1: Write the failing test**

  Extend the result page contract test to assert the source includes `分享一张安全摘要`, `把行动带回现实`, `navigator.share`, and `复制成功`.

- [x] **Step 2: Run test to verify it fails**

  Run `npm test -- src/app/life-story/result/page.test.tsx`.
  Expected: FAIL because the new share and action copy are absent.

- [x] **Step 3: Write minimal implementation**

  Add `shareNotice` state and a `shareResult` handler. Try `navigator.share({ title, text })`; if unavailable, write the helper output to `navigator.clipboard`; if that fails, show a non-blocking notice. Render a secondary share button, the notice with `aria-live`, and a small copy/action card linking to `/life-story/challenges` and `/life-story`.

- [x] **Step 4: Run test to verify it passes**

  Run `npm test -- src/app/life-story/result/page.test.tsx`.
  Expected: PASS.

- [x] **Step 5: Commit**

  Run `git add src/components/life-story/LifeScriptResult.tsx src/components/life-story/life-story.css src/app/life-story/result/page.test.tsx && git commit -m "feat: add safe sharing to life script result"`.

### Task 4: 市场化与开发报告

**Files:**
- Create: `/Users/guangmingxishe/Documents/Codex/2026-09-20/wo-xi/outputs/人生剧本模拟系统-P1.5开发与商业化报告.md`

**Interfaces:**
- Consumes: the approved spec, current implementation, market sources, test/build/online verification output.
- Produces: a user-facing report explaining project origin, new features, operation guide, competitor strengths, launch funnel, offer ladder, risks, KPI, and next milestones.

- [x] **Step 1: Write the report**

  Include links to official/primary market sources: Prepare/Enrich, SYMBIS, 16Personalities, The Pattern, BitLife, FutureMe, and relevant Chinese product pages. Separate “已实现”“本轮明确但未实现”“下一阶段待授权” sections.

- [x] **Step 2: Verify report links and claims**

  Check every local file link resolves and every market claim is supported by the cited source URL. Mark interpretation as product inference rather than fact.

### Task 5: Automated and online verification

**Files:**
- No source changes expected.

- [x] **Step 1: Run focused tests**

  Run `npm test -- src/lib/life-story-growth.test.ts src/app/life-story/page.test.tsx src/app/life-story/result/page.test.tsx` and record the count.

- [x] **Step 2: Run full tests**

  Run `npm test` and record failures, if any.

- [x] **Step 3: Run production build**

  Run `npm run build` and record the exit code.

- [x] **Step 4: Verify the deployed browser routes**

  Use the existing authenticated Chrome session to open `/life-story`, inspect the entry value strip, move through the wizard, and verify `/life-story/result` retains its share/action/ten-challenges controls. Use `curl -sSI https://aisoulcode.cn/life-story` and the live route checks as a second, read-only confirmation.

- [x] **Step 5: Write final report evidence**

  Record exact test/build/route results and clearly distinguish local verification from production deployment. Do not claim payment or full browser form submission if that path was not executed.
