# SoulCode 全站设计模板方案 v1
> 依据：awwwards.com + hostswp.com 2026 设计趋势 + 本站内容（命理/占星/人类图/灵魂解码）
> 用户核心诉求：**页面必须有设计感，禁止"挤成一坨"，上端不得重叠**

---

## 〇、一句话设计理念

> **静水深流** —— 大留白 × 大字排版 × 金色点睛 × 轻缓动效，让"灵魂解码"这个内容自带神性气质。
> 参考气质：Isha 瑜伽官网（宁静、信赖、人文）、AWWAwards 获奖站点的"极简主义 2.0"（留白+重点突出）。

---

## 一、设计系统（Design Tokens）

### 色彩（在方向 B 浅色暖调基础上系统化）

| 用途 | 色值 | 说明 |
|---|---|---|
| 页面背景 | `#FAF6EF` 米白 | 全站主背景 |
| 次级背景 | `#FBF7F0` / `#F4EDE2` | 卡片、区块 |
| 正文 | `#2B2620` 暖墨 | 主要文字 |
| 次级文字 | `#6B6257` | 辅助说明 |
| 弱化文字 | `#9C9285` | 页脚、标注 |
| 品牌金 | `#C9A96A` | CTA、链接、重点 |
| 深金 | `#A8843C` | 标题金色渐变、hover |
| 大地沙 | `#D9CDBA` | 分隔线、边框 |
| 深色保留 | `#0F172A` | 仅星盘等工具页 |

**配色规则**：
- 金=点缀，一页里金色出现 ≤3 处（标题关键词、CTA 按钮、小徽标），其余全部克制。
- 绝不允许大面积金底金字。

### 字体
- **首选**：霞鹜文楷（本地化部署到 `public/fonts/`，不依赖外部 CDN——这是上次字体失效的根因）
- **fallback**：`PingFang SC, 'Noto Sans SC', system-ui, sans-serif`（不再用宋体！）
- 标题：`font-weight 600-700`，`letter-spacing: 0.02em`
- 正文：`font-weight 400`，`line-height: 1.8`，`font-size: 15-16px`

### 间距系统（Spacing Scale）
- 页面区块间：`96-120px`（大留白，绝不用 24px 这种憋屈间距）
- 卡片内：`padding: 40-48px`
- 内页顶部：**必须 `padding-top: 96px+`**（给 64px 固定导航让位，根治上端重叠）
- 移动端：区块间距缩到 `64px`，但页面顶部留白仍 ≥ 80px

---

## 二、导航（Navbar）—— 上端重叠的根治

**问题**：fixed 导航 64px + 内容无 padding → 标题被盖。
**方案**：
1. 全站内页最外层容器统一 `padding-top: 96px md:120px`（或 `pt-[96px]`）
2. 导航视觉：米白半透明 + 毛玻璃 `backdrop-blur` + 细金底线（`1px solid rgba(201,169,106,0.2)`）
3. Logo：左侧「✦ 灵魂解码」金字，右侧菜单
4. **断点**：`≥1024px` 显示完整横向菜单；`<1024px` 收起为汉堡菜单（当前实现似乎有新旧两套导航打架，需统一为一套）

---

## 三、页面头部（Page Hero / Inner Header）—— 每个内页必须有设计感

统一模板（所有内页共用）：

```
[金色小字 kicker]  e.g. HUMAN DESIGN / SEVEN-SYSTEM READING
[大标题 暖墨+金色渐变]  e.g. 人类图 · Human Design
[副标题 次级文字]      e.g. 你的出厂设定，一生的能量地图
[短分隔线 金色 32px 宽]
```

- 头部垂直留白：上下各 `80-96px`
- 居中排版（当前 master-report、human-design 已有雏形，需推广到 daily、compatibility、mbti 等全部页面）
- **禁止**：标题贴顶、无 kicker、无副标题、内容直接从顶部开始

---

## 四、首页（Homepage）—— 打造"第一眼高级感"

当前首页已不错（金色田野 hero + quote-card），需微调：

1. **Hero**：全屏金色田野大图 + 大字「解码你的生命蓝图」居中 + 一个 CTA「生成我的报告」
   - 大字用 `clamp(40px, 6vw, 72px)`，金色渐变
   - 图上方加一层米白色渐变遮罩（`from-white/60 to-transparent`）让字清晰
2. **导航 CTA**：右上「开始测评」金色按钮
3. **quote-card（每日一言）**：保留，居中、引号大、留白足
4. **探索卡片**：6 张卡片 → **修好八字命盘链接**；卡片 hover 时金边 + 轻微上浮（`-translate-y-1`）
5. **区块节奏**：hero → 三条路径 → 报告预览 → quote → 探索 → footer，每块之间留白 ≥ 96px

---

## 五、表单页（master-report / human-design / daily / compatibility）

**模板**（双栏 → 手机单栏）：

```
左栏（40%）| 右栏（60%）
品牌文案     | 表单
- kicker     | - 字段大间距（gap-6）
- 标题       | - 每字段 label + 输入框
- 副标题     | - 输入框: 米白底+金边框(focus)
- 标签徽章   | - CTA 金色按钮
```

- 表单字段间距 `gap: 24px`，绝不挤
- 输入框：`padding 12px 16px`、圆角 `12px`、`border 1px #D9CDBA`、focus 金边
- CTA 按钮：金色实底白字 or 深墨底金字，`padding 14px 32px`，圆角 `9999px`（胶囊形更高级）

---

## 六、动效（克制原则）

- **只加两处**：① 滚动渐入（`IntersectionObserver` 给区块加 fade-up）；② 按钮 hover 微动
- 禁止：WebGL、重动画库、无限旋转
- 过渡统一 `transition: all 0.3s ease`

---

## 七、字体本地化（根治字体失效）

```
public/fonts/LXGWWenKai-Regular.woff2   ← 下载官方 woff2
src/app/globals.css:
  @font-face {
    font-family: 'LXGW WenKai';
    src: url('/fonts/LXGWWenKai-Regular.woff2') format('woff2');
    font-display: swap;
  }
```
- 删除 layout.tsx 里的外部 CDN link
- fallback 链：`'LXGW WenKai', 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif`

---

## 八、立即修复清单（不依赖设计改版，纯 bug）

| # | 问题 | 文件 | 修复 |
|---|---|---|---|
| 1 | 上端重叠（padding 失效） | globals.css / 各内页 | 兜底规则补 `padding-top` 类；内页容器加 `pt-[96px]` |
| 2 | 八字命盘链接错 | `src/app/page.tsx:180` | href 改 `/master-report`（八字在人生总览） |
| 3 | rat 英文残留 | `src/app/daily/page.tsx:82` | 用 `label` 代替英文数组 |
| 4 | 字体失效 | `layout.tsx` / `globals.css` | 字体本地化 |

---

## 九、验证清单（改完后必查）

- [ ] 1280px 桌面：所有内页标题在导航下方（`top ≥ 88px`），无重叠
- [ ] 390px 手机：无水平溢出，汉堡菜单正常
- [ ] 全站无英文残留（rat/ox 等）
- [ ] 首页「八字命盘」点击 → 人生总览
- [ ] 真实浏览器（WebBridge）逐页截图确认
