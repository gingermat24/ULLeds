"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { loadSavedProfiles, profileForDevice, resolveDeviceLedCount } = require("../device-profile");

test("a connected controller reuses its saved name, LED count, RGB order, and monitor layout", async (t) => {
  const appData = await fs.mkdtemp(path.join(os.tmpdir(), "ulleds-profile-"));
  t.after(() => fs.rm(appData, { recursive: true, force: true }));
  const source = path.join(appData, "quiklight-desktop");
  await fs.mkdir(source);
  const controllerPath = "\\\\?\\HID#VID_1A86&PID_FE07&MI_00#monitor";
  await fs.writeFile(path.join(source, "config.json"), JSON.stringify({
    devices: [{
      name: "PC SYNC Backlight",
      path: controllerPath,
      lampsAmount: 75,
      edgeNumber: 3,
      installationMethod: 1,
      wireMap: "RGB",
      location: 1,
      hue: "#008100"
    }]
  }));
  const profiles = loadSavedProfiles(appData, (message) => assert.fail(message));
  const devices = [{ path: controllerPath, vendorId: 0x1a86, productId: 0xfe07 }];
  const profile = profileForDevice(devices[0], devices, profiles);
  assert.deepEqual(
    {
      name: profile.name,
      ledCount: profile.ledCount,
      edgeCount: profile.edgeCount,
      installationMethod: profile.installationMethod,
      colorOrder: profile.colorOrder,
      position: profile.position,
      color: profile.color,
      matchedBy: profile.matchedBy
    },
    {
      name: "PC SYNC Backlight",
      ledCount: 75,
      edgeCount: 3,
      installationMethod: 1,
      colorOrder: "RGB",
      position: "monitor-back",
      color: "#008100",
      matchedBy: "device path"
    }
  );
});

test("multiple matching controllers do not inherit an unrelated saved strip layout", () => {
  const devices = [{ path: "controller-a" }, { path: "controller-b" }];
  const profile = profileForDevice(devices[0], devices, [{
    name: "Saved strip",
    path: "different-controller",
    ledCount: 75,
    edgeCount: 3,
    colorOrder: "RGB",
    position: "monitor-back"
  }]);
  assert.equal(profile.ledCount, null);
  assert.equal(profile.matchedBy, "");
});

test("controller LED count wins, with a matching saved count as the timeout fallback", () => {
  const savedProfile = { ledCount: 75 };
  assert.deepEqual(resolveDeviceLedCount(76, savedProfile), {
    ledCount: 76,
    countSource: "controller"
  });
  assert.deepEqual(resolveDeviceLedCount(undefined, savedProfile), {
    ledCount: 75,
    countSource: "saved profile"
  });
  assert.equal(resolveDeviceLedCount(undefined, null), null);
});
