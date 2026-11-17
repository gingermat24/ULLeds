"use strict";

const isValidColor = (color) => typeof color === "string" && /^#[\da-f]{6}$/i.test(color);

function createLightingFrame({
  source = null,
  colors,
  brightness,
  effectBrightness = 1,
  power,
  channelGains,
  frameType = "lighting"
} = {}) {
  if ((source !== null && typeof source !== "string") ||
      !Array.isArray(colors) || colors.length < 1 || colors.length > 253 ||
      !colors.every(isValidColor) ||
      !Number.isFinite(brightness) || brightness < 0 || brightness > 100 ||
      !Number.isFinite(effectBrightness) || effectBrightness < 0 || effectBrightness > 1 ||
      typeof power !== "boolean" ||
      !Array.isArray(channelGains) || channelGains.length !== 3 ||
      channelGains.some((gain) => !Number.isInteger(gain) || gain < 50 || gain > 150) ||
      !["lighting", "realtime"].includes(frameType)) {
    throw new TypeError("Lighting frame details are invalid.");
  }

  return {
    source,
    colors: [...colors],
    brightness,
    effectBrightness,
    power,
    channelGains: [...channelGains],
    frameType
  };
}

function scaleColorChannels(color, brightness, power, effectBrightness, channelGains) {
  if (!isValidColor(color) || !Number.isFinite(brightness) || brightness < 0 || brightness > 100 ||
      typeof power !== "boolean" || !Number.isFinite(effectBrightness) ||
      effectBrightness < 0 || effectBrightness > 1 ||
      !Array.isArray(channelGains) || channelGains.length !== 3 ||
      channelGains.some((gain) => !Number.isInteger(gain) || gain < 50 || gain > 150)) {
    throw new TypeError("Lighting color scaling details are invalid.");
  }

  const factor = power ? brightness / 100 * effectBrightness : 0;
  return color.slice(1).match(/../g).map((part, index) =>
    Math.round(Number.parseInt(part, 16) * factor * channelGains[index] / 100)
  );
}

const lightingFrame = Object.freeze({ createLightingFrame, scaleColorChannels });
if (typeof module !== "undefined" && module.exports) module.exports = lightingFrame;
else globalThis.ullLightingFrame = lightingFrame;
