"use strict";

const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  MAX_DIAGNOSTIC_BYTES,
  createSupportBundle,
  createGithubIssueReport,
  createGithubIssueUrl,
  readDiagnosticLog,
  validateSupportOptions
} = require("../support-bundle");

test("support attachments include only selected diagnostics and non-identifying system details", () => {
  const options = validateSupportOptions({ screenSync: true, controllerTiming: false });
  const bundle = createSupportBundle({
    problem: "Preview stays black.",
    appVersion: "1.0.86",
    platform: "win32",
    osVersion: "10.0.26100",
    architecture: "x64",
    diagnostics: {
      screenSync: {
        included: options.screenSync,
        available: true,
        truncated: false,
        content: '{"event":"session-start","ledCount":75}\n'
      },
      controllerTiming: { included: options.controllerTiming }
    }
  });

  assert.equal(bundle.app.version, "1.0.86");
  assert.equal(bundle.problem, "Preview stays black.");
  assert.equal(bundle.system.platform, "win32");
  assert.equal(bundle.diagnostics.screenSync.content, '{"event":"session-start","ledCount":75}\n');
  assert.deepEqual(bundle.diagnostics.controllerTiming, { included: false });
  assert.equal(Object.hasOwn(bundle, "settings"), false);
  assert.equal(Object.hasOwn(bundle, "devicePath"), false);
  assert.equal(Object.hasOwn(bundle.system, "username"), false);
  assert.doesNotMatch(JSON.stringify(bundle), /C:\\\\Users|serialNumber|sampledColor/i);
  assert.ok(Number.isFinite(Date.parse(bundle.createdAt)));
});

test("support file choices must be explicit booleans", () => {
  assert.deepEqual(validateSupportOptions({ screenSync: false, controllerTiming: false }), {
    screenSync: false,
    controllerTiming: false
  });
  assert.throws(() => validateSupportOptions({ screenSync: true }), /explicitly select/);
  assert.throws(() => validateSupportOptions({ screenSync: true, controllerTiming: "yes" }), /explicitly select/);
  assert.throws(() =>
    validateSupportOptions({ screenSync: false, controllerTiming: false, settings: true }),
  /explicitly select/);
});

test("GitHub support reports contain the problem, basic system details, and only opted-in logs", () => {
  const report = createGithubIssueReport({
    problem: "The preview stays black.\n\nIt happens after reconnecting.",
    appVersion: "1.0.86",
    platform: "win32",
    osVersion: "10.0.26100",
    architecture: "x64",
    diagnostics: {
      screenSync: {
        included: true,
        available: true,
        truncated: false,
        content: '{"event":"session-start","ledCount":75}\n'
      },
      controllerTiming: { included: false }
    }
  });
  assert.equal(report.title, "Support: The preview stays black.");
  assert.match(report.body, /The preview stays black\.\n\nIt happens after reconnecting\./);
  assert.match(report.body, /- ULLeds: 1\.0\.86/);
  assert.match(report.body, /- Windows: 10\.0\.26100 \(x64\)/);
  assert.match(report.body, /Attach it to this issue if you want to share them/);
  assert.doesNotMatch(report.body, /"ledCount":75/);
  assert.doesNotMatch(report.body, /Controller timing diagnostics/);
  assert.equal(report.hasDiagnostics, true);
  const attachment = JSON.parse(report.attachmentContent);
  assert.equal(attachment.problem, "The preview stays black.\n\nIt happens after reconnecting.");
  assert.equal(attachment.diagnostics.screenSync.content, '{"event":"session-start","ledCount":75}\n');
  assert.deepEqual(attachment.diagnostics.controllerTiming, { included: false });
  assert.throws(() => createGithubIssueReport({
    problem: "  ",
    appVersion: "1.0.86",
    platform: "win32",
    osVersion: "10.0.26100",
    architecture: "x64",
    diagnostics: {
      screenSync: { included: false },
      controllerTiming: { included: false }
    }
  }), /Describe the problem/);
});

test("GitHub issue URLs target only the ULLeds repository and preserve the previewed text", () => {
  const url = new URL(createGithubIssueUrl({
    title: "Support: Connection failed",
    body: "### What happened?\nConnection failed.\n\nDiagnostics: ✓"
  }));
  assert.equal(url.origin, "https://github.com");
  assert.equal(url.pathname, "/gingermat24/ULLeds/issues/new");
  assert.equal(url.searchParams.get("title"), "Support: Connection failed");
  assert.equal(url.searchParams.get("body"), "### What happened?\nConnection failed.\n\nDiagnostics: ✓");
  assert.throws(() => createGithubIssueUrl({ title: " ", body: "x" }), /title and body are required/);
});

test("GitHub draft URLs exclude selected logs and reject an overlong problem description", () => {
  const report = createGithubIssueReport({
    problem: "A brief problem description.",
    appVersion: "1.0.87",
    platform: "win32",
    osVersion: "10.0.26200",
    architecture: "x64",
    diagnostics: {
      screenSync: {
        included: true,
        available: true,
        truncated: false,
        content: `${"diagnostic line\n".repeat(500)}`
      },
      controllerTiming: { included: false }
    }
  });
  const url = createGithubIssueUrl(report);
  assert.ok(url.length < 7000);
  assert.doesNotMatch(url, /diagnostic%20line/);
  assert.match(report.attachmentContent, /diagnostic line/);
  assert.throws(() => {
    const longReport = createGithubIssueReport({
      problem: "😀".repeat(2500),
      appVersion: "1.0.87",
      platform: "win32",
      osVersion: "10.0.26200",
      architecture: "x64",
      diagnostics: {
        screenSync: { included: false },
        controllerTiming: { included: false }
      }
    });
    createGithubIssueUrl(longReport);
  }, /too long to open as a GitHub draft/);
});

test("diagnostic reader reports a missing file and bounds large logs to their newest complete lines", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "ulleds-support-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const missing = await readDiagnosticLog(path.join(directory, "missing.log"));
  assert.deepEqual(missing, { available: false, truncated: false, content: "" });

  const filePath = path.join(directory, "large.log");
  await fs.writeFile(filePath, `${"x".repeat(MAX_DIAGNOSTIC_BYTES)}\nlatest diagnostic\n`);
  const result = await readDiagnosticLog(filePath);
  assert.equal(result.available, true);
  assert.equal(result.truncated, true);
  assert.equal(result.content, "latest diagnostic\n");
});

test("diagnostic reader propagates errors other than a missing file", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "ulleds-support-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await assert.rejects(readDiagnosticLog(null), TypeError);
});
