"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { effectFrame, effectFrameInterval } = require("../effects");

const source = (effect, options = {}) => ({
  effect,
  color: "#123456",
  speed: 48,
  palette: ["#000000", "#ffffff"],
  ...options
});

test("solid effects return their configured color at full brightness", () => {
  assert.deepEqual(effectFrame(source("steady"), 1000), {
    color: "#123456",
    brightness: 1
  });
});

test("breathe effects vary brightness without changing their color", () => {
  const settings = source("breathe");
  const frames = [0, 1000, 2000, 3000].map((now) => effectFrame(settings, now));

  assert.ok(frames.every((frame) => frame.color === settings.color));
  assert.ok(frames.every((frame) => frame.brightness >= 0.16 && frame.brightness <= 1));
  assert.ok(new Set(frames.map((frame) => frame.brightness)).size > 1);
});

test("spectrum effects animate through hues", () => {
  const settings = source("spectrum");

  assert.notEqual(effectFrame(settings, 0).color, effectFrame(settings, 1000).color);
  assert.equal(effectFrame(settings, 1000).brightness, 1);
});

test("palette drift interpolates its configured colors", () => {
  const settings = source("palette");
  const halfwayThroughFirstColor = 500 / (0.55 * (0.12 + settings.speed / 180));

  assert.equal(effectFrame(settings, 0).color, "#000000");
  assert.equal(effectFrame(settings, halfwayThroughFirstColor).color, "#808080");
});

test("effect frame interval is shared and bounded by animation speed", () => {
  assert.equal(effectFrameInterval(1), 169);
  assert.equal(effectFrameInterval(100), 45);
});
