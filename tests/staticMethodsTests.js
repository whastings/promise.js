import { deferred } from './helpers';
import Promise from '../lib/Unbreakable';
import test from 'tape';

export default function staticMethodsTests() {
  var promiseArgs,
      allPromise;

  function before(test) {
    return function(t) {
      promiseArgs = [1, 2, 3].map(deferred);

      return test(t);
    };
  }

  test('Promise.all()', function(t) {
    t.test('it resolves when all passed promises resolve', before(function(st) {
      st.plan(1);

      allPromise = Promise.all(promiseArgs.map(arg => arg.promise));
      allPromise.then(values => st.deepEqual(values, [2, 1, 0]));

      promiseArgs.reverse().forEach((arg, i) => arg.resolveTrigger(i));
    }));

    t.test('it converts any non-promise values to resolved promises', before(function(st) {
      st.plan(1);

      promiseArgs[1] = {promise: 'foo', resolveTrigger: function() {}};

      allPromise = Promise.all(promiseArgs.map(arg => arg.promise));
      allPromise.then(values => st.deepEqual(values, [0, 'foo', 2]));

      promiseArgs.forEach((arg, i) => arg.resolveTrigger(i));
    }));

    t.test('it rejects if any passed promise rejects', before(function(st) {
      st.plan(1);

      allPromise = Promise.all(promiseArgs.map(arg => arg.promise));
      allPromise.then(null, reason => st.equal(reason, 'foo'));

      promiseArgs[0].rejectTrigger('foo');
    }));
  });

  test('Promise.race()', function(t) {
    t.test('it resolves when first passed promise resolves', before(function(st) {
      var toResolve = promiseArgs[1];
      st.plan(1);
      allPromise = Promise.race(promiseArgs.map(arg => arg.promise));

      allPromise.then((value) => st.equal(value, 'foo'));
      toResolve.resolveTrigger('foo');

      promiseArgs.forEach((arg, i) => arg.resolveTrigger(i));
    }));

    t.test('it rejects when first passed promise rejects', before(function(st) {
      var toReject = promiseArgs[2];
      st.plan(1);
      allPromise = Promise.race(promiseArgs.map(arg => arg.promise));

      allPromise.then(null, (reason) => st.equal(reason, 'foo'));
      toReject.rejectTrigger('foo');

      promiseArgs.forEach((arg, i) => arg.rejectTrigger(i));
    }));
  });

  test('Promise.reject()', function(t) {
    t.test('it returns a promise already rejected with reason', function(st) {
      var promise = Promise.reject('foo');
      st.plan(1);

      promise.then(null, reason => st.equal(reason, 'foo'));
    });
  });

  test('Promise.resolve()', function(t) {
    t.test('it returns a promise already resolved with value', function(st) {
      var promise = Promise.resolve('foo');
      st.plan(1);

      promise.then(value => st.equal(value, 'foo'));
    });
  });
}
