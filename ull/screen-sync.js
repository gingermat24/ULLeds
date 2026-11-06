"use strict";

function averageColor(pixels) {
  if (!pixels || !Number.isInteger(pixels.length) || pixels.length < 4 || pixels.length % 4 !== 0) {
    throw new TypeError("Screen pixels must be RGBA data.");
  }
  let red = 0;
  let green = 0;
  let blue = 0;
  let weight = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3] / 255;
    red += pixels[index] * alpha;
    green += pixels[index + 1] * alpha;
    blue += pixels[index + 2] * alpha;
    weight += alpha;
  }
  if (weight === 0) return "#000000";
  return `#${[red, green, blue]
    .map((channel) => Math.round(channel / weight).toString(16).padStart(2, "0"))
    .join("")}`;
}

function blendColors(from, to, amount) {
  if (!/^#[\da-f]{6}$/i.test(from) || !/^#[\da-f]{6}$/i.test(to) ||
      !Number.isFinite(amount) || amount < 0 || amount > 1) {
    throw new TypeError("Colors must be six-digit hex values and blend amount must be from 0 to 1.");
  }
  const left = from.slice(1).match(/../g);
  const right = to.slice(1).match(/../g);
  return `#${left.map((channel, index) => {
    const value = Number.parseInt(channel, 16);
    const target = Number.parseInt(right[index], 16);
    return Math.round(value + (target - value) * amount).toString(16).padStart(2, "0");
  }).join("")}`;
}

function sampleStripColors(pixels, width, height, layout) {
  if (!pixels || !Number.isInteger(width) || width < 1 ||
      !Number.isInteger(height) || height < 1 ||
      pixels.length !== width * height * 4 ||
      !layout || !Number.isInteger(layout.ledCount) || !layout.indices) {
    throw new TypeError("Screen image and strip layout are invalid.");
  }
  const colors = Array(layout.ledCount).fill("#000000");
  const samplePosition = (edge, position, count) => {
    const along = Math.round((position + 0.5) / count * ((edge === "top" || edge === "bottom" ? width : height) - 1));
    if (edge === "top") return [along, Math.min(height - 1, Math.max(0, Math.round(height * 0.06)))];
    if (edge === "bottom") return [along, Math.min(height - 1, Math.max(0, Math.round(height * 0.94)))];
    if (edge === "left") return [Math.min(width - 1, Math.max(0, Math.round(width * 0.06))), along];
    return [Math.min(width - 1, Math.max(0, Math.round(width * 0.94))), along];
  };
  for (const [edge, indices] of Object.entries(layout.indices)) {
    indices.forEach((ledIndex, position) => {
      const [centerX, centerY] = samplePosition(edge, position, indices.length);
      const sample = [];
      for (let y = Math.max(0, centerY - 1); y <= Math.min(height - 1, centerY + 1); y += 1) {
        for (let x = Math.max(0, centerX - 1); x <= Math.min(width - 1, centerX + 1); x += 1) {
          const offset = (y * width + x) * 4;
          sample.push(pixels[offset], pixels[offset + 1], pixels[offset + 2], pixels[offset + 3]);
        }
      }
      colors[ledIndex] = averageColor(sample);
    });
  }
  return colors;
}

function blendColorArrays(from, to, amount) {
  if (!Array.isArray(from) || !Array.isArray(to) || from.length !== to.length) {
    throw new TypeError("Color arrays must have matching lengths.");
  }
  return to.map((color, index) => from[index] ? blendColors(from[index], color, amount) : color);
}

const screenSync = Object.freeze({ averageColor, blendColorArrays, blendColors, sampleStripColors });
if (typeof module !== "undefined" && module.exports) module.exports = screenSync;
else globalThis.ullScreenSync = screenSync;
