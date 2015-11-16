import Promise from '../Promise';

export function deferred() {
  var rejectTrigger,
      resolveTrigger;

  var promise = new Promise(function(resolve, reject) {
    resolveTrigger = resolve;
    rejectTrigger = reject;
  });

  return {promise, rejectTrigger, resolveTrigger};
}
