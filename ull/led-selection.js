"use strict";

function selectLed(selection, index, additive = false) {
  if (!Number.isInteger(index) || index < 0 || index > 252) {
    throw new RangeError("LED index must be between 0 and 252.");
  }
  if (!additive) return new Set([index]);
  const next = new Set(selection || []);
  if (next.has(index)) next.delete(index);
  else next.add(index);
  return next;
}

function selectLedRange(anchorIndex, index) {
  for (const value of [anchorIndex, index]) {
    if (!Number.isInteger(value) || value < 0 || value > 252) {
      throw new RangeError("LED index must be between 0 and 252.");
    }
  }
  const first = Math.min(anchorIndex, index);
  const last = Math.max(anchorIndex, index);
  return new Set(Array.from({ length: last - first + 1 }, (_, offset) => first + offset));
}

function colorChanges(currentColor, currentLedColors, selection, color) {
  if (selection === null) return { color, ledColors: {} };
  const ledColors = { ...currentLedColors };
  selection.forEach((index) => { ledColors[index] = color; });
  return { ledColors };
}

const ledSelection = Object.freeze({ selectLed, selectLedRange, colorChanges });
if (typeof module !== "undefined" && module.exports) module.exports = ledSelection;
else globalThis.ullLedSelection = ledSelection;
