export default function Promise(executor) {
  var state = {
    rejectors: [],
    resolvers: [],
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

  // TODO: Pass message to all rejectors

  state.message = message;
  state.status = 'rejected';
}

function resolve(state, value) {
  if (state.status !== 'pending') {
    return;
  }
  state.value = value;
  state.status = 'resolved';

  runResolvers(state.resolvers, value);
}

function runResolvers(resolvers, value) {
  setTimeout(function() {
    resolvers.forEach(function(resolver) {
      var { callback, trigger } = resolver;
      if (typeof callback === 'function') {
        trigger(callback(value));
      } else {
        trigger(value);
      }
    });
  }, 0);
}

function then(state, resolveCallback, rejectCallback) {
  var hasResolveFn = (typeof resolveCallback === 'function'),
      hasRejectFn = (typeof rejectCallback === 'function'),
      status = state.status,
      isResolved = (status === 'resolved'),
      resolver = {};

  if (hasResolveFn) {
    resolver.callback = resolveCallback;
  }
  if (isResolved) {
    runResolvers([resolver], state.value);
  } else {
    state.resolvers.push(resolver);
  }

  // TODO: If already rejected, call new rejectCB and return

  return new Promise(function(resolve) {
    resolver.trigger = resolve;
  });
}
