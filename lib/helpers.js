export function isFunction(fn) {
  return typeof fn === 'function';
}

export function isObject(value) {
  var type = typeof value;
  return value !== null && (type === 'object' || type === 'function');
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
