"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScrollParallax = void 0;
var _react = _interopRequireWildcard(require("react"));
var _Parallaxis = _interopRequireDefault(require("../Parallaxis"));
function getScrollY() {
  return window.scrollY || 0;
}
var ScrollParallax = /*#__PURE__*/(0, _react.forwardRef)(function (props, _ref) {
  var parallaxRef = (0, _react.useRef)(null);
  var scriptsRef = (0, _react.useRef)(null);
  var handleScroll = (0, _react.useCallback)(function () {
    if (scriptsRef.current) {
      var scrollTop = getScrollY();
      scriptsRef.current.play(scrollTop);
    }
  }, [scriptsRef.current]);
  (0, _react.useEffect)(function () {
    scriptsRef.current = new _Parallaxis.default(parallaxRef.current, props);
    window.addEventListener("scroll", handleScroll, {
      passive: true
    });
    setTimeout(function () {
      handleScroll();
    }, 0);
    return function () {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return /*#__PURE__*/_react.default.createElement("span", {
    ref: parallaxRef,
    style: Object.assign({
      backfaceVisibility: "hidden",
      position: "relative",
      display: "inline-block",
      userSelect: "initial",
      pointerEvents: "initial",
      width: "100%"
    }, props.style)
  }, props.children);
});
exports.ScrollParallax = ScrollParallax;