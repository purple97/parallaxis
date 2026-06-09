"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.visualStateToStyle = visualStateToStyle;
exports.visualStateToTransform = visualStateToTransform;
var Rematrix = _interopRequireWildcard(require("rematrix"));
function float(value) {
  var decimal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  return Math.round(value * decimal) / decimal;
}
function visualStateToTransform(state) {
  var matrix = [Rematrix.translateX(state.x), Rematrix.translateY(state.y), Rematrix.scale(state.scale), Rematrix.rotate(state.rotate), Rematrix.rotateX(state.rotateX), Rematrix.rotateY(state.rotateY), Rematrix.rotateZ(state.rotateZ)].reduce(Rematrix.multiply);
  return Rematrix.toString(matrix.map(function (value) {
    return float(value);
  }));
}
function visualStateToStyle(state) {
  return {
    transform: visualStateToTransform(state),
    opacity: state.opacity
  };
}