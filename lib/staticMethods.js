import { hasThen, isFunction, toArray } from './helpers';

export default function addStaticMethods(Promise) {
  Promise.all = function(promises) {
    var allPromise,
        allRejector,
        allResolver;

    allPromise = new Promise((resolve, reject) => {
      allRejector = reject;
      allResolver = resolve;
    });

    if (!isFunction(promises.forEach)) {
      promises = toArray(promises);
    }

    subscribeToAll(allResolver, allRejector, promises);

    return allPromise;
  };

  Promise.reject = function(reason) {
    var rejector;
    var promise = new Promise(function(resolve, reject) {
      rejector = reject;
    });

    rejector(reason);

    return promise;
  };

  Promise.resolve = function(value) {
    var resolver;
    var promise = new Promise(function(resolve) {
      resolver = resolve;
    });

    resolver(value);

    return promise;
  };

  function subscribeToAll(resolveAll, rejectAll, promises) {
    var resolutions = 0,
        values = new Array(promises.length);

    promises.forEach((promise, i) => {
      if (!hasThen(promise) || !isFunction(promise.then)) {
        promise = Promise.resolve(promise);
      }

      promise.then((value) => {
        values[i] = value;
        resolutions += 1;
        if (resolutions === promises.length) {
          resolveAll(values);
        }
      }, (reason) => rejectAll(reason));
    });
  }
}
