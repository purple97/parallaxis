"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  ScrollParallax: true,
  Parallaxis: true,
  Grid: true,
  useParallaxis: true
};
Object.defineProperty(exports, "Grid", {
  enumerable: true,
  get: function get() {
    return _grid.renderGrid;
  }
});
Object.defineProperty(exports, "Parallaxis", {
  enumerable: true,
  get: function get() {
    return _Parallaxis.default;
  }
});
Object.defineProperty(exports, "ScrollParallax", {
  enumerable: true,
  get: function get() {
    return _ScrollParallax.ScrollParallax;
  }
});
Object.defineProperty(exports, "useParallaxis", {
  enumerable: true,
  get: function get() {
    return _useParallaxis.useParallaxis;
  }
});
var _ScrollParallax = require("./components/ScrollParallax");
var _Parallaxis = _interopRequireDefault(require("./Parallaxis"));
var _grid = require("./components/grid");
var _core = require("./core");
Object.keys(_core).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _core[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _core[key];
    }
  });
});
var _useParallaxis = require("./react/useParallaxis");