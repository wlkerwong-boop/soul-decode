# SoulCode 首页蓝图实现设计

## 目标

以 `soulcode-homepage-blueprint.tsx` 为视觉与结构基准，重写 SoulCode 首页，保持现有真实路由，使用纯 Tailwind CSS 与内联 SVG，不增加运行时依赖。

## 页面结构

首页依次包含：100dvh 星空 Hero、三张横向 scroll-snap 核心服务卡、七章原生手风琴报告预览、五张横向探索卡、创始人头像占位与四行内简介、收尾 CTA。Hero 使用多层 CSS radial-gradient，不使用外部图片或 SVG 数据背景。

报告章节采用语义化 `details`/`summary`，由浏览器提供点击展开与键盘操作。服务与探索区在所有断点保留横向轨道，限制卡片宽度以维持留白和卡片感。

## 全局与 Footer

全局主背景调整为深靛蓝 `#0B1120`，正文行高为 1.8；保留布局中已有的霞鹜文楷 CDN。共享 Footer 继续由根布局渲染，但社交链接根据微信、小红书、Stella 标签显示内联 SVG/字母标记，并统一为圆形按钮。

## 验证

使用 Vitest 的服务端静态渲染验证首页关键语义结构、章节数量、真实路由和 Footer 社交按钮。最后执行完整测试与 `npx next build`，确认零报错后使用指定作者与提交信息提交到 `redesign-2026`。
