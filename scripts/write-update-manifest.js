"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outputDirectory = path.join(root, "dist");
const version = require(path.join(root, "package.json")).version;
const artifact = `ULLeds-Setup-${version}-x64.exe`;
const artifactPath = path.join(outputDirectory, artifact);
const blockMapPath = `${artifactPath}.blockmap`;

async function digestFile(file) {
  const hashes = {
    sha256: crypto.createHash("sha256"),
    sha512: crypto.createHash("sha512")
  };
  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(file);
    stream.on("data", (chunk) => {
      hashes.sha256.update(chunk);
      hashes.sha512.update(chunk);
    });
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return {
    sha256: hashes.sha256.digest("hex"),
    sha512: hashes.sha512.digest("base64")
  };
}

async function main() {
  if (!fs.existsSync(artifactPath) || !fs.existsSync(blockMapPath)) {
    throw new Error(`Installer or differential block map not found for ${version}.`);
  }
  const [hashes, artifactStat, blockMapStat] = await Promise.all([
    digestFile(artifactPath),
    fs.promises.stat(artifactPath),
    fs.promises.stat(blockMapPath)
  ]);
  const manifest = {
    version,
    files: [{
      url: artifact,
      sha512: hashes.sha512,
      size: artifactStat.size,
      blockMapSize: blockMapStat.size
    }],
    path: artifact,
    sha512: hashes.sha512,
    releaseDate: new Date().toISOString()
  };
  fs.writeFileSync(
    path.join(outputDirectory, "latest.yml"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
  const legacyManifest = {
    version,
    artifact,
    sha256: hashes.sha256
  };
  for (const filename of ["ulleds-update.json", "ull-update.json"]) {
    fs.writeFileSync(
      path.join(outputDirectory, filename),
      `${JSON.stringify(legacyManifest, null, 2)}\n`
    );
  }
  console.log(`Wrote differential update metadata for ULLeds ${version}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
