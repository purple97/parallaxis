import * as Rematrix from 'rematrix';
function float(value) {
  var decimal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  return Math.round(value * decimal) / decimal;
}
export function visualStateToTransform(state) {
  var matrix = [Rematrix.translateX(state.x), Rematrix.translateY(state.y), Rematrix.scale(state.scale), Rematrix.rotate(state.rotate), Rematrix.rotateX(state.rotateX), Rematrix.rotateY(state.rotateY), Rematrix.rotateZ(state.rotateZ)].reduce(Rematrix.multiply);
  return Rematrix.toString(matrix.map(function (value) {
    return float(value);
  }));
}
export function visualStateToStyle(state) {
  return {
    transform: visualStateToTransform(state),
    opacity: state.opacity
  };
}