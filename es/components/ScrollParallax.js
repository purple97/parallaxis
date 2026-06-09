var __rest = this && this.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
import React, { forwardRef, useImperativeHandle } from 'react';
import { useParallaxis } from '../react/useParallaxis';
export var ScrollParallax = /*#__PURE__*/forwardRef(function (props, ref) {
  var children = props.children,
    option = __rest(props, ["children"]);
  var _useParallaxis = useParallaxis(option),
    elementRef = _useParallaxis.elementRef;
  useImperativeHandle(ref, function () {
    return elementRef.current;
  });
  return /*#__PURE__*/React.createElement("span", {
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