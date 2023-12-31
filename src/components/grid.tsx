import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle, useCallback } from 'react';
import './style/grid.less';

function isReact18() {
    return React.version.startsWith('18')
}

/*
* 挂载组件到指定元素
*/
function ReactRender(Component: any, ele: HTMLElement) {
    if (isReact18()) {
        //@ts-ignore
        require('react-dom/client').createRoot(ele).render(Component);
    } else {
        //@ts-ignore
        require('react-dom').default.render(Component, ele);
    }
}


/*
* 网格 和 当前条滚动进度
*/
export const Grid = forwardRef((_props: any, ref: any) => {
    const [top, setTop] = useState(0);
    const [disabled, setDisabled] = useState(false);

    useImperativeHandle(ref, () => ({
        updateValue: (value: number) => {
            setTop(value)
        },
        setDisplay: (v: boolean) => setDisabled(!v)
    }));

    const height = window.innerHeight;
    const middle = height / 2 + top;
    const bottom = height + top - 1;
    const styleWrap = { display: disabled ? 'none' : 'block' }

    return <div className='__ParallaxisGridWrap__' style={styleWrap}>
        <div className='__ParallaxisGridTop__'>
            <b>{top + 20}</b>
        </div>
        <div className='__ParallaxisGridMiddle__'>
            <b>{middle}</b>
        </div>
        <div className='__ParallaxisGridBottom__'>
            <b>{bottom - 20}</b>
        </div>
    </div>
})

/*
* 添加网格组件到body，并监听window滚动事件
*/
export const renderGrid: React.FC<{ container?: HTMLElement }> = (props) => {
    const gridRef = useRef<any>(null);

    const handleScroll = useCallback(() => {
        const scrollTop = props.container ? props.container.scrollTop : window.scrollY;
        gridRef.current?.updateValue(scrollTop)
    }, [gridRef.current, props.container])

    const Component = <Grid ref={gridRef} {...props} />

    useEffect(() => {
        const ele = document.createElement('div');
        ele.className = '__ParallaxisGrid__';
        document.body.appendChild(ele);
        ReactRender(Component, ele)
        window.addEventListener("scroll", handleScroll, { passive: true });

        // window.addEventListener("resize", handleScroll, { passive: true });

        setTimeout(() => {
            handleScroll();
        }, 10);

        return () => {
            document.body.removeChild(ele);
            window.removeEventListener("scroll", handleScroll);
        }
    }, [])

    return null
}

export default renderGrid;
