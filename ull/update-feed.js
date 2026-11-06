"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

function compareVersions(left, right) {
  const parse = (value) => value.split(".").map(Number);
  const a = parse(left);
  const b = parse(right);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

async function fileDigest(file) {
  const hash = crypto.createHash("sha256");
  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(file);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return hash.digest("hex");
}

async function findUpdate(folder, currentVersion) {
  if (!folder) return { available: false, error: "Choose a local update folder first." };
  const manifestNames = ["ulleds-update.json", "ull-update.json", "dx-light-update.json"];
  const manifestPath = manifestNames
    .map((name) => path.join(folder, name))
    .find((candidate) => fs.existsSync(candidate));
  if (!manifestPath) {
    return { available: false, error: "Could not find a ULLeds update manifest in the selected folder." };
  }
  let manifest;
  try {
    manifest = JSON.parse(await fs.promises.readFile(manifestPath, "utf8"));
  } catch (error) {
    return { available: false, error: `Could not read ${path.basename(manifestPath)}: ${error.message}` };
  }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest) ||
      typeof manifest.version !== "string" || !/^\d+\.\d+\.\d+$/.test(manifest.version) ||
      typeof manifest.artifact !== "string" ||
      !/^(?:ULLeds|DX-Light)-Setup-\d+\.\d+\.\d+-x64\.exe$/.test(manifest.artifact) ||
      typeof manifest.sha256 !== "string" || !/^[\da-f]{64}$/i.test(manifest.sha256)) {
    return { available: false, error: "The update manifest is incomplete or invalid." };
  }
  if (!/^\d+\.\d+\.\d+$/.test(currentVersion) || compareVersions(manifest.version, currentVersion) <= 0) {
    return { available: false, error: `ULLeds ${currentVersion} is already up to date.` };
  }
  const artifact = path.resolve(folder, manifest.artifact);
  if (path.dirname(artifact) !== path.resolve(folder)) {
    return { available: false, error: "The update manifest points outside its selected folder." };
  }
  try {
    const digest = await fileDigest(artifact);
    if (digest.toLowerCase() !== manifest.sha256.toLowerCase()) {
      return { available: false, error: "The installer checksum does not match the update manifest." };
    }
  } catch (error) {
    return { available: false, error: `Could not verify the installer: ${error.message}` };
  }
  return { available: true, version: manifest.version, artifact };
}

module.exports = { findUpdate };
