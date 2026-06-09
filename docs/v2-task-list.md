# Parallaxis v2 改造任务列表

本文档用于规划 v2 大版本改造。当前阶段只确认任务和优先级，不直接进入实现。

## 改造原则

- 先改动画求值模型，再改 DOM 运行时和 React 封装。
- 旧 `animationScript` 尽量兼容，但内部统一 normalize 到 v2 timeline。
- 任意 `scrollY` 都应该能解析出完整、稳定、可预测的视觉状态。
- 核心算法必须可脱离浏览器测试。
- 每个阶段完成后都要更新浏览器验证示例或测试，避免只凭肉眼判断。

## P0：确认 v2 语义和兼容边界

- [x] 确认动画脚本表达绝对状态，不表达增量变化。
- [x] 确认没写的属性按属性维度保持上一段结束状态。
- [x] 确认数字写法永远等价于默认值到目标值。
- [x] 确认重叠片段后声明优先。
- [x] 确认区间外 start 前保持 from，end 后保持 to。
- [x] 确认默认状态固定，不读取 DOM transform。
- [x] 确认 `beforeSupplement` / `afterSupplement` 保留 legacy，但 v2 内核不依赖。
- [x] 确认第一阶段只做片段级 easing。
- [x] 确认非法脚本 warning + 跳过，不让页面崩。
- [x] 确认 v2 新增 `timeline` 作为主 API，旧 `animationScript` 标记为 legacy。
- [x] 确认新 `timeline` API 采用 `range` / `from` / `to` / `easing` 结构。
- [x] 确认 v2 立即支持自定义滚动容器。
- [x] 确认保留 `Grid`，定位为位移距离校准和调试工具。
- [x] 确认继续提交 `es/` 和 `lib/` 构建产物。
- [x] 确认支持滚动轴向 `axis: 'y' | 'x'`，默认 `y`。
- [x] 确认自定义滚动容器 API 使用 `container`。
- [x] 确认支持 `prefers-reduced-motion`，默认尊重系统设置。
- [x] 确认保留 `frameFn` 作为 advanced API，不参与核心状态求值。
- [x] 确认 React / ReactDOM 在 v2 迁移到 `peerDependencies`。
- [x] 确认本次改造发布为 `2.0.0`，v1 入口尽量兼容但不限制 v2 内核设计。

## P1：核心模型重构

- [x] 新建 `src/core/types.ts`，定义 v2 内部状态、属性、timeline、diagnostic 类型。
- [x] 新建 `src/core/defaults.ts`，集中维护默认视觉状态。
- [x] 新建 `src/core/normalize.ts`，把旧 `animationScript` 和新 timeline 统一转换为内部结构。
- [x] 新建 `src/core/resolve.ts`，实现 `resolveState(scrollY, timeline)`。
- [x] 新建 `src/core/easing.ts`，实现 `linear` 和第一批基础 easing。
- [x] 新建 `src/core/transform.ts`，把完整视觉状态转换为 CSS transform 和 opacity。
- [x] 处理重叠片段：同属性后声明优先，不同属性按属性维度继承。
- [x] 处理区间外状态：start 前 from，end 后 to。
- [x] 处理非法脚本：产出 diagnostic，跳过非法片段。

## P2：测试体系

- [x] 增加测试框架和 `pnpm test` 脚本。
- [x] 为 normalize 增加测试。
- [x] 为 resolveState 增加边界测试。
- [x] 覆盖重叠片段后声明优先。
- [x] 覆盖属性级继承。
- [x] 覆盖数字写法等价于默认值到目标值。
- [x] 覆盖区间外 from/to 保持。
- [x] 覆盖非法脚本 warning + 跳过。
- [x] 增加 `pnpm run typecheck`，确保类型问题不会继续潜伏。

## P3：DOM 运行时重构

- [x] 重构 `Parallaxis`，让它只负责 DOM 绑定、播放和清理。
- [x] 把脚本解析从 `Parallaxis` 中移到 core normalize。
- [x] 把每帧求值从 `Parallaxis` 中移到 core resolve。
- [x] 把样式写入独立成 DOM style helper。
- [x] 确保 `disconnect()` 清理 IntersectionObserver 和内部状态。
- [x] 保留旧参数 `beforeSupplement` / `afterSupplement`，但标记 legacy。
- [x] 明确开发环境 warning 输出方式，避免生产环境刷屏。

## P4：React 封装重构

- [x] 新建 `src/react/useParallaxis.ts`，集中管理生命周期。
- [x] 重构 `ScrollParallax`，让组件只负责 ref、children 和 props 转发。
- [x] 修复 props 更新后动画脚本不生效的问题。
- [x] 卸载时调用 `disconnect()`。
- [x] 支持自定义滚动容器。
- [x] 把滚动位置读取抽象成统一输入，兼容 `window` 和自定义容器。
- [x] 修复当前类型错误，去掉不必要的 `any`。
- [x] 将 React / ReactDOM 迁移到 peerDependencies。

## P5：API 增强

- [x] 设计并实现 `timeline` 主 API。
- [x] 将 `timeline` 公开 API 固定为 `range` / `from` / `to` / `easing` 结构。
- [x] 兼容旧 `animationScript` API。
- [x] 支持片段级 `easing`。
- [x] 支持自定义滚动容器。
- [x] 支持滚动轴向：`axis: 'y' | 'x'`。
- [x] 支持 `reducedMotion: 'respect' | 'ignore'`，默认 `respect`。
- [x] 保留 `frameFn` 作为 advanced API，补充文档说明。

## P6：浏览器验证示例升级

- [x] 扩展 `examples/browser`，展示旧 `animationScript` 兼容路径。
- [x] 增加新 timeline API 示例。
- [x] 增加重叠片段后声明优先示例。
- [x] 增加属性级继承示例。
- [x] 增加自定义滚动容器示例。
- [x] 增加横向滚动轴向示例。
- [x] 增加 `prefers-reduced-motion` 或 `reducedMotion` 验证场景。
- [x] 增加 `Grid` 调试位移距离的示例或说明。
- [x] 增加 easing 示例。
- [x] 增加 props 更新验证场景。
- [x] 用浏览器控制台检查 error，确保示例不是只看视觉效果。

## P7：文档和迁移指南

- [x] 更新 README，解释 v2 动画语义。
- [x] 在 README 和迁移指南中明确说明 timeline 表达绝对状态，不表达增量变化。
- [x] 新增 v1 到 v2 迁移指南。
- [x] 文档化旧 `animationScript` 与新 timeline 的对应关系。
- [x] 文档化 legacy 参数。
- [x] 文档化非法脚本 warning 规则。
- [x] 文档化 `container`、`axis`、`reducedMotion` 和 `frameFn`。
- [x] 文档化浏览器验证流程。

## P8：构建与发布整理

- [x] 确认继续提交 `es/` 和 `lib/` 构建产物。
- [x] 检查 `main`、`module`、`types` 和 `exports`。
- [x] 确认 `files` 字段是否覆盖 README、types、样式和示例需要。
- [x] 将版本号更新为 `2.0.0`。
- [x] 在发布前重新构建并验证产物。

## 建议执行顺序

1. 实现 P1 core normalize / resolve / transform。
2. 立刻补 P2 测试，把语义锁住。
3. 再进入 P3 DOM 运行时重构。
4. 然后做 P4 React 封装。
5. 最后做 P5-P8 的能力增强、示例、文档和发布整理。

## 暂不做的事

- 暂不优先改 React 组件。
- 暂不直接重写 `es/` 和 `lib/` 构建产物。
- 暂不做每个属性单独 easing。
- 暂不把 matrix 作为核心业务状态。
