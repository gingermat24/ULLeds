"use strict";

const clampSpotify = (value, min, max) => Math.max(min, Math.min(max, value));

function createSpotifySyncColors(pixels, ledCount) {
  if (!(pixels instanceof Uint8ClampedArray) || pixels.length < 4 || pixels.length % 4 !== 0 ||
      !Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253) {
    throw new TypeError("Spotify cover-art pixels and LED count are invalid.");
  }

  const histogram = new Map();
  const hueHistogram = new Map();
  const neutral = { count: 0, red: 0, green: 0, blue: 0 };
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

    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const delta = maximum - minimum;
    const saturation = maximum === 0 ? 0 : delta / maximum;
    if (saturation < 0.16) {
      neutral.count += 1;
      neutral.red += red;
      neutral.green += green;
      neutral.blue += blue;
      continue;
    }

    let hue;
    if (maximum === red) hue = ((green - blue) / delta) % 6;
    else if (maximum === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue = (hue * 60 + 360) % 360;
    const hueBin = Math.floor(hue / 30);
    const colorBucket = hueHistogram.get(hueBin) || { count: 0, red: 0, green: 0, blue: 0 };
    colorBucket.count += 1;
    colorBucket.red += red;
    colorBucket.green += green;
    colorBucket.blue += blue;
    hueHistogram.set(hueBin, colorBucket);
  }

  const toColor = (bucket) => ({
    count: bucket.count,
    rgb: [
      Math.round(bucket.red / bucket.count),
      Math.round(bucket.green / bucket.count),
      Math.round(bucket.blue / bucket.count)
    ]
  });
  const candidates = [
    ...(neutral.count ? [toColor(neutral)] : []),
    ...[...hueHistogram.values()]
      .sort((left, right) => right.count - left.count)
      .map(toColor),
    ...[...histogram.values()]
      .sort((left, right) => right.count - left.count)
      .map(toColor)
  ];
  const palette = candidates.reduce((colors, candidate) => {
    if (colors.length >= 5) return colors;
    const distinct = colors.every(({ rgb }) =>
      rgb.reduce((distance, channel, index) => distance + (channel - candidate.rgb[index]) ** 2, 0) >= 28 ** 2
    );
    if (distinct) colors.push(candidate);
    return colors;
  }, []);

  if (palette.length === 0) throw new TypeError("Spotify cover art has no opaque pixels.");
  return Array.from({ length: ledCount }, (_, index) => {
    const { rgb } = palette[Math.floor(index / ledCount * palette.length)];
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
    if (!count) return 0;
    const decibels = 10 * Math.log10(power / count);
    return clampSpotify((decibels + 72) / 54, 0, 1);
  };
  const bass = bandLevel(40, 200);
  const mid = bandLevel(200, 2400);
  const treble = bandLevel(2400, 11000);
  const spectrum = Array.from({ length: 12 }, (_, index) => {
    const minimumHz = 40 * (11000 / 40) ** (index / 12);
    const maximumHz = 40 * (11000 / 40) ** ((index + 1) / 12);
    return bandLevel(minimumHz, maximumHz);
  });
  return {
    bass,
    mid,
    treble,
    energy: clampSpotify(bass * 0.45 + mid * 0.35 + treble * 0.2, 0, 1),
    spectrum
  };
}

function smoothSpotifyLevels(previous, current, elapsedMs) {
  if (!previous || !current ||
      !["bass", "mid", "treble", "energy"].every((key) =>
        Number.isFinite(previous[key]) && previous[key] >= 0 && previous[key] <= 1 &&
        Number.isFinite(current[key]) && current[key] >= 0 && current[key] <= 1) ||
      !Array.isArray(previous.spectrum) || !Array.isArray(current.spectrum) ||
      previous.spectrum.length !== current.spectrum.length ||
      !previous.spectrum.every((level) => Number.isFinite(level) && level >= 0 && level <= 1) ||
      !current.spectrum.every((level) => Number.isFinite(level) && level >= 0 && level <= 1) ||
      !Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new TypeError("Spotify audio smoothing data is invalid.");
  }

  const smooth = (from, to) => {
    const timeConstant = to > from ? 75 : 240;
    const amount = 1 - Math.exp(-Math.min(elapsedMs, 1000) / timeConstant);
    return from + (to - from) * amount;
  };
  return {
    bass: smooth(previous.bass, current.bass),
    mid: smooth(previous.mid, current.mid),
    treble: smooth(previous.treble, current.treble),
    energy: smooth(previous.energy, current.energy),
    spectrum: current.spectrum.map((level, index) => smooth(previous.spectrum[index], level))
  };
}

function createSpotifyReactiveColors(palette, levels, ledCount, elapsedSeconds, sensitivity = 65) {
  if (!Array.isArray(palette) || palette.length === 0 ||
      !palette.every((color) => typeof color === "string" && /^#[\da-f]{6}$/i.test(color)) ||
      !levels || !["bass", "mid", "treble", "energy"].every((key) =>
        Number.isFinite(levels[key]) && levels[key] >= 0 && levels[key] <= 1) ||
      (levels.spectrum !== undefined &&
        (!Array.isArray(levels.spectrum) || levels.spectrum.length === 0 ||
          !levels.spectrum.every((level) => Number.isFinite(level) && level >= 0 && level <= 1))) ||
      !Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253 ||
      !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0 ||
      !Number.isFinite(sensitivity) || sensitivity < 0 || sensitivity > 100) {
    throw new TypeError("Spotify audio-reactive colors are invalid.");
  }

  const rgbPalette = palette.map((color) =>
    color.slice(1).match(/.{2}/g).map((channel) => Number.parseInt(channel, 16))
  );
  const response = sensitivity / 100;
  const flow = elapsedSeconds * (0.025 + response * (0.08 + levels.energy * 0.2)) +
    response * (levels.mid * 0.24 + levels.treble * 0.08);
  return Array.from({ length: ledCount }, (_, index) => {
    const position = ((index / ledCount) * rgbPalette.length + flow) % rgbPalette.length;
    const first = Math.floor(position);
    const second = (first + 1) % rgbPalette.length;
    const blend = position - first;
    const stripPosition = ledCount > 1 ? index / (ledCount - 1) : 0.5;
    const wave = (Math.sin(stripPosition * Math.PI * 2 - elapsedSeconds * (0.45 + levels.bass * 0.8)) + 1) / 2;
    const bandLevel = Array.isArray(levels.spectrum)
      ? levels.spectrum[Math.min(levels.spectrum.length - 1, Math.floor(stripPosition * levels.spectrum.length))]
      : stripPosition < 0.34 ? levels.bass : stripPosition < 0.67 ? levels.mid : levels.treble;
    const pulse = clampSpotify(
      0.9 + response * (
        bandLevel * 0.28 +
        levels.energy * 0.08 +
        (wave - 0.5) * levels.bass * 0.12 +
        levels.treble * 0.03
      ),
      0.72,
      1.32
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
  createSpotifySyncColors,
  smoothSpotifyLevels
});
if (typeof module !== "undefined" && module.exports) module.exports = spotifySync;
else globalThis.ullSpotifySync = spotifySync;
