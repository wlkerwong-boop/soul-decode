# 给 Codex / Claude 的明确指令：SoulCode 全站设计 + 部署

> 先读 `HANDOFF-SOULCODE.md`（历史与坑），再按本文执行。任务完成标准：**你交付的是线上可验证的结果，不是代码**。

## 0. 任务

把 SoulCode（aisoulcode.cn）从"能用的文档站"提升为**有品牌感的设计站**：全站（首页 + 全部内页 + 报告页）统一为**浅色暖调、大留白、有设计感**的视觉语言，并**完成生产部署与多端验证**。用户对"挤成一坨、没有设计感"零容忍。

## 1. 环境

- 仓库：`/Users/guangmingxishe/Projects/soul-decode`，分支 `sc-oldui-shared-auth`（已推 GitHub origin）。
- 本地 mac（有 Node，能 build）；服务器 47.102.142.225（root，1G 内存**不能 build**）→ **本地构建、上传部署**。
- 生产：`/root/soulcode`（pm2 进程名 soulcode，端口 3005）；域名经 `/root/proxy-v4.js`（pm2 proxy）转发。
- 先 `git pull` 拉最新（含 HANDOFF 文档），在分支上干活，**每个改动 commit + push**（用户要 git 历史可溯）。

## 2. 设计标准（不许自由发挥，按此执行）

- **色板**（方向 B，用户钦定）：背景米白 `#FBF7F0`，正文暖墨 `#2B2620`，点缀金 `#C9A96A`/深金 `#A8843C`。深色仅限星盘等工具页。
- **审美基准**：git `5ac5975`（K3 定稿）与当前浅色版（HEAD）。**K3 文案一律不动**（如"解码你的生命蓝图"）。
- **每个内页必须有设计感**（用户核心诉求）：页面头部统一 = 金色小字 kicker（如 HUMAN DESIGN）→ 大标题（暖墨 + 局部金色渐变）→ 副标题；内容区大留白；表单页用"左品牌文案 / 右表单"双栏（参照当前 master-report、human-design 的写法）。
- **真实摄影**：hero 用金色阳光田野 `photo-1500382017468-9049fed747ef`，报告区用金色光柱 `photo-1518098268026-4e89f1a2cd8e`（Unsplash，fm=jpg&q=82&w=2400/2000）。禁 SVG 假装饰、禁灰调。
- **动效轻量**：纯 CSS 过渡，禁 WebGL/重动画库。
- **每日一言板块**（首页 quote-card，金刚老师语录）保留。
- **响应式**：手机（390px）/平板/桌面全正常；导航在 <1280px 必须用汉堡菜单（当前 Navbar 已 `xl:flex` 处理，别改回去）。

## 3. 部署机制（铁律，顺序不可乱）

1. 本地 `npm run build` → 确认 55/55 路由。
2. 服务器备份：`mv /root/soulcode/.next /root/soulcode/.next.bak-$(date +%Y%m%d-%H%M%S)`。
3. 打包上传：`tar czf` 打包 `.next` → `split -b 40M` 分块 → scp 每块 → 服务器 `cat` 合并 → `tar xzf`。
   - **static/chunks/、server/chunks/、server/app/ 必须整目录覆盖**（Turbopack 同名 chunk 不同内容的坑）；
   - 同时覆盖 `routes-manifest.json`、`app-path-routes-manifest.json`。
4. `pm2 restart soulcode`。
5. 冒烟（服务器上 curl 127.0.0.1:3005）：
   - `/` 200 且 `grep -c hero-light` = 1
   - `grep "解码你的生命蓝图"` 在位；`grep "quote-card"` 在位
   - `/master-report` 含 `SEVEN-SYSTEM READING`；`/login /my /daily /tools` 均 200
   - `cat /root/soulcode/.next/BUILD_ID` 与本地一致
6. 域名侧验证（本机 curl https://aisoulcode.cn/ 加时间戳参数绕缓存）。

## 4. 验证清单（交付前必须全部通过）

- [ ] 桌面 Chrome（1280px）+ 手机（390px）逐页截图：`/` `/master-report` `/human-design` `/jiugong` `/daily` `/mbti` `/compatibility` `/tools` `/auth/login` `/my`
- [ ] 每页无水平溢出、无元素重叠、无 console 报错
- [ ] **用户真实浏览器验证**：用 Kimi WebBridge 控制用户 Chrome（本地 POST http://127.0.0.1:10086/command，{"action":"navigate","args":{"url":"..."},"session":"soulcode"}；screenshot/evaluate 同法）逐页截图确认；Safari 用 AppleScript `tell application "Safari" to make new document with properties {URL:"..."}` 开页让用户确认
- [ ] 无痕窗口（零缓存）打开页面正常
- [ ] 交互走通：master-report 填表 → 提交 → 出报告（DeepSeek 生成约 60-150s，超时重试）；daily 生肖切换；登录页可开
- [ ] 备案号在 Footer（粤ICP备2026087672号-2 + 粤公网安备44030002015349号）

## 5. 已知坑（遇到"怪现象"先看这里）

- **页面挤左上角/导航重叠**：① 用户浏览器扩展注入 @layer 破坏层序 → layout.tsx head 已有内联 `@layer theme, base, components, utilities;` 锁序（**保留它**）；globals.css 尾部有非 layer 兜底规则（**保留**）。② 旧 HTML/CSS 缓存 → 强刷/无痕验证。
- **字体**：外部字体 CDN 对用户网络不可达（404/0 字节）→ font-family 已带苹方 fallback。要真字体必须下载分包放 `public/fonts/` 本地化，**不要只换 CDN 链接**。
- **HTML 缓存**：proxy 已对 text/html 与 /_next/static 强制 no-cache（`/root/proxy-v4.js`，备份 .bak-20260806-cachefix）——**不要移除**。
- **改完必须 build 再部署**（不 build 直接传 = 白干）。
- **服务器空间**：`/root/soulcode/.next.bak-*` 很多（~15G），部署前先 `df -h` 确认空间足够；清理需用户批准。

## 6. 禁止事项

- **不动 Stella**（stella-aiedu.com 独立分支，用户已定旧 UI + 隐藏 AI，严禁碰 redesign-2026）。
- 不改 K3 定稿文案；不删每日一言/备案号/统一登录功能。
- **密钥不进 git/文档/聊天**（.env 里的 Supabase/Resend 值一律不写）。
- 部署前必备份；部署后必验 BUILD_ID + 特征词（防并行工作流互踩）。
- 不做"注释掉报错/绕过标记"的修复——找根因。

## 7. 完成标准

交付时给出：① 改动清单（git log）；② 全页面截图证据（桌面+手机+用户真实浏览器）；③ 冒烟输出（BUILD_ID、特征词、页面 200 列表）；④ 一句用户可执行的验证指引（打开哪个 URL 看什么）。**用户满意 = 唯一验收标准。**
