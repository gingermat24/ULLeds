"use strict";

const fs = require("node:fs");
const path = require("node:path");

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function extractReleaseNotes(html) {
  if (typeof html !== "string") throw new TypeError("In-app release notes must be HTML text.");
  const entries = [];
  const articlePattern = /<article\b[^>]*class="card release-entry"[^>]*>([\s\S]*?)<\/article>/g;
  for (const article of html.matchAll(articlePattern)) {
    const versionMatch = article[1].match(/<h3>ULLeds (1\.0\.\d+)<\/h3>/);
    if (!versionMatch) throw new Error("A release note entry is missing its version.");
    const categories = [];
    const categoryPattern = /<div class="release-category"><strong>([^<]+)<\/strong><ul>([\s\S]*?)<\/ul><\/div>/g;
    for (const category of article[1].matchAll(categoryPattern)) {
      const items = [...category[2].matchAll(/<li>([\s\S]*?)<\/li>/g)]
        .map((item) => decodeHtmlEntities(item[1].replace(/<[^>]*>/g, "").trim()));
      if (items.length === 0) throw new Error(`Release ${versionMatch[1]} has an empty category.`);
      categories.push({ name: decodeHtmlEntities(category[1]), items });
    }
    if (categories.length === 0) throw new Error(`Release ${versionMatch[1]} has no notes.`);
    entries.push({ version: versionMatch[1], categories });
  }
  if (entries.length === 0) throw new Error("No in-app release notes were found.");
  const versions = entries.map((entry) => entry.version);
  if (new Set(versions).size !== versions.length) throw new Error("Duplicate in-app release versions found.");
  return entries;
}

function formatReleaseNotes(html, version) {
  const entry = extractReleaseNotes(html).find((candidate) => candidate.version === version);
  if (!entry) throw new Error(`In-app release notes for ${version} were not found.`);
  const categories = entry.categories.map(({ name, items }) =>
    `### ${name}\n\n${items.map((item) => `- ${item}`).join("\n")}`
  );
  return `## ULLeds ${entry.version}\n\n${categories.join("\n\n")}`;
}

function main() {
  const root = path.resolve(__dirname, "..");
  const version = process.argv[2] || require(path.join(root, "package.json")).version;
  const html = fs.readFileSync(path.join(root, "ull", "ui", "index.html"), "utf8");
  process.stdout.write(`${formatReleaseNotes(html, version)}\n`);
}

if (require.main === module) main();

module.exports = { extractReleaseNotes, formatReleaseNotes };
