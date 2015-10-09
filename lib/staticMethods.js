import {
  defineFinalProp, forEach, hasThen, isArray, isFunction, toArray
} from './helpers';

export default function addStaticMethods(Promise) {
  defineFinalProp(Promise, 'all', function all(promises) {
    var allPromise,
        allRejector,
        allResolver;

    allPromise = new Promise((resolve, reject) => {
      allRejector = reject;
      allResolver = resolve;
    });

    if (!isArray(promises)) {
      promises = toArray(promises);
    }

    subscribeToAll(allResolver, allRejector, promises);

    return allPromise;
  });

  defineFinalProp(Promise, 'race', function race(promises) {
    var allPromise,
        allRejector,
        allResolver;

    allPromise = new Promise(function(resolve, reject) {
      allRejector = reject;
      allResolver = resolve;
    });

    if (!isArray(promises)) {
      promises = toArray(promises);
    }

    forEach(promises, (promise) => promise.then(
      (value) => allResolver(value),
      (reason) => allRejector(reason)
    ));

    return allPromise;
  });

  defineFinalProp(Promise, 'reject', function reject(reason) {
    var rejector;
    var promise = new Promise(function(resolve, reject) {
      rejector = reject;
    });

    rejector(reason);

    return promise;
  });

  defineFinalProp(Promise, 'resolve', function resolve(value) {
    var resolver;
    var promise = new Promise(function(resolve) {
      resolver = resolve;
    });

    resolver(value);

    return promise;
  });

  function subscribeToAll(resolveAll, rejectAll, promises) {
    var resolutions = 0,
        values = new Array(promises.length);

    forEach(promises, (promise, i) => {
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
