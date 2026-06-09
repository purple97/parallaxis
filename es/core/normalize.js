import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { DEFAULT_VISUAL_STATE, MOTION_PROPERTIES } from './defaults';
import { resolveEasing } from './easing';
function toArray(input) {
  return Array.isArray(input) ? input : [input];
}
function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}
function createDiagnostic(code, message, segmentIndex, property) {
  return {
    level: 'warning',
    code: code,
    message: message,
    segmentIndex: segmentIndex,
    property: property
  };
}
function readStateValue(state, property) {
  var value = state === null || state === void 0 ? void 0 : state[property];
  return isFiniteNumber(value) ? value : undefined;
}
function normalizeSegment(segment, index, diagnostics) {
  var _segment$range = _slicedToArray(segment.range, 2),
    start = _segment$range[0],
    end = _segment$range[1];
  if (!isFiniteNumber(start) || !isFiniteNumber(end) || end <= start) {
    diagnostics.push(createDiagnostic('INVALID_RANGE', "Invalid timeline range at segment ".concat(index, "."), index));
    return null;
  }
  var easing = resolveEasing(segment.easing);
  if (!easing) {
    diagnostics.push(createDiagnostic('UNKNOWN_EASING', "Unknown easing at segment ".concat(index, "."), index));
    return null;
  }
  var tracks = MOTION_PROPERTIES.reduce(function (result, property) {
    var _a;
    var toValue = readStateValue(segment.to, property);
    var fromValue = readStateValue(segment.from, property);
    if (segment.to[property] !== undefined && toValue === undefined) {
      diagnostics.push(createDiagnostic('INVALID_STATE', "Invalid to.".concat(property, " value at segment ").concat(index, "."), index, property));
      return result;
    }
    if (((_a = segment.from) === null || _a === void 0 ? void 0 : _a[property]) !== undefined && fromValue === undefined) {
      diagnostics.push(createDiagnostic('INVALID_STATE', "Invalid from.".concat(property, " value at segment ").concat(index, "."), index, property));
      return result;
    }
    if (toValue !== undefined) {
      result.push({
        property: property,
        from: fromValue !== null && fromValue !== void 0 ? fromValue : DEFAULT_VISUAL_STATE[property],
        to: toValue
      });
    }
    return result;
  }, []);
  if (tracks.length === 0) {
    diagnostics.push(createDiagnostic('EMPTY_SEGMENT', "Timeline segment ".concat(index, " does not declare any motion property."), index));
    return null;
  }
  return {
    index: index,
    range: [start, end],
    easing: easing,
    tracks: tracks
  };
}
export function normalizeTimeline(input) {
  var diagnostics = [];
  var segments = toArray(input).reduce(function (result, segment, index) {
    var normalizedSegment = normalizeSegment(segment, index, diagnostics);
    if (normalizedSegment) result.push(normalizedSegment);
    return result;
  }, []);
  return {
    segments: segments,
    diagnostics: diagnostics
  };
}
function normalizeLegacyValue(value) {
  if (isFiniteNumber(value)) return [0, value];
  if (Array.isArray(value) && value.length === 2 && isFiniteNumber(value[0]) && isFiniteNumber(value[1])) {
    return [value[0], value[1]];
  }
  return null;
}
function legacyToTimelineSegment(segment) {
  var from = {};
  var to = {};
  MOTION_PROPERTIES.forEach(function (property) {
    var value = segment[property];
    if (value === undefined) return;
    var normalizedValue = normalizeLegacyValue(value);
    if (!normalizedValue) {
      to[property] = Number.NaN;
      return;
    }
    from[property] = normalizedValue[0];
    to[property] = normalizedValue[1];
  });
  return {
    range: [segment.start, segment.end],
    from: from,
    to: to
  };
}
export function normalizeLegacyAnimationScript(input) {
  return normalizeTimeline(toArray(input).map(legacyToTimelineSegment));
}