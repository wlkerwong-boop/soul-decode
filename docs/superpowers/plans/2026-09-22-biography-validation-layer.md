# Biography Validation Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a leakage-resistant biography fact layer and blind-review scorer for celebrity validation.

**Architecture:** Keep biography facts separate from report generation. A pure TypeScript domain module validates pre-registered facts and reviewer labels, then computes an observed-fit score with coverage, contradiction, and unscorable counts. A stateless no-store API exposes the scorer for internal validation; fixtures provide Bruce Lee, Lu Xun, and Yao Ming samples without feeding their facts into the report prompt.

**Tech Stack:** Next.js App Router, TypeScript, Vitest.

**Spec:** `outputs/名人经历交叉验证报告-人生剧本模拟.md`

## Global Constraints

- Do not call the result “prediction accuracy”; use “observed fit” and show unscorable items.
- Facts must be pre-registered before report review and must retain source URL and source grade.
- The report generator must not receive celebrity names, facts, or reviewer labels in this phase.
- A reviewer may label a claim only as `match`, `mismatch`, `neutral`, or `unscorable`.
- The API must be stateless and send `Cache-Control: no-store`.

### Task 1: Define fact and blind-review domain model

**Files:**
- Create: `src/lib/biography-validation.ts`
- Test: `src/lib/biography-validation.test.ts`

**Interfaces:**
- `validateBiographyFacts(input: unknown): BiographyFactValidation`
- `scoreBiographyReview(facts: BiographyFact[], reviews: BiographyReview[]): BiographyValidationScore`
- `BiographyFact`: `id`, `personId`, `eventYear?`, `category`, `description`, `sourceUrl`, `sourceGrade`, `distinctiveness`, `preRegistered`
- `BiographyReview`: `factId`, `label`, `reviewerId?`, `note?`

- [ ] Write failing tests for required source fields, pre-registration, duplicate IDs, and complete score accounting.
- [ ] Run `npm test -- --run src/lib/biography-validation.test.ts` and confirm the module is missing or assertions fail for the intended reason.
- [ ] Implement bounded validation and weighted observed-fit scoring.
- [ ] Run the focused test until all assertions pass.
- [ ] Commit as `feat: add biography validation domain model`.

### Task 2: Add public-figure validation fixtures

**Files:**
- Create: `src/data/celebrity-validation.ts`
- Test: `src/lib/biography-validation.test.ts`

**Interfaces:**
- `CELEBRITY_VALIDATION_FIXTURES: Record<string, BiographyFact[]>`
- `getCelebrityFacts(personId: string): BiographyFact[]`

- [ ] Add 5–7 high-distinctiveness facts each for Bruce Lee, Lu Xun, and Yao Ming.
- [ ] Mark Lu Xun time-sensitive facts as unavailable by not encoding a birth-time claim.
- [ ] Use source URLs already collected in the validation report.
- [ ] Test fixture IDs, source URLs, and pre-registration flags.
- [ ] Commit as `feat: add celebrity validation fixtures`.

### Task 3: Expose stateless blind-review scoring API

**Files:**
- Create: `src/app/api/biography-validation/route.ts`
- Test: `src/app/api/biography-validation/route.test.ts`

**Interfaces:**
- `POST /api/biography-validation` body: `{ facts: BiographyFact[], reviews: BiographyReview[] }`
- Success: `{ ok: true, score: BiographyValidationScore }`
- Invalid input: HTTP 400 with `{ ok: false, errors: string[] }`

- [ ] Write failing route tests for valid scoring, duplicate/missing review labels, and no-store headers.
- [ ] Implement the route using the domain module only.
- [ ] Run focused route tests, then the full test suite and production build.
- [ ] Commit as `feat: expose biography validation scorer`.

### Task 4: Produce the first blind-review worksheet

**Files:**
- Create: `outputs/名人盲测评分工作表.md`
- Create: `outputs/传记事实层与盲测评分说明.md`

- [ ] Document the three fixture sets, reviewer labels, scoring formula, and prohibited interpretations.
- [ ] Record the first review as “待盲评”，not as a successful validation result.
- [ ] Run a local API-level scoring example with synthetic reviewer labels and record the JSON output.
