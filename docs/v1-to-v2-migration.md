# v1 到 v2 迁移指南

v2 是一次大版本改造。核心变化是：新主 API 从 `animationScript` 切换到 `timeline`，动画求值模型从“滚动事件驱动的片段计算”改为“滚动位置到视觉状态的纯函数”。

```text
visualState = parallaxis(scrollY)
```

## 主 API 变化

v1 / legacy:

```tsx
<ScrollParallax
    animationScript={[
        { start: 0, x: [0, 100], opacity: [1, 0.5], end: 500 },
    ]}
>
    <div />
</ScrollParallax>
```

v2:

```tsx
<ScrollParallax
    timeline={[
        {
            range: [0, 500],
            from: { x: 0, opacity: 1 },
            to: { x: 100, opacity: 0.5 },
        },
    ]}
>
    <div />
</ScrollParallax>
```

## 绝对状态，不是增量变化

`timeline` 表达滚动区间内的绝对视觉状态。

```tsx
{
    range: [600, 1000],
    from: { x: 100 },
    to: { x: 300 },
}
```

这表示 `x` 从 `100` 到 `300`，不是“增加 300”。

如果上一段结束时 `x = 100`，你想再移动 `200`，应该写 `to: { x: 300 }`。

## 数字写法

legacy `animationScript` 中：

```ts
{ start: 0, x: 100, end: 500 }
```

仍然等价于：

```ts
{ start: 0, x: [0, 100], end: 500 }
```

它不会根据上一段自动推断起点。

## 重叠片段

同一个属性在同一个滚动位置被多个片段控制时，后声明优先。

```tsx
timeline={[
    {
        range: [0, 500],
        from: { x: 0 },
        to: { x: 100 },
    },
    {
        range: [300, 600],
        from: { x: 100 },
        to: { x: 200 },
    },
]}
```

`300 ~ 500` 内，第二段的 `x` 会覆盖第一段的 `x`。

## 属性级继承

后段只覆盖自己声明的属性。

```tsx
timeline={[
    {
        range: [0, 500],
        from: { x: 0, opacity: 1 },
        to: { x: 100, opacity: 0.5 },
    },
    {
        range: [300, 600],
        from: { y: 0 },
        to: { y: 100 },
    },
]}
```

`300 ~ 500` 内，`x`、`opacity` 和 `y` 会一起生效。第二段不会因为只声明 `y` 而清掉第一段的 `x` 或 `opacity`。

## 区间外状态

同一个属性按分段函数求值：

- 第一段之前保持第一段的 `from`。
- 最后一段之后保持最后一段的 `to`。
- 两段非重叠区间之间保持上一段的 `to`。
- 多段重叠时，同属性后声明优先。

## Legacy 参数

`animationScript`、`beforeSupplement`、`afterSupplement` 都保留兼容，但属于 legacy。

v2 core 不依赖 `beforeSupplement` / `afterSupplement` 来避免跳帧，因为任意滚动位置都可以直接解析出完整状态。

## 新能力

v2 增加：

- `timeline`
- `container`
- `axis: 'y' | 'x'`
- `reducedMotion: 'respect' | 'ignore'`
- 片段级 `easing`
- 可独立测试的 core normalize / resolve / transform

## 非法脚本

非法片段会产生 diagnostic 并被跳过，不应让页面崩溃。

常见非法情况：

- `range` 或 legacy `start/end` 非法。
- `end <= start`。
- 属性值不是有限数字。
- 片段没有声明任何可动画属性。
- easing 名称未知。

开发时可以打开 `debug` 查看 warning。
