"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  colorChanges,
  gradientChanges,
  selectLed,
  selectLedRange
} = require("../led-selection");

test("clicking selects one LED and additive clicks toggle additional LEDs", () => {
  const first = selectLed(null, 4);
  const multiple = selectLed(selectLed(first, 9, true), 4, true);
  assert.deepEqual([...first], [4]);
  assert.deepEqual([...multiple], [9]);
  assert.throws(() => selectLed(null, 253), RangeError);
});

test("Shift selection includes every LED between the anchor and clicked LED", () => {
  assert.deepEqual([...selectLedRange(3, 7)], [3, 4, 5, 6, 7]);
  assert.deepEqual([...selectLedRange(7, 3)], [3, 4, 5, 6, 7]);
  assert.throws(() => selectLedRange(0, 253), RangeError);
});

test("a color change updates only selected LED indices", () => {
  assert.deepEqual(
    colorChanges("#000000", { 1: "#111111", 7: "#777777" }, new Set([1, 3]), "#ff00ff"),
    { ledColors: { 1: "#ff00ff", 3: "#ff00ff", 7: "#777777" } }
  );
});

test("a whole-strip color change clears individual overrides", () => {
  assert.deepEqual(
    colorChanges("#000000", { 1: "#111111" }, null, "#ffffff"),
    { color: "#ffffff", ledColors: {} }
  );
});

test("a gradient blends in strip order and keeps colors outside the selection", () => {
  assert.deepEqual(
    gradientChanges(
      { 0: "#111111", 2: "#222222", 4: "#444444" },
      new Set([4, 1, 3]),
      5,
      "#000000",
      "#ffffff"
    ),
    {
      ledColors: {
        0: "#111111",
        1: "#000000",
        2: "#222222",
        3: "#808080",
        4: "#ffffff"
      }
    }
  );
});

test("a whole-strip gradient covers each LED and a one-LED gradient uses its start color", () => {
  assert.deepEqual(gradientChanges({}, null, 3, "#ff0000", "#0000ff"), {
    ledColors: { 0: "#ff0000", 1: "#800080", 2: "#0000ff" }
  });
  assert.deepEqual(gradientChanges({}, new Set([2]), 3, "#12ab34", "#ffffff"), {
    ledColors: { 2: "#12ab34" }
  });
});

test("gradient application rejects empty, out-of-range, and invalid input", () => {
  assert.throws(() => gradientChanges({}, new Set(), 5, "#000000", "#ffffff"), RangeError);
  assert.throws(() => gradientChanges({}, new Set([5]), 5, "#000000", "#ffffff"), RangeError);
  assert.throws(() => gradientChanges({}, null, 0, "#000000", "#ffffff"), TypeError);
  assert.throws(() => gradientChanges({}, null, 5, "invalid", "#ffffff"), TypeError);
});
