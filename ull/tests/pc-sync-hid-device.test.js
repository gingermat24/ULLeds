"use strict";

const { EventEmitter } = require("node:events");
const test = require("node:test");
const assert = require("node:assert/strict");
const { createPcSyncHidDevice } = require("../pc-sync-hid-device");

function createHidDevice({ ledCount = 3, responseMessageId } = {}) {
  const device = new EventEmitter();
  device.reports = [];
  device.write = async (report) => {
    device.reports.push(Buffer.from(report));
    if (report[5] === 130) {
      const response = Buffer.alloc(13);
      response.set([82, 66, 12, responseMessageId ?? report[4], 130, 0, 0, 0, 0, 0, 0, ledCount]);
      setImmediate(() => device.emit("data", response));
    }
  };
  device.close = async () => {};
  return device;
}

test("the PC SYNC adapter owns connection, LED-count queries, and HID packet framing", async () => {
  const device = createHidDevice();
  let openedPath;
  const adapter = createPcSyncHidDevice({
    openHidDevice: async (path) => {
      openedPath = path;
      return device;
    }
  });

  await adapter.open("hid-path");
  assert.equal(adapter.isConnected, true);
  assert.equal(openedPath, "hid-path");
  assert.equal(await adapter.readLedCount(), 3);

  const firstOutputReport = device.reports.length;
  await adapter.writeFrame(["#ff0000", "#00ff00", "#0000ff"], {
    frameType: "realtime",
    brightness: 100
  });
  const output = Buffer.concat(device.reports.slice(firstOutputReport)
    .map((report) => report.subarray(1)));
  assert.equal(output.toString("ascii", 0, 2), "SC");
  assert.equal(output[5], 128);

  await adapter.close();
  assert.equal(adapter.isConnected, false);
  await assert.rejects(adapter.readLedCount(), /not connected/);
});

test("the PC SYNC adapter accepts valid LED-count replies whose message ID changed", async () => {
  const device = createHidDevice({ ledCount: 75, responseMessageId: 37 });
  const adapter = createPcSyncHidDevice({
    openHidDevice: async () => device,
    ledCountTimeoutMs: 10
  });
  await adapter.open("hid-path");
  assert.equal(await adapter.readLedCount(), 75);
  await adapter.close();
});

test("the PC SYNC adapter preserves standard RB lighting frames", async () => {
  const device = createHidDevice();
  const adapter = createPcSyncHidDevice({ openHidDevice: async () => device });
  await adapter.open("hid-path");

  await adapter.writeFrame(["#804020"], {
    frameType: "lighting",
    brightness: 50
  });

  const packet = Buffer.concat(device.reports.map((report) => report.subarray(1)));
  assert.deepEqual([...packet], [
    82, 66, 16, 2, 134, 1, 64, 32, 16, 1, 2, 0, 0, 0, 254, 158
  ]);
  await adapter.close();
});

test("the PC SYNC adapter reports HID errors and rejects unsupported frame types", async () => {
  const device = createHidDevice();
  const adapter = createPcSyncHidDevice({ openHidDevice: async () => device });
  let reportedError;
  await adapter.open("hid-path", (error) => { reportedError = error; });
  const failure = new Error("device removed");
  device.emit("error", failure);
  assert.equal(reportedError, failure);
  await assert.rejects(
    adapter.writeFrame(["#ffffff"], { frameType: "unknown" }),
    /frame type/
  );
  await adapter.close();
});
