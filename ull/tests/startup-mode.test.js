"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { isSyncStartupMode, normalizeStartupMode } = require("../startup-mode");

test("only known lighting modes are restored and old Screen Sync preference migrates", () => {
  assert.equal(normalizeStartupMode("lighting"), "lighting");
  assert.equal(normalizeStartupMode("screen"), "screen");
  assert.equal(normalizeStartupMode("spotify"), "spotify");
  assert.equal(normalizeStartupMode("unknown"), "lighting");
  assert.equal(normalizeStartupMode(undefined, true), "screen");
  assert.equal(normalizeStartupMode(undefined, false), "lighting");
});

test("only capture modes require a renderer at hidden Windows startup", () => {
  assert.equal(isSyncStartupMode("lighting"), false);
  assert.equal(isSyncStartupMode("screen"), true);
  assert.equal(isSyncStartupMode("spotify"), true);
  assert.equal(isSyncStartupMode("invalid"), false);
});
