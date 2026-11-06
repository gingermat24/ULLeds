"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { colorChanges, selectLed } = require("../led-selection");

test("clicking selects one LED and additive clicks toggle additional LEDs", () => {
  const first = selectLed(null, 4);
  const multiple = selectLed(selectLed(first, 9, true), 4, true);
  assert.deepEqual([...first], [4]);
  assert.deepEqual([...multiple], [9]);
  assert.throws(() => selectLed(null, 253), RangeError);
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
