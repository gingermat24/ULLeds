"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  analyzeSpotifySpectrum,
  createSpotifyReactiveColors,
  createSpotifySyncColors,
  smoothSpotifyLevels
} = require("../spotify-sync");

test("Spotify Sync extracts cover-art colors and assigns artwork colors across the whole strip", () => {
  const pixels = new Uint8ClampedArray(4 * 4 * 4);
  for (let pixel = 0; pixel < 16; pixel += 1) {
    const color = pixel < 12 ? [240, 24, 32] : pixel < 14 ? [24, 48, 240] : [24, 220, 48];
    pixels.set([...color, 255], pixel * 4);
  }

  const colors = createSpotifySyncColors(pixels, 16);

  assert.equal(colors.length, 16);
  assert.ok(colors.every((color) => color !== "#000000"));
  assert.ok(colors.filter((color) => color === "#f01820").length > colors.filter((color) => color === "#1830f0").length);
  assert.ok(colors.includes("#1830f0"));
  assert.ok(colors.includes("#18dc30"));
});

test("Spotify Sync rejects invalid cover-art pixels and LED counts", () => {
  assert.throws(() => createSpotifySyncColors([255, 0, 0, 255], 4), TypeError);
  assert.throws(() => createSpotifySyncColors(new Uint8ClampedArray(5), 4), TypeError);
  assert.throws(() => createSpotifySyncColors(new Uint8ClampedArray(4), 0), TypeError);
});

test("Spotify Sync preserves small accent colors from mostly neutral cover art", () => {
  const pixels = new Uint8ClampedArray(1000 * 4);
  for (let index = 0; index < 1000; index += 1) {
    const color = index < 900 ? [248, 248, 248]
      : index < 950 ? [244, 44, 156]
        : [32, 96, 240];
    pixels.set([...color, 255], index * 4);
  }

  const colors = createSpotifySyncColors(pixels, 20);
  const count = (color) => colors.filter((candidate) => candidate === color).length;

  assert.ok(count("#f8f8f8") >= 5, "dominant neutral color should remain present");
  assert.ok(count("#f42c9c") >= 5, "small pink accent should reach multiple LEDs");
  assert.ok(count("#2060f0") >= 5, "small blue accent should reach multiple LEDs");
});

test("Spotify Sync reacts to live audio while cover art stays unchanged", () => {
  const artwork = ["#d82040", "#2548d8", "#e4c228"];
  const quiet = createSpotifyReactiveColors(
    artwork,
    { bass: 0.02, mid: 0.01, treble: 0.01, energy: 0.02 },
    24,
    0
  );
  const beat = createSpotifyReactiveColors(
    artwork,
    { bass: 0.95, mid: 0.72, treble: 0.48, energy: 0.8 },
    24,
    0.25
  );

  assert.equal(quiet.length, 24);
  assert.equal(beat.length, 24);
  assert.notDeepEqual(beat, quiet);
  assert.ok(new Set(beat).size > 1, "audio-reactive frame should spread colors across the strip");
});

test("Spotify audio bands produce visible color changes at corresponding strip positions", () => {
  const colors = createSpotifyReactiveColors(
    ["#808080"],
    {
      bass: 0,
      mid: 0,
      treble: 0,
      energy: 0,
      spectrum: [...Array(6).fill(0), ...Array(6).fill(1)]
    },
    12,
    0
  );

  assert.equal(new Set(colors.slice(0, 6)).size, 1);
  assert.equal(new Set(colors.slice(6)).size, 1);
  assert.notEqual(colors[0], colors[11]);
});

test("Spotify audio analysis separates bass, mids, and treble energy", () => {
  const spectrum = new Float32Array(1024).fill(-Infinity);
  spectrum[4] = -18;
  spectrum[20] = -24;
  spectrum[150] = -30;

  const levels = analyzeSpotifySpectrum(spectrum, 48000, 2048);

  assert.ok(levels.bass > levels.mid);
  assert.ok(levels.mid > levels.treble);
  assert.ok(levels.energy > 0);
  assert.equal(levels.spectrum.length, 12);
  assert.ok(levels.spectrum.every((level) => Number.isFinite(level) && level >= 0 && level <= 1));
});

test("Spotify audio smoothing softens sudden changes and releases more gradually", () => {
  const quiet = { bass: 0, mid: 0, treble: 0, energy: 0, spectrum: Array(12).fill(0) };
  const loud = { bass: 1, mid: 1, treble: 1, energy: 1, spectrum: Array(12).fill(1) };
  const attack = smoothSpotifyLevels(quiet, loud, 16);
  const release = smoothSpotifyLevels(attack, quiet, 16);

  assert.ok(attack.energy > 0 && attack.energy < 0.5);
  assert.ok(release.energy > 0 && release.energy < attack.energy);
  assert.throws(() => smoothSpotifyLevels(quiet, loud, -1), TypeError);
});

test("Spotify audio meter levels span a visible range from quiet to loud signals", () => {
  const analyzeBass = (decibels) => {
    const frequencyData = new Float32Array(1024).fill(-Infinity);
    frequencyData[4] = decibels;
    return analyzeSpotifySpectrum(frequencyData, 48000, 2048).bass;
  };
  const quiet = analyzeBass(-65);
  const moderate = analyzeBass(-48);
  const loud = analyzeBass(-30);

  assert.ok(quiet < moderate);
  assert.ok(moderate < loud);
  assert.ok(loud - quiet > 0.5);
});

test("Spotify audio response control scales the brightness movement", () => {
  const artwork = ["#d82040", "#2548d8", "#e4c228"];
  const levels = { bass: 0.95, mid: 0.72, treble: 0.48, energy: 0.8 };
  const still = createSpotifyReactiveColors(artwork, levels, 24, 0.25, 0);
  const responsive = createSpotifyReactiveColors(artwork, levels, 24, 0.25, 100);

  assert.notDeepEqual(responsive, still);
  assert.throws(() => createSpotifyReactiveColors(artwork, levels, 24, 0, -1), TypeError);
  assert.throws(() => createSpotifyReactiveColors(artwork, levels, 24, 0, 101), TypeError);
});

test("Spotify reactive colors reject invalid audio levels and palettes", () => {
  assert.throws(() => createSpotifyReactiveColors([], {}, 8, 0), TypeError);
  assert.throws(() => createSpotifyReactiveColors(["red"], {}, 8, 0), TypeError);
  assert.throws(() => createSpotifyReactiveColors(
    ["#ffffff"],
    { bass: -1, mid: 0, treble: 0, energy: 0 },
    8,
    0
  ), TypeError);
});
