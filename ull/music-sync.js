"use strict";

function createMusicSyncColors(frequencies, ledCount) {
  if (!(frequencies instanceof Uint8Array) || frequencies.length < 2 ||
      !Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253) {
    throw new TypeError("Music Sync frequency data and LED count are invalid.");
  }

  const maxBin = frequencies.length - 1;
  return Array.from({ length: ledCount }, (_, index) => {
    const position = (index + 0.5) / ledCount;
    const bin = Math.min(maxBin, Math.max(1, Math.round(position * maxBin)));
    const energy = Math.max(0, (frequencies[bin] - 48) / (255 - 48));
    if (energy <= 0) return "#000000";

    const hue = 270 * (1 - position);
    const saturation = 0.9;
    const value = energy * 0.82;
    const chroma = value * saturation;
    const hueSegment = hue / 60;
    const second = chroma * (1 - Math.abs(hueSegment % 2 - 1));
    const components = hueSegment < 1
      ? [chroma, second, 0]
      : hueSegment < 2
        ? [second, chroma, 0]
        : hueSegment < 3
          ? [0, chroma, second]
          : hueSegment < 4
            ? [0, second, chroma]
            : hueSegment < 5
              ? [second, 0, chroma]
              : [chroma, 0, second];
    const offset = value - chroma;
    return `#${components
      .map((component) => Math.round((component + offset) * 255).toString(16).padStart(2, "0"))
      .join("")}`;
  });
}

const musicSync = Object.freeze({ createMusicSyncColors });
if (typeof module !== "undefined" && module.exports) module.exports = musicSync;
else globalThis.ullMusicSync = musicSync;
