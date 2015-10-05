var SLICE = Array.prototype.slice;

var defineFinalProp = Object.defineProperty ?
  function defineFinalProp(object, prop, value, enumerable = true) {
    Object.defineProperty(object, prop, {enumerable, value});
  } :
  function defineFinalProp(object, prop, value) {
    object[prop] = value;
  };
export { defineFinalProp };

export function hasThen(value) {
  return isObject(value) && ('then' in value);
}

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
