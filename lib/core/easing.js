"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clampProgress = clampProgress;
exports.easingMap = void 0;
exports.resolveEasing = resolveEasing;
var easingMap = exports.easingMap = {
  linear: function linear(progress) {
    return progress;
  },
  easeInQuad: function easeInQuad(progress) {
    return progress * progress;
  },
  easeOutQuad: function easeOutQuad(progress) {
    return 1 - (1 - progress) * (1 - progress);
  },
  easeInOutQuad: function easeInOutQuad(progress) {
    return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  },
  easeInCubic: function easeInCubic(progress) {
    return progress * progress * progress;
  },
  easeOutCubic: function easeOutCubic(progress) {
    return 1 - Math.pow(1 - progress, 3);
  },
  easeInOutCubic: function easeInOutCubic(progress) {
    return progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  }
};
function clampProgress(progress) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  return progress;
}
function resolveEasing(easing) {
  if (!easing) return easingMap.linear;
  if (typeof easing === 'function') return easing;
  return easingMap[easing];
}