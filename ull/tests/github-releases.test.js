"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  compareVersions,
  findReleaseInstaller,
  getReleasedInstallers
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
