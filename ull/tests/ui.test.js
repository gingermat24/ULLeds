"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const uiDirectory = path.join(__dirname, "..", "ui");

test("the detected LED count has no editable renderer control", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  assert.doesNotMatch(html, /id=["']led-count["']/);
  assert.doesNotMatch(app, /data-setting=["']ledCount["']/);
});

test("renderer selectors resolve to unique elements in the page", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const missing = [...new Set([...app.matchAll(/\$\("#([^"]+)"\)/g)].map((match) => match[1]))]
    .filter((id) => !ids.includes(id));

  assert.deepEqual(duplicates, []);
  assert.deepEqual(missing, []);
});

test("update feedback includes an accessible progress bar and reports download size", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(html, /id=["']update-progress["'][^>]*role=["']progressbar["']/);
  assert.match(html, /id=["']update-progress-fill["']/);
  assert.match(app, /window\.ull\.onUpdateProgress/);
  assert.match(app, /formatUpdateProgress/);
  assert.match(app, /updateCheckInProgress/);
});

test("the interface has no decorative glow, shadow, or backdrop blur", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  assert.doesNotMatch(css, /box-shadow|text-shadow|backdrop-filter/);
});

test("Scenes is archived behind a disabled feature flag", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(app, /const SCENES_ENABLED = false/);
  assert.equal((html.match(/data-feature="scenes"/g) || []).length, 2);
  assert.match(app, /if \(name === "scenes" && !SCENES_ENABLED\) return/);
  assert.match(app, /if \(SCENES_ENABLED\) \{\s*\$\("#save-scene"\)/);
});

test("update installation stops controller work without waiting for HID shutdown", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const prepare = main.indexOf("function prepareForUpdate()");
  const install = main.indexOf('ipcMain.handle("updates:install"');
  const updaterLaunch = main.indexOf("autoUpdater.quitAndInstall(true, true)", install);

  assert.notEqual(prepare, -1);
  assert.notEqual(install, -1);
  assert.notEqual(updaterLaunch, -1);
  assert.match(main.slice(prepare, install), /void disconnectDevice\(\)/);
  assert.match(main.slice(install, updaterLaunch), /prepareForUpdate\(\)/);
  assert.doesNotMatch(main.slice(install, updaterLaunch), /await/);
});

test("restart status tells users ULLeds will reopen automatically", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  assert.match(app, /ULLeds will reopen automatically/);
  assert.match(app, /requestAnimationFrame\(\(\) => requestAnimationFrame\(resolve\)\)/);
});

test("saved color is restored at Windows sign-in and screen sync can resume automatically", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.match(main, /startWithWindows: true/);
  assert.match(main, /openAtLogin: settings\.startWithWindows/);
  assert.match(main, /args: \["--hidden"\]/);
  assert.match(main, /if \(devices\.length\) void connectDevice\(devices\[0\]\.path\)/);
  assert.match(html, /id="start-with-windows"/);
  assert.match(html, /id="resume-screen-sync"/);
  assert.match(app, /window\.ull\.screenSyncSource\(\)\.then/);
  assert.match(app, /chromeMediaSourceId: id/);
  assert.match(app, /maybeResumeScreenSync\(\)/);
  assert.match(app, /Will resume automatically when ULLeds starts/);
});

test("reopening during saved screen sync keeps hardware output and shows a starting state", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(main, /if \(screenSyncActive \|\| settings\.resumeScreenSync\) return/);
  assert.match(app, /screenSyncStarting \|\| \(/);
  assert.match(app, /syncPending \? "Starting…"/);
  assert.match(app, /syncPending\s*\?\s*"Resuming display capture…"/);
  assert.match(app, /autoSyncAttempted = true;\s*updatePreview\(\);\s*void startScreenSync\(\{ automatic: true \}\)/);
});

test("LED channel calibration is exposed, saved, and applied to the preview", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.match(html, /id="rgb-red"/);
  assert.match(html, /id="rgb-green"/);
  assert.match(html, /id="rgb-blue"/);
  assert.match(app, /function calibratedColor/);
  assert.match(app, /queueSettings\(\{ channelGains \}\)/);
  assert.match(main, /channelGains: \[100, 100, 100\]/);
  assert.match(main, /settings\.channelGains/);
});

test("Screen Sync FPS is persisted and controls capture, sampling, and HID cadence", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.match(html, /id="sync-fps-range"[^>]*min="5" max="60"[^>]*value="30"/);
  assert.match(html, /id="sync-fps-number"[^>]*min="5" max="60"[^>]*value="30"/);
  assert.match(main, /syncFps: 30/);
  assert.match(main, /Screen Sync FPS must be an integer from 5 to 60/);
  assert.match(app, /maxFrameRate: state\.settings\.syncFps/);
  assert.match(app, /frameRate: state\.settings\.syncFps/);
  assert.match(app, /1000 \/ clamp\(Number\(state\.settings\.syncFps\)/);
});

test("Updates has GitHub Releases selected by default and guarded local updates", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.match(html, /data-view="updates"/);
  assert.match(html, /id="update-source-github"[^>]*value="github"/);
  assert.match(html, /id="update-source-local"[^>]*value="local"/);
  assert.match(html, /GitHub Releases is the planned default/);
  assert.match(html, /What changed/);
  assert.match(app, /updateSource: "github"/);
  assert.match(app, /GitHub Releases updates are coming soon/);
  assert.match(main, /updateSource: "github"/);
  assert.match(main, /settings\.updateSource !== "local"/);
});

test("the icon build consumes the user PNG and responsive motion preferences are global", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  const iconScript = fs.readFileSync(path.join(__dirname, "..", "..", "scripts", "create-icon.ps1"), "utf8");
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8"));

  assert.match(html, /src="\.\.\/assets\/app\.png"/);
  assert.match(iconScript, /app\.png/);
  assert.doesNotMatch(iconScript, /bitmap\.Save\(\$pngPath/);
  assert.match(packageJson.scripts["dist:win"], /create-icon\.ps1/);
  assert.match(css, /@media \(max-width: 980px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
