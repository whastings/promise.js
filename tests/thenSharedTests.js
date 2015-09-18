import { deferred } from './helpers';
import Promise from '../Promise';
import sinon from 'sinon';

export default function thenSharedTests(type, t) {
  var isResolved = (type === 'resolved'),
      promise,
      rejectTrigger,
      resolveTrigger,
      trigger;

  function before(test) {
    return function(t) {
      ({ promise, rejectTrigger, resolveTrigger } = deferred()); // jshint ignore:line
      trigger = isResolved ? resolveTrigger : rejectTrigger;

      return test(t);
    };
  }

  t.test('it takes callbacks that are called when promise settled', before(function(st) {
    var callbacks = [sinon.spy(), sinon.spy(), sinon.spy()];
    st.plan(9);

    callbacks.forEach(
      isResolved ? (cb) => promise.then(cb) : (cb) => promise.then(null, cb)
    );

    trigger('foo');

    callbacks.forEach(cb => st.notOk(cb.called));

    setTimeout(function() {
      callbacks.forEach(function(cb) {
        st.ok(cb.calledOnce);
        st.ok(cb.calledWith('foo'));
      });
    }, 0);
  }));

  t.test('it returns a promise that is resolved with return value of callback', before(function(st) {
    var callback = () => 'foo';
    var secondPromise = isResolved ? promise.then(callback) :
      promise.then(null, callback);
    st.plan(1);

    secondPromise.then(value => st.equal(value, 'foo'));
    trigger('bar');
  }));

  t.test('it returns a promise that is settled w/ same result if callback omitted', before(function(st) {
    var callback = (result) => st.equal(result, 'foo');
    var secondPromise = promise.then();
    st.plan(1);

    isResolved ? secondPromise.then(callback) : secondPromise.then(null, callback);
    trigger('foo');
  }));

  t.test('it does not invoke passed callback if one attempts to settle twice', before(function(st) {
    var callback = () => st.pass();
    st.plan(1);

    isResolved ? promise.then(callback) : promise.then(null, callback);

    trigger();
    trigger();
  }));

  t.test('it automatically invokes callback if promise is already settled', before(function(st) {
    st.plan(3);

    trigger('foo');

    setTimeout(function() {
      var callback = (result) => st.equal(result, 'foo');
      var secondPromise = isResolved ? promise.then(callback) :
        promise.then(null, callback);

      secondPromise
        .then(() => st.pass())
        .then(() => st.pass());
    }, 0);
  }));

  t.test('it rejects second promise if callback throws exception', before(function(st) {
    var callback = function() {
      throw new Error('foo');
    };
    var secondPromise = isResolved ? promise.then(callback) :
      promise.then(null, callback);
    st.plan(1);

    secondPromise.then(null, error => st.equal(error.message, 'foo'));
    trigger('bar');
  }));

  t.test('it returns promise linked to promise returned by callback', before(function(st) {
    var returnPromise, secondPromise, resolver;
    var callback = () => returnPromise;
    st.plan(1);

    returnPromise = new Promise(function(resolve) {
      resolver = resolve;
    });

    secondPromise = isResolved ? promise.then(callback) : promise.then(null, callback);
    secondPromise.then((result) => st.equal(result, 'foo'));

    trigger();
    resolver('foo');
  }));
}
