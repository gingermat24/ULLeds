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

function parseReleaseNotes(body) {
  if (typeof body !== "string") return [];
  const categories = [];
  let currentCategory = null;
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      currentCategory = heading[1].length === 3
        ? { name: heading[2], items: [] }
        : null;
      if (currentCategory) categories.push(currentCategory);
      continue;
    }
    if (!currentCategory || !line) continue;
    const item = line.match(/^(?:[-*+]|\d+\.)\s+(.+)$/);
    if (item) {
      currentCategory.items.push(item[1]);
    } else if (currentCategory.items.length > 0) {
      const lastIndex = currentCategory.items.length - 1;
      currentCategory.items[lastIndex] += ` ${line}`;
    } else {
      currentCategory.items.push(line);
    }
  }
  return categories.filter((category) => category.items.length > 0);
}

function getPublishedReleases(releases) {
  if (!Array.isArray(releases)) throw new TypeError("GitHub releases must be an array.");
  return releases.flatMap((release) => {
    if (!release || release.draft || release.prerelease ||
        typeof release.tag_name !== "string" ||
        !/^v\d+\.\d+\.\d+$/.test(release.tag_name) ||
        typeof release.published_at !== "string" ||
        Number.isNaN(Date.parse(release.published_at))) {
      return [];
    }
    return [{
      version: release.tag_name.slice(1),
      date: release.published_at,
      categories: parseReleaseNotes(release.body)
    }];
  }).sort((left, right) => compareVersions(right.version, left.version));
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_match, entity) => {
      const codePoint = entity[0].toLowerCase() === "x"
        ? Number.parseInt(entity.slice(1), 16)
        : Number.parseInt(entity, 10);
      return Number.isInteger(codePoint) && codePoint > 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : "";
    });
}

function getReleaseFromHtml(html, version) {
  if (typeof html !== "string" || !VERSION_PATTERN.test(version)) return undefined;
  const openingTag = /<div\b(?=[^>]*\bdata-test-selector="body-content")[^>]*>/i.exec(html);
  if (!openingTag) return { version, date: undefined, categories: [] };

  const bodyStart = openingTag.index + openingTag[0].length;
  const divTags = /<\/?div\b[^>]*>/gi;
  divTags.lastIndex = bodyStart;
  let depth = 1;
  let bodyEnd = html.length;
  for (let match = divTags.exec(html); match; match = divTags.exec(html)) {
    if (/^<\//.test(match[0])) {
      depth -= 1;
      if (depth === 0) {
        bodyEnd = match.index;
        break;
      }
    } else if (!/\/>$/.test(match[0])) {
      depth += 1;
    }
  }

  const categories = [];
  let currentCategory = null;
  const content = html.slice(bodyStart, bodyEnd);
  for (const match of content.matchAll(/<(h[1-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)) {
    const text = decodeHtmlEntities(match[2].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
    if (!text) continue;
    if (/^h[1-6]$/i.test(match[1])) {
      const level = Number(match[1][1]);
      currentCategory = level === 3 ? { name: text, items: [] } : null;
      if (currentCategory) categories.push(currentCategory);
    } else if (currentCategory) {
      currentCategory.items.push(text);
    }
  }

  const dateMatch = /<relative-time\b[^>]*\bdatetime="([^"]+)"/i.exec(html);
  const date = dateMatch && !Number.isNaN(Date.parse(dateMatch[1]))
    ? dateMatch[1]
    : undefined;
  return {
    version,
    date,
    categories: categories.filter((category) => category.items.length > 0)
  };
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
  getPublishedReleases,
  getReleasedInstallers,
  getReleaseFromHtml,
  getReleaseInstallerFromHtml,
  getReleasePageCountFromHtml,
  getReleaseTagsFromHtml,
  parseReleaseNotes
});
if (typeof module !== "undefined" && module.exports) module.exports = githubReleases;
else globalThis.ullGithubReleases = githubReleases;
