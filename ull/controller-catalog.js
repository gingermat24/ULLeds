"use strict";

const { isSupportedController } = require("./protocol");
const { profileForDevice } = require("./device-profile");

function controllerName(device) {
  if (typeof device.product === "string" && device.product && device.product !== "USBHID") {
    return device.product;
  }
  if (typeof device.manufacturer === "string" && device.manufacturer.trim()) {
    return `${device.manufacturer.trim()} USB LED controller`;
  }
  return `USB LED controller (${device.vendorId.toString(16).padStart(4, "0")}:${device.productId.toString(16).padStart(4, "0")})`;
}

function listSupportedControllers(hidDevices, profiles) {
  const supported = hidDevices.filter((device) =>
    isSupportedController(device) && typeof device.path === "string" && device.path.length > 0
  );
  return supported.map((device) => ({
    path: device.path,
    name: controllerName(device),
    manufacturer: device.manufacturer || "",
    product: device.product || "",
    vendorId: device.vendorId,
    productId: device.productId,
    interface: Number.isInteger(device.interface) ? device.interface : null,
    serialNumber: device.serialNumber || "",
    profile: profileForDevice(device, supported, profiles)
  }));
}

function selectPreferredController(devices, preferredPath, connectedPath = "") {
  return devices.find((device) => device.path === preferredPath) ||
    devices.find((device) => device.path === connectedPath) ||
    devices[0] ||
    null;
}

function settingsAfterReset(defaults, profile, devicePath) {
  const reset = { ...defaults };
  if (Number.isInteger(profile?.ledCount) && profile.ledCount > 0) {
    reset.deviceProfile = { ...profile };
    reset.devicePath = typeof devicePath === "string" ? devicePath : "";
    reset.ledCount = profile.ledCount;
  }
  return reset;
}

module.exports = {
  listSupportedControllers,
  selectPreferredController,
  settingsAfterReset
};
