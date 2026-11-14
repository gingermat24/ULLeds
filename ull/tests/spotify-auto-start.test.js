"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createSpotifyAutoStartGate } = require("../spotify-auto-start");

test("auto-start triggers once for each transition into playback", () => {
  const gate = createSpotifyAutoStartGate();

  assert.equal(gate.observe("Playing", true), true);
  gate.markAttempted();
  assert.equal(gate.observe("Playing", true), false);
  assert.equal(gate.observe("Paused", true), false);
  assert.equal(gate.observe("Playing", true), true);
});

test("auto-start stays pending until the caller can start, and disabling clears it", () => {
  const gate = createSpotifyAutoStartGate();

  assert.equal(gate.observe("Playing", true), true);
  assert.equal(gate.observe("Playing", true), true);
  assert.equal(gate.observe("Playing", false), false);
  assert.equal(gate.observe("Playing", true), true);
});

test("stopped or unavailable playback never starts sync", () => {
  const gate = createSpotifyAutoStartGate();

  assert.equal(gate.observe(null, true), false);
  assert.equal(gate.observe("Stopped", true), false);
  assert.equal(gate.observe("Paused", true), false);
});
