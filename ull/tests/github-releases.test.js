"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  compareVersions,
  findReleaseInstaller,
  getReleasedInstallers,
  getReleaseInstallerFromHtml,
  getReleasePageCountFromHtml,
  getReleaseTagsFromHtml
} = require("../github-releases");

function release(version, overrides = {}) {
  const assetName = `ULLeds-Setup-${version}-x64.exe`;
  return {
    tag_name: `v${version}`,
    draft: false,
    prerelease: false,
    assets: [{
      name: assetName,
      browser_download_url:
        `https://github.com/gingermat24/ULLeds/releases/download/v${version}/${assetName}`
    }],
    ...overrides
  };
}

test("release installers include only published stable Windows x64 installers", () => {
  const installers = getReleasedInstallers([
    release("1.0.9"),
    release("1.0.10"),
    release("1.0.11", { draft: true }),
    release("1.0.12", { prerelease: true }),
    release("1.0.13", {
      assets: [{
        name: "ULLeds-Setup-1.0.13-x64.exe",
        browser_download_url: "https://example.com/installer.exe"
      }]
    }),
    release("1.0.14", { tag_name: "latest" })
  ]);

  assert.deepEqual(installers.map(({ version }) => version), ["1.0.10", "1.0.9"]);
  assert.equal(
    findReleaseInstaller(installers, "1.0.9").url,
    "https://github.com/gingermat24/ULLeds/releases/download/v1.0.9/ULLeds-Setup-1.0.9-x64.exe"
  );
  assert.equal(findReleaseInstaller(installers, "1.0.11"), undefined);
  assert.equal(findReleaseInstaller(installers, "latest"), undefined);
});

test("release versions compare numerically by component", () => {
  assert.equal(compareVersions("1.0.10", "1.0.9"), 1);
  assert.equal(compareVersions("1.2.0", "1.2.1"), -1);
  assert.equal(compareVersions("1.2.3", "1.2.3"), 0);
  assert.throws(() => compareVersions("1.2", "1.2.3"), /X\.Y\.Z/);
});

test("GitHub release HTML exposes published version tags and pagination", () => {
  const html = [
    '<a href="/gingermat24/ULLeds/releases/tag/v1.0.63">Latest</a>',
    '<a href="/gingermat24/ULLeds/releases/tag/v1.0.62">Previous</a>',
    '<a href="/gingermat24/ULLeds/releases/tag/v1.0.63">Duplicate</a>',
    '<a href="/someone/else/releases/tag/v9.9.9">Unrelated</a>',
    '<div data-total-pages="2"></div>'
  ].join("");

  assert.deepEqual(getReleaseTagsFromHtml(html), ["v1.0.63", "v1.0.62"]);
  assert.equal(getReleasePageCountFromHtml(html), 2);
  assert.equal(getReleasePageCountFromHtml("<html></html>"), 1);
  assert.throws(() => getReleasePageCountFromHtml('<div data-total-pages="101">'), /page count/);
});

test("GitHub release asset HTML accepts only the matching official installer", () => {
  const installer = getReleaseInstallerFromHtml(
    '<a href="/gingermat24/ULLeds/releases/download/v1.0.63/ULLeds-Setup-1.0.63-x64.exe">Installer</a>' +
      '<a href="/gingermat24/ULLeds/releases/download/v1.0.63/ULLeds-Setup-1.0.63-x64.exe.blockmap">Blockmap</a>',
    "1.0.63"
  );
  assert.deepEqual(installer, {
    version: "1.0.63",
    url: "https://github.com/gingermat24/ULLeds/releases/download/v1.0.63/ULLeds-Setup-1.0.63-x64.exe"
  });
  assert.equal(getReleaseInstallerFromHtml(
    '<a href="https://example.com/ULLeds-Setup-1.0.63-x64.exe">Installer</a>',
    "1.0.63"
  ), undefined);
  assert.equal(getReleaseInstallerFromHtml(
    '<a href="/gingermat24/ULLeds/releases/download/v1.0.63/ULLeds-Setup-1.0.62-x64.exe">Installer</a>',
    "1.0.63"
  ), undefined);
});
