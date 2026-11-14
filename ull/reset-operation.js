"use strict";

function createResetAttempt() {
  let cancelled = false;
  let resolveCancellation;
  const cancellation = new Promise((resolve) => {
    resolveCancellation = resolve;
  });

  return Object.freeze({
    get cancelled() {
      return cancelled;
    },
    cancel() {
      if (cancelled) return false;
      cancelled = true;
      resolveCancellation();
      return true;
    },
    wait(operation) {
      const result = Promise.resolve(operation).then(
        (value) => ({ cancelled: false, value }),
        (error) => ({ cancelled: false, error })
      );
      return Promise.race([
        result,
        cancellation.then(() => ({ cancelled: true }))
      ]).then((outcome) => {
        if (cancelled || outcome.cancelled) return { cancelled: true };
        if (Object.hasOwn(outcome, "error")) throw outcome.error;
        return outcome;
      });
    }
  });
}

const resetOperation = Object.freeze({ createResetAttempt });
if (typeof module !== "undefined" && module.exports) module.exports = resetOperation;
else globalThis.ullResetOperation = resetOperation;
