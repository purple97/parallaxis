import { DEFAULT_VISUAL_STATE, MOTION_PROPERTIES } from './defaults';
import { resolveEasing } from './easing';
import type {
    Diagnostic,
    LegacyAnimationInput,
    LegacyAnimationSegment,
    LegacyValue,
    MotionProperty,
    NormalizedTimelineSegment,
    NormalizeResult,
    PartialVisualState,
    TimelineInput,
    TimelineSegment,
} from './types';

function toArray<T>(input: T | T[]): T[] {
    return Array.isArray(input) ? input : [input];
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function createDiagnostic(
    code: Diagnostic['code'],
    message: string,
    segmentIndex: number,
    property?: MotionProperty,
): Diagnostic {
    return {
        level: 'warning',
        code,
        message,
        segmentIndex,
        property,
    };
}

function readStateValue(
    state: PartialVisualState | undefined,
    property: MotionProperty,
): number | undefined {
    const value = state?.[property];
    return isFiniteNumber(value) ? value : undefined;
}

function normalizeSegment(
    segment: TimelineSegment,
    index: number,
    diagnostics: Diagnostic[],
): NormalizedTimelineSegment | null {
    const [start, end] = segment.range;

    if (!isFiniteNumber(start) || !isFiniteNumber(end) || end <= start) {
        diagnostics.push(createDiagnostic(
            'INVALID_RANGE',
            `Invalid timeline range at segment ${index}.`,
            index,
        ));
        return null;
    }

    const easing = resolveEasing(segment.easing);
    if (!easing) {
        diagnostics.push(createDiagnostic(
            'UNKNOWN_EASING',
            `Unknown easing at segment ${index}.`,
            index,
        ));
        return null;
    }

    const tracks = MOTION_PROPERTIES.reduce<NormalizedTimelineSegment['tracks']>((result, property) => {
        const toValue = readStateValue(segment.to, property);
        const fromValue = readStateValue(segment.from, property);

        if (segment.to[property] !== undefined && toValue === undefined) {
            diagnostics.push(createDiagnostic(
                'INVALID_STATE',
                `Invalid to.${property} value at segment ${index}.`,
                index,
                property,
            ));
            return result;
        }

        if (segment.from?.[property] !== undefined && fromValue === undefined) {
            diagnostics.push(createDiagnostic(
                'INVALID_STATE',
                `Invalid from.${property} value at segment ${index}.`,
                index,
                property,
            ));
            return result;
        }

        if (toValue !== undefined) {
            result.push({
                property,
                from: fromValue ?? DEFAULT_VISUAL_STATE[property],
                to: toValue,
            });
        }

        return result;
    }, []);

    if (tracks.length === 0) {
        diagnostics.push(createDiagnostic(
            'EMPTY_SEGMENT',
            `Timeline segment ${index} does not declare any motion property.`,
            index,
        ));
        return null;
    }

    return {
        index,
        range: [start, end],
        easing,
        tracks,
    };
}

export function normalizeTimeline(input: TimelineInput): NormalizeResult {
    const diagnostics: Diagnostic[] = [];
    const segments = toArray(input).reduce<NormalizedTimelineSegment[]>((result, segment, index) => {
        const normalizedSegment = normalizeSegment(segment, index, diagnostics);
        if (normalizedSegment) result.push(normalizedSegment);
        return result;
    }, []);

    return {
        segments,
        diagnostics,
    };
}

function normalizeLegacyValue(value: LegacyValue): [number, number] | null {
    if (isFiniteNumber(value)) return [0, value];
    if (
        Array.isArray(value)
        && value.length === 2
        && isFiniteNumber(value[0])
        && isFiniteNumber(value[1])
    ) {
        return [value[0], value[1]];
    }
    return null;
}

function legacyToTimelineSegment(
    segment: LegacyAnimationSegment,
): TimelineSegment {
    const from: PartialVisualState = {};
    const to: PartialVisualState = {};

    MOTION_PROPERTIES.forEach((property) => {
        const value = segment[property];
        if (value === undefined) return;

        const normalizedValue = normalizeLegacyValue(value);
        if (!normalizedValue) {
            to[property] = Number.NaN;
            return;
        }

        from[property] = normalizedValue[0];
        to[property] = normalizedValue[1];
    });

    return {
        range: [segment.start, segment.end],
        from,
        to,
    };
}

export function normalizeLegacyAnimationScript(input: LegacyAnimationInput): NormalizeResult {
    return normalizeTimeline(toArray(input).map(legacyToTimelineSegment));
}
