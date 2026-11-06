/**
 * Mouse-tracking worker thread (Windows only).
 *
 * Spawned by src/main/runtime.js when the "fps optimization" setting is on.
 * Posts the mouse position so the main process can down-clock screen capture
 * while the user is moving the cursor.
 */
const { parentPort } = require("worker_threads");
const { startMouseTracking, stopMouseTracking } = require("@warren-robobloq/quiklight");

const sleepInterval = 100;

startMouseTracking((position) => {
  parentPort.postMessage(position);
}, sleepInterval);

parentPort.on("message", (message) => {
  if (message === "exit") {
    stopMouseTracking();
    parentPort.close();
  }
});
