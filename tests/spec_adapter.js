require('babel/register');

var Promise = require('../Promise'); // jshint ignore:line

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

exports.rejected = function(message) {
  var rejector;
  var promise = new Promise(function(resolve, reject) {
    rejector = reject;
  });
  rejector(message);
  return promise;
};

exports.resolved = function(value) {
  var resolver;
  var promise = new Promise(function(resolve) {
    resolver = resolve;
  });
  resolver(value);
  return promise;
};

