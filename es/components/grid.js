import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle, useCallback } from 'react';
import './style/grid.less';
function isReact18() {
  return React.version.startsWith('18');
}
/*
* 挂载组件到指定元素
*/
function ReactRender(Component, ele) {
  if (isReact18()) {
    //@ts-ignore
    require('react-dom/client').createRoot(ele).render(Component);
  } else {
    //@ts-ignore
    require('react-dom').default.render(Component, ele);
  }
}
/*
* 网格 和 当前条滚动进度
*/
export var Grid = /*#__PURE__*/forwardRef(function (props, ref) {
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
/*
* 添加网格组件到body，并监听window滚动事件
*/
export var renderGrid = function renderGrid(props) {
  var gridRef = useRef(null);
  var handleScroll = useCallback(function () {
    var _gridRef$current;
    var scrollTop = props.container ? props.container.scrollTop : window.scrollY;
    (_gridRef$current = gridRef.current) === null || _gridRef$current === void 0 ? void 0 : _gridRef$current.updateValue(scrollTop);
  }, [gridRef.current, props.container]);
  var Component = /*#__PURE__*/React.createElement(Grid, _objectSpread({
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
    // window.addEventListener("resize", handleScroll, { passive: true });
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