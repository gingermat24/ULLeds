"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { SOURCE_PRIORITIES, createPriorityMux } = require("../priority-mux");

test("sync source priority levels remain ordered above fallback lighting", () => {
  assert.deepEqual(SOURCE_PRIORITIES, {
    manualLighting: 10,
    effects: 20,
    screenSync: 30,
    spotifySync: 40,
    temporaryOverride: 60
  });
});

test("the highest numeric priority wins and source updates do not alter its registration order", () => {
  const mux = createPriorityMux();
  mux.setInput({ id: "lighting", priority: SOURCE_PRIORITIES.manualLighting, colors: ["#101010"] });
  mux.setInput({ id: "screen", priority: SOURCE_PRIORITIES.screenSync, colors: ["#202020"] });
  mux.setInput({ id: "spotify", priority: SOURCE_PRIORITIES.spotifySync, colors: ["#303030"] });

  assert.equal(mux.getWinner(0).id, "spotify");
  mux.setInput({ id: "spotify", priority: SOURCE_PRIORITIES.spotifySync, colors: ["#404040"] });
  assert.deepEqual(mux.getWinner(0).colors, ["#404040"]);
  assert.equal(mux.release("spotify"), true);
  assert.equal(mux.getWinner(0).id, "screen");
});

test("equal priorities select the earliest registered input deterministically", () => {
  const mux = createPriorityMux();
  mux.setInput({ id: "first", priority: 30, colors: ["#111111"] });
  mux.setInput({ id: "second", priority: 30, colors: ["#222222"] });
  assert.equal(mux.getWinner(0).id, "first");
});

test("temporary overrides require an expiry and stop winning when expired", () => {
  const mux = createPriorityMux();
  mux.setInput({ id: "screen", priority: SOURCE_PRIORITIES.screenSync, colors: ["#111111"] });
  assert.throws(() => mux.setInput({
    id: "phone",
    priority: SOURCE_PRIORITIES.temporaryOverride,
    colors: ["#ffffff"]
  }), /expiry time/);

  mux.setInput({
    id: "phone",
    priority: SOURCE_PRIORITIES.temporaryOverride,
    colors: ["#ffffff"],
    expiresAt: 500
  });
  assert.equal(mux.getWinner(499).id, "phone");
  assert.equal(mux.getWinner(500).id, "screen");
  assert.deepEqual(mux.expire(500), ["phone"]);
  assert.equal(mux.getWinner(500).id, "screen");
});

test("priority inputs validate frames and return detached frame data", () => {
  const mux = createPriorityMux();
  assert.throws(() => mux.setInput({ id: "bad", priority: 10, colors: ["red"] }), TypeError);
  const colors = ["#123456"];
  mux.setInput({ id: "manual", priority: 10, colors });
  colors[0] = "#ffffff";
  const selected = mux.getWinner(0);
  assert.equal(selected.colors[0], "#123456");
  selected.colors[0] = "#000000";
  assert.equal(mux.getWinner(0).colors[0], "#123456");
});

test("priority winners preserve output framing and effect brightness metadata", () => {
  const mux = createPriorityMux();
  mux.setInput({
    id: "screen",
    priority: SOURCE_PRIORITIES.screenSync,
    colors: ["#101010"],
    frameType: "realtime"
  });
  mux.setInput({
    id: "effect",
    priority: SOURCE_PRIORITIES.effects,
    colors: ["#202020"],
    effectBrightness: 0.4
  });

  assert.equal(mux.getWinner(0).frameType, "realtime");
  assert.equal(mux.release("screen"), true);
  assert.equal(mux.getWinner(0).frameType, "lighting");
  assert.equal(mux.getWinner(0).effectBrightness, 0.4);
  assert.throws(() => mux.setInput({
    id: "invalid",
    priority: SOURCE_PRIORITIES.screenSync,
    colors: ["#000000"],
    frameType: "unknown"
  }), TypeError);
});
