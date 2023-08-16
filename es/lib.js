import * as Rematrix from 'rematrix';
var styleKeys = ['x', 'y', 'opacity', 'scale', 'rotate', 'rotateX', 'rotateY', 'rotateZ'];
//判断两个对象是否相等
export function isSameFrameInfo(prevFrameInfo, frameInfo) {
  var is = true;
  if (!prevFrameInfo || !frameInfo) return false;
  if (Object.keys(prevFrameInfo).length !== Object.keys(frameInfo).length) return false;
  styleKeys.forEach(function (k) {
    if (prevFrameInfo[k] !== frameInfo[k]) {
      is = false;
    }
  });
  return is;
}
//判断是否支持该api
export function isNative(api) {
  return typeof api === 'function' && /native code/.test(api.toString());
}
export function Float(floatNumber) {
  var decimal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  return Math.round(floatNumber * decimal) / decimal;
}
export function analysisFrameScript(_ref, progress) {
  var start = _ref.start,
    sp = _ref.sp;
  return start + progress * sp;
}
export function getFrameInfo(scrollProgress, scriptsMap, _ref2) {
  var _ref2$beforeSupplemen = _ref2.beforeSupplement,
    beforeSupplement = _ref2$beforeSupplemen === void 0 ? 0 : _ref2$beforeSupplemen,
    _ref2$afterSupplement = _ref2.afterSupplement,
    afterSupplement = _ref2$afterSupplement === void 0 ? 20 : _ref2$afterSupplement;
  var frameInfo = {};
  scriptsMap.forEach(function (item) {
    if (item.start <= scrollProgress && scrollProgress <= item.end) {
      var progress = scrollProgress - item.start;
      styleKeys.forEach(function (key) {
        if (item[key]) frameInfo[key] = analysisFrameScript(item[key], progress);
      });
    } else if (beforeSupplement > 0 && scrollProgress < item.start && scrollProgress >= item.start - beforeSupplement) {
      styleKeys.forEach(function (key) {
        if (item[key]) frameInfo[key] = item[key].start;
      });
    } else if (afterSupplement > 0 && scrollProgress > item.end && scrollProgress <= item.end + afterSupplement) {
      styleKeys.forEach(function (key) {
        if (item[key]) frameInfo[key] = item[key].end;
      });
    }
  });
  return frameInfo;
}
function fromatScriptInfo(data, le) {
  var obj = {
    start: 0,
    end: 0,
    l: 0,
    sp: 0,
    value: 0
  };
  obj.value = data;
  if (Array.isArray(data)) {
    obj.start = data[0];
    obj.end = data[1];
    obj.l = data[1] - data[0];
    obj.sp = (data[1] - data[0]) / le;
  } else if (typeof data == 'number') {
    obj.start = 0;
    obj.end = data;
    obj.l = data - 0;
    obj.sp = data / le;
  }
  return obj;
}
export function frameScripts(props) {
  var start = props.start,
    end = props.end;
  if (end <= start) return null;
  var le = end - start;
  var script = {
    _props: props,
    start: props.start,
    end: props.end,
    le: le
  };
  styleKeys.forEach(function (key) {
    if (props[key] !== undefined) {
      script[key] = fromatScriptInfo(props[key], le);
    }
  });
  return script;
}
export function initializeFrameScripts(actionScripts) {
  var scriptsArray = [];
  if (Array.isArray(actionScripts)) {
    scriptsArray = actionScripts.map(frameScripts);
  } else {
    scriptsArray = [frameScripts(actionScripts)];
  }
  return scriptsArray;
}
/*
* 常规 transform 效果转 matrix 矩阵
*/
//TODO: 目前无法继承之前的matrix
export function transformToMatrix(prevframeInfo, frameInfo) {
  if (frameInfo) {
    var x = frameInfo.x,
      y = frameInfo.y,
      scale = frameInfo.scale,
      rotate = frameInfo.rotate,
      rotateX = frameInfo.rotateX,
      rotateY = frameInfo.rotateY,
      rotateZ = frameInfo.rotateZ;
    var matrixArray = [];
    if (x != undefined) matrixArray.push(Rematrix.translateX(x));
    if (y != undefined) matrixArray.push(Rematrix.translateY(y));
    if (scale != undefined && scale >= 0) matrixArray.push(Rematrix.scale(scale));
    if (rotate != undefined && rotate != 0) matrixArray.push(Rematrix.rotate(rotate));
    if (rotateX != undefined && rotateX != 0) matrixArray.push(Rematrix.rotateX(rotateX));
    if (rotateY != undefined && rotateY != 0) matrixArray.push(Rematrix.rotateY(rotateY));
    if (rotateZ != undefined && rotateZ != 0) matrixArray.push(Rematrix.rotateZ(rotateZ));
    if (matrixArray.length > 0) {
      var matrix = matrixArray.reduce(Rematrix.multiply);
      return matrix.map(function (n) {
        return Float(n, 100);
      });
    }
  }
  return prevframeInfo;
}
export function setParallaxisStyle(el, style) {
  for (var key in style) {
    el.style.setProperty(key, style[key]);
  }
}