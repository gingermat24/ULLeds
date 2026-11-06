"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { findUpdate } = require("../update-feed");

async function makeFeed(t, version = "1.1.0", content = "installer bytes") {
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), "dx-light-feed-"));
  t.after(() => fs.rm(folder, { recursive: true, force: true }));
  const artifact = `ULLeds-Setup-${version}-x64.exe`;
  await fs.writeFile(path.join(folder, artifact), content);
  const sha256 = crypto.createHash("sha256").update(content).digest("hex");
  await fs.writeFile(path.join(folder, "ulleds-update.json"), JSON.stringify({ version, artifact, sha256 }));
  return folder;
}

test("local update feed verifies a newer installer and its checksum", async (t) => {
  const folder = await makeFeed(t);
  const result = await findUpdate(folder, "1.0.0");
  assert.equal(result.available, true);
  assert.equal(result.version, "1.1.0");
  assert.equal(path.basename(result.artifact), "ULLeds-Setup-1.1.0-x64.exe");
});

test("local update feed rejects an installer with a mismatched checksum", async (t) => {
  const folder = await makeFeed(t);
  await fs.writeFile(path.join(folder, "ULLeds-Setup-1.1.0-x64.exe"), "changed");
  const result = await findUpdate(folder, "1.0.0");
  assert.equal(result.available, false);
  assert.match(result.error, /checksum/);
});

test("local update feed ignores the current version and rejects malformed manifests", async (t) => {
  const folder = await makeFeed(t, "1.0.0");
  const upToDate = await findUpdate(folder, "1.0.0");
  assert.equal(upToDate.available, false);
  assert.match(upToDate.error, /already up to date/);
  await fs.writeFile(path.join(folder, "ulleds-update.json"), JSON.stringify({ version: "2.0.0", artifact: "..\\outside.exe" }));
  const malformed = await findUpdate(folder, "1.0.0");
  assert.equal(malformed.available, false);
  assert.match(malformed.error, /invalid/);
});

test("local update feed remains compatible with DX Light installer manifests", async (t) => {
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), "dx-light-legacy-feed-"));
  t.after(() => fs.rm(folder, { recursive: true, force: true }));
  const artifact = "DX-Light-Setup-1.1.0-x64.exe";
  const content = "legacy installer bytes";
  await fs.writeFile(path.join(folder, artifact), content);
  const sha256 = crypto.createHash("sha256").update(content).digest("hex");
  await fs.writeFile(path.join(folder, "dx-light-update.json"), JSON.stringify({
    version: "1.1.0",
    artifact,
    sha256
  }));
  const result = await findUpdate(folder, "1.0.4");
  assert.equal(result.available, true);
  assert.equal(result.version, "1.1.0");
});
