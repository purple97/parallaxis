import * as Rematrix from 'rematrix';
import type { FrameStyle } from '../lib';
import type { VisualState } from './types';

function float(value: number, decimal = 100): number {
    return Math.round(value * decimal) / decimal;
}

export function visualStateToTransform(state: VisualState): string {
    const matrix = [
        Rematrix.translateX(state.x),
        Rematrix.translateY(state.y),
        Rematrix.scale(state.scale),
        Rematrix.rotate(state.rotate),
        Rematrix.rotateX(state.rotateX),
        Rematrix.rotateY(state.rotateY),
        Rematrix.rotateZ(state.rotateZ),
    ].reduce(Rematrix.multiply);

    return Rematrix.toString(matrix.map((value) => float(value)) as Rematrix.Matrix3D);
}

export function visualStateToStyle(state: VisualState): FrameStyle {
    return {
        transform: visualStateToTransform(state),
        opacity: state.opacity,
    };
}
