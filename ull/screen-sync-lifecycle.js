(() => {
"use strict";

function createScreenSyncLifecycle() {
  let startPromise = null;
  let stopPromise = null;
  return {
    get isStarting() { return Boolean(startPromise); },
    get isStopping() { return Boolean(stopPromise); },
    start(operation) {
      if (startPromise || stopPromise) return Promise.resolve(false);
      const pending = Promise.resolve().then(operation);
      const tracked = pending.then(() => true).finally(() => {
        if (startPromise === tracked) startPromise = null;
      });
      startPromise = tracked;
      return tracked;
    },
    stop(cancel, operation) {
      if (stopPromise) return stopPromise;
      cancel();
      const startingAtStop = startPromise;
      const pending = Promise.resolve().then(async () => {
        let startError;
        if (startingAtStop) {
          try {
            await startingAtStop;
          } catch (error) {
            startError = error;
          }
        }
        await operation();
        if (startError) throw startError;
      });
      const tracked = pending.finally(() => {
        if (stopPromise === tracked) stopPromise = null;
      });
      stopPromise = tracked;
      return tracked;
    }
  };
}

const screenSyncLifecycle = Object.freeze({ createScreenSyncLifecycle });
if (typeof module !== "undefined" && module.exports) module.exports = screenSyncLifecycle;
else globalThis.ullScreenSyncLifecycle = screenSyncLifecycle;
})();
