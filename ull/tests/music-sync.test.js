"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createMusicSyncColors } = require("../music-sync");

test("Music Sync maps silence to black and active frequency bands to colors", () => {
  const frequencies = new Uint8Array(16);
  assert.deepEqual(createMusicSyncColors(frequencies, 4), Array(4).fill("#000000"));

  frequencies.fill(0);
  frequencies[2] = 255;
  frequencies[13] = 255;
  const colors = createMusicSyncColors(frequencies, 4);

  assert.equal(colors.length, 4);
  assert.notEqual(colors[0], "#000000");
  assert.notEqual(colors[3], "#000000");
  assert.notEqual(colors[0], colors[3]);
  assert.equal(colors[1], "#000000");
  assert.equal(colors[2], "#000000");
});

test("Music Sync rejects invalid frequency data and LED counts", () => {
  assert.throws(() => createMusicSyncColors([0, 0], 4), TypeError);
  assert.throws(() => createMusicSyncColors(new Uint8Array(1), 4), TypeError);
  assert.throws(() => createMusicSyncColors(new Uint8Array(2), 0), TypeError);
});
