import type { Easing, EasingFunction, EasingName } from './types';

export const easingMap: Record<EasingName, EasingFunction> = {
    linear: (progress: number) => progress,
    easeInQuad: (progress: number) => progress * progress,
    easeOutQuad: (progress: number) => 1 - (1 - progress) * (1 - progress),
    easeInOutQuad: (progress: number) => progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2,
    easeInCubic: (progress: number) => progress * progress * progress,
    easeOutCubic: (progress: number) => 1 - Math.pow(1 - progress, 3),
    easeInOutCubic: (progress: number) => progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2,
};

export function clampProgress(progress: number): number {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    return progress;
}

export function resolveEasing(easing?: Easing): EasingFunction | undefined {
    if (!easing) return easingMap.linear;
    if (typeof easing === 'function') return easing;
    return easingMap[easing];
}
