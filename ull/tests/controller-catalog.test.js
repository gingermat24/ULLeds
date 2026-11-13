"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  listSupportedControllers,
  selectPreferredController,
  settingsAfterReset
} = require("../controller-catalog");

const controller = (devicePath, options = {}) => ({
  path: devicePath,
  vendorId: 0x1a86,
  productId: 0xfe07,
  manufacturer: "Robobloq",
  product: "USBHID",
  ...options
});

test("controller catalog finds every connected controller using the supported protocol", () => {
  const devices = listSupportedControllers([
    controller("controller-a", { serialNumber: "A" }),
    controller("controller-b", { serialNumber: "B", product: "PC Sync Strip" }),
    controller("unrelated", { vendorId: 0x1234, productId: 0xabcd })
  ], []);

  assert.equal(devices.length, 2);
  assert.equal(devices[0].name, "Robobloq USB LED controller");
  assert.equal(devices[0].serialNumber, "A");
  assert.equal(devices[1].name, "PC Sync Strip");
  assert.equal(devices[1].path, "controller-b");
});

test("manual selection is preferred, while missing selections fall back to a live controller", () => {
  const devices = [{ path: "a" }, { path: "b" }];
  assert.equal(selectPreferredController(devices, "b").path, "b");
  assert.equal(selectPreferredController(devices, "missing", "b").path, "b");
  assert.equal(selectPreferredController(devices, "missing").path, "a");
  assert.equal(selectPreferredController([], "missing"), null);
});

test("data reset retains the live controller profile but resets lighting preferences", () => {
  const defaults = {
    color: "#008100",
    brightness: 50,
    ledColors: {},
    deviceProfile: null,
    devicePath: ""
  };
  const profile = {
    name: "Controller A",
    ledCount: 75,
    edgeCount: 3,
    colorOrder: "RGB",
    position: "monitor-back"
  };
  const reset = settingsAfterReset(defaults, profile, "controller-a");

  assert.equal(reset.color, "#008100");
  assert.equal(reset.brightness, 50);
  assert.deepEqual(reset.ledColors, {});
  assert.deepEqual(reset.deviceProfile, profile);
  assert.equal(reset.devicePath, "controller-a");
});
