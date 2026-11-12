"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { allocateEdgeIndices } = require("../strip-layout");

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

test("direct edge selection supports opposite sides and estimates counts by edge length", () => {
  const layout = allocateEdgeIndices(60, ["top", "bottom"]);
  assert.deepEqual(layout.counts, { top: 30, bottom: 30 });
  assert.deepEqual(layout.activeEdges.sort(), ["bottom", "top"]);

  const portraitSides = allocateEdgeIndices(60, ["top", "left", "right"], 0, { aspectRatio: 1 });
  assert.deepEqual(portraitSides.counts, { left: 20, top: 20, right: 20 });
});

test("manual edge counts preserve uneven physical strip lengths", () => {
  const layout = allocateEdgeIndices(63, ["top", "left"], 0, {
    edgeCounts: { left: 3, top: 60 }
  });
  assert.deepEqual(layout.counts, { left: 3, top: 60 });
  assert.equal(Object.values(layout.indices).flat().length, 63);
  assert.throws(() => allocateEdgeIndices(63, ["top", "left"], 0, {
    edgeCounts: { left: 3, top: 59 }
  }), RangeError);
});

test("invalid strip layouts are rejected", () => {
  assert.throws(() => allocateEdgeIndices(0, 3), RangeError);
  assert.throws(() => allocateEdgeIndices(75, 5), RangeError);
  assert.throws(() => allocateEdgeIndices(75, 3, 2), RangeError);
  assert.throws(() => allocateEdgeIndices(75, []), RangeError);
});
