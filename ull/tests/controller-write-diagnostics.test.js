"use strict";

const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { createControllerWriteDiagnostics } = require("../controller-write-diagnostics");

test("controller timing diagnostics aggregate timings without recording device data", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "ulleds-controller-timing-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const logPath = path.join(directory, "controller-write-diagnostics.log");
  const diagnostics = createControllerWriteDiagnostics(logPath, () => {});

  diagnostics.start();
  assert.equal(diagnostics.isFlushScheduled, false);
  diagnostics.recordWrite({
    command: "RB",
    status: "written",
    reportCount: 2,
    queueMs: 3.2,
    writeMs: 8.7
  });
  assert.equal(diagnostics.isFlushScheduled, true);
  diagnostics.recordWrite({
    command: "SC",
    status: "superseded",
    reportCount: 1,
    queueMs: 16.4,
    writeMs: null
  });
  diagnostics.recordSettingsSave(2.1);
  await diagnostics.stop();

  const log = await fs.readFile(logPath, "utf8");
  const entry = JSON.parse(log.trim());
  assert.equal(entry.event, "controller-write-timing");
  assert.deepEqual(entry.writes.RB, {
    written: 1,
    superseded: 0,
    failed: 0,
    reportCount: 2,
    queueWaitMs: { samples: 1, p50: 3.2, p95: 3.2, max: 3.2 },
    deviceWriteMs: { samples: 1, p50: 8.7, p95: 8.7, max: 8.7 }
  });
  assert.equal(entry.writes.SC.superseded, 1);
  assert.equal(entry.writes.SC.deviceWriteMs, null);
  assert.equal(entry.settingsSaveMs.max, 2.1);
  assert.doesNotMatch(log, /#(?:[\da-f]{3}){2}/i);
  assert.doesNotMatch(log, /1,2,3/);
});
