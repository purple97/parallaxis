
import { initializeFrameScripts, setParallaxisStyle, getFrameInfo, transformToMatrix, isSameFrameInfo, isNative } from './lib'
import type { FrameScriptInfo } from './lib'
import * as Rematrix from 'rematrix'

type FrameFunction = (style: any, scrollProgress: number, el: HTMLElement) => any

type OpstionType = {
    debug: boolean;
    frameFn?: FrameFunction; // 每帧回调
    beforeSupplement?: number; // 前补帧，默认0
    afterSupplement?: number; // 后补帧，默认20
    // initialStyle?: FrameScriptInfo;
    // endStyle?: FrameScriptInfo;
    animationScript?: FrameScriptInfo | FrameScriptInfo[]; //必传，动画脚本
    transformOrigin?: string; // 旋转中心
    duration?: number; // 动画过度时长，默认0.1，建议0.1~0.3
    style?: any;
    openIntersection: boolean; //false, 开启后会在元素进入视口后才会执行动画，但是离开视口后不会执行动画。飞入飞出效果需要注意
}

function getElementMatrix(el: any) {
    const oldStyle = window.getComputedStyle(el).getPropertyValue('transform');
    const matrixStyle = Rematrix.fromString(oldStyle);
    return matrixStyle
}

/* 
* Parallaxis 视差动画类
* @param {HTMLElement} el , 绑定动画的元素
* @param {Object} opstion, 参数
*   {
*    debug: boolean;
*    frameFn?: FrameFunction; // 每帧回调
*    beforeSupplement?: number; // 前补帧，默认0
*    afterSupplement?: number; // 后补帧，默认20
*    animationScript: FrameScriptInfo | FrameScriptInfo[]; //必传，动画脚本
*    transformOrigin?: string; // 旋转中心
*    duration?: number; // 动画过度时长，默认0.1，建议0.1~0.3
*   }
*/
export default class Parallaxis {
    el: any;
    isView: boolean;
    frameFn?: FrameFunction;
    opstion?: OpstionType;
    intersectionObserver?: IntersectionObserver;
    constructor(
        el: HTMLElement | null,
        opstion: OpstionType
    ) {
        const defaultOpstion: OpstionType = {
            duration: 0.1,
            transformOrigin: 'center',
            style: {
                willChange: 'transform'
            },
            openIntersection: false,
            debug: false,
            animationScript: undefined
        }

        this.el = el;
        this.opstion = Object.assign(defaultOpstion, opstion);
        defaultOpstion.style.transition = `all ${defaultOpstion.duration}s linear`;
        this.isView = this.opstion.openIntersection ?? true;
        // this.el.style.transform = 'translate3d(0px,0px,0px)'; //开启显卡3d加速
        if (this.opstion.style) {
            setParallaxisStyle(this.el, this.opstion.style);
        }
        if (opstion.animationScript) {
            // 初始化动画脚本
            this.el._animationScript = initializeFrameScripts(opstion.animationScript)
            this.frameFn = opstion?.frameFn
            // this.log(this.el._animationScript)

            // 判断是否支持IntersectionObserver
            if (this.opstion.openIntersection && isNative(IntersectionObserver)) {
                this.bindViewport()
            } else {
                this.isView = true;
            }
        } else {
            console.error('缺少参数:animationScript')
        }

    }

    bindViewport() {
        this.intersectionObserver = new IntersectionObserver((entries) => {
            this.isView = entries[0].intersectionRatio > 0
        });
        this.intersectionObserver.observe(this.el);
    }

    setStyle(scrollProgress: number) {
        const currentStyle = window.getComputedStyle(this.el, null)
        /* 获取当前进度的帧信息 */
        const frameInfo = getFrameInfo(scrollProgress, this.el._animationScript, this.opstion)
        // 和上一帧动画内容相同,跳出;
        if (isSameFrameInfo(this.el.frameInfo, frameInfo)) {
            this.log(this.el.frameInfo, frameInfo)
            return;
        }

        if (Object.keys(frameInfo).length > 0) {
            this.el.frameInfo = frameInfo
            const currentMatrix = getElementMatrix(this.el);
            const matrix = transformToMatrix(currentMatrix, frameInfo)
            // console.log(frameInfo)
            let style = {
                transform: Rematrix.toString(matrix),
                opacity: frameInfo.opacity !== undefined ? frameInfo.opacity : Number(currentStyle.getPropertyValue('opacity'))
            }
            this.log(scrollProgress, frameInfo)
            if (this.frameFn) {
                style = this.frameFn(style, scrollProgress, this.el) || style
            }
            //
            if (style) {
                setParallaxisStyle(this.el, style);
            }
        }

    }

    play(scrollProgress: number) {
        if (this.isView) this.setStyle(Math.round(scrollProgress));
    }

    disconnect() {
        this.el.style.willChange = "auto";
        this.intersectionObserver?.disconnect()
    }

    log(...args: any[]) {
        if (this.opstion?.debug) console.log(...args)
    }

}