# Parallaxis v2 设计决策

本文档记录 v2 大版本改造中已经确认的核心语义。后续重构动画求值模型、DOM 运行时、React 封装和浏览器验证时，应优先遵守这里的规则。

## 核心方向

Parallaxis v2 应被设计成“滚动位置到视觉状态的函数”：

```text
visualState = parallaxis(scrollY)
```

也就是说，任意 `scrollY` 都应该能稳定解析出完整、可预测的视觉状态，而不是依赖滚动事件是否刚好经过某一帧。

## 动画脚本语义

动画脚本表达“某个滚动区间内的绝对状态”，不是表达“在上一次状态基础上的增量变化”。

例如：

```js
{ start: 500, x: [100, 300], end: 1000 }
```

含义是：

```text
scrollY 从 500 到 1000 时，x 从 100 变化到 300。
```

它不表示“在之前 x 的基础上再增加一段变化”。

新 `timeline` API 也遵循同样的绝对状态模型：

```js
timeline={[
  {
    range: [0, 500],
    from: { x: 0, opacity: 1 },
    to: { x: 100, opacity: 0.5 },
    easing: 'easeOutCubic'
  },
  {
    range: [300, 600],
    from: { y: 0 },
    to: { y: 100 },
    easing: 'easeOutCubic'
  }
]}
```

这里第二段只声明 `y`，表示 `300 ~ 600` 区间内 `y` 从 `0` 到 `100`。它不会重新定义 `x`，因此 `300 ~ 500` 区间内 `x` 和 `y` 可以同时变化。

如果滚动到 `600` 之后，希望 `x` 和 `y` 在已有位置基础上再移动 `200`，不能写成 `x: [100, 200]`。因为 `[100, 200]` 的含义是“从 `100` 移动到 `200`”，不是“增加 `200`”。

应该写成明确的绝对起点和终点：

```js
timeline={[
  {
    range: [600, 1000],
    from: { x: 100, y: 100, opacity: 0.5 },
    to: { x: 300, y: 300, opacity: 1 },
    easing: 'easeOutCubic'
  }
]}
```

透明度也遵循同一规则。`opacity: [0.5, 0.2]` 表示透明度从 `0.5` 变到 `0.2`，不表示“减少 `0.2`”。

因此 v2 的使用原则是：每个片段描述该滚动区间内由 `from` 到 `to` 的绝对视觉状态；如果想表达“再移动多少”，需要先把它换算成绝对终态再写入脚本。

## 已确认规则

1. 重叠片段：后声明优先。

   当多个片段在同一个滚动位置控制同一个属性时，后声明的片段覆盖前面的片段。这与 CSS cascade 直觉一致。

2. 区间外：`start` 前保持 `from`，`end` 后保持 `to`。

   任意滚动位置都应该有稳定状态。滚动到片段开始前，使用该片段起始值；滚动到片段结束后，使用该片段结束值。

3. 数字写法：永远等价于默认值到目标值，不做上下文推断。

   例如：

   ```js
   { start: 0, x: 100, end: 500 }
   ```

   永远等价于：

   ```js
   { start: 0, x: [0, 100], end: 500 }
   ```

   即使它处在连续动画的后续片段里，也不自动从上一段终点接上。这样能保证同一段脚本在任何上下文中含义一致。

4. 默认状态：使用固定默认值，不读取 DOM transform。

   默认视觉状态为：

   ```js
   {
     x: 0,
     y: 0,
     scale: 1,
     rotate: 0,
     rotateX: 0,
     rotateY: 0,
     rotateZ: 0,
     opacity: 1
   }
   ```

   DOM 当前样式可以作为外层样式存在，但核心动画状态不应依赖 DOM matrix 反解析。

5. 继承粒度：按属性继承，不是整段继承。

   后续片段只覆盖它声明的属性。没有声明的属性继续按已有规则解析和保持。

   例如后段只声明 `x`，不应该导致 `y`、`scale`、`opacity` 等属性丢失。

   对同一个属性的多段非重叠区间，应按属性维度形成分段函数：区间内使用当前 active 片段；如果多个片段同时 active，后声明优先；两个区间之间的空档保持上一段 `to`；第一段之前保持第一段 `from`；最后一段之后保持最后一段 `to`。

