"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { sampleStripColors } = require("../screen-sync");
const { allocateEdgeIndices } = require("../strip-layout");

test("screen sync does not invent a color from a one-pixel highlight", () => {
  const width = 5;
  const height = 5;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let offset = 0; offset < pixels.length; offset += 4) {
    pixels.set([0, 0, 0, 255], offset);
  }
  pixels.set([255, 0, 0, 255], (1 * width + 1) * 4);
  const colors = sampleStripColors(pixels, width, height, {
    ledCount: 1,
    indices: { top: [0] }
  });

  assert.equal(["#000000", "#ff0000"].includes(colors[0]), true);
});

test("screen sync samples one color for each physical LED position", () => {
  const pixels = new Uint8ClampedArray(16 * 12 * 4);
  for (let index = 0; index < pixels.length; index += 4) {
    pixels.set([24, 96, 180, 255], index);
  }
  const layout = allocateEdgeIndices(75, 3);
  const colors = sampleStripColors(pixels, 16, 12, layout);
  assert.equal(colors.length, 75);
  assert.equal(colors.every((color) => color === "#1860b4"), true);
  assert.throws(() => sampleStripColors(pixels, 15, 12, layout), /image and strip layout/);
});

test("screen sync preserves different screen colors at individual LED positions", () => {
  const width = 80;
  const height = 45;
  const pixels = new Uint8ClampedArray(width * height * 4);
  const colors = [
    [255, 0, 0, 255],
    [0, 255, 0, 255],
    [0, 0, 255, 255],
    [255, 255, 0, 255]
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const color = colors[Math.min(3, Math.floor(x / 20))];
      pixels.set(color, (y * width + x) * 4);
    }
  }
  assert.deepEqual(
    sampleStripColors(pixels, width, height, {
      ledCount: 4,
      indices: { top: [0, 1, 2, 3] }
    }),
    ["#ff0000", "#00ff00", "#0000ff", "#ffff00"]
  );
});

test("screen sync maps front-view left and right screen colors to matching strip sides in either direction", () => {
  const width = 80;
  const height = 45;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      pixels.set(x < width / 2 ? [255, 0, 0, 255] : [0, 0, 255, 255], (y * width + x) * 4);
    }
  }

  for (const installationMethod of [0, 1]) {
    const layout = allocateEdgeIndices(75, 3, installationMethod);
    const colors = sampleStripColors(pixels, width, height, layout);
    assert.equal(layout.indices.left.every((index) => colors[index] === "#ff0000"), true);
    assert.equal(layout.indices.right.every((index) => colors[index] === "#0000ff"), true);
    assert.equal(colors[layout.indices.top[0]], "#ff0000");
    assert.equal(colors[layout.indices.top.at(-1)], "#0000ff");
  }
});
