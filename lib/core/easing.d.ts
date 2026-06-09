import type { Easing, EasingFunction, EasingName } from './types';
export declare const easingMap: Record<EasingName, EasingFunction>;
export declare function clampProgress(progress: number): number;
export declare function resolveEasing(easing?: Easing): EasingFunction | undefined;
