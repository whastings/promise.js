export default function addStaticMethods(Promise) {
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
}
