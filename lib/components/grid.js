"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderGrid = exports.default = exports.Grid = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = _interopRequireWildcard(require("react"));
var _client = require("react-dom/client");
require("./style/grid.less");
var Grid = exports.Grid = /*#__PURE__*/(0, _react.forwardRef)(function (_props, ref) {
  var _useState = (0, _react.useState)(0),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    top = _useState2[0],
    setTop = _useState2[1];
  var _useState3 = (0, _react.useState)(false),
    _useState4 = (0, _slicedToArray2.default)(_useState3, 2),
    disabled = _useState4[0],
    setDisabled = _useState4[1];
  (0, _react.useImperativeHandle)(ref, function () {
    return {
      updateValue: function updateValue(value) {
        setTop(value);
      },
      setDisplay: function setDisplay(v) {
        return setDisabled(!v);
      }
    };
  });
  var height = window.innerHeight;
  var middle = height / 2 + top;
  var bottom = height + top - 1;
  var styleWrap = {
    display: disabled ? 'none' : 'block'
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: '__ParallaxisGridWrap__',
    style: styleWrap
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: '__ParallaxisGridTop__'
  }, /*#__PURE__*/_react.default.createElement("b", null, top + 20)), /*#__PURE__*/_react.default.createElement("div", {
    className: '__ParallaxisGridMiddle__'
  }, /*#__PURE__*/_react.default.createElement("b", null, middle)), /*#__PURE__*/_react.default.createElement("div", {
    className: '__ParallaxisGridBottom__'
  }, /*#__PURE__*/_react.default.createElement("b", null, bottom - 20)));
});
var renderGrid = exports.renderGrid = function renderGrid(props) {
  var gridRef = (0, _react.useRef)(null);
  var handleScroll = (0, _react.useCallback)(function () {
    var _a;
    var scrollTop = props.container ? props.container.scrollTop : window.scrollY;
    (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.updateValue(scrollTop);
  }, [props.container]);
  (0, _react.useEffect)(function () {
    var _a;
    var ele = document.createElement('div');
    ele.className = '__ParallaxisGrid__';
    document.body.appendChild(ele);
    var root = (0, _client.createRoot)(ele);
    root.render(/*#__PURE__*/_react.default.createElement(Grid, Object.assign({
      ref: gridRef
    }, props)));
    var scrollTarget = (_a = props.container) !== null && _a !== void 0 ? _a : window;
    scrollTarget.addEventListener("scroll", handleScroll, {
      passive: true
    });
    setTimeout(function () {
      handleScroll();
    }, 10);
    return function () {
      root.unmount();
      document.body.removeChild(ele);
      scrollTarget.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, props.container]);
  return null;
};
var _default = exports.default = renderGrid;