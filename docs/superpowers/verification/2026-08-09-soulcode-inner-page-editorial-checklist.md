# SoulCode 内页安静编辑风本地验收清单

## 已完成的自动化检查

- [x] `npm run build`：通过；TypeScript 编译通过，55 个静态页面生成完成。
- [x] 1440px 人生总览截图：标题、说明栏、表单卡和 CTA 无重叠。
- [x] 390px 人生总览截图：页面总宽度与 viewport 同为 390px，无横向滚动。
- [x] 1440px 关系合盘截图：三种关系类型以 editorial tabs 呈现，表单层级清晰。
- [x] 390px 关系合盘布局读取：页面总宽度 390px；三项 tabs 的计算宽度为 123.594px、123.609px、123.594px，未发生真实横向溢出。
- [x] 1440px 人类图截图：说明栏与表单栏比例稳定，CTA 无渐变。
- [x] 390px 人类图截图：标题、字段和 CTA 无真实横向溢出。
- [x] `git diff --check`：未发现空白错误。

## 本轮视觉改动已核对

- [x] 人生总览输入区取消厚重卡片化分隔。
- [x] 关系合盘的“你 / 对方”输入组取消内部小面板边框。
- [x] 关系合盘性别按钮去除人物 emoji，使用纯文字状态。
- [x] 人类图输入页接入统一标题、说明、字段和 CTA。
- [x] 屏幕端报告表格改为淡色底部间隔；打印端仍保留单元格边框。
- [x] 其他 `.inner-page` 页面获得轻边界、无渐变文字和稳定控件基础样式。

## 尚待真实验收

- [ ] 使用真实家庭成员资料完成一次人生总览报告生成，并核对报告内容未变化。
- [ ] 使用真实家庭成员资料完成一次家庭/情侣合盘，并核对流式报告速度和内容未变化。
- [ ] 打开完整报告打印预览，确认图表、表格和分页效果。
- [ ] 在真实手机 Chrome 中检查导航、输入控件触摸体验和打印入口。
- [ ] 用户确认展示稿后，再提交 GitHub、部署服务器并做线上缓存核对。

## 已知非本轮问题

- 全仓 `npm run lint` 会扫描 `.next.old-0727b`、历史测试脚本和既有组件，当前存在大量基线 lint 错误；本轮没有新增构建错误。
- 构建仍提示多个页面使用旧式 metadata viewport 导出方式；这属于已有 Next.js 兼容提示，本轮未修改。

## 本地展示截图

- `/private/tmp/soulcode-master-desktop.png`
- `/private/tmp/soulcode-master-mobile.png`
- `/private/tmp/soulcode-compatibility-desktop.png`
- `/private/tmp/soulcode-compatibility-mobile-final.png`
- `/private/tmp/soulcode-human-design-desktop.png`
- `/private/tmp/soulcode-human-design-mobile.png`
