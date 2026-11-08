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

  diagnostics.start({ fps: 30, ledCount: 75 });
  diagnostics.recordHidWrite("SC", "queued");
  diagnostics.recordHidWrite("SC", "written");
  diagnostics.recordHidWrite("RB", "queued");
  diagnostics.recordHidWrite("RB", "superseded");
  diagnostics.recordRendererPerformance({
    windowMs: 1000,
    callbackCount: 2,
    sampleCount: 2,
    sampleTotalMs: 12.5,
    sampleMaxMs: 7.5
  });
  await diagnostics.stop("user");

  const entries = (await fs.readFile(logPath, "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.equal(entries[0].event, "session-start");
  assert.deepEqual(entries[0], {
    timestamp: entries[0].timestamp,
    event: "session-start",
    fps: 30,
    ledCount: 75
  });
  assert.deepEqual(entries[1], {
    timestamp: entries[1].timestamp,
    event: "renderer-performance",
    windowMs: 1000,
    callbackCount: 2,
    callbackFps: 2,
    sampleCount: 2,
    sampledFps: 2,
    sampleAverageMs: 6.3,
    sampleMaxMs: 7.5
  });
  assert.equal(entries[2].event, "hid-summary");
  assert.deepEqual(entries[2].SC, { queued: 1, written: 1, superseded: 0, failed: 0 });
  assert.deepEqual(entries[2].RB, { queued: 1, written: 0, superseded: 1, failed: 0 });
  assert.equal(entries[3].event, "session-stop");
  assert.doesNotMatch(await fs.readFile(logPath, "utf8"), /#(?:[\\da-f]{3}){2}/i);
});

test("Screen Sync diagnostics reject invalid renderer performance metrics", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "ulleds-screen-sync-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const diagnostics = createScreenSyncDiagnostics(
    path.join(directory, "screen-sync-diagnostics.log"),
    () => {}
  );
  diagnostics.start({ fps: 30, ledCount: 75 });
  assert.throws(() => diagnostics.recordRendererPerformance(null), TypeError);
  assert.throws(() => diagnostics.recordRendererPerformance({
    windowMs: 1000,
    callbackCount: 2,
    sampleCount: 3,
    sampleTotalMs: 1,
    sampleMaxMs: 2
  }), TypeError);
  await diagnostics.stop("test");
});
