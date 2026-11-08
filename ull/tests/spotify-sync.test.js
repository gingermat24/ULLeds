"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  analyzeSpotifySpectrum,
  createSpotifyReactiveColors,
  createSpotifySyncColors
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

test("Spotify audio analysis separates bass, mids, and treble energy", () => {
  const spectrum = new Float32Array(1024).fill(-Infinity);
  spectrum[4] = -18;
  spectrum[20] = -24;
  spectrum[150] = -30;

  const levels = analyzeSpotifySpectrum(spectrum, 48000, 2048);

  assert.ok(levels.bass > levels.mid);
  assert.ok(levels.mid > levels.treble);
  assert.ok(levels.energy > 0);
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
