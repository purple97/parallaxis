"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveState = resolveState;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _defaults = require("./defaults");
var _easing = require("./easing");
function interpolate(from, to, progress) {
  return from + (to - from) * progress;
}
function resolveTrackValue(scrollProgress, entry) {
  var _entry$segment$range = (0, _slicedToArray2.default)(entry.segment.range, 2),
    start = _entry$segment$range[0],
    end = _entry$segment$range[1];
  var rawProgress = (scrollProgress - start) / (end - start);
  var easedProgress = entry.segment.easing((0, _easing.clampProgress)(rawProgress));
  return interpolate(entry.track.from, entry.track.to, easedProgress);
}
function findActiveEntry(scrollProgress, entries) {
  for (var index = entries.length - 1; index >= 0; index -= 1) {
    var entry = entries[index];
    var _entry$segment$range2 = (0, _slicedToArray2.default)(entry.segment.range, 2),
      start = _entry$segment$range2[0],
      end = _entry$segment$range2[1];
    if (start <= scrollProgress && scrollProgress <= end) return entry;
  }
  return undefined;
}
function findPreviousEntry(scrollProgress, entries) {
  return entries.filter(function (entry) {
    return entry.segment.range[1] < scrollProgress;
  }).sort(function (a, b) {
    var endDiff = b.segment.range[1] - a.segment.range[1];
    if (endDiff !== 0) return endDiff;
    return b.segment.index - a.segment.index;
  })[0];
}
function findNextEntry(scrollProgress, entries) {
  return entries.filter(function (entry) {
    return scrollProgress < entry.segment.range[0];
  }).sort(function (a, b) {
    var startDiff = a.segment.range[0] - b.segment.range[0];
    if (startDiff !== 0) return startDiff;
    return b.segment.index - a.segment.index;
  })[0];
}
function resolveProperty(scrollProgress, property, segments, state) {
  var entries = segments.reduce(function (result, segment) {
    var track = segment.tracks.find(function (item) {
      return item.property === property;
    });
    if (track) result.push({
      segment: segment,
      track: track
    });
    return result;
  }, []);
  if (entries.length === 0) return;
  var activeEntry = findActiveEntry(scrollProgress, entries);
  if (activeEntry) {
    state[property] = resolveTrackValue(scrollProgress, activeEntry);
    return;
  }
  var previousEntry = findPreviousEntry(scrollProgress, entries);
  if (previousEntry) {
    state[property] = previousEntry.track.to;
    return;
  }
  var nextEntry = findNextEntry(scrollProgress, entries);
  if (nextEntry) state[property] = nextEntry.track.from;
}
function resolveState(scrollProgress, segments) {
  var state = (0, _defaults.createDefaultVisualState)();
  _defaults.MOTION_PROPERTIES.forEach(function (property) {
    resolveProperty(scrollProgress, property, segments, state);
  });
  return state;
}