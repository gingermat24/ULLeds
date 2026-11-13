"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { extractReleaseNotes, formatReleaseNotes } = require("../../scripts/release-notes");

const html = fs.readFileSync(path.join(__dirname, "..", "ui", "index.html"), "utf8");

test("GitHub release text is generated from every in-app changelog entry", () => {
  const entries = extractReleaseNotes(html);
  assert.equal(entries.length, 83);
  for (let version = 0; version <= 83; version += 1) {
    if (version === 67) continue;
    assert.ok(entries.some((entry) => entry.version === `1.0.${version}`));
  }
});

test("release workflow writes each generated Markdown line separately", () => {
  const workflow = fs.readFileSync(
    path.join(__dirname, "..", "..", ".github", "workflows", "release.yml"),
    "utf8"
  );
  assert.match(workflow, /node scripts\/release-notes\.js \$version \| Set-Content -Path \$notesPath -Encoding utf8NoBOM/);
  assert.doesNotMatch(workflow, /"\$notes`n"/);
});

test("release note output preserves categories and user-facing items", () => {
  const latestNotes = formatReleaseNotes(html, "1.0.83");
  assert.equal(
    latestNotes,
    "## ULLeds 1.0.83\n\n### Improved\n\n- Refined the strip profile editor with a centered monitor-edge picker, concise LED counts, and one Advanced section for LED counts and color order.\n- Adjusted live-preview LED spacing to the number of LEDs on each monitor edge.\n- Kept monitor edges in a consistent order and clarified manual LED-count validation.\n\n### Fixed\n\n- Separated selected monitor-edge indicators at the corners so adjacent bars stay visually distinct."
  );
  const notes = formatReleaseNotes(html, "1.0.82");
  assert.equal(
    notes,
    "## ULLeds 1.0.82\n\n### Fixed\n\n- Preserved headings and bullet lists in GitHub release descriptions so published changelogs display correctly."
  );
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
