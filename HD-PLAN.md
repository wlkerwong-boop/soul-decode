# 人类图（Human Design）模块 · 开发计划

## 核心引擎
所用库：`@it-healer/human-design-calculator`（内部调用calculateBodygraph函数）
输出：行星位置、类型、权威、通道、闸门、中心定义 → 完整Bodygraph + SVG图表

## 四功能

### ① 人类图生成（P0）
- 输入：出生日期+时间+地点（复用现有八字表单逻辑）
- 计算：调用HD库 → 返回JSON + SVG
- 展示：SVG Bodygraph + 核心信息卡片

### ② 深度解析（P0）
- 基于人类图创始人Ra Uru Hu的原始体系
- 参考：区分的科学、一本读懂人类图、图解人类图
- 解析维度：类型、权威、通道、闸门、能量中心、人生角色、轮回交叉、PHS

### ③ 知识库问答（P1）
- 提取人类图核心知识体系
- 构建AI问答API（类似法藏RAG）
- 可查询：闸门含义、通道解读、能量中心说明、权威类型等

### ④ 八字/星座融合（P2）
- 对比人类图类型与八字日主五行
- 找出共同指向和互补信息
- 给个性化综合建议

## 分工

| 模块 | 负责人 | 预估工时 |
|------|--------|---------|
| HD API Route（调用calculateBodygraph） | Hermes | 1h |
| HD 前端页面（表单+SVG+信息卡） | Hermes + 小舍得 | 2h |
| HD 深度解析（类型/权威/通道解读） | Hermes | 2h |
| HD 知识库问答API | 小舍得(Claude) | 2h |
| HD SVG展示和交互 | Codex/备用 | 1h |
| 八字/星座融合 | Hermes | 2h |
| 全链路测试 | Hermes | 1h |
