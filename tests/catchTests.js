import { deferred } from './helpers';
import Promise from '../Promise';
import test from 'tape';

export default function catchTests() {
  var promise,
      rejectTrigger,
      resolveTrigger;

  function before(test) {
    return function(t) {
      ({ promise, rejectTrigger, resolveTrigger } = deferred()); // jshint ignore:line

      return test(t);
    };
  }

  test('catch()', function(t) {
    t.test('it calls callback when promise rejects', before(function(st) {
      st.plan(1);

      promise.catch((reason) => st.equal(reason, 'foo'));

      rejectTrigger('foo');
    }));

    t.test('it returns a promise', before(function(st) {
      st.plan(1);

      promise
        .catch((reason) => `${reason}bar`)
        .then((value) => st.equal(value, 'foobar'));

      rejectTrigger('foo');
    }));
  });
}
