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

    secondPromise.then(null, error => st.equal(error.message, 'foo'));
    resolveTrigger('bar');
  }));

  t.test('it returns promise linked to promise returned by callback', before(function(st) {
    var returnPromise, secondPromise, resolver;
    st.plan(1);

    returnPromise = new Promise(function(resolve) {
      resolver = resolve;
    });

    secondPromise = promise.then(() => returnPromise);
    secondPromise.then(value => st.equal(value, 'foo'));

    resolveTrigger();
    resolver('foo');
  }));

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

    secondPromise.then(null, error => st.equal(error.message, 'foo'));
    rejectTrigger('bar');
  }));

  t.test('it returns promise linked to promise returned by callback', before(function(st) {
    var returnPromise, secondPromise, resolver;
    st.plan(1);

    returnPromise = new Promise(function(resolve) {
      resolver = resolve;
    });

    secondPromise = promise.then(null, () => returnPromise);
    secondPromise.then(value => st.equal(value, 'foo'));

    rejectTrigger();
    resolver('foo');
  }));
});
