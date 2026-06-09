import {
    normalizeLegacyAnimationScript,
    normalizeTimeline,
    resolveState,
    visualStateToStyle,
} from './core';
import type {
    Diagnostic,
    LegacyAnimationInput,
    NormalizedTimelineSegment,
    TimelineInput,
    VisualState,
} from './core';
import { isNative, isSameFrameInfo, setParallaxisStyle } from './lib';
import type { FrameStyle } from './lib';

type FrameFunction = (
    style: FrameStyle,
    scrollProgress: number,
    el: HTMLElement,
    state: VisualState,
) => FrameStyle | void;

export type ScrollAxis = 'y' | 'x';

export type ReducedMotion = 'respect' | 'ignore';

export type ParallaxisOption = {
    debug?: boolean;
    frameFn?: FrameFunction;
    /** @deprecated v2 core no longer relies on supplement frames. */
    beforeSupplement?: number;
    /** @deprecated v2 core no longer relies on supplement frames. */
    afterSupplement?: number;
    /** @deprecated Use timeline as the primary v2 API. */
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

const defaultOption: Required<Pick<
    ParallaxisOption,
    'duration' | 'transformOrigin' | 'style' | 'openIntersection' | 'debug' | 'axis' | 'reducedMotion'
>> = {
    duration: 0.1,
    transformOrigin: 'center',
    style: { willChange: 'transform' },
    openIntersection: false,
    debug: false,
    axis: 'y',
    reducedMotion: 'respect',
};

function shouldReduceMotion(option: ParallaxisOption): boolean {
    if (option.reducedMotion === 'ignore') return false;
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getWindowScroll(axis: ScrollAxis): number {
    return axis === 'x'
        ? window.scrollX || window.pageXOffset || 0
        : window.scrollY || window.pageYOffset || 0;
}

function getContainerScroll(container: HTMLElement, axis: ScrollAxis): number {
    return axis === 'x' ? container.scrollLeft : container.scrollTop;
}

function getFinalScrollProgress(segments: NormalizedTimelineSegment[]): number {
    return segments.reduce((max, segment) => Math.max(max, segment.range[1]), 0);
}

function warnDiagnostics(diagnostics: Diagnostic[], debug?: boolean) {
    if (!debug || diagnostics.length === 0) return;
    diagnostics.forEach((diagnostic) => {
        console.warn(`[parallaxis] ${diagnostic.message}`, diagnostic);
    });
}

/*
* Parallaxis 视差动画类
*/
export default class Parallaxis {
    el: HTMLElement | null;
    isView: boolean;
    frameFn?: FrameFunction;
    option: ParallaxisOption;
    intersectionObserver?: IntersectionObserver;
    segments: NormalizedTimelineSegment[];
    prevState?: VisualState;

    constructor(el: HTMLElement | null, option: ParallaxisOption) {
        this.el = el;
        this.option = {
            ...defaultOption,
            ...option,
            style: {
                ...defaultOption.style,
                ...option.style,
            },
        };
        this.option.style = {
            ...this.option.style,
            transition: `all ${this.option.duration}s linear`,
        };
        this.isView = this.option.openIntersection ? false : true;
        this.frameFn = this.option.frameFn;
        this.segments = [];

        if (!this.el) return;

        if (this.option.style) {
            setParallaxisStyle(this.el, this.option.style);
        }

        const normalizeResult = this.option.timeline
            ? normalizeTimeline(this.option.timeline)
            : this.option.animationScript
                ? normalizeLegacyAnimationScript(this.option.animationScript)
                : null;

        if (!normalizeResult) {
            console.error('缺少参数: timeline 或 animationScript');
            return;
        }

        this.segments = normalizeResult.segments;
        warnDiagnostics(normalizeResult.diagnostics, this.option.debug);

        if (this.option.openIntersection && isNative(IntersectionObserver)) {
            this.bindViewport();
        } else {
            this.isView = true;
        }
    }

    bindViewport() {
        if (!this.el) return;
        this.intersectionObserver = new IntersectionObserver((entries) => {
            this.isView = entries[0].intersectionRatio > 0;
        });
        this.intersectionObserver.observe(this.el);
    }

    getScrollProgress(): number {
        const axis = this.option.axis ?? 'y';
        if (this.option.container) return getContainerScroll(this.option.container, axis);
        return getWindowScroll(axis);
    }

    setStyle(scrollProgress: number) {
        if (!this.el || this.segments.length === 0) return;

        const progress = shouldReduceMotion(this.option)
            ? getFinalScrollProgress(this.segments)
            : scrollProgress;
        const state = resolveState(progress, this.segments);

        if (this.prevState && isSameFrameInfo(this.prevState, state)) {
            this.log(this.prevState, state);
            return;
        }

        this.prevState = state;
        const baseStyle = visualStateToStyle(state);
        const style = this.frameFn?.(baseStyle, progress, this.el, state) || baseStyle;

        this.log(progress, state);
        setParallaxisStyle(this.el, style);
    }

    play(scrollProgress = this.getScrollProgress()) {
        if (this.isView) this.setStyle(Math.round(scrollProgress));
    }

    disconnect() {
        if (this.el) this.el.style.willChange = 'auto';
        this.intersectionObserver?.disconnect();
        this.intersectionObserver = undefined;
        this.prevState = undefined;
        this.segments = [];
        this.frameFn = undefined;
        this.el = null;
    }

    log(...args: unknown[]) {
        if (this.option.debug) console.log(...args);
    }
}
