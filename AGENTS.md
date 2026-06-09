用中文回答我。

## 项目概览

这是一个 React 视差滚动动画库。核心能力是把滚动位置映射到动画脚本，再把位移、缩放、旋转、透明度转换为元素样式。

## 重点阅读路径

- `src/index.ts`: 对外导出入口。
- `src/Parallaxis.ts`: 核心运行时类，负责初始化脚本、按滚动进度播放动画、处理 IntersectionObserver。
- `src/lib.ts`: 帧脚本解析、补帧、样式矩阵计算等核心算法。
- `src/components/ScrollParallax.tsx`: React 组件封装。
- `src/components/grid.tsx`: 调试网格组件。
- `src/components/style/grid.less`: 调试网格样式。

## 修改原则

- 优先修改 `src/` 源码。
- 不要直接手改 `es/` 和 `lib/` 产物目录；它们应由构建生成。
- 注意 `npm run build` 会先执行删除脚本，移除 `dist`、`es`、`lib` 后再构建。
- 使用 `pnpm` 管理依赖，`pnpm-lock.yaml` 应提交到仓库；`.pnpm-store/` 是本地缓存，不能提交。
- 当前项目缺少测试体系；改动核心帧计算或 React 生命周期时，要优先补最小验证。
- 视差动画问题优先关注运行时正确性，再考虑性能优化。

## 浏览器验证

- 运行 `pnpm run serve:example` 启动本地示例。
- 示例入口在 `examples/browser/index.html`，实现文件在 `examples/browser/main.tsx`。
- 示例覆盖 `ScrollParallax` 组件封装和 `Parallaxis` 类直接实例化两条路径。
- 验证重点是滚动后元素的 `transform` 和 `opacity` 是否变化，以及浏览器控制台是否有 error。
- 如果只改算法或生命周期，优先用这个示例做一次真实浏览器验证，再补充更细的单元测试。

## 已知风险点

- `ScrollParallax` 的生命周期需要注意 props 更新、事件解绑和 `Parallaxis.disconnect()`。
- `initializeFrameScripts()` 可能产生无效脚本，后续计算需要避免运行时崩溃。
- transform matrix 目前存在继承/组合限制，README 也记录了相关问题。
- 组件库依赖关系需要留意 React 是否应该作为 peer dependency。
