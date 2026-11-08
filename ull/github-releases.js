"use strict";

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

function compareVersions(left, right) {
  if (!VERSION_PATTERN.test(left) || !VERSION_PATTERN.test(right)) {
    throw new TypeError("Release versions must use the X.Y.Z format.");
  }
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);
  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] > rightParts[index] ? 1 : -1;
    }
  }
  return 0;
}

function getReleasedInstallers(releases) {
  if (!Array.isArray(releases)) throw new TypeError("GitHub releases must be an array.");
  return releases.flatMap((release) => {
    if (!release || release.draft || release.prerelease ||
        typeof release.tag_name !== "string" ||
        !/^v\d+\.\d+\.\d+$/.test(release.tag_name) ||
        !Array.isArray(release.assets)) {
      return [];
    }
    const version = release.tag_name.slice(1);
    const assetName = `ULLeds-Setup-${version}-x64.exe`;
    const asset = release.assets.find((candidate) =>
      candidate?.name === assetName && typeof candidate.browser_download_url === "string"
    );
    if (!asset) return [];
    let url;
    try {
      url = new URL(asset.browser_download_url);
    } catch {
      return [];
    }
    if (url.origin !== "https://github.com" ||
        url.pathname !== `/gingermat24/ULLeds/releases/download/v${version}/${assetName}` ||
        url.search || url.hash) {
      return [];
    }
    return [{ version, url: url.href }];
  }).sort((left, right) => compareVersions(right.version, left.version));
}

function findReleaseInstaller(releases, version) {
  if (!VERSION_PATTERN.test(version)) return undefined;
  return releases.find((release) => release.version === version);
}

const githubReleases = Object.freeze({
  compareVersions,
  findReleaseInstaller,
  getReleasedInstallers
});
if (typeof module !== "undefined" && module.exports) module.exports = githubReleases;
else globalThis.ullGithubReleases = githubReleases;
