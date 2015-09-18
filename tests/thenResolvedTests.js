import { deferred } from './helpers';
import Promise from '../Promise';
import sinon from 'sinon';
import test from 'tape';
import thenSharedTests from './thenSharedTests';

export default function thenResolvedTests() {
  var promise,
      rejectTrigger,
      resolveTrigger;

  function before(test) {
    return function(t) {
      ({ promise, rejectTrigger, resolveTrigger } = deferred()); // jshint ignore:line

      return test(t);
    };
  }

  test('then() with resolution', function(t) {
    thenSharedTests('resolved', t);

    t.test('it rejects promise if returned promise rejects', before(function(st) {
      var returnPromise, secondPromise, rejector;
      st.plan(1);

      returnPromise = new Promise(function(resolve, reject) {
        rejector = reject;
      });

      secondPromise = promise.then(() => returnPromise);
      secondPromise.then(null, message => st.equal(message, 'foo'));

      resolveTrigger();
      rejector('foo');
    }));

    t.test('it adopts state of promise if resolved w/ thenable', before(function(st) {
      var resolver, secondPromise;
      st.plan(1);

      secondPromise = new Promise(function(resolve, reject) {
        resolver = resolve;
      });

      promise.then(value => st.equal(value, 'foo'));
      resolveTrigger(secondPromise);
      resolver('foo');
    }));

    t.test('it ignores resolution with more than one thenable', before(function(st) {
      var thenable1 = {then: sinon.spy()},
          thenable2 = {then: sinon.spy()};
      st.plan(2);
      resolveTrigger(thenable1);
      resolveTrigger(thenable2);

      st.ok(thenable1.then.calledOnce);
      st.notOk(thenable2.then.called);
    }));

    t.test('it ignores rejection if resolved with a thenable', before(function(st) {
      var thenable = {then: sinon.spy()};
      st.plan(1);

      promise.then(null, () => st.fail());
      resolveTrigger(thenable);
      rejectTrigger();

      st.ok(thenable.then.calledOnce);
    }));
  });
}
