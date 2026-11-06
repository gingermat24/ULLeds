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

function colorChanges(currentColor, currentLedColors, selection, color) {
  if (selection === null) return { color, ledColors: {} };
  const ledColors = { ...currentLedColors };
  selection.forEach((index) => { ledColors[index] = color; });
  return { ledColors };
}

const ledSelection = Object.freeze({ selectLed, colorChanges });
if (typeof module !== "undefined" && module.exports) module.exports = ledSelection;
else globalThis.ullLedSelection = ledSelection;
