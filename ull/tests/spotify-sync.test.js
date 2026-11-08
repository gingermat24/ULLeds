"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createSpotifySyncColors } = require("../spotify-sync");

test("Spotify Sync extracts cover-art colors and assigns artwork colors across the whole strip", () => {
  const pixels = new Uint8ClampedArray(4 * 4 * 4);
  for (let pixel = 0; pixel < 16; pixel += 1) {
    const color = pixel < 12 ? [240, 24, 32] : pixel < 14 ? [24, 48, 240] : [24, 220, 48];
    pixels.set([...color, 255], pixel * 4);
  }

  const colors = createSpotifySyncColors(pixels, 16);

  assert.equal(colors.length, 16);
  assert.ok(colors.every((color) => color !== "#000000"));
  assert.ok(colors.filter((color) => color === "#f01820").length > colors.filter((color) => color === "#1830f0").length);
  assert.ok(colors.includes("#1830f0"));
  assert.ok(colors.includes("#18dc30"));
});

test("Spotify Sync rejects invalid cover-art pixels and LED counts", () => {
  assert.throws(() => createSpotifySyncColors([255, 0, 0, 255], 4), TypeError);
  assert.throws(() => createSpotifySyncColors(new Uint8ClampedArray(5), 4), TypeError);
  assert.throws(() => createSpotifySyncColors(new Uint8ClampedArray(4), 0), TypeError);
});
