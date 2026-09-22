# SoulCode Inner Page Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保持功能不变的前提下，把 SoulCode 核心内页改造成舒展、低线条、字号层级稳定的安静编辑风。

**Architecture:** 先在 `globals.css` 建立共享的 SoulCode editorial tokens 和屏幕/打印分层规则，再以最小 JSX 调整替换三个核心页面的旧卡片化外壳。数据状态、请求函数和已有业务组件保持原样，只改变 className、布局容器和视觉语义。

**Tech Stack:** Next.js App Router、React、Tailwind CSS、现有 SoulCode CSS 变量、Markdown 渲染、CSS media queries。

## Global Constraints

- 不修改 API 路径、请求 payload、报告生成逻辑、登录、保存和打印入口。
- 不删除任何现有输入字段和报告字段。
- 屏幕表格去网格，打印表格保留边界。
- 所有改动先在本地验证，未获得新的部署确认前不推送生产服务器。
- 移动端必须通过 390px 宽度检查，桌面端通过 1440px 宽度检查。

---

### Task 1: 建立共享 editorial 视觉基础

**Files:**
- Modify: `src/app/globals.css:1-160, 250-465, 1150-1450`
- Modify: `src/app/layout.tsx:35-95`

**Interfaces:**
- Consumes: 现有 `body[data-site="soulcode"]` 变量、`.card-jade`、`.input-jade`、`.report-content` 和 `.inner-page-*` 类。
- Produces: `.soul-editorial-page`、`.soul-editorial-shell`、`.soul-editorial-surface`、`.soul-editorial-field`、`.soul-editorial-table` 等共享视觉规则，供后续页面使用。

- [ ] **Step 1: 将 SoulCode 共享字体拆成 UI 字体和展示字体**

在 `body[data-site="soulcode"]` 中新增 `--font-ui: "PingFang SC", "Noto Sans SC", "MiSans", system-ui, sans-serif` 和 `--font-display: "LXGW WenKai", "Songti SC", serif`；将 body、控件和报告正文改用 `--font-ui`，标题保留现有展示字体类。

- [ ] **Step 2: 将基础卡片和输入控件改为轻边界**

保留 `.card-jade` 给结果模块，但把默认阴影降为无阴影或极轻阴影；新增 `.soul-editorial-surface` 只提供浅色表面；新增 `.soul-editorial-field` 使用浅色背景、单一细边框和明确 focus ring。

- [ ] **Step 3: 添加屏幕端无网格表格和媒体规则**

为 `.report-content table.soul-editorial-table` 设置 `border-collapse: separate`、`border-spacing: 0`，屏幕端只保留 `border-bottom` 和表头浅底；在 `@media print` 中恢复 `border-collapse: collapse` 和单元格边框。

- [ ] **Step 4: 统一标题、说明和表单间距**

新增 `.soul-editorial-header`、`.soul-editorial-eyebrow`、`.soul-editorial-title`、`.soul-editorial-lead`、`.soul-editorial-form` 和移动端规则，确保标题不依赖 Tailwind 任意字号散落控制。

- [ ] **Step 5: 运行样式与类型检查**

Run: `npm run lint`

Expected: 无新增 lint 错误；现有业务逻辑不被改动。

### Task 2: 重做人生总览输入页和结果容器

**Files:**
- Modify: `src/app/master-report/page.tsx:212-365, 381-566`

**Interfaces:**
- Consumes: `MasterPage` 现有状态、`submit`、`showQuickInput`、`showSkeleton`、`showFullReport` 和 `reportHtml`。
- Produces: 使用共享 editorial 类的输入区和报告模块，所有现有条件渲染和数据绑定保持不变。

- [ ] **Step 1: 替换页面头部 className**

将页面根容器改为 `.soul-editorial-page`，标题区改为 `.soul-editorial-header`，保留原有文本、按钮和状态条件。

- [ ] **Step 2: 将桌面双栏扩展为舒展布局**

