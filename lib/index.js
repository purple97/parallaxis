"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
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
var _ScrollParallax = require("./components/ScrollParallax");
var _Parallaxis = _interopRequireDefault(require("./Parallaxis"));
var _grid = require("./components/grid");