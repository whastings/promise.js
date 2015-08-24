export default function Promise(executor) {
  var state = {
    callbacks: [],
    status: 'pending'
  };

  var resolveTrigger = resolve.bind(this, state),
      rejectTrigger = reject.bind(this, state);

  this.then = then.bind(this, state);

  executor(resolveTrigger, rejectTrigger);
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
      error = cbReturn.error;
      rejectTrigger(error instanceof Error ? error.message : error);
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
