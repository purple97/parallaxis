export type MotionProperty =
    | 'x'
    | 'y'
    | 'opacity'
    | 'scale'
    | 'rotate'
    | 'rotateX'
    | 'rotateY'
    | 'rotateZ';

export type VisualState = Record<MotionProperty, number>;

export type PartialVisualState = Partial<VisualState>;

export type TimelineRange = [number, number];

export type EasingName =
    | 'linear'
    | 'easeInQuad'
    | 'easeOutQuad'
    | 'easeInOutQuad'
    | 'easeInCubic'
    | 'easeOutCubic'
    | 'easeInOutCubic';

export type EasingFunction = (progress: number) => number;

export type Easing = EasingName | EasingFunction;

export type TimelineSegment = {
    range: TimelineRange;
    from?: PartialVisualState;
    to: PartialVisualState;
    easing?: Easing;
};

export type LegacyValue = number | [number, number];

export type LegacyAnimationSegment = {
    start: number;
    end: number;
} & Partial<Record<MotionProperty, LegacyValue>>;

export type DiagnosticLevel = 'warning';

export type DiagnosticCode =
    | 'INVALID_RANGE'
    | 'INVALID_STATE'
    | 'EMPTY_SEGMENT'
    | 'UNKNOWN_EASING';

export type Diagnostic = {
    level: DiagnosticLevel;
    code: DiagnosticCode;
    message: string;
    segmentIndex: number;
    property?: MotionProperty;
};

export type NormalizedTrack = {
    property: MotionProperty;
    from: number;
    to: number;
};

export type NormalizedTimelineSegment = {
    index: number;
    range: TimelineRange;
    easing: EasingFunction;
    tracks: NormalizedTrack[];
};

export type NormalizeResult = {
    segments: NormalizedTimelineSegment[];
    diagnostics: Diagnostic[];
};

export type TimelineInput = TimelineSegment | TimelineSegment[];

export type LegacyAnimationInput = LegacyAnimationSegment | LegacyAnimationSegment[];
