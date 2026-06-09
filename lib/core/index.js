"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _defaults = require("./defaults");
Object.keys(_defaults).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _defaults[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _defaults[key];
    }
  });
});
var _easing = require("./easing");
Object.keys(_easing).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _easing[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _easing[key];
    }
  });
});
var _normalize = require("./normalize");
Object.keys(_normalize).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _normalize[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _normalize[key];
    }
  });
});
var _resolve = require("./resolve");
Object.keys(_resolve).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _resolve[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _resolve[key];
    }
  });
});
var _transform = require("./transform");
Object.keys(_transform).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _transform[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _transform[key];
    }
  });
});
var _types = require("./types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _types[key];
    }
  });
});