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

test("frosted glass is clean, adjustable, and respects reduced-transparency preferences", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(html, /id="appearance-card"/);
  assert.match(html, /id="liquid-glass-toggle"/);
  assert.match(html, /id="glass-clarity"[^>]*type="range"|<input id="glass-clarity" type="range"/);
  assert.match(app, /const LIQUID_GLASS = "ON"/);
  assert.match(app, /prefers-reduced-transparency: reduce/);
  assert.match(app, /root\.dataset\.glass = glassIsActive\(\) \? "on" : "off"/);
  assert.match(app, /--glass-alpha/);
  assert.match(app, /--glass-blur/);
  assert.match(css, /html\[data-glass="on"\].*backdrop-filter/s);
  assert.match(css, /html\[data-glass="on"\].*background-color: rgb\(31 39 50 \/ var\(--glass-alpha\)\)/s);
  assert.doesNotMatch(css, /box-shadow|text-shadow|drop-shadow|radial-gradient/i);
  assert.doesNotMatch(css, /ambient-led|glow/i);
  assert.match(html, /<html lang="en" data-glass="on">/);
  assert.doesNotMatch(html.slice(html.indexOf('<header class="topbar">'), html.indexOf("</header>")), /ULLeds|brand|logo/i);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /input\[type="range"\]::-webkit-slider-thumb \{\s+-webkit-appearance: none;\s+width: 26px;\s+height: 18px;\s+margin-top: -8px;/);
});

