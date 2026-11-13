"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { formatReleaseNotes } = require("../../scripts/release-notes");

const root = path.join(__dirname, "..", "..");
const version = require(path.join(root, "package.json")).version;
const releaseNotesPath = path.join(root, "docs", "releases", `${version}.md`);

test("release notes are maintained outside the app package", () => {
  const notes = fs.readFileSync(releaseNotesPath, "utf8");
  assert.equal(formatReleaseNotes(notes, version), notes.trim().replace(/\r\n/g, "\n"));

  const html = fs.readFileSync(path.join(root, "ull", "ui", "index.html"), "utf8");
  const app = fs.readFileSync(path.join(root, "ull", "ui", "app.js"), "utf8");
  const packageConfig = require(path.join(root, "package.json"));
  assert.doesNotMatch(html, /changelog-data|Built-in changelog/);
  assert.doesNotMatch(app, /loadBuiltinChangelog|releases\.builtin/);
  assert.deepEqual(packageConfig.build.files, ["package.json", "ull/**", "!ull/tests/**", "!ull/ui/_preview-light.html"]);
});

test("release workflow publishes the matching versioned Markdown notes", () => {
  const workflow = fs.readFileSync(
    path.join(root, ".github", "workflows", "release.yml"),
    "utf8"
  );
  assert.match(workflow, /node scripts\/release-notes\.js \$version \| Set-Content -Path \$notesPath -Encoding utf8NoBOM/);
  assert.match(fs.readFileSync(releaseNotesPath, "utf8"), new RegExp(`^## ULLeds ${version}$`, "m"));
});

test("release note formatting validates version, category, and bullet", () => {
  const notes = fs.readFileSync(releaseNotesPath, "utf8");
  assert.match(formatReleaseNotes(notes, version), /Load release notes and history directly from published GitHub releases/);
  assert.throws(() => formatReleaseNotes(notes, "bad-version"), /X\.Y\.Z/);
  assert.throws(() => formatReleaseNotes("## ULLeds 1.0.84\n\nNo category", "1.0.84"), /category and at least one bullet/);
  assert.throws(() => formatReleaseNotes("## ULLeds 1.0.83\n\n### Fixed\n\n- Note", "1.0.84"), /must start/);
});
