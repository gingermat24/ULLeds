"use strict";

const fs = require("node:fs");
const path = require("node:path");

function formatReleaseNotes(markdown, version) {
  if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new TypeError("Release version must use the X.Y.Z format.");
  }
  if (typeof markdown !== "string") {
    throw new TypeError("Release notes must be Markdown text.");
  }

  const notes = markdown.trim().replace(/\r\n/g, "\n");
  if (notes.split("\n", 1)[0] !== `## ULLeds ${version}`) {
    throw new Error(`Release notes must start with "## ULLeds ${version}".`);
  }
  if (!/^### .+\S.*$/m.test(notes) || !/^[-*+] \S.+$/m.test(notes)) {
    throw new Error(`Release notes for ${version} must include a category and at least one bullet.`);
  }
  return notes;
}

function main() {
  const root = path.resolve(__dirname, "..");
  const version = process.argv[2] || require(path.join(root, "package.json")).version;
  const file = path.join(root, "docs", "releases", `${version}.md`);
  const markdown = fs.readFileSync(file, "utf8");
  process.stdout.write(`${formatReleaseNotes(markdown, version)}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { formatReleaseNotes };
