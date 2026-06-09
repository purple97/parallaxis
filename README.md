# Parallaxis

React 滚动视差库。v2 以 `timeline` 作为主 API，把动画定义为“滚动位置到视觉状态”的函数。

```text
visualState = parallaxis(scrollY)
```

这意味着任意滚动位置都应该能解析出稳定、完整、可预测的视觉状态，而不是依赖滚动事件是否刚好经过某一帧。

## 安装

```bash
pnpm add parallaxis
```

`react` 和 `react-dom` 是 peer dependencies，宿主项目需要自行安装 React 18 或更高版本。

## 快速上手

```tsx
import { ScrollParallax, Grid } from 'parallaxis';

export function App() {
    return (
        <>
            <Grid />

            <ScrollParallax
                timeline={[
                    {
                        range: [0, 500],
                        from: { x: 0, opacity: 1 },
                        to: { x: 100, opacity: 0.5 },
                        easing: 'easeOutCubic',
                    },
                    {
                        range: [300, 600],
                        from: { y: 0 },
                        to: { y: 100 },
                    },
                ]}
            >
                <h1>Parallaxis</h1>
            </ScrollParallax>
        </>
    );
}
```

## Timeline 语义

`timeline` 表达某个滚动区间内的绝对视觉状态，不表达“在上一段基础上增加多少”。

```tsx
timeline={[
    {
        range: [600, 1000],
        from: { x: 100, y: 100, opacity: 0.5 },
        to: { x: 300, y: 300, opacity: 1 },
    },
]}
```

上面表示：

- `x` 从 `100` 移动到 `300`
- `y` 从 `100` 移动到 `300`
- `opacity` 从 `0.5` 变到 `1`

如果你想表达“在已有位置上再移动 200”，需要自己换算成绝对终态。也就是说，当前 `x = 100` 时，再移动 `200` 应写成 `to: { x: 300 }`，不是 `x: [100, 200]`。

## Timeline 字段

```ts
type TimelineSegment = {
    range: [number, number];
    from?: PartialVisualState;
    to: PartialVisualState;
    easing?: EasingName | ((progress: number) => number);
};
```

- `range`：滚动区间。
- `from`：该区间起始处的绝对视觉状态。
- `to`：该区间结束处的绝对视觉状态。
- `easing`：片段级缓动，默认 `linear`。

支持的视觉属性：

- `x`
- `y`
- `opacity`
- `scale`
- `rotate`
- `rotateX`
- `rotateY`
- `rotateZ`

默认视觉状态：

```ts
{
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
}
```

## 重叠与继承

多个片段可以重叠。规则是：

- 同一个属性在同一个滚动位置被多个片段控制时，后声明的片段优先。
- 不同属性按属性维度继承，后段只声明 `y` 不会覆盖前段的 `x`。
- 同一个属性的两个非重叠区间之间，会保持上一段的 `to`。
- 第一段之前保持第一段的 `from`，最后一段之后保持最后一段的 `to`。

## ScrollParallax 参数

```tsx
<ScrollParallax
    timeline={timeline}
    container={containerRef}
    axis="y"
    reducedMotion="respect"
    debug={false}
    frameFn={(style, scrollProgress, element, state) => style}
>
    <div />
</ScrollParallax>
```

- `timeline`：v2 主 API。
- `animationScript`：legacy API，兼容旧版本。
- `container`：自定义滚动容器，支持 `HTMLElement` 或 `RefObject<HTMLElement>`。
- `axis`：滚动轴向，`'y' | 'x'`，默认 `'y'`。
- `reducedMotion`：`'respect' | 'ignore'`，默认 `'respect'`。
- `frameFn`：高级逃逸口，可在每帧拿到 resolved state 后修改最终样式。
- `debug`：开启调试日志。
- `beforeSupplement` / `afterSupplement`：legacy 参数，v2 core 不依赖补帧。

## 原生类

```ts
import { Parallaxis } from 'parallaxis';

const instance = new Parallaxis(element, {
    timeline: [
        {
            range: [0, 500],
            from: { x: 0 },
            to: { x: 100 },
        },
    ],
});

window.addEventListener('scroll', () => {
    instance.play();
});
```

销毁时调用：

```ts
instance.disconnect();
```

## Grid

`Grid` 是调试辅助工具，用于观察滚动位置和校准位移距离。

```tsx
import { Grid } from 'parallaxis';

<Grid />;
```

它不是核心动画 API。

## Legacy animationScript

旧 API 仍然兼容：

```tsx
<ScrollParallax
    animationScript={[
        { start: 0, x: [0, 100], opacity: [1, 0.5], end: 500 },
    ]}
>
    <div />
</ScrollParallax>
```

v2 内部会把 `animationScript` normalize 到 `timeline` 再执行。新功能优先使用 `timeline`。

迁移细节见 [docs/v1-to-v2-migration.md](docs/v1-to-v2-migration.md)。

## 浏览器验证

```bash
pnpm install
pnpm run serve:example
```

默认地址：

```text
http://127.0.0.1:5173/
```

验证页位置：

- `examples/browser/index.html`
- `examples/browser/main.tsx`
- `examples/browser/styles.css`

验证重点：

- `timeline` 是否产生正确的 `transform` 和 `opacity`。
- legacy `animationScript` 是否仍然兼容。
- 自定义滚动容器是否读取容器滚动进度。
- `axis="x"` 是否读取横向滚动。
- props 更新后动画实例是否重新生效。
- `Grid` 是否能辅助观察滚动位置。
- 浏览器控制台是否存在 error。

## 开发

```bash
pnpm install
pnpm test
pnpm run typecheck
pnpm run build
```
