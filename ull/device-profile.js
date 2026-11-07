"use strict";

const fs = require("node:fs");
const path = require("node:path");

const COLOR_ORDERS = new Set(["RGB", "RBG", "GRB", "GBR", "BRG", "BGR"]);
const POSITIONS = new Map([
  [0, "top"],
  [1, "monitor-back"],
  [2, "monitor-front"],
  [3, "desk"]
]);

function isProfilePathMatch(device, profile) {
  return typeof device.path === "string" &&
    typeof profile.path === "string" &&
    device.path.toLowerCase() === profile.path.toLowerCase();
}

function normalizeProfile(profile, source) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) return null;
  const ledCount = Number(profile.lampsAmount);
  const edgeCount = Number(profile.edgeNumber);
  const colorOrder = typeof profile.wireMap === "string" ? profile.wireMap.toUpperCase() : "";
  const location = Number(profile.location);
  const installationMethod = profile.installationMethod == null ? 0 : Number(profile.installationMethod);
  if (!Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253 ||
      !Number.isInteger(edgeCount) || edgeCount < 1 || edgeCount > 4 ||
      !Number.isInteger(installationMethod) || installationMethod < 0 || installationMethod > 1 ||
      !COLOR_ORDERS.has(colorOrder)) return null;
  return {
    name: typeof profile.name === "string" && profile.name.trim()
      ? profile.name.trim()
      : "PC SYNC Backlight",
    ledCount,
    edgeCount,
    installationMethod,
    colorOrder,
    position: POSITIONS.get(location) || "monitor-back",
    color: typeof profile.hue === "string" && /^#[\da-f]{6}$/i.test(profile.hue)
      ? profile.hue.toLowerCase()
      : null,
    source
  };
}

function loadSavedProfiles(appDataPath, onError = console.error) {
  const files = [
    path.join(appDataPath, "DX Light", "config.json"),
    path.join(appDataPath, "quiklight-desktop", "config.json")
  ];
  const available = files
    .map((file) => {
      try {
        return { file, modified: fs.statSync(file).mtimeMs };
      } catch (error) {
        if (error.code !== "ENOENT") onError(`Could not inspect saved device profile ${file}: ${error.message}`);
        return null;
      }
    })
    .filter(Boolean)
    .sort((left, right) => right.modified - left.modified);
  const profiles = [];
  for (const { file } of available) {
    try {
      const config = JSON.parse(fs.readFileSync(file, "utf8"));
      if (!Array.isArray(config.devices)) {
        onError(`Saved device profile ${file} does not contain a devices list.`);
        continue;
      }
      for (const device of config.devices) {
        const profile = normalizeProfile(device, file);
        if (profile) profiles.push({ ...profile, path: device.path });
      }
    } catch (error) {
      onError(`Could not read saved device profile ${file}: ${error.message}`);
    }
  }
  return profiles;
}

function profileForDevice(device, devices, profiles) {
  const exact = profiles.find((profile) => isProfilePathMatch(device, profile));
  if (exact) return { ...exact, matchedBy: "device path" };
  if (devices.length === 1 && profiles.length === 1) {
    const [profile] = profiles;
    return {
      ...profile,
      path: device.path,
      matchedBy: "single connected controller"
    };
  }
  return {
    name: "PC SYNC Backlight",
    ledCount: null,
    edgeCount: null,
    installationMethod: 0,
    colorOrder: null,
    position: null,
    source: "",
    matchedBy: ""
  };
}

function resolveDeviceLedCount(reportedCount, savedProfile) {
  if (Number.isInteger(reportedCount) && reportedCount >= 1 && reportedCount <= 253) {
    return { ledCount: reportedCount, countSource: "controller" };
  }
  if (Number.isInteger(savedProfile?.ledCount) && savedProfile.ledCount >= 1 && savedProfile.ledCount <= 253) {
    return { ledCount: savedProfile.ledCount, countSource: "saved profile" };
  }
  return null;
}

module.exports = { loadSavedProfiles, normalizeProfile, profileForDevice, resolveDeviceLedCount };
