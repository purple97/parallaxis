import type { FrameScriptInfo } from './lib';
type FrameFunction = (style: any, scrollProgress: number, el: HTMLElement) => any;
type OpstionType = {
    debug: boolean;
    frameFn?: FrameFunction;
    beforeSupplement?: number;
    afterSupplement?: number;
    animationScript?: FrameScriptInfo | FrameScriptInfo[];
    transformOrigin?: string;
    duration?: number;
    style?: any;
    openIntersection: boolean;
};
export default class Parallaxis {
    el: any;
    isView: boolean;
    frameFn?: FrameFunction;
    opstion?: OpstionType;
    intersectionObserver?: IntersectionObserver;
    constructor(el: HTMLElement | null, opstion: OpstionType);
    bindViewport(): void;
    setStyle(scrollProgress: number): void;
    play(scrollProgress: number): void;
    disconnect(): void;
    log(...args: any[]): void;
}
export {};
