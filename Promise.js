import { isFunction, isObject, tryCatch } from './lib/helpers';
import addStaticMethods from './lib/staticMethods.js';

export default function Promise(executor) {
  var state = {
    callbacks: [],
    self: this,
    status: 'pending'
  };

  setTriggers(state);

  this.then = then.bind(null, state);

  executor(state.resolveTrigger, state.rejectTrigger);
}

addStaticMethods(Promise);

function reject(state, triggerState, reason) {
  if (triggerState.called) {
    return;
  }

  runRejectors(state.callbacks, reason);

  state.reason = reason;
  state.status = 'rejected';
  triggerState.called = true;
}

function resolve(state, triggerState, value) {
  var then = {},
      rejectTrigger = state.rejectTrigger,
      thenResult,
      newTriggerState;

  if (triggerState.called) {
    return;
  }

  if (value === state.self) {
    return rejectTrigger(new TypeError('Cannot resolve a promise with itself as the value'));
  }

  if (isObject(value) && ('then' in value)) {
    then = tryCatch(() => value.then);
  }

  if (isFunction(then.value)) {
    newTriggerState = setTriggers(state);
    thenResult = tryCatch(then.value.bind(value), state.resolveTrigger, state.rejectTrigger);
    if (thenResult.error && !newTriggerState.called) {
      rejectTrigger(thenResult.error);
    }
  } else if (then.error) {
    rejectTrigger(then.error);
  } else {
    state.value = value;
    state.status = 'resolved';
    runResolvers(state.callbacks, value);
  }

  triggerState.called = true;
}

function runRejectors(rejectors, reason) {
  setTimeout(function() {
    rejectors.forEach(runCallback.bind(null, 'reject', reason));
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

function setTriggers(state) {
  var triggerState = {called: false};
  state.rejectTrigger = reject.bind(null, state, triggerState);
  state.resolveTrigger = resolve.bind(null, state, triggerState);

  return triggerState;
}

function then(state, resolveCallback, rejectCallback) {
  var hasResolveFn = (isFunction(resolveCallback)),
      hasRejectFn = (isFunction(rejectCallback)),
      status = state.status,
      isResolved = (status === 'resolved'),
      isRejected = (status === 'rejected'),
      data = {};

  data.resolveCallback = hasResolveFn ? resolveCallback : null;
  data.rejectCallback = hasRejectFn ? rejectCallback : null;

  if (isResolved) {
    runResolvers([data], state.value);
  } else if (isRejected) {
    runRejectors([data], state.reason);
  } else {
    state.callbacks.push(data);
  }

  return new Promise(function(resolve, reject) {
    data.resolveTrigger = resolve;
    data.rejectTrigger = reject;
  });
}
