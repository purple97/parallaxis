import * as Rematrix from 'rematrix'
import type { Matrix } from 'rematrix'


type ScriptInfoKeys = 'x' | 'y' | 'opacity' | 'scale' | 'rotate' | 'rotateX' | 'rotateY' | 'rotateZ'

export type FrameInfo = Record<ScriptInfoKeys, number | number[] | undefined>

export type FrameScriptInfo = FrameInfo & {
    start: number;
    end: number
}

export type FrameStyle = {
    opacity?: number;
    transform?: string;
    willChange?: string;
    transition?: string;
}

export type ActionScriptInfo = {
    start: number;
    end: number;
    l: number;
    sp: number;
    value: number | number[];
}


export type FrameScripts = {
    _props: FrameScriptInfo;
    start: number;
    end: number;
    le: number;
} & {
    [key in ScriptInfoKeys]?: ActionScriptInfo;
}

const styleKeys: ScriptInfoKeys[] = [
    'x', 'y', 'opacity', 'scale', 'rotate', 'rotateX', 'rotateY', 'rotateZ'
]

//判断两个对象是否相等
export function isSameFrameInfo(prevFrameInfo: Record<ScriptInfoKeys, number>, frameInfo: Record<ScriptInfoKeys, number>): boolean {
    if (!prevFrameInfo || !frameInfo) return false;
    if (Object.keys(prevFrameInfo).length !== Object.keys(frameInfo).length) return false;
    return styleKeys.every(k => prevFrameInfo[k] === frameInfo[k]);
}

//判断是否支持该api
export function isNative(api: any) {
    return typeof api === 'function' && /native code/.test(api.toString());
}

export function Float(floatNumber: number, decimal = 100) {
    return Math.round(floatNumber * decimal) / decimal;
}

export function analysisFrameScript({ start, sp }: { start: number, sp: number }, progress: number) {
    return start + progress * sp
}

export function getFrameInfo(scrollProgress: number, scriptsMap: FrameScripts[], {
    beforeSupplement = 0,
    afterSupplement = 20
}: { beforeSupplement?: number; afterSupplement?: number }): Record<ScriptInfoKeys, number> {
    const frameInfo = {} as Record<ScriptInfoKeys, number>

    scriptsMap.forEach((item: FrameScripts) => {
        if (item.start <= scrollProgress && scrollProgress <= item.end) {
            const progress = scrollProgress - item.start;
            styleKeys.forEach(key => {
                if (item[key]) frameInfo[key] = analysisFrameScript(item[key] as ActionScriptInfo, progress);
            });
        } else {
            handleSupplement(scrollProgress, item, beforeSupplement, afterSupplement, frameInfo);
        }
    })
    return frameInfo
}


function handleSupplement(scrollProgress: number, item: FrameScripts, beforeSupplement: number, afterSupplement: number, frameInfo: Record<ScriptInfoKeys, number>) {
    if (beforeSupplement > 0 && scrollProgress < item.start && scrollProgress >= item.start - beforeSupplement) {
        styleKeys.forEach(key => {
            if (item[key]) frameInfo[key] = (item[key] as ActionScriptInfo).start;
        });
    } else if (afterSupplement > 0 && scrollProgress > item.end && scrollProgress <= item.end + afterSupplement) {
        styleKeys.forEach(key => {
            if (item[key]) frameInfo[key] = (item[key] as ActionScriptInfo).end;
        });
    }
}


function formatScriptInfo(data: number | Array<number>, le: number): ActionScriptInfo {
    const obj: ActionScriptInfo = {
        start: 0,
        end: 0,
        l: 0,
        sp: 0,
        value: data
    };

    if (Array.isArray(data)) {
        obj.start = data[0]
        obj.end = data[1]
        obj.l = data[1] - data[0]
        obj.sp = (data[1] - data[0]) / le
    } else if (typeof data == 'number') {
        obj.start = 0
        obj.end = data
        obj.l = data - 0
        obj.sp = data / le
    }

    return obj
}

export function frameScripts(props: FrameScriptInfo): FrameScripts | null {
    const { start, end } = props;
    if (end <= start) return null
    const le = end - start;
    const script: FrameScripts = {
        _props: props,
        start: props.start,
        end: props.end,
        le,
    };

    styleKeys.forEach((key: string) => {
        if (props[key as ScriptInfoKeys] !== undefined) {
            script[key as ScriptInfoKeys] = formatScriptInfo(props[key as ScriptInfoKeys] as number | Array<number>, le);
        }
    })
    return script
}

export function initializeFrameScripts(actionScripts: FrameScriptInfo | FrameScriptInfo[]): Array<FrameScripts | null> {
    return Array.isArray(actionScripts) ? actionScripts.map(frameScripts) : [frameScripts(actionScripts)];
}

/*
* 常规 transform 效果转 matrix 矩阵
*/
//TODO: 目前无法继承之前的matrix
export function transformToMatrix(prevframeInfo: Matrix, frameInfo: Record<ScriptInfoKeys, number>) {
    if (frameInfo) {
        const matrixArray = []
        let { x, y, scale, rotate, rotateX, rotateY, rotateZ } = frameInfo;

        if (x != undefined) matrixArray.push(Rematrix.translateX(x))
        if (y != undefined) matrixArray.push(Rematrix.translateY(y))
        if (scale != undefined && scale >= 0) matrixArray.push(Rematrix.scale(scale))
        if (rotate != undefined && rotate != 0) matrixArray.push(Rematrix.rotate(rotate))
        if (rotateX != undefined && rotateX != 0) matrixArray.push(Rematrix.rotateX(rotateX))
        if (rotateY != undefined && rotateY != 0) matrixArray.push(Rematrix.rotateY(rotateY))
        if (rotateZ != undefined && rotateZ != 0) matrixArray.push(Rematrix.rotateZ(rotateZ))

        if (matrixArray.length > 0) {
            let matrix = matrixArray.reduce(Rematrix.multiply)
            return matrix.map(n => Float(n, 100)) as Rematrix.Matrix3D
        }
    }
    return prevframeInfo
}


export function setParallaxisStyle(el: any, style: FrameStyle) {
    for (let key in style) {
        el.style.setProperty(key, style[key as keyof FrameStyle])
    }
}
