"use strict";

const fs = require("node:fs/promises");

const MAX_DIAGNOSTIC_BYTES = 8 * 1024;
const DIAGNOSTIC_KEYS = Object.freeze(["screenSync", "controllerTiming"]);
const MAX_PROBLEM_LENGTH = 5000;

function validateSupportOptions(options) {
  if (!options || typeof options !== "object" || Array.isArray(options) ||
      Object.keys(options).some((key) => !DIAGNOSTIC_KEYS.includes(key)) ||
      DIAGNOSTIC_KEYS.some((key) => typeof options[key] !== "boolean")) {
    throw new TypeError("Support request options must explicitly select each diagnostic log.");
  }
  return { screenSync: options.screenSync, controllerTiming: options.controllerTiming };
}

async function readDiagnosticLog(filePath) {
  let handle;
  try {
    handle = await fs.open(filePath, "r");
    const { size } = await handle.stat();
    const offset = Math.max(0, size - MAX_DIAGNOSTIC_BYTES);
    const buffer = Buffer.alloc(Math.min(size, MAX_DIAGNOSTIC_BYTES));
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, offset);
    let content = buffer.toString("utf8", 0, bytesRead);
    if (offset > 0) {
      const firstLineEnd = content.indexOf("\n");
      content = firstLineEnd < 0 ? "" : content.slice(firstLineEnd + 1);
    }
    return { available: true, truncated: offset > 0, content };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { available: false, truncated: false, content: "" };
    }
    throw error;
  } finally {
    await handle?.close();
  }
}

function createSupportBundle({ problem, appVersion, platform, osVersion, architecture, diagnostics }) {
  for (const [label, value] of Object.entries({ problem, appVersion, platform, osVersion, architecture })) {
    if (typeof value !== "string" || !value.trim()) {
      throw new TypeError(`Support attachment ${label} must be a non-empty string.`);
    }
  }
  if (!diagnostics || typeof diagnostics !== "object") {
    throw new TypeError("Support attachment diagnostics must be an object.");
  }

  return {
    formatVersion: 1,
    createdAt: new Date().toISOString(),
    problem: problem.trim(),
    app: { name: "ULLeds", version: appVersion },
    system: { platform, version: osVersion, architecture },
    diagnostics: Object.fromEntries(DIAGNOSTIC_KEYS.map((key) => {
      const entry = diagnostics[key];
      if (!entry || typeof entry.included !== "boolean") {
        throw new TypeError(`Support file ${key} diagnostics are invalid.`);
      }
      if (!entry.included) return [key, { included: false }];
      if (typeof entry.available !== "boolean" || typeof entry.truncated !== "boolean" ||
          typeof entry.content !== "string") {
        throw new TypeError(`Support file ${key} diagnostics are invalid.`);
      }
      return [key, {
        included: true,
        available: entry.available,
        truncated: entry.truncated,
        content: entry.content
      }];
    }))
  };
}

function createGithubIssueReport({ problem, appVersion, platform, osVersion, architecture, diagnostics }) {
  if (typeof problem !== "string" || !problem.trim() || problem.trim().length > MAX_PROBLEM_LENGTH) {
    throw new TypeError(`Describe the problem in 1 to ${MAX_PROBLEM_LENGTH} characters.`);
  }
  const bundle = createSupportBundle({
    problem: problem.trim(),
    appVersion,
    platform,
    osVersion,
    architecture,
    diagnostics
  });
  const titleLine = problem.trim().split(/\r?\n/, 1)[0].replace(/\s+/g, " ");
  const title = `Support: ${titleLine}`.slice(0, 120);
  const sections = [
    "### What happened?",
    problem.trim(),
    "### App and system",
    `- ULLeds: ${bundle.app.version}`,
    `- Windows: ${bundle.system.version} (${bundle.system.architecture})`,
    "### Diagnostics",
    DIAGNOSTIC_KEYS.some((key) => bundle.diagnostics[key].included)
      ? "Optional diagnostics are in the local JSON attachment. Attach it to this issue if you want to share them."
      : "No diagnostic logs included."
  ];
  const hasDiagnostics = DIAGNOSTIC_KEYS.some((key) => bundle.diagnostics[key].included);
  return {
    title,
    body: sections.join("\n\n"),
    hasDiagnostics,
    attachmentContent: hasDiagnostics ? `${JSON.stringify(bundle, null, 2)}\n` : null
  };
}

function createGithubIssueUrl({ title, body }) {
  if (typeof title !== "string" || !title.trim() ||
      typeof body !== "string" || !body.trim()) {
    throw new TypeError("GitHub support issue title and body are required.");
  }
  const url = new URL("https://github.com/gingermat24/ULLeds/issues/new");
  url.searchParams.set("title", title);
  url.searchParams.set("body", body);
  if (url.href.length > 7000) {
    throw new RangeError("The problem description is too long to open as a GitHub draft. Shorten it and preview again.");
  }
  return url.href;
}

module.exports = {
  MAX_DIAGNOSTIC_BYTES,
  createSupportBundle,
  createGithubIssueReport,
  createGithubIssueUrl,
  readDiagnosticLog,
  validateSupportOptions
};
