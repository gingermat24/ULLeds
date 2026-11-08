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

function getReleaseTagsFromHtml(html) {
  if (typeof html !== "string") throw new TypeError("GitHub release page must be HTML text.");
  return [...new Set(
    [...html.matchAll(/\/gingermat24\/ULLeds\/releases\/tag\/v(\d+\.\d+\.\d+)(?:["/?#])/g)]
      .map((match) => `v${match[1]}`)
  )];
}

function getReleasePageCountFromHtml(html) {
  if (typeof html !== "string") throw new TypeError("GitHub release page must be HTML text.");
  const counts = [...html.matchAll(/\bdata-total-pages="(\d+)"/g)]
    .map((match) => Number(match[1]));
  if (counts.length === 0) return 1;
  if (counts.some((count) => !Number.isInteger(count) || count < 1 || count > 100)) {
    throw new Error("GitHub returned an invalid release page count.");
  }
  return Math.max(...counts);
}

function getReleaseInstallerFromHtml(html, version) {
  if (typeof html !== "string" || !VERSION_PATTERN.test(version)) return undefined;
  const assetName = `ULLeds-Setup-${version}-x64.exe`;
  const expectedPath = `/gingermat24/ULLeds/releases/download/v${version}/${assetName}`;
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>/gi)) {
    const href = match[1].replace(/&amp;/g, "&");
    let url;
    try {
      url = new URL(href, "https://github.com");
    } catch {
      continue;
    }
    if (url.origin === "https://github.com" &&
        url.pathname === expectedPath && !url.search && !url.hash) {
      return { version, url: url.href };
    }
  }
  return undefined;
}

function findReleaseInstaller(releases, version) {
  if (!VERSION_PATTERN.test(version)) return undefined;
  return releases.find((release) => release.version === version);
}

const githubReleases = Object.freeze({
  compareVersions,
  findReleaseInstaller,
  getReleasedInstallers,
  getReleaseInstallerFromHtml,
  getReleasePageCountFromHtml,
  getReleaseTagsFromHtml
});
if (typeof module !== "undefined" && module.exports) module.exports = githubReleases;
else globalThis.ullGithubReleases = githubReleases;
