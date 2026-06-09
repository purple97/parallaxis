"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MOTION_PROPERTIES = exports.DEFAULT_VISUAL_STATE = void 0;
exports.createDefaultVisualState = createDefaultVisualState;
var MOTION_PROPERTIES = exports.MOTION_PROPERTIES = ['x', 'y', 'opacity', 'scale', 'rotate', 'rotateX', 'rotateY', 'rotateZ'];
var DEFAULT_VISUAL_STATE = exports.DEFAULT_VISUAL_STATE = {
  x: 0,
  y: 0,
  opacity: 1,
  scale: 1,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0
};
function createDefaultVisualState() {
  return Object.assign({}, DEFAULT_VISUAL_STATE);
}