test("topbar tabs stay centered independently of connection status changes", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(css, /\.topbar \{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, 1fr\) max-content minmax\(0, 1fr\);/s);
  assert.match(css, /\.tabs \{[^}]*justify-self: center;/s);
  assert.match(css, /\.device-status \{[^}]*width: min\(280px, 100%\);/s);
  assert.match(css, /#device-label \{\s+flex: 1 1 auto;\s+min-width: 0;\s+overflow: hidden;\s+text-overflow: ellipsis;\s+white-space: nowrap;/);
  assert.match(css, /\.device-status \{[^}]*justify-self: end;/s);
  assert.match(css, /@media \(max-width: 980px\) \{\s+\.topbar \{\s+grid-template-columns: minmax\(0, 1fr\) auto;/);
});

test("release notes have separate entries for every version from 1.0.0 through 1.0.27", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const releaseVersions = [...html.matchAll(/<h3>ULLeds (1\.0\.\d+)<\/h3>/g)].map((match) => match[1]);

  for (let version = 0; version <= 27; version += 1) {
    assert.equal(releaseVersions.filter((entry) => entry === `1.0.${version}`).length, 1);
  }
  assert.doesNotMatch(html, /<h3>ULLeds 1\.0\.12[–-]1\.0\.14<\/h3>/);
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
  assert.match(main, /void scanAndConnect\(\)\.catch/);
  assert.match(html, /id="start-with-windows"/);
  assert.match(html, /id="resume-screen-sync"/);
  assert.match(app, /window\.ull\.screenSyncSource\(\)\.then/);
  assert.match(app, /chromeMediaSourceId: id/);
  assert.match(app, /maybeResumeScreenSync\(\)/);
  assert.match(app, /Will resume automatically when ULLeds starts/);
});

test("saved Screen Sync preserves output only during reconnect and falls back when resume fails", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(main, /function updateAnimation\(\{ preserveOutput = false \} = \{\}\)/);
  assert.match(main, /if \(screenSyncActive \|\| \(preserveOutput && settings\.resumeScreenSync\)\) return/);
  assert.match(main, /updateAnimation\(\{ preserveOutput: settings\.resumeScreenSync \}\)/);
  assert.match(main, /parseDeviceLedCount\(response\)/);
  assert.match(main, /response\.length < 12 \|\| response\[4\] !== 130/);
  assert.match(app, /screenSyncStarting \|\| \(/);
  assert.match(app, /syncPending \? "Starting…"/);
  assert.match(app, /syncPending\s*\?\s*"Resuming display capture…"/);
  assert.match(app, /!sessionOwnsStream && \(hardwareSyncStarted \|\| automatic\)/);
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

  assert.doesNotMatch(html.slice(html.indexOf('<header class="topbar">'), html.indexOf("</header>")), /app\.png/);
  assert.match(iconScript, /app\.png/);
  assert.match(iconScript, /\$sizes = \[int\[\]\]@\(16, 20, 24, 32, 40, 48, 64, 128, 256\)/);
  assert.doesNotMatch(iconScript, /bitmap\.Save\(\$pngPath/);
  const iconPath = path.join(__dirname, "..", "assets", "app.ico");
  const icon = fs.readFileSync(iconPath);
  const iconCount = icon.readUInt16LE(4);
  assert.equal(iconCount, 9);
  assert.deepEqual(
    Array.from({ length: iconCount }, (_, index) => {
      const size = icon[6 + index * 16];
      return size || 256;
    }),
    [16, 20, 24, 32, 40, 48, 64, 128, 256]
  );
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  assert.match(main, /icon: path\.join\(__dirname, "assets", "app\.ico"\)/);
  assert.match(packageJson.scripts["dist:win"], /create-icon\.ps1/);
  assert.match(css, /@media \(max-width: 980px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("the default lighting is green at 50% brightness and the app expands on large windows", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(main, /color: "#008100"/);
  assert.match(main, /brightness: 50/);
  assert.match(app, /color: "#008100"/);
  assert.match(app, /brightness: 50/);
  assert.match(html, /id="color-picker" type="color" value="#008100"/);
  assert.match(html, /id="hex-color"[^>]*value="#008100"/);
  assert.match(html, /id="brightness"[^>]*value="50"/);
  assert.match(css, /\.app \{\s+width: 100%;\s+\}/);
  assert.match(css, /@media \(min-width: 1440px\)/);
});

test("full reset is confirmed, clears app and imported profile data, and preserves the installation", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");
  const resetData = fs.readFileSync(path.join(__dirname, "..", "reset-data.js"), "utf8");

  assert.match(html, /id="reset-all-data"/);
  assert.match(html, /id="reset-dialog"/);
  assert.match(html, /DX Light\/QuikLight/);
  assert.match(html, /active compatible controller stays connected and selected/);
  assert.match(app, /window\.ull\.resetData\(\)/);
  assert.match(app, /settingsQueue = \{\}/);
  assert.match(app, /screenSyncGeneration \+= 1/);
  assert.match(app, /generation !== screenSyncGeneration/);
  assert.match(preload, /resetData: \(\) => ipcRenderer\.invoke\("settings:reset"\)/);
  assert.match(main, /ipcMain\.handle\("settings:reset"/);
  assert.match(main, /settings = settingsAfterReset\(defaultSettings\(\), activeProfile, activePath\)/);
  const resetHandler = main.slice(main.indexOf('ipcMain.handle("settings:reset"'), main.indexOf('ipcMain.handle("app:initial-state"'));
  assert.doesNotMatch(resetHandler, /await disconnectDevice\(\)/);
  assert.match(resetHandler, /if \(hidDevice\) updateAnimation\(\)/);
  assert.match(main, /configureLoginItem\(\)/);
  assert.match(resetData, /path\.join\(root, "ULLeds", "settings\.json"\)/);
  assert.match(resetData, /path\.join\(root, "DX Light", "config\.json"\)/);
  assert.match(resetData, /path\.join\(root, "quiklight-desktop", "config\.json"\)/);
});

test("the Device page can list and switch between detected compatible controllers", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");

  assert.match(html, /id="controller-select"/);
  assert.match(app, /window\.ull\.connectDevice\(devicePath\)/);
  assert.match(preload, /connectDevice: \(devicePath\) => ipcRenderer\.invoke\("device:connect", devicePath\)/);
  assert.match(main, /devices,\s*\.\.\.deviceState\(\)/);
  assert.match(main, /listSupportedControllers\(listHidDevices\(\), profiles\)/);
  assert.match(html, /ULLeds-compatible controller/);
  assert.match(html, /Arbitrary HID devices are not driven/);
});
