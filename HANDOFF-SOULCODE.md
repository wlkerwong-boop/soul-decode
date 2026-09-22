# SoulCode（aisoulcode.cn）调整全过程整理

> 供 Codex / Claude 接手前了解完整历史。本文档只讲事实与教训，不粉饰。

## 一、项目概况

| 项 | 值 |
|---|---|
| 站点 | https://aisoulcode.cn（soulcode，灵魂解码） |
| 本地仓库 | `/Users/guangmingxishe/Projects/soul-decode` |
| 当前分支 | `sc-oldui-shared-auth`（已推 GitHub origin） |
| 服务器 | 47.102.142.225，部署目录 `/root/soulcode`，端口 3005 |
| 反向代理 | `/root/proxy-v4.js`（pm2 进程 proxy，SNI 路由三站） |
| 技术栈 | Next.js 16（App Router）+ Tailwind v4 + TypeScript，本地构建后部署（服务器 1G 内存不能 build） |
| 登录 | 三站统一 Supabase 邮箱登录（共用实例 tnmbesyjsftephqmwsmw）+ Resend 发信域 mail.aisoulcode.cn |

## 二、设计演进时间线（git 锚点）

1. **最初版** `6831e72` — 深色文档站风格，功能全但无品牌感。
2. **K3 定稿** `5ac5975` — 用户认可的"最早版本"，全站设计基准（首页 hero 深蓝、卡片、报告预览区）。**审美基准以它为准。**
3. **退化元凶** `df7e89b` — 一次改版把 K3 文案/设计改坏（"不如之前"的代码侧根因）。**教训：不得随意改 K3 已定稿的文案与布局。**
4. **P0 修复** `9e6898a` — 恢复 K3 文案。
5. **浅色改版** `ef9b63e` — 用户选定**方向 B 浅色暖调**（见下文色板），首页 hero-light。
6. **内页浅色** `e275ab9` — 修复"内页不导入 homepage.css 导致仍深色"。
7. **每日一言 + SVG 图标** `cb7f527` — 金刚老师语录 RAG（326 主题，本地 JSON 随机，零 AI 成本），首页 quote-card。
8. **统一登录 + 备案号** — 从 main cherry-pick `d97c939`（统一登录）、`121f56b`（公安备案号，粤ICP备2026087672号-2 + 粤公网安备44030002015349号）。
9. **清理** `5730914` — .gitignore 补 `.next.old-0727b/`、`tools-screenshots/`（曾误提交 1817 文件）。
10. **移动端修复** — master-report 手机 2 列（grid-cols-2 md:grid-cols-4）。
11. **内页头部统一** — 去掉 emoji 大图标（🧬🌅📜💞）、标题加大（gradient-text 金色局部）。
12. **master-report 重设计** — 双栏（左品牌信息+七大系统标签 / 右分区表单 01基本信息 02出生时间 03出生地点 04精确时间），金色 kicker "SEVEN-SYSTEM READING"。
13. **human-design 双栏** — 同款设计语言（左"你的出厂设定"文案+标签 / 右表单）。
14. **@layer 锁 + 字体 CDN 修复 + 导航断点** `9862be9`（当前 HEAD）— 见下"已知坑"。

## 三、设计标准（用户已锁定的方向 B）

- **色板**：米白 `#FBF7F0` / `#FAF6EF`（背景）、暖墨 `#2B2620`（正文）、大地沙 `#D9CDBA`、深金 `#A8843C`、金 `#C9A96A`（点缀/CTA）。深色只保留给星盘等工具页。
- **真实摄影大图**：首屏 hero = 金色阳光田野 `photo-1500382017468-9049fed747ef`（fm=jpg&q=82&w=2400）；报告区 = 金色光柱穿云 `photo-1518098268026-4e89f1a2cd8e`（w=2000）。**用户否定 SVG 假装饰、否定灰调沉闷。**
- **气质参考**：Isha 瑜伽官网（宁静、信赖、人文）→ 大留白、单栏窄表单、克制排版。
- **动效**：轻量（纯 CSS，不碰 WebGL）。
- **内页也要有设计感**（用户核心诉求）：内页必须有首页同级的头部（kicker 小字 → 大标题 → 副标题）与布局设计，禁止"表单塞一个小卡片"。
- **每日一言板块**：首页保留（金刚老师语录，quote-card）。
- **法藏页**：保持隐藏（首页"即将上线"badge），勿开放。
- **文案铁律**：K3 定稿文案（如"解码你的生命蓝图"）不得改动。

## 四、部署机制（铁律，Codex/Claude 必须照做）

服务器 1G 内存无法构建，**一律本地构建 → 部署**：

1. **本地**：`npm run build`（Next 16 产物在 `.next/`；Next 16 禁服务器 build）。
2. **备份**：部署前服务器执行 `mv /root/soulcode/.next /root/soulcode/.next.bak-$(date +%Y%m%d-%H%M%S)`（备份机制救过两次命）。
3. **传输**：`tar czf` 打包 `.next` → **40M 分块**（`split -b 40M`）→ scp 分块到服务器 → 服务器 `cat` 合并 → 解压。
   - ⚠️ 大管道直传必被中间设备切断（200M 以上必断），必须分块+独立文件。
