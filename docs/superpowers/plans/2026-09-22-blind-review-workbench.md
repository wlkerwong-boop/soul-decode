# Blind Review Workbench Implementation Plan

> **For agentic workers:** Execute task-by-task with tests first. Keep the blind sample mapping server-side.

**Goal:** Turn the existing stateless biography scorer into a usable internal blind-review workflow without leaking person names or source URLs before review.

**Architecture:** A server-only study module maps anonymous samples A/B/C to the existing celebrity fixtures. The browser receives only sanitized facts and submits `{ sampleId, reviews }` to a dedicated server route. The route scores against server-side facts and redacts the real `personId` from the response. No reports, reviewer identity, or results are persisted.

**Constraints:** Do not call the result prediction accuracy. Do not expose source URLs, real person IDs, or fixture IDs to the browser before review. Keep the workbench internal and clearly label the result as a review aid, not scientific validation.

## Task 1: Server-only blind sample mapping

- Add anonymous sample IDs and sanitized fact projection.
- Add tests for three samples, no person names/source URLs in the public projection, and stable fact IDs.

## Task 2: Dedicated blind-review API

- Add `POST /api/biography-validation/review` accepting only `sampleId` and reviewer labels.
- Add tests for valid scoring, unknown samples, duplicate/missing labels, and redacted `personId`.

## Task 3: Reviewer workbench page

- Add `/biography-validation` with anonymous sample selection, report-first gate, label controls, notes, submission, and score summary.
- Add a source-contract test for the page/component and keep the page stateless.

## Task 4: Verification and operator guide

- Run focused tests, full tests, typecheck, build, and local/production smoke checks.
- Update the K3 acceptance package and operator guide with the new route and workflow.
