import Promise from '../Promise';
import sinon from 'sinon';
import test from 'tape';

var promise,
    rejectTrigger,
    resolveTrigger;

function before(test) {
  return function(t) {
    promise = new Promise(function(resolve, reject) {
      resolveTrigger = resolve;
      rejectTrigger = reject;
    });

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

test('then() with success', function(t) {
  t.test('it takes callbacks that are called on resolution with value', before(function(st) {
    var callbacks = [sinon.spy(), sinon.spy(), sinon.spy()];
    st.plan(9);
    callbacks.forEach(cb => promise.then(cb));

    resolveTrigger('foo');

    callbacks.forEach(cb => st.notOk(cb.called));

    setTimeout(function() {
      callbacks.forEach(function(cb) {
        st.ok(cb.calledOnce);
        st.ok(cb.calledWith('foo'));
      });
    }, 0);
  }));

  t.test('it returns a promise that is resolved with return value of callback', before(function(st) {
    var secondPromise = promise.then(() => 'foo');
    st.plan(1);

    secondPromise.then(value => st.equal(value, 'foo'));
    resolveTrigger('bar');
  }));

  t.test('it returns a promise that is resolved w/ same value if success callback omitted', before(function(st) {
    var secondPromise = promise.then();
    st.plan(1);

    secondPromise.then(value => st.equal(value, 'bar'));
    resolveTrigger('bar');
  }));

  t.test('it does not invoke passed callback if one attempts to resolve twice', before(function(st) {
    st.plan(1);
    promise.then(() => st.pass());

    resolveTrigger();
    resolveTrigger();
  }));

  t.test('it automatically invokes resolver if promise is already resolved', before(function(st) {
    st.plan(3);

    resolveTrigger('foo');

    setTimeout(function() {
      promise.then(value => st.equal(value, 'foo'))
        .then(() => st.pass())
        .then(() => st.pass());
    }, 0);
  }));

  t.test('it rejects second promise if callback throws exception', before(function(st) {
    var secondPromise = promise.then(function() {
      throw new Error('foo');
    });
    st.plan(1);

    secondPromise.then(null, message => st.equal(message, 'foo'));
    resolveTrigger('bar');
  }));
});

test('then() with rejection', function(t) {
  t.test('it takes callbacks that are called on rejection w/ message', before(function(st) {
    var callbacks = [sinon.spy(), sinon.spy(), sinon.spy()];
    st.plan(9);
    callbacks.forEach(cb => promise.then(null, cb));

    rejectTrigger('foo');

    callbacks.forEach(cb => st.notOk(cb.called));

    setTimeout(function() {
      callbacks.forEach(function(cb) {
        st.ok(cb.calledOnce);
        st.ok(cb.calledWith('foo'));
      });
    }, 0);
  }));

  t.test('it returns a promise that is resolved with return value of callback', before(function(st) {
    var secondPromise = promise.then(null, () => 'foo');
    st.plan(1);

    secondPromise.then(value => st.equal(value, 'foo'));
    rejectTrigger('bar');
  }));

  t.test('it returns a promise that is rejected w/ same message if callback omitted', before(function(st) {
    var secondPromise = promise.then();
    st.plan(1);

    secondPromise.then(null, message => st.equal(message, 'foo'));
    rejectTrigger('foo');
  }));

  t.test('it does not invoke passed callback if one attempts to reject twice', before(function(st) {
    st.plan(1);
    promise.then(null, () => st.pass());

    rejectTrigger();
    rejectTrigger();
  }));

  t.test('it automatically invokes rejector if promise is already rejected', before(function(st) {
    st.plan(3);

    rejectTrigger('foo');

    setTimeout(function() {
      promise.then(null, message => st.equal(message, 'foo'))
        .then(() => st.pass())
        .then(() => st.pass());
    }, 0);
  }));

  t.test('it rejects second promise if callback throws exception', before(function(st) {
    var secondPromise = promise.then(null, function() {
      throw new Error('foo');
    });
    st.plan(1);

    secondPromise.then(null, message => st.equal(message, 'foo'));
    rejectTrigger('bar');
  }));
});
