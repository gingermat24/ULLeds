"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { averageColor, blendColorArrays, blendColors, sampleStripColors } = require("../screen-sync");
const { allocateEdgeIndices } = require("../strip-layout");

test("screen sync averages visible RGB channels and ignores transparent pixels", () => {
  assert.equal(averageColor(new Uint8ClampedArray([
    255, 0, 0, 255,
    0, 0, 255, 255,
    0, 255, 0, 0
  ])), "#800080");
});

test("screen sync eases color changes instead of jumping between frames", () => {
  assert.equal(blendColors("#000000", "#ffffff", 0.5), "#808080");
  assert.throws(() => blendColors("black", "#ffffff", 0.5), /Colors/);
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

test("screen sync blends each LED independently", () => {
  assert.deepEqual(
    blendColorArrays(["#000000", "#ff0000"], ["#ffffff", "#0000ff"], 0.5),
    ["#808080", "#800080"]
  );
  assert.throws(() => blendColorArrays(["#000000"], [], 0.5), /matching lengths/);
});
