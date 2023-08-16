import React, { forwardRef, useRef, useEffect, useCallback } from 'react';
import Parallaxis from '../Parallaxis';
function getScrollY() {
  return window.scrollY || 0;
}
export var ScrollParallax = /*#__PURE__*/forwardRef(function (props, _ref) {
  var parallaxRef = useRef(null);
  var scriptsRef = useRef(null);
  var handleScroll = useCallback(function () {
    if (scriptsRef.current) {
      var scrollTop = getScrollY();
      scriptsRef.current.play(scrollTop);
    }
  }, [scriptsRef.current]);
  useEffect(function () {
    scriptsRef.current = new Parallaxis(parallaxRef.current, props);
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
  return /*#__PURE__*/React.createElement("span", {
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