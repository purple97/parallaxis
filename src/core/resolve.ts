import { createDefaultVisualState, MOTION_PROPERTIES } from './defaults';
import { clampProgress } from './easing';
import type {
    MotionProperty,
    NormalizedTimelineSegment,
    NormalizedTrack,
    VisualState,
} from './types';

type TrackEntry = {
    segment: NormalizedTimelineSegment;
    track: NormalizedTrack;
};

function interpolate(from: number, to: number, progress: number): number {
    return from + (to - from) * progress;
}

function resolveTrackValue(scrollProgress: number, entry: TrackEntry): number {
    const [start, end] = entry.segment.range;
    const rawProgress = (scrollProgress - start) / (end - start);
    const easedProgress = entry.segment.easing(clampProgress(rawProgress));
    return interpolate(entry.track.from, entry.track.to, easedProgress);
}

function findActiveEntry(scrollProgress: number, entries: TrackEntry[]): TrackEntry | undefined {
    for (let index = entries.length - 1; index >= 0; index -= 1) {
        const entry = entries[index];
        const [start, end] = entry.segment.range;
        if (start <= scrollProgress && scrollProgress <= end) return entry;
    }
    return undefined;
}

function findPreviousEntry(scrollProgress: number, entries: TrackEntry[]): TrackEntry | undefined {
    return entries
        .filter((entry) => entry.segment.range[1] < scrollProgress)
        .sort((a, b) => {
            const endDiff = b.segment.range[1] - a.segment.range[1];
            if (endDiff !== 0) return endDiff;
            return b.segment.index - a.segment.index;
        })[0];
}

function findNextEntry(scrollProgress: number, entries: TrackEntry[]): TrackEntry | undefined {
    return entries
        .filter((entry) => scrollProgress < entry.segment.range[0])
        .sort((a, b) => {
            const startDiff = a.segment.range[0] - b.segment.range[0];
            if (startDiff !== 0) return startDiff;
            return b.segment.index - a.segment.index;
        })[0];
}

function resolveProperty(
    scrollProgress: number,
    property: MotionProperty,
    segments: NormalizedTimelineSegment[],
    state: VisualState,
) {
    const entries = segments.reduce<TrackEntry[]>((result, segment) => {
        const track = segment.tracks.find((item) => item.property === property);
        if (track) result.push({ segment, track });
        return result;
    }, []);

    if (entries.length === 0) return;

    const activeEntry = findActiveEntry(scrollProgress, entries);
    if (activeEntry) {
        state[property] = resolveTrackValue(scrollProgress, activeEntry);
        return;
    }

    const previousEntry = findPreviousEntry(scrollProgress, entries);
    if (previousEntry) {
        state[property] = previousEntry.track.to;
        return;
    }

    const nextEntry = findNextEntry(scrollProgress, entries);
    if (nextEntry) state[property] = nextEntry.track.from;
}

export function resolveState(
    scrollProgress: number,
    segments: NormalizedTimelineSegment[],
): VisualState {
    const state = createDefaultVisualState();

    MOTION_PROPERTIES.forEach((property) => {
        resolveProperty(scrollProgress, property, segments, state);
    });

    return state;
}
