import * as Rematrix from 'rematrix';
import type { Matrix } from 'rematrix';
type ScriptInfoKeys = 'x' | 'y' | 'opacity' | 'scale' | 'rotate' | 'rotateX' | 'rotateY' | 'rotateZ';
export type FrameInfo = Record<ScriptInfoKeys, number | number[] | undefined>;
export type FrameScriptInfo = FrameInfo & {
    start: number;
    end: number;
};
export type FrameStyle = {
    opacity?: number;
    transform?: string;
    willChange?: string;
    transition?: string;
};
export type ActionScriptInfo = {
    start: number;
    end: number;
    l: number;
    sp: number;
    value: number | number[];
};
export type FrameScripts = {
    _props: FrameScriptInfo;
    start: number;
    end: number;
    le: number;
} & {
    [key in ScriptInfoKeys]?: ActionScriptInfo;
};
export declare function isSameFrameInfo(prevFrameInfo: Record<ScriptInfoKeys, number>, frameInfo: Record<ScriptInfoKeys, number>): boolean;
export declare function isNative(api: any): boolean;
export declare function Float(floatNumber: number, decimal?: number): number;
export declare function analysisFrameScript({ start, sp }: {
    start: number;
    sp: number;
}, progress: number): number;
export declare function getFrameInfo(scrollProgress: number, scriptsMap: FrameScripts[], { beforeSupplement, afterSupplement }: any): Record<ScriptInfoKeys, number>;
export declare function frameScripts(props: FrameScriptInfo): FrameScripts;
export declare function initializeFrameScripts(actionScripts: FrameScriptInfo | FrameScriptInfo[]): Array<FrameScripts | null>;
export declare function transformToMatrix(prevframeInfo: Matrix, frameInfo: Record<ScriptInfoKeys, number>): Rematrix.Matrix;
export declare function setParallaxisStyle(el: any, style: FrameStyle): void;
export {};
