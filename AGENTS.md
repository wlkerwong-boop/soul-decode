# 见己学园 · 项目记忆包 v1.1（AGENTS.md 候选）

> 用途：Kimi Code CLI 开工上下文。放置于仓库根目录作为 AGENTS.md，或用 `/import` 导入。
> 维护：K3 执笔；发生重大变更时更新版本号。
> 读者：Kimi Code CLI（写代码）、Hermes（统筹/部署）、Codex（后备）。
> v1.1 变更：更正 Stella 公开站网址；新增"全部站点归一阿里云"决策与前端迁移要点。

---

## 1. 项目一句话

为个性化家庭教育而生的三站体系：**SoulCode**（aisoulcode.cn，七系统命理测评+AI解读，已在运营）→ **见己学园**（学习方案平台，开发中）→ **Stella**（家长陪伴，公开站 **https://www.stella-aiedu.com/**）。理念：先见己，后见世界。创始家庭：大理王献科一家，三个女儿（一斐15/一然11/一如8）是前三个样本。

## 2. 基础设施拓扑（阿里云 47.102.142.225）

| 服务 | pm2 进程 | 端口 | 说明 |
|------|----------|:--:|------|
| soul-decode（SoulCode 主站） | next | 3000 | Next.js，aisoulcode.cn |
| bell-app（Stella 相关服务） | bell-app | 3002 | bell.aisoulcode.cn；Stella 公开站为 www.stella-aiedu.com |
| report-api | report-api | 3003 | SoulCode 计算/报告后端 |
| jianji-api | jianji-api | 3004 | 见己学园后端（Express + Supabase） |
| proxy-v3 | proxy | 80/443 | 按域名路由：bell.aisoulcode.cn→3002；任意域名 `/jianji/*`→3004（剥前缀） |

- 前端"见己学园"：React+Vite，HashRouter。**2026-07-19 决策：全部站点归一阿里云，迁出 Vercel**（迁移要点见 §6 与 jianji-ops/decisions/）。本地模式（无环境变量）可独立运行。
- Supabase：与 Stella 同实例（gotrue 鉴权 + Postgres）。
- DeepSeek：report-api 与 soul-decode 的 AI 解读引擎。

## 3. 仓库地图（GitHub wlkerwong-boop，均私有）

| 仓库 | 内容 |
|------|------|
| jianji-ops | **三方协作中枢**：/tasks 任务书、/materials 规则材料、/reports 验收报告、/decisions 决策规划、/patches 前端补丁 |
| jianji-api | 见己学园后端源码（Express） |
| soul-decode | SoulCode 主站源码（Next.js） |

## 4. 工程纪律（铁律，本周三次事故换来的）

1. **GitHub 是唯一真相源**，服务器只允许 `git pull`，禁止直接改服务器文件。
2. **提交必 `git add -A`**——新文件不跟踪的事故已发生过（me.js 漏 push 导致仓库无法克隆运行）。
3. **部署 checklist**：pull → 构建 → pm2 restart --update-env → 验证命令（配置类改动必须 grep 代码确认仍在）。
4. **push 前必扫密钥**：`git diff --cached | grep -i "key\|secret\|token"`（service_role 曾泄漏 2 分钟，已轮换）。
5. **验收双 curl**：改 CORS/代理类配置，预检(OPTIONS)和实际响应(POST)两条都要验。

## 5. 事故案例库（根因一句话）

| 事故 | 根因 |
|------|------|
| proxy 规则重启后消失 | 只改运行时未写入文件（配置漂移#1） |
| CORS 修复被覆盖回退 ×2 | 修复只在服务器热改，rsync 用旧代码覆盖（漂移#2/#3） |
| 创建孩子静默失败 | ①CORS 白名单失效 ②requireAuth 用了不存在的 phone 列插 profiles |
| 一斐登录看到家长界面 | /api/me 先查 profiles 而后端会为任何用户自动建行，孩子被误判为家长 → 已修（children 查询前置） |
| service_role 密钥上 GitHub | .env 被提交，暴露约 2 分钟（已轮换） |
| DeepSeek 402 全站 AI 宕 | 余额不足；后查明 API key 已更换但服务器环境变量未更新 |
| 人类图排盘页 404 | report-api 路由被移除，前端代理未同步（双轨计算的漂移面） |

## 6. 当前状态快照（2026-07-19）

