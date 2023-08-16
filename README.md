# Parallax 视差动画库
- 滚动视差库
- React组件 "ScrollParallax" 通过滚动进度来实现视差

## ScrollParallax 快速上手


```js

import { ScrollParallax, Grid } from 'parallax'

const animationScript = [
    { start: 200, x: 1000, y: 1000, end: 2000 },
    { start: 800, opacity: [1, 0.3], scale: [1, 1.3], end: 2400 },
    { start: 1200, rotate: [0, 120], end: 2000 },
    { start: 2000, x: [1000, 400], y: [1000, 1600], rotate: [120, 360], end: 2400 },
]

const app = ()=>{
    return <>
        {/* 显示标尺 */}
        <Grid/>

        <div className='parallax-box' style={{ height:3000, widht:'100vw', position:'relative' }}>
            <div style={{ width: 400, height: 200, position: 'relative', top: 800 }}>
                <ScrollParallax animationScript={animationScript} debug={false}>
                    <h1>Parallaxis.js</h1>
                </ScrollParallax>
            </div>
        </div>
    </>
}
```

## 参数

- animationScript， 动画脚本
- frameFn， 每帧执行前的回调函数，可以style修改并返回,  (element, style, scrollProgress) => style
- debug， debug模式，打印每帧参数
- beforeSupplement, 前追加帧，用来解决跳帧问题，默认0
- afterSupplement, 后追加帧，用来解决跳帧问题，默认20 【注意这里默认值】

## 问题
- 跳帧，由于滚动条监听的频率导致进度数值 刚好 跳过动画结束（或切换）的那几帧，导致无法精确执行那几帧效果;
    - 例如上面的例子中，需要在从2000~2400旋转到360度，有可能跳帧导致滚动条已经在2450的位置 但是才350度。
- 效果继承问题，原因：效果计算后得到图形矩阵matrix，但是目前不支持matrix和常规效果互转。 有望修复
```js
//例子
const animationScript = [
    { start: 200, x: 1000, y: 1000, end: 2000 }, // 从200到2000，过程中x移动到1000，y移动到1000
    { start: 1200, rotate: [0, 120], end: 2400 },// 如果这个或后面没设置 x，y的值，会导致2000~2400的400帧里丢失x和y
    { start: 2000, x:[1000, 600], y:[1000, 1600], end:2400}  // 这里需要补后面那400帧 x和y的动效
]
```