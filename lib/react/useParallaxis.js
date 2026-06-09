"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveContainer = resolveContainer;
exports.useParallaxis = useParallaxis;
var _react = require("react");
var _Parallaxis = _interopRequireDefault(require("../Parallaxis"));
var __rest = void 0 && (void 0).__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function resolveContainer(container) {
  var _a;
  if (!container) return undefined;
  if (container instanceof HTMLElement) return container;
  return (_a = container.current) !== null && _a !== void 0 ? _a : undefined;
}
function useParallaxis(options) {
  var elementRef = (0, _react.useRef)(null);
  var instanceRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    var container = resolveContainer(options.container);
    var _container = options.container,
      parallaxisOption = __rest(options, ["container"]);
    instanceRef.current = new _Parallaxis.default(elementRef.current, Object.assign(Object.assign({}, parallaxisOption), {
      container: container
    }));
    var handleScroll = function handleScroll() {
      var _a;
      (_a = instanceRef.current) === null || _a === void 0 ? void 0 : _a.play();
    };
    var scrollTarget = container !== null && container !== void 0 ? container : window;
    scrollTarget.addEventListener('scroll', handleScroll, {
      passive: true
    });
    var frame = window.requestAnimationFrame(handleScroll);
    return function () {
      var _a;
      window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener('scroll', handleScroll);
      (_a = instanceRef.current) === null || _a === void 0 ? void 0 : _a.disconnect();
      instanceRef.current = null;
    };
  }, [options.afterSupplement, options.animationScript, options.axis, options.beforeSupplement, options.container, options.debug, options.duration, options.frameFn, options.openIntersection, options.reducedMotion, options.style, options.timeline, options.transformOrigin]);
  return {
    elementRef: elementRef,
    instanceRef: instanceRef
  };
}