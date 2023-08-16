import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import { initializeFrameScripts, setParallaxisStyle, getFrameInfo, transformToMatrix, isSameFrameInfo, isNative } from './lib';
import * as Rematrix from 'rematrix';
function getElementMatrix(el) {
  var oldStyle = window.getComputedStyle(el).getPropertyValue('transform');
  var matrixStyle = Rematrix.fromString(oldStyle);
  return matrixStyle;
}
/*
* Parallaxis 视差动画类
* @param {HTMLElement} el , 绑定动画的元素
* @param {Object} opstion, 参数
*   {
*    debug: boolean;
*    frameFn?: FrameFunction; // 每帧回调
*    beforeSupplement?: number; // 前补帧，默认0
*    afterSupplement?: number; // 后补帧，默认20
*    animationScript: FrameScriptInfo | FrameScriptInfo[]; //必传，动画脚本
*    transformOrigin?: string; // 旋转中心
*    duration?: number; // 动画过度时长，默认0.1，建议0.1~0.3
*   }
*/
var Parallaxis = /*#__PURE__*/function () {
  function Parallaxis(el, opstion) {
    var _this$opstion$openInt;
    _classCallCheck(this, Parallaxis);
    this.el = void 0;
    this.isView = void 0;
    this.frameFn = void 0;
    this.opstion = void 0;
    this.intersectionObserver = void 0;
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
    this.isView = (_this$opstion$openInt = this.opstion.openIntersection) !== null && _this$opstion$openInt !== void 0 ? _this$opstion$openInt : true;
    // this.el.style.transform = 'translate3d(0px,0px,0px)'; //开启显卡3d加速
    if (this.opstion.style) {
      setParallaxisStyle(this.el, this.opstion.style);
    }
    if (opstion.animationScript) {
      // 初始化动画脚本
      this.el._animationScript = initializeFrameScripts(opstion.animationScript);
      this.frameFn = opstion === null || opstion === void 0 ? void 0 : opstion.frameFn;
      // this.log(this.el._animationScript)
      // 判断是否支持IntersectionObserver
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
      /* 获取当前进度的帧信息 */
      var frameInfo = getFrameInfo(scrollProgress, this.el._animationScript, this.opstion);
      // 和上一帧动画内容相同,跳出;
      if (isSameFrameInfo(this.el.frameInfo, frameInfo)) {
        this.log(this.el.frameInfo, frameInfo);
        return;
      }
      if (Object.keys(frameInfo).length > 0) {
        this.el.frameInfo = frameInfo;
        var currentMatrix = getElementMatrix(this.el);
        var matrix = transformToMatrix(currentMatrix, frameInfo);
        // console.log(frameInfo)
        var style = {
          transform: Rematrix.toString(matrix),
          opacity: frameInfo.opacity !== undefined ? frameInfo.opacity : Number(currentStyle.getPropertyValue('opacity'))
        };
        this.log(scrollProgress, frameInfo);
        if (this.frameFn) {
          style = this.frameFn(style, scrollProgress, this.el) || style;
        }
        //
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
      var _this$intersectionObs;
      this.el.style.willChange = "auto";
      (_this$intersectionObs = this.intersectionObserver) === null || _this$intersectionObs === void 0 ? void 0 : _this$intersectionObs.disconnect();
    }
  }, {
    key: "log",
    value: function log() {
      var _this$opstion, _console;
      if ((_this$opstion = this.opstion) === null || _this$opstion === void 0 ? void 0 : _this$opstion.debug) (_console = console).log.apply(_console, arguments);
    }
  }]);
  return Parallaxis;
}();
export { Parallaxis as default };