保留左侧说明和右侧表单的语义，但将 `max-w-4xl` 调整为共享 shell 宽度；左侧说明用更稳定的正文宽度，右侧表单不再使用厚重 `.card-jade` 外框。

- [ ] **Step 3: 减少表单分隔线和过小标签**

保留四个业务分区标题，统一为 11–12px 标签；性别、日期、地点、精确时间控件替换为 `.soul-editorial-field`，删除重复的 rounded/border/shadow 组合 class。

- [ ] **Step 4: 统一 CTA 和等待状态视觉**

保留 `submit`、disabled 和 `ReportWaiting`，只调整按钮 class 和外层间距；不修改文字、状态变量或请求流程。

- [ ] **Step 5: 处理完整报告屏幕表格 class**

为报告 Markdown 外层和显式表格加入 `report-content soul-editorial-table-wrap` 或 `soul-editorial-table` 所需 class，不改报告原文。

### Task 3: 统一关系合盘和人类图输入页

**Files:**
- Modify: `src/app/compatibility/page.tsx:161-275`
- Modify: `src/app/human-design/page.tsx:216-330`

**Interfaces:**
- Consumes: 现有 `HepanPage`、`HumanDesignPage` 的表单状态、提交函数、结果渲染和子组件。
- Produces: 两个页面使用与人生总览一致的页面标题、表单 surface、控件和 CTA 体系。

- [ ] **Step 1: 将关系合盘类型切换改为 editorial tabs**

保留 `couple/family/friend` 值和按钮事件，去掉渐变和厚边框；激活项用深金文字和浅色底，未激活项使用无边界文字按钮。

- [ ] **Step 2: 将多人输入表单改为分组留白**

保留 `PersonForm` 调用和添加/移除孩子逻辑，只调整外层容器和间距，避免“卡片套卡片”。

- [ ] **Step 3: 统一人类图表单的左右比例和字段样式**

保留所有字段和 `handleSubmit`，使用共享表单 shell 和 field class；输入区不再使用 `card-jade p-7 md:p-10` 的厚重组合。

- [ ] **Step 4: 统一两个页面的报告外层**

结果仍保留现有 `ReportWaiting`、Markdown、图表和问答组件，仅替换外层容器和标题层级，避免影响报告生成速度和内容。

### Task 4: 屏幕/打印回归验证

**Files:**
- Modify: `src/app/globals.css:print media sections` only if verification shows regression.
- Create: `docs/superpowers/verification/2026-08-09-soulcode-inner-page-editorial-checklist.md`

**Interfaces:**
- Consumes: Tasks 1–3 的 CSS 和 JSX。
- Produces: 可复用的验收清单和本地构建证据；不产生生产部署。

- [ ] **Step 1: 构建项目**

Run: `npm run build`

Expected: Next.js production build 成功，无 TypeScript、CSS 或 route 构建错误。

- [ ] **Step 2: 检查桌面端核心页面**

在 1440px 宽度检查 `/master-report`、`/compatibility`、`/human-design`：标题、表单、按钮和报告区无重叠；屏幕表格无密集竖线。

- [ ] **Step 3: 检查移动端核心页面**

在 390px 宽度检查上述路由：无横向滚动；标题不换行重叠；日期和地点字段可以触控；按钮不被遮挡。

- [ ] **Step 4: 检查功能不变**

逐项确认表单填写、提交按钮禁用条件、等待状态、流式结果、失败提示、历史报告、打印入口和外链仍存在。

- [ ] **Step 5: 检查打印版**

从完整报告调用打印预览，确认 A4 页面中的标题、图表、表格边界和页眉页脚规则仍正常；屏幕无网格策略不得破坏打印表格。

- [ ] **Step 6: 写入验收记录并提交本地改动**

将实际结果、失败项和截图路径写入验收清单；仅提交 Git 本地分支，等待用户查看展示稿后再决定是否推送和部署。
