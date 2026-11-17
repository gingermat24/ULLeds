"use strict";

/**
 * Time-based lighting effects shared by the main process (LED output) and the
 * renderer (live preview), so both always show the same animation.
 */

function hueColor(hue) {
  const h = ((hue % 360) + 360) % 360 / 60;
  const chroma = 1;
  const x = chroma * (1 - Math.abs((h % 2) - 1));
  const bands = [[1, x, 0], [x, 1, 0], [0, 1, x], [0, x, 1], [x, 0, 1], [1, 0, x]];
  const rgb = bands[Math.floor(h)];
  return `#${rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("")}`;
}

function effectFrame(sourceSettings, now = Date.now()) {
  const seconds = (now / 1000) * (0.12 + sourceSettings.speed / 180);
  if (sourceSettings.effect === "breathe") {
    return {
      color: sourceSettings.color,
      brightness: 0.16 + (Math.sin(seconds * Math.PI * 2) + 1) * 0.42
    };
  }
  if (sourceSettings.effect === "spectrum") {
    return { color: hueColor(seconds * 55), brightness: 1 };
  }
  if (sourceSettings.effect === "palette") {
    const colors = Array.isArray(sourceSettings.palette) && sourceSettings.palette.length
      ? sourceSettings.palette
      : [sourceSettings.color];
    const step = (seconds * 0.55) % colors.length;
    const index = Math.floor(step);
    const blend = step - index;
    const from = colors[index];
    const to = colors[(index + 1) % colors.length];
    const fromRgb = from.slice(1).match(/../g);
    const toRgb = to.slice(1).match(/../g);
    return {
      color: `#${fromRgb.map((part, channel) => {
        const a = parseInt(part, 16);
        const b = parseInt(toRgb[channel], 16);
        return Math.round(a + (b - a) * blend).toString(16).padStart(2, "0");
      }).join("")}`,
      brightness: 1
    };
  }
  return { color: sourceSettings.color, brightness: 1 };
}

function effectFrameInterval(speed) {
  return Math.max(40, Math.round(170 - Number(speed) * 1.25));
}

const effects = Object.freeze({ effectFrame, effectFrameInterval });
if (typeof module !== "undefined" && module.exports) module.exports = effects;
else globalThis.ullEffects = effects;
