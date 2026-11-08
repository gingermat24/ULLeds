"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
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

test("renderer scripts load together and expose their APIs", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const scriptPaths = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)]
    .map((match) => path.resolve(uiDirectory, match[1]));
  const context = vm.createContext({});
  context.window = context;

  for (const scriptPath of scriptPaths) {
    let source = fs.readFileSync(scriptPath, "utf8");
    if (path.basename(scriptPath) === "app.js") {
      const startupCall = /\nstart\(\);\s*$/;
      assert.match(source, startupCall);
      source = source.replace(startupCall, "\n");
    }
    assert.doesNotThrow(
      () => new vm.Script(source, { filename: scriptPath }).runInContext(context),
      `${path.relative(uiDirectory, scriptPath)} should load without a global declaration collision`
    );
  }

  assert.equal(typeof context.ullScreenSyncLifecycle?.createScreenSyncLifecycle, "function");
  assert.equal(typeof context.ullStripLayout?.allocateEdgeIndices, "function");
  assert.equal(typeof context.ullLedSelection?.selectLed, "function");
  assert.equal(typeof context.ullSceneData?.sceneFromLighting, "function");
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

test("Liquid Glass is fully removed from the interface", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  for (const source of [html, app, css]) {
    assert.doesNotMatch(source, /data-glass|liquid-glass-toggle|glass-clarity|LIQUID_GLASS|--glass-|backdrop-filter/);
  }
  assert.match(html, /<html lang="en">/);
  assert.doesNotMatch(html, /class="brand"/);
  assert.match(css, /--accent: #D71921/);
  assert.match(css, /--bg: #000000/);
  assert.doesNotMatch(css, /box-shadow|text-shadow/i);
});

test("legacy vendor names are replaced with a neutral device label", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(app, /function deviceLabel\(value, fallback = "USB LED controller"\)/);
  assert.match(app, /\.replace\(\/\\brobo\\s\*bloq\\b\/gi, ""\)/);
  assert.match(app, /\.replace\(\/\\bpc\\s\*sync\\b\/gi, ""\)/);
  assert.match(app, /deviceLabel\(device\.name\)/);
  assert.match(app, /deviceLabel\(state\.device\.name/);
  assert.doesNotMatch(html, /Robobloq|ROBOBLOQ|PC SYNC/i);
});

test("power off always reaches the controller and the switch reports the live state", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const screenSync = fs.readFileSync(path.join(__dirname, "..", "screen-sync.js"), "utf8");

  assert.match(html, /id="power-toggle" class="power-switch" type="button" role="switch" aria-checked="true"/);
  assert.match(app, /if \(screenSyncSession \|\| screenSyncLifecycle\.isStarting\) stopScreenSync\("", true\);\s+queueSettings\(\{ power: !state\.settings\.power \}, true\);/);
  assert.match(app, /\$\("#power-toggle"\)\.setAttribute\("aria-checked", String\(settings\.power\)\)/);
  assert.match(app, /\$\("#power-state"\)\.textContent = settings\.power \? "On" : "Off"/);
  assert.match(app, /style\.setProperty\("--led-opacity", settings\.power \? String\(settings\.brightness \/ 100\) : "0"\)/);
  assert.match(app, /\$\("#monitor"\)\.dataset\.power = settings\.power \? "on" : "off"/);
  assert.match(main, /ipcMain\.handle\("settings:update", async \(_event, input\) => \{\s+const powerChanged = input && Object\.hasOwn\(input, "power"\);\s+const result = setSettings\(input, !powerChanged\);\s+if \(powerChanged\) await updateAnimation\(\{ waitForOutput: true \}\);/);
  assert.match(main, /const powerOff = !settings\.power;\s+if \(!powerOff && \(screenSyncActive \|\| \(preserveOutput && settings\.resumeScreenSync\)\)\) return;/);
  assert.match(main, /if \(!hidDevice \|\| powerOff \|\| settings\.effect === "steady"\) \{/);
  assert.match(main, /ipcMain\.handle\("screen-sync:colors", \(_event, colors\) => \{\s+if \(!screenSyncActive \|\| !hidDevice \|\| !settings\.power\) return \{ active: false \};/);
  assert.match(main, /ipcMain\.handle\("screen-sync:stop", async \(\) => \{\s+screenSyncActive = false;\s+pendingMovieFormat = null;\s+try \{\s+await updateAnimation\(\{ waitForOutput: true \}\);\s+\} finally \{\s+await screenSyncDiagnostics\.stop\("user"\);/);
  assert.match(main, /function updateAnimation\(\{ preserveOutput = false, waitForOutput = false \}/);
});

test("topbar tabs stay centered independently of connection status changes", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(css, /\.topbar \{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, 1fr\) max-content minmax\(0, 1fr\);/s);
  assert.match(css, /\.tabs \{[^}]*position: absolute;[^}]*left: 50%;[^}]*transform: translateX\(-50%\);/s);
  assert.match(css, /\.topbar button, \.tabs, \.device-status \{ -webkit-app-region: no-drag; \}/);
  assert.match(css, /\.device-status \{[^}]*width: min\(280px, 100%\);/s);
  assert.match(css, /#device-label \{\s+flex: 1 1 auto;\s+min-width: 0;\s+overflow: hidden;\s+text-overflow: ellipsis;\s+white-space: nowrap;/);
  assert.match(css, /\.device-status \{[^}]*justify-self: end;/s);
  assert.match(css, /\.topbar \{[^}]*padding: 0 calc\(var\(--pad-x\) \+ max\(148px, 100% - env\(titlebar-area-width, 100%\)\)\) 0 var\(--pad-x\);/s);
  assert.match(css, /@media \(max-width: 1180px\) \{\s+\.topbar \{\s+grid-template-columns: minmax\(0, 1fr\) auto;/);
  assert.match(css, /@media \(max-width: 1180px\) \{[\s\S]*\.tabs \{\s+position: relative;/);
});

test("settings changes stay ordered and sliders flush their final value", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(app, /void flushSettingsQueue\(\);\s+\}, 16\);/);
  assert.match(app, /while \(Object\.keys\(settingsQueue\)\.length\)/);
  assert.match(app, /Object\.assign\(state\.settings, settingsQueue\)/);
  assert.match(app, /settingsQueue = \{ \.\.\.pending, \.\.\.settingsQueue \}/);
  assert.match(app, /if \(immediate\) \{\s+settingsTimer = null;\s+void flushSettingsQueue\(\);/);
  assert.match(app, /document\.addEventListener\("change", \(event\) => \{\s+if \(event\.target instanceof HTMLInputElement && event\.target\.type === "range"\)/);
  assert.doesNotMatch(app, /settingsRevision/);
  assert.match(css, /\.preference-row input\[type="checkbox"\]::after \{[^}]*top: 50%;[^}]*transform: translateY\(-50%\);/s);
  assert.match(css, /\.preference-row input\[type="checkbox"\]:checked::after \{[^}]*transform: translate\(20px, -50%\);/s);
  assert.match(css, /\.preference-row input\[type="checkbox"\] \{[\s\S]*border-radius: 0;/);
});

test("release notes have separate entries for every version from 1.0.0 through 1.0.44", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const releaseVersions = [...html.matchAll(/<h3>ULLeds (1\.0\.\d+)<\/h3>/g)].map((match) => match[1]);

  for (let version = 0; version <= 44; version += 1) {
    assert.equal(releaseVersions.filter((entry) => entry === `1.0.${version}`).length, 1);
  }
  const currentMarkers = [...html.matchAll(/<header><h3>ULLeds 1\.0\.\d+<\/h3><span>Current<\/span><\/header>/g)];
  assert.equal(currentMarkers.length, 1);
  assert.match(html, /<header><h3>ULLeds 1\.0\.44<\/h3><span>Current<\/span><\/header>/);
  assert.doesNotMatch(html, /<h3>ULLeds 1\.0\.12[–-]1\.0\.14<\/h3>/);
});

test("LED preview scales with its card and selected LEDs stay within their grid cells", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(css, /\.preview-card\s*\{[^}]*container-type:\s*inline-size/s);
  assert.match(css, /--led-rail-size:\s*clamp\(10px,\s*1\.5cqi,\s*18px\)/);
  assert.match(css, /\.led-edge\s*\{[^}]*gap:\s*clamp\(2px,\s*0\.28cqi,\s*4px\)/s);
  assert.match(css, /\.led-pixel\.selected\s*\{[^}]*outline:\s*2px solid #fff;[^}]*outline-offset:\s*-2px/s);
  assert.doesNotMatch(css, /\.led-pixel(?:\.selected)?:hover\s*\{[^}]*transform:\s*scale/);
});

test("Scenes save full lighting setups with explicit management actions", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.match(html, /id="save-scene"[^>]*>Save current setup/);
  assert.match(html, /id="scene-form"/);
  assert.match(html, /id="delete-scene-dialog"/);
  assert.match(html, /id="palette-tuning"/);
  assert.match(app, /sceneFromLighting\(/);
  assert.match(app, /function duplicateScene/);
  assert.match(app, /function applyScene/);
  assert.match(app, /settingsFromScene\(scene\)/);
  assert.match(main, /scenes: \[\]/);
  assert.match(main, /normalizeScenes\(input\.scenes\)/);
  assert.doesNotMatch(app, /SCENES_ENABLED|DEFAULT_SCENES/);
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
  const screenSync = fs.readFileSync(path.join(__dirname, "..", "screen-sync.js"), "utf8");

  assert.match(main, /acquireSingleInstanceLock\(app, showMainWindow\)/);
  assert.match(main, /if \(!hasSingleInstanceLock\) return/);
  assert.match(main, /startWithWindows: true/);
  assert.match(main, /openAtLogin: settings\.startWithWindows/);
  assert.match(main, /args: \["--hidden"\]/);
  assert.match(main, /void scanAndConnect\(\)\.catch/);
  assert.match(html, /id="start-with-windows"/);
  assert.match(html, /id="resume-screen-sync"/);
  assert.match(app, /window\.ull\.screenSyncSource\(\)\.then/);
  assert.match(app, /video\.requestVideoFrameCallback\(sampleFrame\)/);
  assert.match(app, /session\.video\.cancelVideoFrameCallback\(session\.videoFrame\)/);
  assert.match(app, /createLatestFrameSender\(\{/);
  assert.match(screenSync, /audio: false/);
  assert.match(app, /stream\.getAudioTracks\(\)\.length/);
  assert.match(app, /audio input is not supported/);
  assert.match(screenSync, /chromeMediaSourceId: sourceId/);
  assert.match(app, /const capture = window\.ull\.screenSyncSource\(\)\.then\(\(\{ id \}\) =>\s*navigator\.mediaDevices\.getUserMedia\(/);
  assert.match(app, /createDesktopCaptureConstraints\(id, state\.settings\.syncFps\)/);
  assert.doesNotMatch(app, /getDisplayMedia/);
  assert.match(app, /maybeResumeScreenSync\(\)/);
  assert.match(app, /Will resume automatically when ULLeds starts/);
});

test("saved Screen Sync preserves output only during reconnect and falls back when resume fails", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(main, /function updateAnimation\(\{ preserveOutput = false, waitForOutput = false \} = \{\}\)/);
  assert.match(main, /if \(!powerOff && \(screenSyncActive \|\| \(preserveOutput && settings\.resumeScreenSync\)\)\) return/);
  assert.match(main, /updateAnimation\(\{ preserveOutput: settings\.resumeScreenSync \}\)/);
  assert.match(main, /parseDeviceLedCount\(response, messageId\)/);
  assert.match(main, /response\[offset \+ 3\] !== messageId \|\| response\[offset \+ 4\] !== 130/);
  assert.match(app, /screenSyncLifecycle\.isStarting \|\| \(/);
  assert.match(app, /syncPending \? "Starting…"/);
  assert.match(app, /syncPending\s*\?\s*"Resuming display capture…"/);
  assert.match(app, /!sessionOwnsStream && \(hardwareSyncStarted \|\| automatic\) && !screenSyncLifecycle\.isStopping/);
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
  const screenSync = fs.readFileSync(path.join(__dirname, "..", "screen-sync.js"), "utf8");

  assert.match(html, /id="sync-fps-range"[^>]*min="5" max="60"[^>]*value="30"/);
  assert.match(html, /id="sync-fps-number"[^>]*min="5" max="60"[^>]*value="30"/);
  assert.match(main, /syncFps: 30/);
  assert.match(main, /Screen Sync FPS must be an integer from 5 to 60/);
  assert.match(app, /createDesktopCaptureConstraints\(id, state\.settings\.syncFps\)/);
  assert.match(app, /1000 \/ clamp\(Number\(state\.settings\.syncFps\)/);
  assert.match(app, /video\.requestVideoFrameCallback\(sampleFrame\)/);
  assert.match(app, /createLatestFrameSender\(\{/);
  assert.match(screenSync, /maxFrameRate,\s*maxWidth: MAX_CAPTURE_DIMENSION,\s*maxHeight: MAX_CAPTURE_DIMENSION/);
});

test("Screen Sync picture area is persisted and supports cinema widescreen sampling", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const screenSync = fs.readFileSync(path.join(__dirname, "..", "screen-sync.js"), "utf8");

  assert.match(html, /id="sync-content-mode"[\s\S]*value="display"[\s\S]*value="cinema235"/);
  assert.match(html, /ULLeds 1\.0\.44/);
  assert.match(app, /syncContentMode: "display"/);
  assert.match(app, /queueSettings\(\{ syncContentMode: event\.target\.value \}, true\)/);
  assert.match(app, /session\.detectedAspectRatio \|\|\s+\(state\.settings\.syncContentMode === "cinema235" \? 2\.35 : null\)/);
  assert.match(main, /syncContentMode: "display"/);
  assert.match(main, /Choose a supported Screen Sync picture area/);
  assert.match(screenSync, /contentAspectRatio = null/);
});

test("widescreen detection is optional, stable, and asks before changing the current sync area", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");
  const screenSync = fs.readFileSync(path.join(__dirname, "..", "screen-sync.js"), "utf8");

  assert.match(html, /id="sync-auto-detect" type="checkbox"/);
  assert.match(html, /id="use-detected-format"/);
  assert.match(html, /id="keep-detecting"/);
  assert.match(app, /syncAutoDetect: true/);
  assert.match(app, /detectLetterboxAspectRatio/);
  assert.match(app, /notifyMovieFormat\(stableRatio\)/);
  assert.match(app, /function applyDetectedMovieFormat/);
  assert.match(main, /new Notification\(\{ title: message\.title, body: message\.body \}\)/);
  assert.match(main, /!settings\.syncAutoDetect/);
  assert.match(preload, /onScreenSyncMovieDetected/);
  assert.match(preload, /notifyMovieFormat: \(aspectRatio\)/);
  assert.match(screenSync, /function detectLetterboxAspectRatio/);
  assert.match(screenSync, /function createLetterboxStability/);
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
  const appPng = fs.readFileSync(path.join(__dirname, "..", "assets", "app.png"));
  assert.equal(appPng.readUInt32BE(16), 1024);
  assert.equal(appPng.readUInt32BE(20), 1024);
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
  assert.match(main, /listSupportedControllers\(await listHidDevicesAsync\(\), profiles\)/);
  assert.match(html, /ULLeds-compatible controller/);
  assert.match(html, /Arbitrary HID devices are not driven/);
});

test("the interface uses a single typeface and no top-left branding", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.doesNotMatch(html, /class="brand|brand-name|brand-dot/);
  assert.doesNotMatch(html.slice(html.indexOf('<header class="topbar">'), html.indexOf("</header>")), />\s*ULLeds\s*</);
  assert.match(css, /--sans: "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, sans-serif;/);
  assert.match(css, /--mono: var\(--sans\);/);
  assert.doesNotMatch(css, /ui-monospace|Consolas|SF Mono|Cascadia Mono|monospace/);
});

test("the Windows title bar blends into the app and the native menu bar is removed", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(main, /titleBarStyle: "hidden"/);
  assert.match(main, /titleBarOverlay: \{\s+color: "#000000",\s+symbolColor: "#F5F5F5",\s+height: 40\s+\}/);
  assert.match(main, /Menu\.setApplicationMenu\(null\)/);
  assert.doesNotMatch(main, /createApplicationMenu/);
  assert.match(css, /\.topbar \{[^}]*[-]webkit-app-region: drag;/s);
  assert.match(css, /[-]webkit-app-region: no-drag/);
});

test("editing a connected strip profile updates the live connection profile and saved profile wins on reconnect", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.match(main, /if \(Object\.hasOwn\(changes, "deviceProfile"\) && connectedInfo\) \{\s+connectedInfo = \{\s+\.\.\.connectedInfo,\s+profile: settings\.deviceProfile\s+\?/);
  assert.match(main, /const savedProfile = settings\.devicePath === selected\.path && settings\.deviceProfile\?\.ledCount\s+\?\s+settings\.deviceProfile\s+:\s+selected\.profile\?\.ledCount/);
});

test("screen sync uses an updated strip layout immediately after profile edits", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(app, /function stripLayoutSignature\(layout\) \{\s+return JSON\.stringify\(\[layout\.ledCount, layout\.indices\]\);/);
  assert.match(app, /screenSyncSession\.layoutSignature !== signature\) \{\s+screenSyncSession\.layout = layout;\s+screenSyncSession\.layoutSignature = signature;\s+screenSyncSession\.colors = null;/);
  assert.match(app, /Bottom left → over top → bottom right/);
  assert.match(app, /Bottom right → over top → bottom left/);
});

test("Screen Sync serializes its stop operation and permits canceling startup", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(html, /<script src="\.\.\/screen-sync-lifecycle\.js"><\/script>/);
  assert.match(app, /screenSyncLifecycle\.start\(\(\) => runScreenSyncStart\(options\)\)/);
  assert.match(app, /screenSyncLifecycle\.stop\(\(\) => \{/);
  assert.match(app, /screenSyncLifecycle\.isStopping\s*\?\s*"Stopping…"/);
  assert.match(app, /screenSyncSession \|\| screenSyncLifecycle\.isStarting\) stopScreenSync/);
});

test("Screen Sync sends sampled screen colors without synthetic transition blending", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(app, /session\.colors = sampledColors;/);
  assert.doesNotMatch(app, /session\.colors = session\.colors\s*\?\s*window\.ullScreenSync\.blendColorArrays/);
});

test("startup UI appears before the controller scan completes", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const start = app.slice(app.indexOf("async function start()"), app.indexOf("\nfunction maybeResumeScreenSync()"));

  assert.match(start, /state = await window\.ull\.initialState\(\);\s+render\(\);\s+if \(!state\.settings\.onboarded\) openSetup\(\);\s+void scanDevices\(\)\.then\(maybeResumeScreenSync\)/);
  assert.match(app, /if \(!state\.settings\.onboarded && \$\("#setup-dialog"\)\.open && wizardStep === 0\) \{\s+setWizardStep\(0\);/);
});

test("main-process controller discovery uses asynchronous HID enumeration", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.match(main, /devicesAsync: listHidDevicesAsync/);
  assert.match(main, /async function getDeviceList\(\) \{\s+const profiles = loadSavedProfiles\(app\.getPath\("appData"\)\);\s+return listSupportedControllers\(await listHidDevicesAsync\(\), profiles\);/);
  assert.match(main, /const devices = await getDeviceList\(\)/);
  assert.match(main, /if \(selected\) await connectDevice\(selected\.path, devices\)/);
  assert.doesNotMatch(main, /listHidDevices\(\)/);
});
