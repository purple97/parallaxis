import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import { initializeFrameScripts, setParallaxisStyle, getFrameInfo, transformToMatrix, isSameFrameInfo, isNative } from './lib';
import * as Rematrix from 'rematrix';
function getElementMatrix(el) {
  var oldStyle = window.getComputedStyle(el).getPropertyValue('transform');
  var matrixStyle = Rematrix.fromString(oldStyle);
  return matrixStyle;
}
var Parallaxis = /*#__PURE__*/function () {
  function Parallaxis(el, opstion) {
    _classCallCheck(this, Parallaxis);
    var _a;
    var defaultOpstion = {
      duration: 0.1,
      transformOrigin: 'center',
      style: {
        willChange: 'transform'
      },
      openIntersection: false,
      debug: false,
      animationScript: undefined
    };
    this.el = el;
    this.opstion = Object.assign(defaultOpstion, opstion);
    defaultOpstion.style.transition = "all ".concat(defaultOpstion.duration, "s linear");
    this.isView = (_a = this.opstion.openIntersection) !== null && _a !== void 0 ? _a : true;
    if (this.opstion.style) {
      setParallaxisStyle(this.el, this.opstion.style);
    }
    if (opstion.animationScript) {
      this.el._animationScript = initializeFrameScripts(opstion.animationScript);
      this.frameFn = opstion === null || opstion === void 0 ? void 0 : opstion.frameFn;
      if (this.opstion.openIntersection && isNative(IntersectionObserver)) {
        this.bindViewport();
      } else {
        this.isView = true;
      }
    } else {
      console.error('缺少参数:animationScript');
    }
  }
  _createClass(Parallaxis, [{
    key: "bindViewport",
    value: function bindViewport() {
      var _this = this;
      this.intersectionObserver = new IntersectionObserver(function (entries) {
        _this.isView = entries[0].intersectionRatio > 0;
      });
      this.intersectionObserver.observe(this.el);
    }
  }, {
    key: "setStyle",
    value: function setStyle(scrollProgress) {
      var currentStyle = window.getComputedStyle(this.el, null);
      var frameInfo = getFrameInfo(scrollProgress, this.el._animationScript, this.opstion);
      if (isSameFrameInfo(this.el.frameInfo, frameInfo)) {
        this.log(this.el.frameInfo, frameInfo);
        return;
      }
      if (Object.keys(frameInfo).length > 0) {
        this.el.frameInfo = frameInfo;
        var currentMatrix = getElementMatrix(this.el);
        var matrix = transformToMatrix(currentMatrix, frameInfo);
        var style = {
          transform: Rematrix.toString(matrix),
          opacity: frameInfo.opacity !== undefined ? frameInfo.opacity : Number(currentStyle.getPropertyValue('opacity'))
        };
        this.log(scrollProgress, frameInfo);
        if (this.frameFn) {
          style = this.frameFn(style, scrollProgress, this.el) || style;
        }
        if (style) {
          setParallaxisStyle(this.el, style);
        }
      }
    }
  }, {
    key: "play",
    value: function play(scrollProgress) {
      if (this.isView) this.setStyle(Math.round(scrollProgress));
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      var _a;
      this.el.style.willChange = "auto";
      (_a = this.intersectionObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
    }
  }, {
    key: "log",
    value: function log() {
      var _console;
      var _a;
      if ((_a = this.opstion) === null || _a === void 0 ? void 0 : _a.debug) (_console = console).log.apply(_console, arguments);
    }
  }]);
  return Parallaxis;
}();
export { Parallaxis as default };