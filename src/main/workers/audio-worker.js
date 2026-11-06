/**
 * Audio-rhythm worker thread.
 *
 * Spawned by src/main/runtime.js when "computer rhythm" / music mode is
 * enabled. The native addon analyses system audio and posts a 0..1 loudness
 * value that the main process turns into a color pulse.
 *
 * workerData:
 *   audioInterval - analysis interval in ms
 */
const { parentPort, workerData } = require("worker_threads");
const { startStream, stopStream } = require("@warren-robobloq/quiklight");

const { audioInterval } = workerData;

startStream((level) => {
  // Clamp tiny noise to silence so the LEDs stay off in quiet passages.
  parentPort.postMessage(level <= 0.01 ? 0 : level);
}, audioInterval);

parentPort.on("message", (message) => {
  if (message === "exit") {
    stopStream();
    parentPort.close();
  }
});
