"use strict";

const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { createScreenSyncDiagnostics } = require("../screen-sync-diagnostics");

test("Screen Sync diagnostics count HID commands without recording sampled colors", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "ulleds-screen-sync-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const logPath = path.join(directory, "screen-sync-diagnostics.log");
  const diagnostics = createScreenSyncDiagnostics(logPath, () => {});

  diagnostics.start({ fps: 30, ledCount: 75, audioTracks: 0 });
  diagnostics.recordHidWrite("SC", "queued");
  diagnostics.recordHidWrite("SC", "written");
  diagnostics.recordHidWrite("RB", "queued");
  diagnostics.recordHidWrite("RB", "superseded");
  await diagnostics.stop("user");

  const entries = (await fs.readFile(logPath, "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.equal(entries[0].event, "session-start");
  assert.equal(entries[0].audioTracks, 0);
  assert.equal(entries[1].event, "hid-summary");
  assert.deepEqual(entries[1].SC, { queued: 1, written: 1, superseded: 0, failed: 0 });
  assert.deepEqual(entries[1].RB, { queued: 1, written: 0, superseded: 1, failed: 0 });
  assert.equal(entries[2].event, "session-stop");
  assert.doesNotMatch(await fs.readFile(logPath, "utf8"), /#(?:[\\da-f]{3}){2}/i);
});
