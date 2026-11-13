"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  compareVersions,
  findReleaseInstaller,
  getArchivedReleases,
  getPublishedReleases,
  getReleasedInstallers,
  mergeReleaseHistory,
  getReleaseFromHtml,
  getReleaseInstallerFromHtml,
  getReleasePageCountFromHtml,
  getReleaseTagsFromHtml,
  parseReleaseNotes
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

test("published GitHub releases provide sorted dates and parsed release notes", () => {
  const releases = getPublishedReleases([
    {
      tag_name: "v1.0.9",
      published_at: "2026-01-02T03:04:05Z",
      body: "## ULLeds 1.0.9\n\n### Improved\n- Color & brightness.\n  Keeps the previous behavior."
    },
    {
      tag_name: "v1.0.10",
      published_at: "2026-01-03T03:04:05Z",
      body: "### Fixed\n- Fixed startup."
    },
    {
      tag_name: "v1.0.11",
      draft: true,
      published_at: "2026-01-04T03:04:05Z",
      body: "### Added\n- Draft."
    },
    {
      tag_name: "v1.0.12",
      prerelease: true,
      published_at: "2026-01-05T03:04:05Z",
      body: "### Added\n- Preview."
    },
    {
      tag_name: "v1.0.13",
      published_at: "not a date",
      body: "### Added\n- Invalid."
    }
  ]);

  assert.deepEqual(releases, [
    {
      version: "1.0.10",
      date: "2026-01-03T03:04:05Z",
      categories: [{ name: "Fixed", items: ["Fixed startup."] }]
    },
    {
      version: "1.0.9",
      date: "2026-01-02T03:04:05Z",
      categories: [{
        name: "Improved",
        items: ["Color & brightness. Keeps the previous behavior."]
      }]
    }
  ]);
  assert.deepEqual(parseReleaseNotes("Notes without a category"), []);
});

test("archived notes fill unpublished versions while GitHub notes take precedence", () => {
  const archived = getArchivedReleases({
    schemaVersion: 1,
    legacy: { note: "Older history.", versions: ["1.0.1"] },
    releases: [
      { version: "1.0.8", categories: [{ name: "Improved", items: ["Archived note."] }] },
      { version: "1.0.9", categories: [{ name: "Fixed", items: ["Older published note."] }] }
    ]
  });
  const merged = mergeReleaseHistory([
    {
      version: "1.0.9",
      date: "2026-01-02T03:04:05Z",
      categories: [{ name: "Fixed", items: ["Current GitHub note."] }]
    },
    { version: "1.0.10", date: "2026-01-03T03:04:05Z", categories: [] }
  ], archived);

  assert.deepEqual(merged.map(({ version }) => version), ["1.0.10", "1.0.9", "1.0.8", "1.0.1"]);
  assert.deepEqual(merged[1].categories, [{ name: "Fixed", items: ["Current GitHub note."] }]);
  assert.equal(merged[1].date, "2026-01-02T03:04:05Z");
  assert.deepEqual(merged[2].categories, [{ name: "Improved", items: ["Archived note."] }]);
  assert.deepEqual(merged[3].categories, [{ name: "History", items: ["Older history."] }]);
  assert.throws(() => getArchivedReleases({ schemaVersion: 1, legacy: {}, releases: [] }), /archived release history is invalid/);
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

test("public GitHub release pages expose release notes and publication dates", () => {
  const release = getReleaseFromHtml(
    '<relative-time datetime="2026-11-09T20:12:40Z"></relative-time>' +
      '<div data-test-selector="body-content" class="markdown-body">' +
      "<h2>ULLeds 1.0.68</h2><h3>Improved</h3><ul>" +
      "<li>Color &amp; brightness.</li></ul></div>",
    "1.0.68"
  );
  assert.deepEqual(release, {
    version: "1.0.68",
    date: "2026-11-09T20:12:40Z",
    categories: [{ name: "Improved", items: ["Color & brightness."] }]
  });
  assert.deepEqual(getReleaseFromHtml("<html></html>", "1.0.68"), {
    version: "1.0.68",
    date: undefined,
    categories: []
  });
  assert.equal(getReleaseFromHtml("<html></html>", "latest"), undefined);
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
