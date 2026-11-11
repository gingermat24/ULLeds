"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { allocateEdgeIndices, createDefaultLedPositions, createStripLayout } = require("../strip-layout");

test("the three-side monitor layout maps visual LEDs to physical strip order", () => {
  const layout = allocateEdgeIndices(75, 3);
  assert.deepEqual(layout.counts, { left: 20, top: 35, right: 20 });
  assert.equal(layout.indices.left[0], 19);
  assert.equal(layout.indices.left.at(-1), 0);
  assert.equal(layout.indices.top[0], 20);
  assert.equal(layout.indices.top.at(-1), 54);
  assert.equal(layout.indices.right[0], 55);
  assert.equal(layout.indices.right.at(-1), 74);
  assert.equal(new Set(Object.values(layout.indices).flat()).size, 75);
});

test("the alternate strip direction reverses both order and edge orientation", () => {
  const layout = allocateEdgeIndices(75, 3, 1);
  assert.deepEqual(layout.counts, { right: 20, top: 35, left: 20 });
  assert.equal(layout.indices.right[0], 19);
  assert.equal(layout.indices.right.at(-1), 0);
  assert.equal(layout.indices.top[0], 54);
  assert.equal(layout.indices.top.at(-1), 20);
  assert.equal(layout.indices.left[0], 55);
  assert.equal(layout.indices.left.at(-1), 74);
});

test("LEDs are allocated across all configured sides without losing indices", () => {
  for (let edgeCount = 1; edgeCount <= 4; edgeCount += 1) {
    const layout = allocateEdgeIndices(253, edgeCount);
    const indices = Object.values(layout.indices).flat();
    assert.equal(indices.length, 253);
    assert.deepEqual([...indices].sort((a, b) => a - b), Array.from({ length: 253 }, (_, i) => i));
  }
});

test("invalid strip layouts are rejected", () => {
  assert.throws(() => allocateEdgeIndices(0, 3), RangeError);
  assert.throws(() => allocateEdgeIndices(75, 5), RangeError);
  assert.throws(() => allocateEdgeIndices(75, 3, 2), RangeError);
});

test("legacy profiles receive a complete position for every detected LED", () => {
  const legacy = allocateEdgeIndices(75, 3, 1);
  const layout = createStripLayout(75, { edgeCount: 3, installationMethod: 1 });
  assert.equal(layout.positions.length, 75);
  assert.deepEqual(layout.positions, createDefaultLedPositions(75, 3, 1));
  assert.deepEqual(layout.indices, legacy.indices);
  assert.deepEqual([...Object.values(layout.indices).flat()].sort((a, b) => a - b),
    Array.from({ length: 75 }, (_, index) => index));
});

test("manual positions keep physical LED indices while grouping by assigned side", () => {
  const positions = [
    { x: 25, y: 5, edge: "top" },
    { x: 80, y: 50, edge: "right" },
    { x: 20, y: 90, edge: "bottom" },
    { x: 5, y: 50, edge: "left" }
  ];
  const layout = createStripLayout(4, { edgeCount: 3, ledPositions: positions });

  assert.deepEqual(layout.positions, positions);
  assert.deepEqual(layout.indices, {
    top: [0],
    left: [3],
    right: [1],
    bottom: [2]
  });
  assert.deepEqual(layout.counts, { top: 1, left: 1, right: 1, bottom: 1 });
});

test("manual layouts must include exactly one valid coordinate for every LED", () => {
  assert.throws(() => createStripLayout(2, {
    edgeCount: 3,
    ledPositions: [{ x: 50, y: 50, edge: "top" }]
  }), /LED positions/);
  assert.throws(() => createStripLayout(1, {
    edgeCount: 3,
    ledPositions: [{ x: 101, y: 50, edge: "top" }]
  }), /LED positions/);
});
