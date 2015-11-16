import { deferred } from './helpers';
import Promise from '../lib/Unbreakable';
import test from 'tape';

export default function constructorTests() {
  var promise,
      rejectTrigger,
      resolveTrigger;

  function before(test) {
    return function(t) {
      ({ promise, rejectTrigger, resolveTrigger } = deferred()); // jshint ignore:line

      return test(t);
    };
  }

  test('Promise()', function(t) {
    t.test('it takes a callback and passes it resolve and reject functions', before(function(st) {
      st.plan(2);

      st.equal(typeof resolveTrigger, 'function');
      st.equal(typeof rejectTrigger, 'function');
    }));
  });
}
