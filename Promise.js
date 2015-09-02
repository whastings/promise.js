export default function Promise(executor) {
  var state = {
    callbacks: [],
    self: this,
    status: 'pending'
  };

  state.rejectTrigger = reject.bind(this, state);
  state.resolveTrigger = callTrigger.bind(
    null, state, resolve.bind(this, state), state.rejectTrigger
  );

  this.then = then.bind(this, state);

  executor(state.resolveTrigger, state.rejectTrigger);
}

function callTrigger(state, resolveTrigger, rejectTrigger, arg) {
  var then = {};

  if (state.status !== 'pending') {
    return;
  }

  if (arg === state.self) {
    return rejectTrigger(new TypeError('Cannot resolve a promise with itself as the value'));
  }

  if (isObject(arg) && ('then' in arg)) {
    then = tryCatch(() => arg.then);
  }

  if (typeof then.value === 'function') {
    then.value.call(arg, state.resolveTrigger, state.rejectTrigger);
  } else if (then.error) {
    rejectTrigger(then.error);
  } else {
    resolveTrigger(arg);
  }
}

function isObject(value) {
  var type = typeof value;
  return value !== null && (type === 'object' || type === 'function');
}

function reject(state, message) {
  if (state.status !== 'pending') {
    return;
  }

  runRejectors(state.callbacks, message);

  state.message = message;
  state.status = 'rejected';
}

function resolve(state, value) {
  if (state.status !== 'pending') {
    return;
  }

  state.value = value;
  state.status = 'resolved';

  runResolvers(state.callbacks, value);
}

function runRejectors(rejectors, message) {
  setTimeout(function() {
    rejectors.forEach(runCallback.bind(null, 'reject', message));
  }, 0);
}

function runCallback(type, arg, data) {
  var { rejectCallback, resolveCallback, rejectTrigger, resolveTrigger } = data,
      isResolving = (type === 'resolve'),
      callback = isResolving ? resolveCallback : rejectCallback,
      trigger = isResolving ? resolveTrigger : rejectTrigger,
      cbReturn,
      error;

  if (callback) {
    cbReturn = tryCatch(callback, arg);
    if (cbReturn.hasOwnProperty('value')) {
      resolveTrigger(cbReturn.value);
    } else {
      rejectTrigger(cbReturn.error);
    }
  } else {
    trigger(arg);
  }
}

function runResolvers(resolvers, value) {
  setTimeout(function() {
    resolvers.forEach(runCallback.bind(null, 'resolve', value));
  }, 0);
}

function then(state, resolveCallback, rejectCallback) {
  var hasResolveFn = (typeof resolveCallback === 'function'),
      hasRejectFn = (typeof rejectCallback === 'function'),
      status = state.status,
      isResolved = (status === 'resolved'),
      isRejected = (status === 'rejected'),
      data = {};

  data.resolveCallback = hasResolveFn ? resolveCallback : null;
  data.rejectCallback = hasRejectFn ? rejectCallback : null;

  if (isResolved) {
    runResolvers([data], state.value);
  } else if (isRejected) {
    runRejectors([data], state.message);
  } else {
    state.callbacks.push(data);
  }

  return new Promise(function(resolve, reject) {
    data.resolveTrigger = resolve;
    data.rejectTrigger = reject;
  });
}

// Do try...catch is own function since it causes de-optimizations.
// See: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers
function tryCatch(fn, arg) {
  try {
    return {value: fn(arg)};
  } catch(error) {
    return {error};
  }
}
