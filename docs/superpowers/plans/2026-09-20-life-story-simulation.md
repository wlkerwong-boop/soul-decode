# 人生总结与双路径人生剧本 P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended) to implement this plan task-by-task.

**Goal:** 在 SoulCode 现有七系统画像之后增加可恢复的人生总结向导、结构化总结接口和双路径人生剧本结果页。

**Architecture:** 新功能独立于现有 `master-report` 流式报告，使用纯客户端向导状态与服务端 JSON API。出生画像作为可选上下文，人生经历作为最小必要输入；服务端负责校验、结构化 AI 输出和免责声明注入。

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest 3, 现有 DeepSeek/OpenAI 配置。

**Spec:** `docs/superpowers/specs/2026-09-20-life-story-simulation-design.md`

## Global Constraints

- 不改现有 `/api/master-report/stream` 请求协议。
- 不新增生产依赖，不新增数据库迁移。
- 不在日志中写入完整人生经历、出生时间或 AI prompt。
- 所有命理和剧本文案必须保留“地图不是判决书”式边界声明。
- 先写失败测试，再写生产代码；每个任务独立运行相关测试。
- 不把十重考验、真实支付和永久服务端人生档案纳入 P0。

### Task 1: 建立人生总结领域模型与纯函数校验

**Files:**
- Create: `src/lib/life-story.ts`
- Test: `src/lib/life-story.test.ts`

**Interfaces:**
- `validateLifeStory(input: unknown): { ok: true; value: LifeStoryProfile } | { ok: false; errors: string[] }`
- `createEmptyLifeStory(): LifeStoryProfile`
- `buildSummarySeed(profile: LifeStoryProfile): string`
- 导出 `LifeStoryProfile`, `LifeStoryEvent`, `LifeScriptResult`。

- [x] **Step 1: Write failing tests** for empty profile defaults, required current status, maximum eight events, year bounds, and bounded text length.
- [x] **Step 2: Run** `npm test -- src/lib/life-story.test.ts` and confirm failure because the module does not exist.
- [x] **Step 3: Implement** the interfaces and pure validation without network or browser storage.
- [x] **Step 4: Run** `npm test -- src/lib/life-story.test.ts` and confirm all assertions pass.
- [x] **Step 5: Refactor** error messages into stable Chinese field-level messages while keeping tests green.

### Task 2: 增加总结与剧本 API

**Files:**
- Create: `src/app/api/life-script/summary/route.ts`
- Create: `src/app/api/life-script/generate/route.ts`
- Create: `src/lib/life-script-ai.ts`
- Test: `src/app/api/life-script/life-script-route.test.ts`

**Interfaces:**
- `POST /api/life-script/summary` returns `{ ok: true, summary }` or `{ ok: false, errors }`.
- `POST /api/life-script/generate` returns `{ ok: true, result }` or `{ ok: false, error }`.
- `buildLifeScriptPrompt(profile, birthProfile, summary)` produces a bounded prompt.
- `parseLifeScriptResponse(text)` fails closed unless the required JSON shape is present.

- [x] **Step 1: Write failing route/helper tests** for invalid payload, missing status, too many events, valid summary seed, invalid AI JSON, and prohibited deterministic wording.
- [x] **Step 2: Run** `npm test -- src/app/api/life-script/life-script-route.test.ts` and confirm the new routes/helpers fail to resolve.
- [x] **Step 3: Implement** summary validation and deterministic summary extraction; keep it useful without an API key.
- [x] **Step 4: Implement** AI generation using the existing `getConfig` pattern, strict JSON instructions, a 7-day action requirement, and post-parse validation.
- [x] **Step 5: Add** `Cache-Control: no-store`, no raw-input logging, and stable 400/422/502 responses.
- [x] **Step 6: Run** the focused tests and then `npm test -- src/lib/report-depth.test.ts src/lib/verify-report-core.test.mjs`.

### Task 3: Build the four-step life-story wizard

**Files:**
- Create: `src/app/life-story/page.tsx`
- Create: `src/components/life-story/LifeStoryWizard.tsx`
- Create: `src/components/life-story/life-story.css`
- Test: `src/app/life-story/page.test.tsx`

**Interfaces:**
- `LifeStoryWizard` owns step navigation, draft persistence, validation display, and submission.
- `localStorage` key is `life_story_draft_v1`; stored value is versioned JSON only.
- The page accepts `?from=master-report` but works without a query parameter.

- [x] **Step 1: Write failing component tests** for four step labels, next/back navigation, draft restore, delete draft, and validation before submit.
- [x] **Step 2: Run** `npm test -- src/app/life-story/page.test.tsx` and confirm failure.
- [x] **Step 3: Implement** the wizard with one question group at a time, progress indicator, examples, optional fields, and explicit reflective-simulation consent.
- [x] **Step 4: Implement** localStorage restore/delete with browser guards and no server-side access.
- [x] **Step 5: Add** a link from `master-report/page.tsx` after a report exists, with copy “把报告放回真实人生”。
- [x] **Step 6: Run** focused component tests and `npm run lint` on changed files.

### Task 4: Build the confirmation and dual-path result view

**Files:**
- Create: `src/app/life-story/result/page.tsx`
- Create: `src/components/life-story/LifeScriptResult.tsx`
- Modify: `src/components/shared/Navbar.tsx` only if the existing navigation pattern requires a visible entry.
- Test: `src/app/life-story/result/page.test.tsx`

**Interfaces:**
- Result page reads a short-lived session payload from `sessionStorage` key `life_script_result_v1`.
- It renders `summary`, `paths`, `sourceLabels`, `disclaimer`, and 7-day actions; missing/invalid payload returns a restart CTA.

- [x] **Step 1: Write failing tests** for summary display, two path cards, source labels, disclaimer, and invalid-session recovery.
- [x] **Step 2: Run** focused result tests and confirm failure.
- [x] **Step 3: Implement** the result view with accessible headings, mobile-first cards, copy/export-safe text, and a restart link.
- [x] **Step 4: Add** a confirmation/edit screen between summary and full generation so users can correct the AI summary.
- [x] **Step 5: Run** focused tests and lint.

### Task 5: Integrate the flow and document usage

**Files:**
- Modify: `src/app/master-report/page.tsx`
- Modify: `src/app/page.tsx` only if the main landing CTA needs a link.
- Create: `docs/reports/2026-09-20-life-story-simulation-development-report.md`
- Create: `docs/guides/life-story-simulation-user-guide.md`
- Test: update existing page tests only where integration changes visible navigation.

**Interfaces:**
- Existing report generation remains backward compatible.
- Logged-in users can reach the wizard from the report page; anonymous users are guided to login only when they submit, with browser draft retained.

- [x] **Step 1: Write an integration test** asserting the master report page exposes the new CTA without changing the existing birth form.
- [x] **Step 2: Run the integration test and confirm failure.**
- [x] **Step 3: Add** the CTA and login-preserving navigation.
- [x] **Step 4: Write the development report** with feature scope, files, data flow, test evidence, operational limits, rollback, and future payment/ten-test roadmap.
- [x] **Step 5: Write the logged-in user guide** covering login, four steps, summary correction, two paths, deletion, privacy, and disclaimers.
- [x] **Step 6: Run** `npm test`, `npm run lint`, and `npm run build`.
- [x] **Step 7: Inspect** `git diff --check`, `git status`, and changed-file list; do not claim completion without fresh command output.
