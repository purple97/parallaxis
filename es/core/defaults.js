export var MOTION_PROPERTIES = ['x', 'y', 'opacity', 'scale', 'rotate', 'rotateX', 'rotateY', 'rotateZ'];
export var DEFAULT_VISUAL_STATE = {
  x: 0,
  y: 0,
  opacity: 1,
  scale: 1,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0
};
export function createDefaultVisualState() {
  return Object.assign({}, DEFAULT_VISUAL_STATE);
}