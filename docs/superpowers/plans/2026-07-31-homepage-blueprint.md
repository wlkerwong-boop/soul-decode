# SoulCode Homepage Blueprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the SoulCode homepage to match the approved blueprint and refine the shared social footer.

**Architecture:** Keep the homepage self-contained in `src/app/page.tsx` with data arrays, inline SVG components, and native `details` accordions. Retain the root-layout Footer and add label-driven inline icons inside the shared Footer component; keep global tokens in `globals.css`.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Vitest, React server rendering.

## Global Constraints

- Hero height is exactly `100dvh` minimum with layered CSS radial gradients.
- Colors are deep indigo `#0B1120` and warm gold `#D4AF37`.
- Use LXGW WenKai from the existing CDN and global line-height 1.8.
- Use no Swiper, Framer Motion, or other new external libraries.
- Commit author is `Codex <codex@aisoulcode.cn>` and commit message is `feat: redesign homepage by Codex - blueprint implementation`.

---

### Task 1: Homepage structure and interactions

**Files:**
- Modify: `src/app/page.tsx`
- Test: `src/app/page.test.tsx`

**Interfaces:**
- Consumes: Next.js `Link` and React server rendering.
- Produces: default `Home` page with semantic sections and seven native accordion items.

- [ ] Write a failing render test that expects a 100dvh hero, three service links, seven `details` chapters, five exploration links, and the approved routes.
- [ ] Run `npx vitest run src/app/page.test.tsx` and confirm failure against the current grid/book implementation.
- [ ] Replace the homepage with the blueprint structure, CSS radial-gradient starfield, inline SVG service icons, native accordions, real routes, constrained about copy, and CTA.
- [ ] Run `npx vitest run src/app/page.test.tsx` and confirm it passes.

### Task 2: Global palette and social Footer

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/shared/Footer.tsx`
- Test: `src/components/shared/Footer.test.tsx`

**Interfaces:**
- Consumes: existing `FooterProps.socialLinks` labels.
- Produces: round social controls with inline WeChat, Xiaohongshu, and Stella artwork.

- [ ] Write a failing render test that expects three labeled circular social links with non-text icon markup.
- [ ] Run `npx vitest run src/components/shared/Footer.test.tsx` and confirm failure against the square text buttons.
- [ ] Add label-driven inline SVG icons, round button styling, `#0B1120` background tokens, and global line-height 1.8.
- [ ] Run both focused test files and confirm they pass.

### Task 3: Verify and commit

**Files:**
- Verify all modified files above.

**Interfaces:**
- Consumes: completed source and tests.
- Produces: verified commit on `redesign-2026`.

- [ ] Run `npm test` and confirm zero failures.
- [ ] Run `npx next build` and confirm exit code 0 with no errors.
- [ ] Review `git diff`, ensure `.next.old-0727b/` remains untouched, and confirm the current branch is `redesign-2026`.
- [ ] Commit tracked implementation files with `git -c user.name=Codex -c user.email=codex@aisoulcode.cn commit -m "feat: redesign homepage by Codex - blueprint implementation"`.
- [ ] Verify the resulting commit author, subject, branch, and clean tracked status.
