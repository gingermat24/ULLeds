"use strict";

const fs = require("node:fs");
const path = require("node:path");

function resetStoredData(appDataPath) {
  if (typeof appDataPath !== "string" || !appDataPath.trim()) {
    throw new TypeError("The application data path must be a non-empty string.");
  }

  const root = path.resolve(appDataPath);
  fs.rmSync(path.join(root, "ULLeds", "settings.json"), { force: true });
  fs.rmSync(path.join(root, "ULLeds", "remote-sessions.json"), { force: true });

  const legacyProfiles = [
    ["DX Light", path.join(root, "DX Light", "config.json")],
    ["QuikLight", path.join(root, "quiklight-desktop", "config.json")]
  ];
  const removedProfiles = [];
  for (const [name, file] of legacyProfiles) {
    if (fs.existsSync(file)) removedProfiles.push(name);
    fs.rmSync(file, { force: true });
  }

  return removedProfiles;
}

module.exports = { resetStoredData };