6. `beforeSupplement` / `afterSupplement`：保留 legacy，但 v2 内核不依赖。

   补帧是旧模型为了解决滚动事件跳帧的补丁。v2 的完整状态求值应在任意 `scrollY` 下都能给出正确状态，因此核心逻辑不应依赖补帧保证正确性。

7. `easing`：先做片段级 easing。

   第一阶段支持：

   ```js
   { start: 0, x: [0, 100], opacity: [1, 0], easing: 'easeOutCubic', end: 500 }
   ```

   暂不优先支持每个属性单独 easing，避免 v2 第一阶段复杂度过高。

8. 非法脚本：warning + 跳过，不崩页面。

   例如 `end <= start`、非法数组长度、非法属性值等情况，应在开发环境给出 warning，并跳过非法片段。生产环境不应让页面崩溃。

## API 策略

v2 新增 `timeline` 作为主 API。

`timeline` 的第一版公开 API 形状采用 `range` / `from` / `to` / `easing`：

```js
timeline={[
  {
    range: [0, 500],
    from: { x: 0, opacity: 1 },
    to: { x: 100, opacity: 0.5 },
    easing: 'easeOutCubic'
  }
]}
```

其中：

- `range` 表示滚动区间。
- `from` 表示该区间起始处的绝对视觉状态。
- `to` 表示该区间结束处的绝对视觉状态。
- `easing` 表示片段级缓动。

旧 `animationScript` 保留兼容，但标记为 legacy。内部实现应把 `animationScript` normalize 到 v2 timeline，再进入统一的求值流程。

建议后续文档明确：

- 新功能优先围绕 `timeline` 设计。
- `animationScript` 只承担迁移兼容职责。
- README 中应优先展示 `timeline` 示例，再补充旧 API 兼容说明。
- 迁移指南需要说明 `animationScript` 到 `timeline` 的映射关系。

## 容器与调试策略

v2 应立即支持自定义滚动容器，而不是只支持 `window` 滚动。滚动位置的读取应抽象成统一输入，让核心求值模型只接收标准化后的 `scrollX` / `scrollY` 或目标轴向位置。

滚动轴向支持 `axis: 'y' | 'x'`，默认值为 `'y'`。

自定义滚动容器的公开 API 采用 `container`：

```tsx
<ScrollParallax container={containerRef} />
```

原生类也支持：

```ts
new Parallaxis(element, { container })
```

其中 `container` 支持 `HTMLElement`；React 封装支持 `RefObject<HTMLElement>`。

`Grid` 保留，但定位为调试辅助工具。它的价值是帮助使用者观察和校准物体位移距离，不应被当作核心动画 API 的一部分。

## 运行时扩展策略

v2 支持 `prefers-reduced-motion`，默认尊重用户系统设置：

```ts
reducedMotion: 'respect' | 'ignore'
```

默认值为 `'respect'`。当系统设置减少动画时，运行时应避免强制播放完整滚动动画，可以直接取最终状态或使用后续实现中定义的降级策略。

`frameFn` 保留为高级逃逸口，定位为 advanced API。它不参与核心状态求值，只允许使用者在每帧拿到 resolved state 后做额外处理。

## 依赖策略

React / ReactDOM 在 v2 中应迁移到 `peerDependencies`，避免库自身携带 React 版本并与宿主项目产生冲突。

## 版本策略

本次改造明确发布为 `2.0.0`。

原因是 v2 会改变核心动画求值模型、API 主入口和部分边界语义，属于大版本改造。即使保留旧 `animationScript` 兼容入口，也不应把这次发布伪装成 minor 或 patch。

v1 入口行为应尽量兼容，但兼容目标是帮助迁移，不是限制 v2 内核设计。

## 构建产物策略

仓库继续提交 `es/` 和 `lib/` 构建产物。

发布前必须统一重建并验证源码、类型声明和构建产物一致。开发过程中不直接手改 `es/` 和 `lib/`，所有改动先落在 `src/`，再通过构建生成产物。

## 重构优先级提醒

这次大版本改造不要先改 React 组件。应先改动画求值模型：

1. 设计并实现脚本 normalize。
2. 实现 `resolveState(scrollY, timeline)`。
3. 用单元测试固定边界语义。
4. 再重构 DOM 运行时和 React 封装。

React 组件只是外壳，真正决定库是否稳定可用的是任意滚动位置下能否解析出完整视觉状态。
