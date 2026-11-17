"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { buildColorSections } = require("../protocol");
const { createLightingFrame, scaleColorChannels } = require("../lighting-frame");

test("lighting frame snapshots the selected output and its scaling settings", () => {
  const colors = ["#804020", "#123456"];
  const channelGains = [100, 150, 50];
  const frame = createLightingFrame({
    source: "Spotify Sync",
    colors,
    brightness: 50,
    effectBrightness: 0.5,
    power: true,
    channelGains
  });

  colors[0] = "#000000";
  channelGains[0] = 50;

  assert.deepEqual(frame, {
    source: "Spotify Sync",
    colors: ["#804020", "#123456"],
    brightness: 50,
    effectBrightness: 0.5,
    power: true,
    channelGains: [100, 150, 50],
    frameType: "lighting"
  });
});

test("preview color scaling matches the RGB values encoded for the LEDs", () => {
  const frame = createLightingFrame({
    source: "Effect",
    colors: ["#804020"],
    brightness: 50,
    effectBrightness: 0.5,
    power: true,
    channelGains: [100, 150, 50]
  });
  const [section] = buildColorSections(
    frame.colors,
    frame.brightness,
    frame.power,
    frame.effectBrightness,
    "RGB",
    frame.channelGains
  );

  assert.deepEqual(
    scaleColorChannels(frame.colors[0], frame.brightness, frame.power, frame.effectBrightness, frame.channelGains),
    section.slice(1, 4)
  );
  assert.deepEqual(section.slice(1, 4), [32, 24, 4]);
  assert.deepEqual(
    scaleColorChannels(frame.colors[0], frame.brightness, false, frame.effectBrightness, frame.channelGains),
    [0, 0, 0]
  );
});

test("lighting frame rejects invalid colors and output settings", () => {
  assert.throws(() => createLightingFrame({ colors: [], brightness: 50, power: true }), TypeError);
  assert.throws(() => createLightingFrame({
    source: "Manual",
    colors: ["red"],
    brightness: 50,
    effectBrightness: 1,
    power: true,
    channelGains: [100, 100, 100]
  }), TypeError);
});