- ✅ 见己学园 v0.3 上线：登录门禁（未登录只见落地页）、家长/孩子双角色、孩子账号（children.auth_id）、G1–G8 验收全绿。测试账号：家长 k3test@jianjixueyuan.com、孩子 yifei@jianjixueyuan.com。
- 🚧 **全部站点归一阿里云（爸爸 2026-07-19 决策）**：见己学园前端迁出 Vercel。约束与要点：jianjixueyuan.com 未备案（80/443 被拦截），过渡期用已备案域名承载（子域或路径），备案完成再切正式域名；前端为纯静态文件，nginx/proxy-v3 直接托管，几乎不占内存；新域名需加入 jianji-api CORS 白名单，Vercel 正则保留至迁移验证通过后再清理。详见 decisions/2026-07-19-前端迁阿里云-决策与执行要点.md。
- 🔴 SoulCode 待修清单（详见 jianji-ops/reports/2026-07-19-SoulCode全站功能测试与UI完善方案.md）：P0=登录固定验证码 888888（任意手机号可登录）；P0=DeepSeek 服务器仍用旧 key（新 key 余额充足，更新 env 即恢复）；P1=ICP 备案号占位符；P1=/human-design 上游 404；P1=排盘与 AI 解读未解耦；P1=HD 计算丢分钟+坐标硬编码北京。
- ⏸ 任务书03（科学测评中心）：材料在 jianji-ops/materials/（附件1–4）。Task G（report-api calcBazi 崩溃）可先行。
- ✅ 方案模块库 v0.1 定稿：骨架六层（能量节律/学习引擎/学科内容/情绪关系/健康红线/年度策略）+12 模块，在 decisions/。
- ⏸ ICP 备案（爸爸办理中）。
- 待爸爸拍板：①SoulCode 商业模式（建议排盘免费引流+解读付费）；②点亮星图工具包归属。

## 7. 账号与数据模型要点

- `profiles`：家长行（auth_id 关联）。`children`：孩子行（parent_id 关联家长，auth_id 开通后关联孩子账号）。
- 中间件：requireAuth（自动建 profile）、ownChild（家长本人或孩子本人放行，越权 404）、requireParent（拒孩子 403）。
- GET /api/me：先查 children（孩子）再查 profiles（家长）——顺序不可颠倒。
- 开通孩子账号：POST /api/children/:id/login-account（admin.createUser，email_confirm:true）。

## 8. 三姐妹画像速记（方案设计的样本基准）

| | 一斐 15 | 一然 11 | 一如 8 |
|---|--------|--------|-------|
| HD | 投射者 1/3，情绪权威 | 显示者，脾脏直觉权威 | 生产者 1/3，荐骨权威 |
| 八字 | 戊土亥月，喜火 | 癸水午月，水火交战 | 癸水未月，三丁透干 |
| 要点 | 等邀请、研究试错、独处充电 | 告知后发起、单点大师、脉冲能量 | 等回应、四步学习、写作输出、2026健康警戒 |

## 9. 协作协议

- **爸爸**：拍板、ICP 备案、产品方向。
- **Hermes**：统筹 + 部署运维（服务器、pm2、proxy、env、密钥、验收命令执行）。
- **Kimi Code CLI**：写代码。开工仪式：`cd 项目目录 && kimi -c`（延续主会话）或新会话 `/import 本记忆包`；每个仓库根目录放本包为 AGENTS.md。完成大块工作后 `/export` 导出会话，Hermes 推入 jianji-ops/reports/。
- **K3（kimi.com 网页端）**：写任务书、定验收标准、做验收测试、维护本记忆包。与 CLI 不共享记忆，一切经 jianji-ops 仓库异步互通。
- **Codex**：后备，需要时加入；同一仓库同一时刻只让一个编码 Agent 动手。
- 沟通格式：任务书含背景/规格/验收命令；回报含命令输出原文；验收报告含记分卡。

## 10. 常用验证命令速查

```bash
# 见己学园后端健康
curl -s https://bell.aisoulcode.cn/jianji/health
# CORS 双验证（预检+实际响应）
curl -s -i -X OPTIONS https://bell.aisoulcode.cn/jianji/api/children -H "Origin: https://dist-alpha-brown-95.vercel.app" -H "Access-Control-Request-Method: POST" | grep access-control
curl -s -i -X POST https://bell.aisoulcode.cn/jianji/api/children -H "Origin: https://dist-alpha-brown-95.vercel.app" -H "Content-Type: application/json" -d '{"name":"probe"}' | grep access-control
# DeepSeek 是否恢复（soul-decode）
curl -s -X POST https://aisoulcode.cn/api/mbti-interpret -H "Content-Type: application/json" -d '{"type":"INTJ"}' | head -c 120
```

---

*v1.1 by K3（2026-07-19）。更新规则：任务书验收收官、重大架构变更、事故复盘后，版本号 +0.1。*
