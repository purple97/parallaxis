import { describe, expect, it } from 'vitest';
import { normalizeTimeline } from './normalize';
import { resolveState } from './resolve';

function normalized(input: Parameters<typeof normalizeTimeline>[0]) {
    const result = normalizeTimeline(input);
    expect(result.diagnostics).toEqual([]);
    return result.segments;
}

describe('resolveState', () => {
    it('resolves absolute visual state for a scroll position', () => {
        const segments = normalized({
            range: [0, 500],
            from: { x: 0, opacity: 1 },
            to: { x: 100, opacity: 0.5 },
        });

        expect(resolveState(250, segments)).toMatchObject({
            x: 50,
            opacity: 0.75,
            y: 0,
            scale: 1,
        });
    });

    it('keeps first from before the first range and last to after the last range', () => {
        const segments = normalized({
            range: [100, 500],
            from: { x: 20 },
            to: { x: 100 },
        });

        expect(resolveState(0, segments).x).toBe(20);
        expect(resolveState(700, segments).x).toBe(100);
    });

    it('keeps previous to value between non-overlapping tracks for the same property', () => {
        const segments = normalized([
            {
                range: [0, 500],
                from: { x: 0 },
                to: { x: 100 },
            },
            {
                range: [600, 1000],
                from: { x: 100 },
                to: { x: 300 },
            },
        ]);

        expect(resolveState(250, segments).x).toBe(50);
        expect(resolveState(550, segments).x).toBe(100);
        expect(resolveState(800, segments).x).toBe(200);
    });

    it('lets overlapping segments declared later win for the same property', () => {
        const segments = normalized([
            {
                range: [0, 500],
                from: { x: 0 },
                to: { x: 100 },
            },
            {
                range: [300, 600],
                from: { x: 100 },
                to: { x: 200 },
            },
        ]);

        expect(resolveState(400, segments).x).toBeCloseTo(133.3333333333);
    });

    it('inherits by property so independent tracks can overlap', () => {
        const segments = normalized([
            {
                range: [0, 500],
                from: { x: 0, opacity: 1 },
                to: { x: 100, opacity: 0.5 },
            },
            {
                range: [300, 600],
                from: { y: 0 },
                to: { y: 100 },
            },
        ]);

        expect(resolveState(400, segments)).toMatchObject({
            x: 80,
            y: 33.33333333333333,
            opacity: 0.6,
        });
    });

    it('uses easing per segment', () => {
        const segments = normalized({
            range: [0, 100],
            from: { x: 0 },
            to: { x: 100 },
            easing: 'easeOutCubic',
        });

        expect(resolveState(50, segments).x).toBe(87.5);
    });
});
