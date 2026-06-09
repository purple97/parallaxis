import { describe, expect, it } from 'vitest';
import { normalizeLegacyAnimationScript, normalizeTimeline } from './normalize';

describe('normalizeTimeline', () => {
    it('normalizes range/from/to/easing timeline segments', () => {
        const result = normalizeTimeline({
            range: [0, 500],
            from: { x: 10, opacity: 1 },
            to: { x: 100, opacity: 0.5 },
            easing: 'easeOutCubic',
        });

        expect(result.diagnostics).toEqual([]);
        expect(result.segments).toHaveLength(1);
        expect(result.segments[0].range).toEqual([0, 500]);
        expect(result.segments[0].tracks).toEqual([
            { property: 'x', from: 10, to: 100 },
            { property: 'opacity', from: 1, to: 0.5 },
        ]);
    });

    it('uses fixed defaults when from does not declare a property', () => {
        const result = normalizeTimeline({
            range: [0, 500],
            to: { x: 100, scale: 2 },
        });

        expect(result.diagnostics).toEqual([]);
        expect(result.segments[0].tracks).toEqual([
            { property: 'x', from: 0, to: 100 },
            { property: 'scale', from: 1, to: 2 },
        ]);
    });

    it('skips invalid segments and returns diagnostics', () => {
        const result = normalizeTimeline([
            {
                range: [100, 0],
                to: { x: 100 },
            },
            {
                range: [0, 100],
                to: {},
            },
        ]);

        expect(result.segments).toEqual([]);
        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
            'INVALID_RANGE',
            'EMPTY_SEGMENT',
        ]);
    });
});

describe('normalizeLegacyAnimationScript', () => {
    it('maps numeric values to default-to-target tracks', () => {
        const result = normalizeLegacyAnimationScript({
            start: 0,
            end: 500,
            x: 100,
            opacity: [1, 0.5],
        });

        expect(result.diagnostics).toEqual([]);
        expect(result.segments[0].range).toEqual([0, 500]);
        expect(result.segments[0].tracks).toEqual([
            { property: 'x', from: 0, to: 100 },
            { property: 'opacity', from: 1, to: 0.5 },
        ]);
    });
});
