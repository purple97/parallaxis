import type { MotionProperty, VisualState } from './types';

export const MOTION_PROPERTIES: MotionProperty[] = [
    'x',
    'y',
    'opacity',
    'scale',
    'rotate',
    'rotateX',
    'rotateY',
    'rotateZ',
];

export const DEFAULT_VISUAL_STATE: VisualState = {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
};

export function createDefaultVisualState(): VisualState {
    return { ...DEFAULT_VISUAL_STATE };
}
