# 人生总结与双路径人生剧本 P0 设计

## 目标

在现有 SoulCode 七系统出生画像之后，增加一个可保存、可恢复、可校正的人生总结向导，并生成两条带证据边界的未来叙事：`不改变路径` 与 `主动改变路径`。P0 的目的不是宣称预测命运，而是帮助用户看见“已有配置 + 已发生经历 + 当前选择”如何共同塑造下一阶段。

## 已确认的现有能力

- `src/app/master-report/page.tsx` 已完成出生信息输入、登录门禁、流式报告展示、报告历史与导出入口。
- `src/app/api/master-report/stream/route.ts` 已把八字、人类图、紫微斗数、占星、五运六气和流年组装成 `reportContext`，并使用 SSE 生成报告。
- `src/lib/report-depth.ts` 已提供报告分章与事实声明结构。
- 现有报告有验证与免责声明护栏；新模块必须沿用“地图不是判决书”的表达边界。
- 当前报告历史主要保存于浏览器端；P0 的人生总结先使用浏览器草稿存储，不新增数据库迁移。

## 用户流程

1. 用户从“人生总览”点击“开始人生总结”。
2. 向导分 4 步，每一步只展示少量问题，并显示进度：
   - 我的起点：出生家庭、成长环境、重要迁移与资源。
   - 我的路：求学、工作/事业、关系/家庭、健康与重大转折。
   - 我的门槛：最多 8 个关键事件，每个事件包含年份、主题、发生了什么、当时选择、现在的理解。
   - 我的此刻：当前状态、未解决问题、想保留的东西、想改变的东西、未来三年愿望。
3. 每一步自动保存本地草稿；用户可以返回、跳过非必填问题或稍后继续。
4. 提交后，服务端先返回结构化人生总结草稿，页面要求用户确认或修改。
5. 用户确认后生成双路径剧本：
   - 不改变路径：按已识别的惯性、资源和未解决问题推演可能延续的模式。
   - 主动改变路径：围绕用户指定的改变目标，生成至少三个可执行分叉。
6. 结果页显示每条洞察的来源标签：`出生画像`、`用户经历`、`当前选择`、`AI推演`，并在结尾提供 7 天行动卡。

## 数据模型

```ts
export interface LifeStoryEvent {
  id: string;
  year?: number;
  theme: 'family' | 'education' | 'career' | 'relationship' | 'health' | 'finance' | 'move' | 'other';
  title: string;
  whatHappened: string;
  choiceMade?: string;
  meaningNow?: string;
}

export interface LifeStoryProfile {
  version: 1;
  origin: { family: string; environment: string; resources?: string; migrations?: string };
  lifePath: { education?: string; career?: string; relationships?: string; health?: string };
  events: LifeStoryEvent[];
  present: { status: string; unresolved?: string; preserve?: string; change?: string; hopes?: string };
  consent: { reflectiveSimulation: boolean; confirmedAt: string };
}

export interface LifeScriptResult {
  summary: { headline: string; strengths: string[]; patterns: string[]; tensions: string[]; openQuestions: string[] };
  paths: Array<{ type: 'continuity' | 'change'; title: string; premise: string; signals: string[]; risks: string[]; opportunities: string[]; actions: string[] }>;
  sourceLabels: Array<'birthProfile' | 'lifeStory' | 'currentChoice' | 'inference'>;
  disclaimer: string;
}
```

## API

- `POST /api/life-script/summary`: 接受 `{ birthProfile?: Record<string, unknown>, lifeStory: LifeStoryProfile }`，返回结构化 `summary`。不调用 AI 时也必须能返回明确的校验错误。
- `POST /api/life-script/generate`: 接受 `{ birthProfile?: Record<string, unknown>, lifeStory: LifeStoryProfile, confirmedSummary: LifeStoryResult['summary'] }`，调用现有 AI 配置生成严格 JSON，并由服务端做 schema 校验、免责声明注入和长度限制。

P0 不改现有 `/api/master-report/stream` 协议；出生画像通过前端已保存的报告数据或摘要传入。API 不记录完整人生经历到日志，日志只记录请求状态和字符数量。

## 体验与安全边界

- 默认每题可选，至少需要“当前状态”和一条关键事件才能生成总结。
- 不使用“注定、必然、命中、灾难”等宿命化表达；输出使用“倾向、可能、如果继续、可以尝试”。
- 健康、法律、投资、性暴力等敏感主题只允许用户主动填写；不主动追问细节，不作诊断。
- 草稿只存当前浏览器 localStorage；提交前明确告知用户数据用途和删除方式。
- API 对输入长度、事件数量和年份做硬限制；AI 输出解析失败时返回可读错误，不展示半份剧本。

## 验收标准

- 未登录用户可访问介绍页，但提交时跳转登录并保留草稿；登录后能恢复草稿。
- 用户可完成 4 步向导、刷新页面后恢复草稿、删除草稿。
- 空白输入、超过 8 个事件、非法年份和超长文本均有明确提示。
- 总结接口可在无 AI key 的测试环境下做输入验证；生成接口对非 JSON、缺字段和宿命化内容失败关闭。
- 结果页能区分两条路径、来源标签、免责声明和 7 天行动。
- 现有测试保持通过，`npm run build` 通过。
- 开发报告包含功能说明、登录者操作指南、测试命令、未完成项和回滚方式。

## 不在 P0

- 十重考验游戏化关卡。
- 真实支付通道、订阅计费和服务端订单账本。
- 多人协作/伴侣共同填写。
- 将人生经历写入 Supabase 或永久服务端存储。
