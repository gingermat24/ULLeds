"use strict";

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
  const sampleColor = (centerX, centerY) => {
    const samples = [];
    for (let y = Math.max(0, centerY - 1); y <= Math.min(height - 1, centerY + 1); y += 1) {
      for (let x = Math.max(0, centerX - 1); x <= Math.min(width - 1, centerX + 1); x += 1) {
        const offset = (y * width + x) * 4;
        if (pixels[offset + 3] === 0) continue;
        samples.push({
          red: pixels[offset],
          green: pixels[offset + 1],
          blue: pixels[offset + 2],
          distance: (x - centerX) ** 2 + (y - centerY) ** 2
        });
      }
    }
    if (!samples.length) return "#000000";

    const representative = samples.reduce((best, candidate) => {
      const cost = samples.reduce((sum, sample) =>
        sum +
          (candidate.red - sample.red) ** 2 +
          (candidate.green - sample.green) ** 2 +
          (candidate.blue - sample.blue) ** 2, 0);
      const bestCost = samples.reduce((sum, sample) =>
        sum +
          (best.red - sample.red) ** 2 +
          (best.green - sample.green) ** 2 +
          (best.blue - sample.blue) ** 2, 0);
      return cost < bestCost || (cost === bestCost && candidate.distance < best.distance)
        ? candidate
        : best;
    });
    return `#${[representative.red, representative.green, representative.blue]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")}`;
  };
  for (const [edge, indices] of Object.entries(layout.indices)) {
    indices.forEach((ledIndex, position) => {
      const [centerX, centerY] = samplePosition(edge, position, indices.length);
      colors[ledIndex] = sampleColor(centerX, centerY);
    });
  }
  return colors;
}

const screenSync = Object.freeze({ sampleStripColors });
if (typeof module !== "undefined" && module.exports) module.exports = screenSync;
else globalThis.ullScreenSync = screenSync;
