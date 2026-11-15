"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createLightingAnimation } = require("../lighting-animation");
const { SOURCE_PRIORITIES, createPriorityMux } = require("../priority-mux");

function createTimerHarness() {
  const timers = [];
  return {
    timers,
    setInterval(callback) {
      const timer = { callback, cleared: false };
      timers.push(timer);
      return timer;
    },
    clearInterval(timer) {
      timer.cleared = true;
    }
  };
}

test("an in-flight effect frame cannot be the final output after switching to solid", async () => {
  const timerHarness = createTimerHarness();
  const completedFrames = [];
  let finishSpectrumFrame;
  const state = { color: "#123456", effect: "spectrum", power: true, speed: 50 };
  const animation = createLightingAnimation({
    getSettings: () => state,
    getDevice: () => "device",
    isConnected: () => true,
    writeColor(color) {
      if (color === "spectrum") {
        return new Promise((resolve) => {
          finishSpectrumFrame = () => {
            completedFrames.push(color);
            resolve();
          };
        });
      }
      completedFrames.push(color);
      return Promise.resolve();
    },
    animatedColor: () => ({ color: "spectrum", brightness: 1 }),
    onWriteError: (error) => { throw error; },
    setIntervalImpl: timerHarness.setInterval,
    clearIntervalImpl: timerHarness.clearInterval
  });

  animation.update();
  const effectTick = timerHarness.timers.at(-1).callback();
  await Promise.resolve();
  state.effect = "steady";
  animation.update();
  finishSpectrumFrame();
  await effectTick;

  assert.equal(completedFrames.at(-1), state.color);
});

test("the priority mux arbitrates effect frames without pausing their source", async () => {
  const timerHarness = createTimerHarness();
  const mux = createPriorityMux();
  const writtenColors = [];
  const effectColors = ["#110000", "#220000", "#330000"];
  let now = 0;
  let nextColor = 0;
  mux.setInput({
    id: "manual-lighting",
    priority: SOURCE_PRIORITIES.manualLighting,
    colors: ["#123456"]
  });
  const animation = createLightingAnimation({
    getSettings: () => ({ color: "#123456", effect: "spectrum", power: true, speed: 50 }),
    getDevice: () => "device",
    isConnected: () => true,
    writeColor: () => {},
    writeEffectColor(color) {
      mux.setInput({
        id: "lighting-effects",
        priority: SOURCE_PRIORITIES.effects,
        colors: [color]
      });
      const winner = mux.getWinner(now);
      if (winner?.id === "lighting-effects") writtenColors.push(winner.colors[0]);
      return Promise.resolve();
    },
    animatedColor: () => ({ color: effectColors[nextColor++], brightness: 1 }),
    onWriteError: (error) => { throw error; },
    setIntervalImpl: timerHarness.setInterval,
    clearIntervalImpl: timerHarness.clearInterval,
    now: () => now
  });

  await animation.update({ waitForOutput: true });
  assert.deepEqual(writtenColors, ["#110000"]);

  mux.setInput({
    id: "phone-override",
    priority: SOURCE_PRIORITIES.temporaryOverride,
    colors: ["#ff00ff"],
    expiresAt: 100
  });
  writtenColors.push(mux.getWinner(now).colors[0]);
  now = 50;
  await timerHarness.timers.at(-1).callback();
  assert.equal(mux.getWinner(now).id, "phone-override");
  assert.equal(mux.getWinner(now).colors[0], "#ff00ff");
  assert.deepEqual(writtenColors, ["#110000", "#ff00ff"]);

  now = 100;
  mux.expire(now);
  await timerHarness.timers.at(-1).callback();
  assert.equal(mux.getWinner(now).id, "lighting-effects");
  assert.equal(writtenColors.at(-1), "#330000");
  animation.stop();
});
