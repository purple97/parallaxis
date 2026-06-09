"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScrollParallax = void 0;
var _react = _interopRequireWildcard(require("react"));
var _useParallaxis2 = require("../react/useParallaxis");
var __rest = void 0 && (void 0).__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
var ScrollParallax = exports.ScrollParallax = /*#__PURE__*/(0, _react.forwardRef)(function (props, ref) {
  var children = props.children,
    option = __rest(props, ["children"]);
  var _useParallaxis = (0, _useParallaxis2.useParallaxis)(option),
    elementRef = _useParallaxis.elementRef;
  (0, _react.useImperativeHandle)(ref, function () {
    return elementRef.current;
  });
  return /*#__PURE__*/_react.default.createElement("span", {
    ref: elementRef,
    style: Object.assign({
      backfaceVisibility: 'hidden',
      position: 'relative',
      display: 'inline-block',
      userSelect: 'initial',
      pointerEvents: 'initial',
      width: '100%'
    }, props.style)
  }, children);
});