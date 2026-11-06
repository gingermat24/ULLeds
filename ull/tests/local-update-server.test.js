"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { createLocalUpdateServer } = require("../local-update-server");

async function createFeed(t) {
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), "ulleds-update-feed-"));
  t.after(() => fs.rm(folder, { recursive: true, force: true }));
  const installer = "ULLeds-Setup-1.1.0-x64.exe";
  await fs.writeFile(path.join(folder, installer), "installer bytes");
  await fs.writeFile(`${path.join(folder, installer)}.blockmap`, "block map bytes");
  await fs.writeFile(path.join(folder, "latest.yml"), JSON.stringify({
    version: "1.1.0",
    files: [{ url: installer, sha512: "test-digest", size: 15, blockMapSize: 15 }],
    path: installer,
    sha512: "test-digest",
    releaseDate: "2026-01-01T00:00:00.000Z"
  }));
  const server = await createLocalUpdateServer(folder);
  t.after(() => server.close());
  return { server, installer };
}

test("local update server serves metadata and installer byte ranges", async (t) => {
  const { server, installer } = await createFeed(t);

  const metadata = await fetch(server.url);
  assert.equal(metadata.status, 200);
  assert.equal((await metadata.json()).version, "1.1.0");

  const range = await fetch(new URL(installer, server.url), {
    headers: { Range: "bytes=3-7" }
  });
  assert.equal(range.status, 206);
  assert.equal(range.headers.get("content-range"), "bytes 3-7/15");
  assert.equal(await range.text(), "talle");

  const head = await fetch(new URL(installer, server.url), { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get("content-length"), "15");
});

test("local update server rejects traversal and invalid byte ranges", async (t) => {
  const { server } = await createFeed(t);

  const traversal = await fetch(new URL("%2e%2e%2foutside.exe", server.url));
  assert.equal(traversal.status, 404);

  const invalidRange = await fetch(new URL("ULLeds-Setup-1.1.0-x64.exe", server.url), {
    headers: { Range: "bytes=4-2" }
  });
  assert.equal(invalidRange.status, 416);
});

test("local update server rejects malformed metadata", async (t) => {
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), "ulleds-invalid-feed-"));
  t.after(() => fs.rm(folder, { recursive: true, force: true }));
  await fs.writeFile(path.join(folder, "latest.yml"), JSON.stringify({
    version: "1.1",
    files: [{ url: "../outside.exe" }]
  }));
  await assert.rejects(createLocalUpdateServer(folder), /invalid differential-update metadata/);
});
