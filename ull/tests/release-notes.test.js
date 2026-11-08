"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { extractReleaseNotes, formatReleaseNotes } = require("../../scripts/release-notes");

const html = fs.readFileSync(path.join(__dirname, "..", "ui", "index.html"), "utf8");

test("GitHub release text is generated from every in-app changelog entry", () => {
  const entries = extractReleaseNotes(html);
  assert.equal(entries.length, 61);
  for (let version = 0; version <= 60; version += 1) {
    assert.ok(entries.some((entry) => entry.version === `1.0.${version}`));
  }
});

test("release note output preserves categories and user-facing items", () => {
  const notes = formatReleaseNotes(html, "1.0.60");
  assert.match(notes, /^## ULLeds 1\.0\.60/m);
  assert.match(notes, /Spotify Sync now reacts to live desktop audio/);
  assert.match(notes, /flowing cover-art colors that pulse with bass, mids, and treble/);
  assert.match(notes, /### Improved/);
  assert.doesNotMatch(notes, /UI tests/);
});

test("HTML entities are decoded in GitHub release text", () => {
  const notes = formatReleaseNotes(
    '<article class="card release-entry"><header><h3>ULLeds 1.0.99</h3></header>' +
    '<div class="release-category"><strong>Improved</strong><ul><li>Color &amp; brightness.</li></ul></div></article>',
    "1.0.99"
  );
  assert.match(notes, /Color & brightness\./);
});
