require('babel/register');

var Promise = require('../lib/Unbreakable'); // jshint ignore:line

exports.deferred = function() {
  var resolver, rejector;
  var promise = new Promise(function(resolve, reject) {
    resolver = resolve;
    rejector = reject;
  });

  return {
    promise: promise,
    reject: rejector,
    resolve: resolver
  };
};

exports.rejected = function(reason) {
  return Promise.reject(reason);
};

exports.resolved = function(value) {
  return Promise.resolve(value);
};
