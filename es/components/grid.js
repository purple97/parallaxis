import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle, useCallback } from 'react';
import './style/grid.less';
function isReact18() {
  return React.version.startsWith('18');
}
function ReactRender(Component, ele) {
  if (isReact18()) {
    require('react-dom/client').createRoot(ele).render(Component);
  } else {
    require('react-dom').default.render(Component, ele);
  }
}
export var Grid = /*#__PURE__*/forwardRef(function (_props, ref) {
  var _useState = useState(0),
    _useState2 = _slicedToArray(_useState, 2),
    top = _useState2[0],
    setTop = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    disabled = _useState4[0],
    setDisabled = _useState4[1];
  useImperativeHandle(ref, function () {
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
  return /*#__PURE__*/React.createElement("div", {
    className: '__ParallaxisGridWrap__',
    style: styleWrap
  }, /*#__PURE__*/React.createElement("div", {
    className: '__ParallaxisGridTop__'
  }, /*#__PURE__*/React.createElement("b", null, top + 20)), /*#__PURE__*/React.createElement("div", {
    className: '__ParallaxisGridMiddle__'
  }, /*#__PURE__*/React.createElement("b", null, middle)), /*#__PURE__*/React.createElement("div", {
    className: '__ParallaxisGridBottom__'
  }, /*#__PURE__*/React.createElement("b", null, bottom - 20)));
});
export var renderGrid = function renderGrid(props) {
  var gridRef = useRef(null);
  var handleScroll = useCallback(function () {
    var _a;
    var scrollTop = props.container ? props.container.scrollTop : window.scrollY;
    (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.updateValue(scrollTop);
  }, [gridRef.current, props.container]);
  var Component = /*#__PURE__*/React.createElement(Grid, Object.assign({
    ref: gridRef
  }, props));
  useEffect(function () {
    var ele = document.createElement('div');
    ele.className = '__ParallaxisGrid__';
    document.body.appendChild(ele);
    ReactRender(Component, ele);
    window.addEventListener("scroll", handleScroll, {
      passive: true
    });
    setTimeout(function () {
      handleScroll();
    }, 10);
    return function () {
      document.body.removeChild(ele);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return null;
};
export default renderGrid;