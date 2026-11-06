/**
 * Screen-capture worker thread.
 *
 * Spawned by src/main/runtime.js when "sync screen" starts. The native
 * @warren-robobloq/quiklight addon grabs the configured displays, samples
 * them, and posts a color frame back to the main process on every tick.
 *
 * workerData:
 *   displays       - array of Electron display descriptors to capture
 *   finalSyncSpeed - effective capture speed (user syncSpeed + 20)
 *   samplingRate   - sampling interval in ms
 */
const { parentPort, workerData } = require("worker_threads");
const { startCaptureMultiScreens, stopCaptureMultiScreens } = require("@warren-robobloq/quiklight");

const { displays, finalSyncSpeed, samplingRate } = workerData;

process.on("uncaughtException", (error) => {
  parentPort.postMessage({ type: "error", error: error.stack });
});

process.on("unhandledRejection", (reason) => {
  parentPort.postMessage({ type: "unhandled-rejection", reason });
});

try {
  startCaptureMultiScreens(
    (frame) => {
      parentPort.postMessage(frame);
    },
    displays,
    finalSyncSpeed,
    samplingRate
  );
} catch (error) {
  throw new Error(error);
}

parentPort.on("message", (message) => {
  if (message === "exit") {
    stopCaptureMultiScreens();
    parentPort.close();
  }
});
