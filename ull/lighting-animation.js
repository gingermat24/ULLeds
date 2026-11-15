"use strict";

function createLightingAnimation({
  getSettings,
  getDevice,
  isConnected,
  writeColor,
  writeEffectColor = writeColor,
  animatedColor,
  onWriteError,
  setIntervalImpl = setInterval,
  clearIntervalImpl = clearInterval,
  now = Date.now
} = {}) {
  if (typeof getSettings !== "function" || typeof getDevice !== "function" ||
      typeof isConnected !== "function" ||
      typeof writeColor !== "function" || typeof writeEffectColor !== "function" ||
      typeof animatedColor !== "function" ||
      typeof onWriteError !== "function" || typeof setIntervalImpl !== "function" ||
      typeof clearIntervalImpl !== "function" || typeof now !== "function") {
    throw new TypeError("Lighting animation dependencies are invalid.");
  }

  let timer = null;
  let writing = false;
  let generation = 0;
  let stopped = false;

  function clearTimer() {
    if (timer) clearIntervalImpl(timer);
    timer = null;
  }

  function reportFailure(error, device, message) {
    console.error(message, error);
    onWriteError(error, device);
  }

  function update({ waitForOutput = false } = {}) {
    stopped = false;
    const requestGeneration = ++generation;
    clearTimer();
    const settings = getSettings();
    const powerOff = !settings.power;
    if (!isConnected() || powerOff || settings.effect === "steady") {
      if (!isConnected()) return;
      const device = getDevice();
      const output = Promise.resolve(writeColor(settings.color, 1, settings.power))
        .catch((error) => {
          reportFailure(error, device, "LED color write failed:");
          throw error;
        });
      if (waitForOutput) return output;
      void output.catch(() => {});
      return;
    }

    const interval = Math.max(40, Math.round(170 - settings.speed * 1.25));
    timer = setIntervalImpl(async () => {
      if (requestGeneration !== generation || writing || !isConnected()) return;
      writing = true;
      const device = getDevice();
      try {
        const frame = animatedColor(now());
        await writeEffectColor(frame.color, frame.brightness);
      } catch (error) {
        reportFailure(error, device, "LED animation write failed:");
      } finally {
        writing = false;
        if (requestGeneration !== generation && !stopped) {
          reconcileLatestFrame();
        }
      }
    }, interval);
    timer?.unref?.();
    if (waitForOutput) return writeAnimatedFrame(requestGeneration);
  }

  function stop() {
    stopped = true;
    generation += 1;
    clearTimer();
  }

  function writeAnimatedFrame(requestGeneration) {
    if (requestGeneration !== generation || !isConnected()) return;
    const device = getDevice();
    const frame = animatedColor(now());
    const output = Promise.resolve(writeEffectColor(frame.color, frame.brightness))
      .catch((error) => {
        reportFailure(error, device, "LED animation write failed:");
        throw error;
      });
    return output;
  }

  function reconcileLatestFrame() {
    const settings = getSettings();
    const powerOff = !settings.power;
    if (!isConnected()) {
      return;
    }

    if (!powerOff && settings.effect !== "steady") {
      void writeAnimatedFrame(generation)?.catch(() => {});
      return;
    }

    const device = getDevice();
    void Promise.resolve(writeColor(settings.color, 1, settings.power))
      .catch((error) => reportFailure(error, device, "LED color write failed:"));
  }

  return Object.freeze({ update, stop });
}

module.exports = { createLightingAnimation };
