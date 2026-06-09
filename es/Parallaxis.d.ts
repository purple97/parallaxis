import type { LegacyAnimationInput, NormalizedTimelineSegment, TimelineInput, VisualState } from './core';
import type { FrameStyle } from './lib';
type FrameFunction = (style: FrameStyle, scrollProgress: number, el: HTMLElement, state: VisualState) => FrameStyle | void;
export type ScrollAxis = 'y' | 'x';
export type ReducedMotion = 'respect' | 'ignore';
export type ParallaxisOption = {
    debug?: boolean;
    frameFn?: FrameFunction;
    beforeSupplement?: number;
    afterSupplement?: number;
    animationScript?: LegacyAnimationInput;
    timeline?: TimelineInput;
    transformOrigin?: string;
    duration?: number;
    style?: FrameStyle & Record<string, string | number | undefined>;
    openIntersection?: boolean;
    container?: HTMLElement;
    axis?: ScrollAxis;
    reducedMotion?: ReducedMotion;
};
export default class Parallaxis {
    el: HTMLElement | null;
    isView: boolean;
    frameFn?: FrameFunction;
    option: ParallaxisOption;
    intersectionObserver?: IntersectionObserver;
    segments: NormalizedTimelineSegment[];
    prevState?: VisualState;
    constructor(el: HTMLElement | null, option: ParallaxisOption);
    bindViewport(): void;
    getScrollProgress(): number;
    setStyle(scrollProgress: number): void;
    play(scrollProgress?: number): void;
    disconnect(): void;
    log(...args: unknown[]): void;
}
export {};
