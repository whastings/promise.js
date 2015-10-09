var SLICE = Array.prototype.slice,
    TO_STRING = Object.prototype.toString;

var defineFinalProp = Object.defineProperty ?
  function defineFinalProp(object, prop, value, enumerable = true) {
    return Object.defineProperty(object, prop, {enumerable, value});
  } :
  function defineFinalProp(object, prop, value) {
    object[prop] = value;
  };
export { defineFinalProp };

var forEach = Array.prototype.forEach ?
  function forEach(array, fn) {
    return array.forEach(fn);
  } :
  function forEach(array, fn) {
    for (var i = 0, length = array.length; i < length; i++) {
      fn(array[i]);
    }
  };
export { forEach };

export function hasThen(value) {
  return isObject(value) && ('then' in value);
}

var isArray = Array.isArray ?
  function isArray(obj) {
    return Array.isArray(obj);
  } :
  function isArray(obj) {
    return TO_STRING.call(obj) === '[object Array]';
  };
export { isArray };

export function isFunction(fn) {
  return typeof fn === 'function';
}

export function isObject(value) {
  var type = typeof value;
  return value !== null && (type === 'object' || type === 'function');
}

export function partial(fn, ...startArgs) {
  return function partialInner(...endArgs) {
    return fn(...(startArgs.concat(endArgs)));
  };
}

export function toArray(iterable) {
  return SLICE.call(iterable);
}

// Do try...catch is own function since it causes de-optimizations.
// See: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers
export function tryCatch(fn, ...args) {
  try {
    return {value: fn(...args)};
  } catch(error) {
    return {error};
  }
}
