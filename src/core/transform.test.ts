import { describe, expect, it } from 'vitest';
import { DEFAULT_VISUAL_STATE } from './defaults';
import { visualStateToStyle, visualStateToTransform } from './transform';

describe('visualStateToTransform', () => {
    it('creates a stable matrix from a complete visual state', () => {
        expect(visualStateToTransform({
            ...DEFAULT_VISUAL_STATE,
            x: 100,
            y: 50,
        })).toBe('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 50, 0, 1)');
    });
});

describe('visualStateToStyle', () => {
    it('maps transform and opacity', () => {
        const style = visualStateToStyle({
            ...DEFAULT_VISUAL_STATE,
            opacity: 0.5,
        });

        expect(style.opacity).toBe(0.5);
        expect(style.transform).toBe('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)');
    });
});
