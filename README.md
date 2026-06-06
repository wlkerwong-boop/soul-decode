# 灵魂解码 · AI人生使命解读平台

## 项目概况

输入出生日期与地点，即时生成一份直击核心的深度个人使命与天赋解码报告。
融合心理学原型理论、生命数字学、东方命理逻辑与人生模式分析学。

## 技术栈

- **框架：** Next.js 16 (App Router) + TypeScript
- **样式：** Tailwind CSS 4 + 自定义 CSS
- **AI：** DeepSeek API（可切换 OpenAI）
- **部署：** Vercel

## 本地开发

```bash
cd ~/Projects/soul-decode
cp .env.example .env.local
# 编辑 .env.local 填入 DeepSeek API Key
npm run dev
```

## 项目结构

```
src/
├── app/
│   ├── api/generate/route.ts   # AI报告生成API
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页（输入表单 + 报告展示）
│   └── globals.css             # 全局样式
├── components/
│   └── BirthInputForm.tsx      # 输入表单 + 报告渲染（客户端组件）
├── lib/
│   ├── numerology.ts           # 生命路径数字计算
│   ├── time-period.ts          # 十二时辰五行映射
│   ├── city.ts                 # 城市文化性格库查询
│   ├── prompts.ts              # AI提示词系统（6大模块）
│   └── ai.ts                   # AI API 集成
└── data/
    └── cities.json             # 中国城市文化性格数据库
```

## 报告6大模块

1. **核心性格解码** — 生命路径数字 + 内外性格矛盾
2. **隐藏优势与弱点** — 三刃三盾 + 核心功课
3. **职业天赋与道路** — 三条道路 + 一个避坑
4. **爱情与关系解码** — 相容类型 + 伴侣画像
5. **财富密码解码** — 财务原型 + 财富策略
6. **人生时间线与年度指引** — 过去/现在/未来5年

## 部署方式

### 方式一：Vercel CLI（推荐）

```bash
cd ~/Projects/soul-decode
vercel login
vercel --prod
```
登录后在 Vercel Dashboard 设置环境变量：
- `DEEPSEEK_API_KEY` = 你的 Key
- `AI_PROVIDER` = deepseek

### 方式二：GitHub + Vercel

1. 推送到 GitHub
2. 在 vercel.com 导入仓库
3. 设置环境变量
4. 自动部署

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API Key | 必填 |
| `AI_PROVIDER` | AI提供商 | deepseek |
| `AI_MODEL` | 模型名 | deepseek-chat |
