import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import { normalizeLegacyAnimationScript, normalizeTimeline, resolveState, visualStateToStyle } from './core';
import { isNative, isSameFrameInfo, setParallaxisStyle } from './lib';
var defaultOption = {
  duration: 0.1,
  transformOrigin: 'center',
  style: {
    willChange: 'transform'
  },
  openIntersection: false,
  debug: false,
  axis: 'y',
  reducedMotion: 'respect'
};
function shouldReduceMotion(option) {
  if (option.reducedMotion === 'ignore') return false;
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function getWindowScroll(axis) {
  return axis === 'x' ? window.scrollX || window.pageXOffset || 0 : window.scrollY || window.pageYOffset || 0;
}
function getContainerScroll(container, axis) {
  return axis === 'x' ? container.scrollLeft : container.scrollTop;
}
function getFinalScrollProgress(segments) {
  return segments.reduce(function (max, segment) {
    return Math.max(max, segment.range[1]);
  }, 0);
}
function warnDiagnostics(diagnostics, debug) {
  if (!debug || diagnostics.length === 0) return;
  diagnostics.forEach(function (diagnostic) {
    console.warn("[parallaxis] ".concat(diagnostic.message), diagnostic);
  });
}
var Parallaxis = /*#__PURE__*/function () {
  function Parallaxis(el, option) {
    _classCallCheck(this, Parallaxis);
    this.el = el;
    this.option = Object.assign(Object.assign(Object.assign({}, defaultOption), option), {
      style: Object.assign(Object.assign({}, defaultOption.style), option.style)
    });
    this.option.style = Object.assign(Object.assign({}, this.option.style), {
      transition: "all ".concat(this.option.duration, "s linear")
    });
    this.isView = this.option.openIntersection ? false : true;
    this.frameFn = this.option.frameFn;
    this.segments = [];
    if (!this.el) return;
    if (this.option.style) {
      setParallaxisStyle(this.el, this.option.style);
    }
    var normalizeResult = this.option.timeline ? normalizeTimeline(this.option.timeline) : this.option.animationScript ? normalizeLegacyAnimationScript(this.option.animationScript) : null;
    if (!normalizeResult) {
      console.error('缺少参数: timeline 或 animationScript');
      return;
    }
    this.segments = normalizeResult.segments;
    warnDiagnostics(normalizeResult.diagnostics, this.option.debug);
    if (this.option.openIntersection && isNative(IntersectionObserver)) {
      this.bindViewport();
    } else {
      this.isView = true;
    }
  }
  return _createClass(Parallaxis, [{
    key: "bindViewport",
    value: function bindViewport() {
      var _this = this;
      if (!this.el) return;
      this.intersectionObserver = new IntersectionObserver(function (entries) {
        _this.isView = entries[0].intersectionRatio > 0;
      });
      this.intersectionObserver.observe(this.el);
    }
  }, {
    key: "getScrollProgress",
    value: function getScrollProgress() {
      var _a;
      var axis = (_a = this.option.axis) !== null && _a !== void 0 ? _a : 'y';
      if (this.option.container) return getContainerScroll(this.option.container, axis);
      return getWindowScroll(axis);
    }
  }, {
    key: "setStyle",
    value: function setStyle(scrollProgress) {
      var _a;
      if (!this.el || this.segments.length === 0) return;
      var progress = shouldReduceMotion(this.option) ? getFinalScrollProgress(this.segments) : scrollProgress;
      var state = resolveState(progress, this.segments);
      if (this.prevState && isSameFrameInfo(this.prevState, state)) {
        this.log(this.prevState, state);
        return;
      }
      this.prevState = state;
      var baseStyle = visualStateToStyle(state);
      var style = ((_a = this.frameFn) === null || _a === void 0 ? void 0 : _a.call(this, baseStyle, progress, this.el, state)) || baseStyle;
      this.log(progress, state);
      setParallaxisStyle(this.el, style);
    }
  }, {
    key: "play",
    value: function play() {
      var scrollProgress = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getScrollProgress();
      if (this.isView) this.setStyle(Math.round(scrollProgress));
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      var _a;
      if (this.el) this.el.style.willChange = 'auto';
      (_a = this.intersectionObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
      this.intersectionObserver = undefined;
      this.prevState = undefined;
      this.segments = [];
      this.frameFn = undefined;
      this.el = null;
    }
  }, {
    key: "log",
    value: function log() {
      var _console;
      if (this.option.debug) (_console = console).log.apply(_console, arguments);
    }
  }]);
}();
export { Parallaxis as default };