4. **整目录覆盖**（Turbopack 坑）：`static/chunks/`、`server/chunks/`、`server/app/` 必须整目录覆盖——Turbopack 按模块路径命名 chunk，**同名文件内容可能不同**，按文件名增量会漏。
   - 同时补 `routes-manifest.json`、`app-path-routes-manifest.json`（API 路由依赖）。
5. **重启**：`pm2 restart <soulcode>` 后**冒烟**：
   - `curl -s http://127.0.0.1:3005/ | grep -c hero-light`（=1 为浅色版）
   - `grep "解码你的生命蓝图"`（P0 文案在位）
   - `.quote-card`（每日一言）、`SEVEN-SYSTEM READING`（master-report 新版）
   - 核对 `BUILD_ID` 与本地一致；抽查 `/master-report /login /my /daily /tools` 均 200。
6. **部署后验证特征词 + BUILD_ID**（8/6 并行工作流互踩事故教训：部署前先查服务器当前 BUILD_ID 与特征词，防别的会话正在部署）。

## 五、已知坑与对策（全部实战踩过）

1. **HTML 一年缓存 → 版本切换后旧用户裸奔**：Next 16 预渲染页面默认 `s-maxage=31536000`。**已根治**：proxy-v4.js 在 `routeRequest()` 包装 `res.writeHead`，`text/html` 强制 `Cache-Control: no-cache, no-store, max-age=0, must-revalidate`；`/_next/static/*` 同样 no-cache（否则同名 CSS/JS chunk 因 immutable 缓存被永久缓存旧内容）。备份 `/root/proxy-v4.js.bak-20260806-cachefix`。
2. **浏览器扩展注入 @layer 破坏 Tailwind v4 层序**（最难缠）：用户 Chrome 装 Monica 等扩展，注入含 `@layer` 声明的样式 → 改变层顺序 → utilities 层规则（.mx-auto/.gap-1 等）被 base 层 preflight 覆盖 → 页面挤左上角/导航重叠。**已根治两层**：
   - `layout.tsx` head 最前面内联 `<style>@layer theme, base, components, utilities;</style>`（锁定层顺序，扩展无法再破坏）；
   - `globals.css` 尾部非 layer 兜底规则（`.mx-auto{margin-inline:auto}` 等 8 类，带 `:not([class*="md:"])` 排除响应式变体）。
   - **鉴别**：headless Chrome 正常但用户浏览器挤；`getComputedStyle(el).marginInline=0` 但内联 `el.style.margin='0 auto'` 生效；同层规则一个生效一个失效。
3. **霞鹜文楷字体 CDN 404**：旧路径 `chinese-font.netlify.app/packages/lxgwwenkai/dist/.../result.css` 已 404（域名迁移）；jsdelivr 路径用户网络也不可达（transferSize 0）。**对策**：font-family 链完整 fallback 苹方（`'LXGW WenKai', 'PingFang SC', 'MiSans', 'Noto Sans SC', system-ui, sans-serif`），外部字体加载失败自动降级；如需真字体应下载分包本地化到 `public/fonts/`。
4. **Turbopack 同名 chunk 不同内容**：见部署机制第 4 条。
5. **用户端诊断必须看用户真实浏览器**：Chrome 无头正常 ≠ 用户正常。可用 Kimi WebBridge（kimibridge，本地 127.0.0.1:10086，POST /command {"action":"navigate|screenshot|evaluate|list_tabs","session":"soulcode"}）直接控制用户 Chrome 截图/evaluate；Safari 只能 AppleScript 开标签（截屏需屏幕录制权限、do JavaScript 需用户在 Safari 设置开启"允许 Apple 事件执行 JavaScript"）。
6. **HTML 中 `result.css`（外部字体样式表）加载失败会使该 link 的 sheet 为 null**——排查样式问题时先看 `document.styleSheets` 与 `performance.getEntriesByType("resource")` 的 transferSize（0 = 加载失败）。

## 六、当前状态（截至交接）

- 分支 `sc-oldui-shared-auth`，HEAD `9862be9`；本地与 GitHub 同步；生产 = 该分支构建（BUILD_ID 以服务器为准，部署后核对）。
- 生产备份：`.next.bak-shared-auth-20260806-172835`（浅色版 5kFSBcHmlCbU49nU2wnh8）、`.next.bak-20260806-light`、`.next.bak-20260805` 等（服务器 25+ 个 bak 约 15G，可清理但先询问用户）。
- 本地 `/tmp/sc-deploy-final.sh` = 全量部署脚本模板（tar+40M 分块+服务器合并+pm2+冒烟），Codex/Claude 可参考重写。
- 服务器清理项待用户批准：25+ `.next.bak`（~15G）、`/root/soul-deploy`（1.2G）、`/root/soulcode-old-20260723`（201M）。

## 七、关联站点（勿动，除非用户明确要求）

- Stella（stella-aiedu.com）：分支 `stella-oldui-shared-auth`，**旧 UI + 统一登录 + NEXT_PUBLIC_HIDE_AI=true（公安审核期隐藏 AI 入口）**。用户明确否定 redesign-2026 新 UI，**严禁部署该分支**。恢复 AI 入口 = 构建时 `NEXT_PUBLIC_HIDE_AI=false`。
- 见己学园（jianjixueyuan.com）：5173 主站、3004 /jianji/*、5174 /jianji-redesign 预览。
- 密钥：`.env` 含凭据（Supabase/Resend），**任何文档/报告/聊天不得出现密钥明文**。
