"use strict";

const clampSpotify = (value, min, max) => Math.max(min, Math.min(max, value));

function createSpotifySyncColors(pixels, ledCount) {
  if (!(pixels instanceof Uint8ClampedArray) || pixels.length < 4 || pixels.length % 4 !== 0 ||
      !Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253) {
    throw new TypeError("Spotify cover-art pixels and LED count are invalid.");
  }

  const histogram = new Map();
  for (let offset = 0; offset < pixels.length; offset += 4) {
    if (pixels[offset + 3] < 128) continue;
    const red = pixels[offset];
    const green = pixels[offset + 1];
    const blue = pixels[offset + 2];
    const key = `${red >> 4}:${green >> 4}:${blue >> 4}`;
    const bucket = histogram.get(key) || { count: 0, red: 0, green: 0, blue: 0 };
    bucket.count += 1;
    bucket.red += red;
    bucket.green += green;
    bucket.blue += blue;
    histogram.set(key, bucket);
  }

  const palette = [...histogram.values()]
    .sort((left, right) => right.count - left.count)
    .reduce((colors, bucket) => {
      if (colors.length >= 5) return colors;
      const color = [
        Math.round(bucket.red / bucket.count),
        Math.round(bucket.green / bucket.count),
        Math.round(bucket.blue / bucket.count)
      ];
      const distinct = colors.every(({ rgb }) =>
        rgb.reduce((distance, channel, index) => distance + (channel - color[index]) ** 2, 0) >= 28 ** 2
      );
      if (distinct) colors.push({ count: bucket.count, rgb: color });
      return colors;
    }, []);

  if (palette.length === 0) throw new TypeError("Spotify cover art has no opaque pixels.");
  const totalWeight = palette.reduce((sum, color) => sum + color.count, 0);
  return Array.from({ length: ledCount }, (_, index) => {
    const target = ((index + 0.5) / ledCount) * totalWeight;
    let accumulated = 0;
    const { rgb } = palette.find(({ count }) => {
      accumulated += count;
      return target < accumulated;
    }) || palette[palette.length - 1];
    return `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  });
}

function analyzeSpotifySpectrum(frequencyData, sampleRate, fftSize) {
  if (!(frequencyData instanceof Float32Array) || frequencyData.length < 2 ||
      !Number.isFinite(sampleRate) || sampleRate <= 0 ||
      !Number.isInteger(fftSize) || fftSize < frequencyData.length * 2) {
    throw new TypeError("Spotify audio spectrum data is invalid.");
  }
  const binWidth = sampleRate / fftSize;
  const bandLevel = (minimumHz, maximumHz) => {
    const firstBin = Math.max(1, Math.ceil(minimumHz / binWidth));
    const lastBin = Math.min(frequencyData.length - 1, Math.floor(maximumHz / binWidth));
    let power = 0;
    let count = 0;
    for (let bin = firstBin; bin <= lastBin; bin += 1) {
      const decibels = frequencyData[bin];
      if (!Number.isFinite(decibels) || decibels <= -120) continue;
      power += 10 ** (decibels / 10);
      count += 1;
    }
    return count ? clampSpotify(Math.sqrt(power / count) * 12, 0, 1) : 0;
  };
  const bass = bandLevel(40, 200);
  const mid = bandLevel(200, 2400);
  const treble = bandLevel(2400, 11000);
  return {
    bass,
    mid,
    treble,
    energy: clampSpotify(bass * 0.45 + mid * 0.35 + treble * 0.2, 0, 1)
  };
}

function createSpotifyReactiveColors(palette, levels, ledCount, elapsedSeconds) {
  if (!Array.isArray(palette) || palette.length === 0 ||
      !palette.every((color) => typeof color === "string" && /^#[\da-f]{6}$/i.test(color)) ||
      !levels || !["bass", "mid", "treble", "energy"].every((key) =>
        Number.isFinite(levels[key]) && levels[key] >= 0 && levels[key] <= 1) ||
      !Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253 ||
      !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
    throw new TypeError("Spotify audio-reactive colors are invalid.");
  }

  const rgbPalette = palette.map((color) =>
    color.slice(1).match(/.{2}/g).map((channel) => Number.parseInt(channel, 16))
  );
  const flow = elapsedSeconds * (0.08 + levels.energy * 0.9);
  return Array.from({ length: ledCount }, (_, index) => {
    const position = ((index / ledCount) * rgbPalette.length + flow) % rgbPalette.length;
    const first = Math.floor(position);
    const second = (first + 1) % rgbPalette.length;
    const blend = position - first;
    const stripPosition = ledCount > 1 ? index / (ledCount - 1) : 0.5;
    const wave = (Math.sin(stripPosition * Math.PI * 2 - elapsedSeconds * (2 + levels.bass * 8)) + 1) / 2;
    const pulse = clampSpotify(
      0.56 + levels.energy * 0.3 + wave * levels.bass * 0.52 + levels.treble * 0.12,
      0.4,
      1.35
    );
    const color = rgbPalette[first].map((channel, channelIndex) =>
      Math.round(clampSpotify(
        (channel * (1 - blend) + rgbPalette[second][channelIndex] * blend) * pulse,
        0,
        255
      ))
    );
    return `#${color.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  });
}

const spotifySync = Object.freeze({
  analyzeSpotifySpectrum,
  createSpotifyReactiveColors,
  createSpotifySyncColors
});
if (typeof module !== "undefined" && module.exports) module.exports = spotifySync;
else globalThis.ullSpotifySync = spotifySync;
