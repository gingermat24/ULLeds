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

function gradientChanges(currentLedColors, selection, ledCount, startColor, endColor) {
  if (!Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253 ||
      !/^#[\da-f]{6}$/i.test(startColor) || !/^#[\da-f]{6}$/i.test(endColor)) {
    throw new TypeError("Gradient colors or LED count are invalid.");
  }
  const indices = selection === null
    ? Array.from({ length: ledCount }, (_, index) => index)
    : [...selection].sort((left, right) => left - right);
  if (indices.length === 0 || indices.some((index) =>
    !Number.isInteger(index) || index < 0 || index >= ledCount)) {
    throw new RangeError("Select valid LEDs before applying a gradient.");
  }

  const start = [1, 3, 5].map((offset) => Number.parseInt(startColor.slice(offset, offset + 2), 16));
  const end = [1, 3, 5].map((offset) => Number.parseInt(endColor.slice(offset, offset + 2), 16));
  const ledColors = { ...currentLedColors };
  indices.forEach((index, position) => {
    const progress = indices.length === 1 ? 0 : position / (indices.length - 1);
    const color = start.map((channel, component) =>
      Math.round(channel + (end[component] - channel) * progress)
        .toString(16)
        .padStart(2, "0")
    ).join("");
    ledColors[index] = `#${color}`;
  });
  return { ledColors };
}

const ledSelection = Object.freeze({
  selectLed,
  selectLedRange,
  colorChanges,
  gradientChanges
});
if (typeof module !== "undefined" && module.exports) module.exports = ledSelection;
else globalThis.ullLedSelection = ledSelection;
