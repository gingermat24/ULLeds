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
  const generatedIds = new Set([
    ...[...app.matchAll(/\bid:\s*["']([^"']+)["']/g)].map((match) => match[1]),
    ...[...app.matchAll(/selectField\([^,\n]+,\s*["']([^"']+)["']/g)].map((match) => match[1])
  ]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const missing = [...new Set([...app.matchAll(/\$\("#([\w-]+)/g)].map((match) => match[1]))]
    .filter((id) => !ids.includes(id) && !generatedIds.has(id));

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
  assert.equal(typeof context.ullSpotifySync?.createSpotifySyncColors, "function");
  assert.equal(typeof context.ullGithubReleases?.getReleasedInstallers, "function");
  assert.equal(typeof context.ullStartupMode?.isSyncStartupMode, "function");
});

test("release notes offer published version downloads and a compact startup update notice", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(html, /id="version-notice"[^>]*role="status"/);
  assert.match(html, /id="version-notice-update"[^>]*>Update</);
  assert.match(html, /github-releases\.js/);
  assert.match(app, /listReleaseDownloads\(\)/);
  assert.match(app, /listReleaseHistory\(\)/);
  assert.match(app, /function releaseEntries\(\)/);
  assert.match(app, /function buildReleaseEntry\(entry\)/);
  assert.match(app, /function releaseDate\(release\)/);
  assert.match(app, /compareReleaseVersions\(version, state\.version\)/);
  assert.match(app, /const label = comparison > 0 \? "Update" : "Downgrade"/);
  assert.match(css, /\.release-head\s*\{[^}]*display:\s*flex;[^}]*flex-wrap:\s*wrap/s);
  assert.match(app, /showVersionNotice\(releases\.latest\)/);
  assert.match(app, /startReleaseUpdate\(version, button\)/);
  assert.match(app, /window\.ull\.installRelease\(version\)/);
  assert.match(app, /updates\.busy = true;\s+switchView\("updates"\)/);
  assert.match(app, /Preparing ULLeds \$\{version\}/);
  assert.match(preload, /listReleaseDownloads: \(\) => ipcRenderer\.invoke\("updates:release-downloads"\)/);
  assert.match(preload, /listReleaseHistory: \(\) => ipcRenderer\.invoke\("updates:release-history"\)/);
  assert.match(preload, /installRelease: \(version\) => ipcRenderer\.invoke\("updates:install-release", version\)/);
  assert.match(main, /ipcMain\.handle\("updates:release-downloads"/);
  assert.match(main, /ipcMain\.handle\("updates:release-history"/);
  assert.match(main, /fetchInstallersFromReleasePages/);
  assert.match(main, /using public release pages/);
  assert.match(main, /getReleaseTagsFromHtml/);
  assert.match(main, /getReleaseInstallerFromHtml/);
  assert.match(main, /ipcMain\.handle\("updates:install-release"/);
  assert.match(main, /autoUpdater\.setFeedURL\(\{\s+provider: "generic",\s+url: new URL\("\.", installer\.url\)\.href\s+\}\)/);
  assert.match(main, /autoUpdater\.allowDowngrade = versionComparison < 0/);
  assert.match(main, /result\.updateInfo\.version !== version/);
  assert.doesNotMatch(main, /updates:download-release|shell\.openExternal\(installer\.url\)/);
  assert.match(css, /\.update-banner\s*\{[^}]*width:\s*min\(340px, calc\(100vw - 28px\)\)/s);
  assert.match(app, /versionNoticeTimer = setTimeout\(dismissVersionNotice, VERSION_NOTICE_MS\)/);
  assert.match(css, /animation: drain 8s linear forwards/);
});

test("Spotify Sync combines local cover art with live desktop audio analysis", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");

  assert.match(html, /Spotify Sync/);
  assert.match(html, /id="spotify-sync-toggle"/);
  assert.match(html, /id="spotify-sync-description"/);
  assert.match(html, /Spotify Sync reads cover art and analyzes local desktop audio while active\. That includes all system sound, not only Spotify\. Nothing is recorded or uploaded\./);
  assert.match(app, /window\.ull\.getSpotifyArtwork\(\)/);
  assert.match(app, /createSpotifySyncColors\([\s\S]*\n\s+5\s*\)/);
  assert.match(app, /window\.ull\.screenSyncSource\(\)\.then\(\(\{ id \}\) =>\s+navigator\.mediaDevices\.getUserMedia\(/);
  assert.match(app, /createDesktopAudioCaptureConstraints\(id\)/);
  assert.match(app, /new AudioContext\(\)/);
  assert.match(app, /analyser\.getFloatFrequencyData/);
  assert.match(app, /analyzeSpotifySpectrum/);
  assert.match(app, /createSpotifyReactiveColors/);
  assert.match(app, /session\.audioFrame = requestAnimationFrame/);
  assert.match(app, /window\.ull\.getSpotifyArtwork\(\),\s+audioCapture,\s+audioReady/);
  assert.match(app, /if \(artwork && artwork\.data !== session\.artworkData\)/);
  assert.match(app, /window\.ull\.startScreenSync\("spotify"\)/);
  assert.match(main, /ipcMain\.handle\("spotify-sync:artwork", \(\) => readSpotifyArtwork\(\)\)/);
  assert.match(main, /settings\.startupMode = mode;\s+saveSettings\(\)/);
  assert.match(main, /execFile\(helperPath/);
  assert.match(main, /spotify-media\.exe/);
  assert.match(preload, /getSpotifyArtwork: \(\) => ipcRenderer\.invoke\("spotify-sync:artwork"\)/);
  assert.match(preload, /screenSyncSource: \(\) => ipcRenderer\.invoke\("screen-sync:source"\)/);
  assert.match(preload, /startScreenSync: \(mode = "screen"\) => ipcRenderer\.invoke\("screen-sync:start", mode\)/);
  assert.match(app, /stopTracks\(audioStream\)/);
});

test("update feedback includes an accessible progress bar and reports download size", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(html, /id=["']update-progress["'][^>]*role=["']progressbar["']/);
  assert.match(html, /id=["']update-progress-fill["']/);
  assert.match(app, /window\.ull\.onUpdateProgress/);
  assert.match(app, /formatUpdateProgress/);
  assert.match(app, /updates\.busy/);
});

test("the interface uses flat monochrome surfaces without colored UI accents", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  for (const source of [html, app, css]) {
    assert.doesNotMatch(source, /data-glass|liquid-glass-toggle|glass-clarity|LIQUID_GLASS|--glass-/);
  }
  assert.match(html, /<html lang="en">/);
  assert.doesNotMatch(html, /class="brand"|brand-mark|brand-word/);
  assert.match(css, /--text: #f4f4f5/i);
  assert.match(css, /--bg: #0a0a0b/i);
  assert.match(css, /--surface: #101011/i);
  assert.doesNotMatch(css, /backdrop-filter/);
  assert.doesNotMatch(css, /#(?:D71921|E51B24|E5484D|FF0000)\b/i);
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

  assert.match(html, /id="power-toggle"[^>]*role="switch" aria-checked="true"/);
  assert.match(app, /void stopActiveSync\(\);\s+queueSettings\(\{ power: !state\.settings\.power \}, true\);/);
  assert.match(app, /\$\("#power-toggle"\)\.setAttribute\("aria-checked", String\(settings\.power\)\)/);
  assert.match(app, /\$\("#power-state"\)\.textContent = settings\.power \? "On" : "Off"/);
  assert.match(app, /root\.setProperty\("--led-opacity", settings\.power \? String\(settings\.brightness \/ 100\) : "0"\)/);
  assert.match(app, /\$\("#monitor"\)\.dataset\.power = settings\.power \? "on" : "off"/);
  assert.match(main, /ipcMain\.handle\("settings:update", async \(_event, input\) => \{\s+const powerChanged = input && Object\.hasOwn\(input, "power"\);\s+const result = setSettings\(input, !powerChanged\);\s+if \(powerChanged\) await updateAnimation\(\{ waitForOutput: true \}\);/);
  assert.match(main, /const powerOff = !settings\.power;\s+if \(!powerOff && \(screenSyncActive \|\| isSyncStartupMode\(settings\.startupMode\)\)\) return;/);
  assert.match(main, /if \(!hidDevice \|\| powerOff \|\| settings\.effect === "steady"\) \{/);
  assert.match(main, /if \(!hidDevice \|\| powerOff \|\| settings\.effect === "steady"\) \{[\s\S]*?if \(hidDevice\) \{[\s\S]*?writeColor\(settings\.color\)[\s\S]*?return;\s+\}/);
  const animation = main.slice(main.indexOf("function updateAnimation"), main.indexOf("function deviceState"));
  assert.match(animation, /settings\.effect === "steady"[\s\S]*?return;\s+\}\s+const interval/);
  assert.match(main, /ipcMain\.handle\("screen-sync:colors", \(_event, colors\) => \{\s+if \(!screenSyncActive \|\| !hidDevice \|\| !settings\.power\) return \{ active: false \};/);
  assert.match(main, /ipcMain\.handle\("screen-sync:stop", async \(\) => \{\s+screenSyncActive = false;\s+settings\.startupMode = "lighting";\s+saveSettings\(\);\s+dismissMovieFormatPrompt\(\);\s+try \{\s+await updateAnimation\(\{ waitForOutput: true \}\);\s+\} finally \{\s+await screenSyncDiagnostics\.stop\("user"\);/);
  assert.match(main, /function updateAnimation\(\{ waitForOutput = false \}/);
});

test("Windows session shutdown powers off connected LEDs without changing saved power", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const shutdownPower = fs.readFileSync(path.join(__dirname, "..", "shutdown-power.js"), "utf8");

  const queryEnd = main.slice(
    main.indexOf('mainWindow.on("query-session-end"'),
    main.indexOf('mainWindow.on("close"', main.indexOf('mainWindow.on("query-session-end"'))
  );
  assert.match(queryEnd, /shouldTurnOffForSessionEnd\(event, shutdown\)/);
  assert.match(queryEnd, /event\.preventDefault\(\)/);
  assert.match(queryEnd, /await turnOffForSessionEnd|void turnOffForSessionEnd/);
  assert.match(queryEnd, /writeOff: \(\) => writeColor\(settings\.color, 1, false\)/);
  assert.match(queryEnd, /\.finally\(\(\) => \{\s+app\.quit\(\)/);
  assert.match(main, /Could not turn off the LEDs before Windows session end/);
  assert.match(shutdownPower, /SESSION_END_REASONS = new Set\(\["shutdown", "critical", "logoff"\]\)/);
  assert.doesNotMatch(main, /app\.on\("session-end"/);
});

test("LED selection starts empty when the renderer opens", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  assert.match(app, /let selectedLedIndices = new Set\(\)/);
  assert.match(html, /id="selection-label">No LEDs selected</);
});

test("topbar uses compact status, shared page padding, and integrated window controls", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");

  assert.match(css, /\.topbar \{[^}]*grid-template-columns: max-content minmax\(0, 1fr\) max-content max-content;[^}]*height: 48px;/s);
  assert.match(css, /\.tabs \{[^}]*display: flex;[^}]*align-self: stretch;/s);
  assert.match(css, /\.tab\.active::after \{[^}]*background: var\(--text\);/s);
  assert.match(css, /\.topbar :is\(button, \.tabs, \.status, \.window-controls\) \{\s+-webkit-app-region: no-drag;/);
  assert.match(css, /\.status \{[^}]*grid-column: 3;[^}]*display: flex;/s);
  assert.match(css, /\.status-dot \{\s+flex: none;\s+width: 6px;\s+height: 6px;/);
  assert.match(css, /\.status\.connected \.status-dot \{\s+background: #fff;\s+\}/);
  assert.match(css, /\.window-controls \{\s+display: flex;\s+align-self: stretch;/);
  assert.match(css, /\.window-btn \{[^}]*background: transparent;/s);
  assert.match(css, /\.status-label \{\s+overflow: hidden;\s+text-overflow: ellipsis;\s+white-space: nowrap;/);
  assert.match(css, /main \{\s+flex: 1;\s+min-height: 0;[\s\S]*overflow-y: auto;/);
  assert.match(css, /\.app \{\s+display: flex;\s+flex-direction: column;[\s\S]*height: 100dvh;/);
  assert.match(css, /--gutter: 32px/);
  assert.match(css, /\.topbar \{[^}]*padding-left: var\(--gutter\);/s);
  assert.match(css, /@media \(max-width: 720px\) \{[\s\S]*\.topbar \{\s+grid-template-columns: minmax\(0, 1fr\) max-content;[\s\S]*\.tabs \{\s+grid-row: 2;[\s\S]*\.status \{\s+grid-column: 1;/);
  assert.match(main, /backgroundColor: "#0A0A0B",\s+frame: false,/);
  assert.doesNotMatch(main, /titleBarStyle|titleBarOverlay/);
  assert.match(html, /class="window-controls"/);
  assert.match(html, /id="window-minimize"/);
  assert.match(html, /id="window-maximize"/);
  assert.match(html, /id="window-close"/);
  assert.match(preload, /minimizeWindow: \(\) => ipcRenderer\.invoke\("window:minimize"\)/);
  assert.match(preload, /toggleMaximizeWindow: \(\) => ipcRenderer\.invoke\("window:toggle-maximize"\)/);
  assert.match(preload, /closeWindow: \(\) => ipcRenderer\.invoke\("window:close"\)/);
  assert.match(preload, /onWindowMaximized/);
  assert.doesNotMatch(html, /class="tab-indicator"/);
  assert.doesNotMatch(app, /positionTabIndicator|tab-indicator/);
  assert.match(app, /label\.textContent = connected \? "Connected" : error \? "Connection issue" : "Not connected"/);
});

test("lighting layout adapts to the window and the monitor preview matches the display ratio", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const controls = css.match(/\.controls\s*\{([^}]*)\}/)?.[1] || "";

  assert.match(css, /\.lighting \{[^}]*grid-template-columns: minmax\(0, 1fr\) 340px;[^}]*gap: var\(--s8\);/s);
  assert.match(controls, /align-self: start;/);
  assert.match(css, /\.preview \{[^}]*min-height: max\(440px, calc\(100dvh - 120px\)\);/s);
  assert.match(css, /\.monitor \{[^}]*aspect-ratio: var\(--monitor-aspect-ratio, 16 \/ 9\);/s);
  assert.match(css, /\.monitor \{[^}]*width: min\(100%, calc\(\(100dvh - 330px\) \* var\(--monitor-aspect-ratio, 1\.7778\)\)\);/s);
  assert.match(css, /--control: 34px/);
  assert.match(app, /function updateMonitorAspectRatio\(\) \{\s+const \{ width, height \} = window\.screen;\s+if \(!Number\.isFinite\(width\) \|\| !Number\.isFinite\(height\) \|\| width <= 0 \|\| height <= 0\) return;\s+document\.documentElement\.style\.setProperty\("--monitor-aspect-ratio", String\(width \/ height\)\);/);
  assert.match(app, /updateMonitorAspectRatio\(\);\s+window\.addEventListener\("resize", updateMonitorAspectRatio\);/);
});

test("lighting spacing and control sizes stay consistent while resizing the window", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(css, /--gutter:\s*32px;/);
  assert.match(css, /--control:\s*34px;/);
  assert.match(css, /--fs-md:\s*13px;/);
  assert.match(css, /--s1:\s*4px;/);
  assert.match(css, /--s2:\s*8px;/);
  assert.match(css, /--s3:\s*12px;/);
  assert.match(css, /--s4:\s*16px;/);
  assert.match(css, /--s5:\s*20px;/);
  assert.match(css, /--s6:\s*24px;/);
  assert.match(css, /\.panel\s*\{[^}]*padding:\s*var\(--s5\);/s);
  assert.match(css, /h2\s*\{[^}]*font-size:\s*var\(--fs-xl\);/s);
  assert.match(css, /\.lighting\s*\{[^}]*gap:\s*var\(--s8\);/s);
  assert.match(css, /\.control-section\s*\{[^}]*gap:\s*var\(--s3\);/s);
  assert.match(css, /font-family:\s*"Noto Sans"/);
  assert.doesNotMatch(css, /Cormorant/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
});

test("settings changes stay ordered and sliders flush their final value", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(app, /void flushSettingsQueue\(\);\s+\}, 16\);/);
  assert.match(app, /while \(Object\.keys\(queue\.changes\)\.length\)/);
  assert.match(app, /Object\.assign\(state\.settings, queue\.changes\)/);
  assert.match(app, /queue\.changes = \{ \.\.\.pending, \.\.\.queue\.changes \}/);
  assert.match(app, /if \(immediate\) \{\s+queue\.timer = null;\s+void flushSettingsQueue\(\);/);
  assert.match(app, /document\.addEventListener\("change", \(event\) => \{\s+if \(event\.target instanceof HTMLInputElement && event\.target\.type === "range"\)/);
  assert.doesNotMatch(app, /settingsRevision/);
  assert.match(css, /\.switch::after \{[^}]*top: 50%;[^}]*transform: translateY\(-50%\);/s);
  assert.match(css, /\.switch:is\(:checked, \[aria-checked="true"\]\)::after \{[^}]*transform: translate\(18px, -50%\);/s);
  assert.match(css, /\.switch \{[\s\S]*border-radius: 99px;/);
});

test("Device settings are grouped by controller, sync, startup, and reset", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  const sectionOrder = [
    "group-controller",
    "group-sync",
    "group-startup",
    "group-reset"
  ].map((id) => html.indexOf(`id="${id}"`));

  assert.ok(sectionOrder.every((index) => index >= 0));
  assert.deepEqual(sectionOrder, [...sectionOrder].sort((a, b) => a - b));
  assert.match(html, /aria-labelledby="group-controller"[\s\S]*id="controller-select"/);
  assert.match(html, /aria-labelledby="group-sync"[\s\S]*id="sync-fps-range"/);
  assert.match(html, /aria-labelledby="group-startup"[\s\S]*id="start-with-windows"/);
  assert.match(html, /aria-labelledby="group-reset"[\s\S]*id="reset-all-data"/);
  assert.match(css, /\.groups\s*\{[^}]*display:\s*grid;[^}]*gap:\s*var\(--s8\)/s);
});

test("controller reconnect polling sleeps while connected and retries only while disconnected", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const watcher = main.slice(main.indexOf("function stopDeviceWatcher"), main.indexOf("async function connectDevice"));
  const startup = main.slice(main.indexOf("void scanAndConnect().catch"), main.indexOf('app.on("activate"'));

  assert.match(watcher, /function scheduleDeviceWatcher\(\) \{\s+if \(watcherTimer \|\| isQuitting \|\| hidDevice\) return/);
  assert.match(watcher, /watcherTimer = setTimeout\(async \(\) =>/);
  assert.match(watcher, /if \(isQuitting \|\| hidDevice\) return/);
  assert.match(watcher, /if \(!hidDevice\) scheduleDeviceWatcher\(\)/);
  assert.doesNotMatch(watcher, /setInterval/);
  assert.match(main, /if \(hidDevice\) stopDeviceWatcher\(\);\s+else scheduleDeviceWatcher\(\)/);
  assert.match(startup, /if \(!hidDevice\) scheduleDeviceWatcher\(\)/);
});

test("release carousel has dated entries and compact bounded navigation", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(html, /id="release-track"[^>]*aria-live="polite"/);
  assert.match(html, /id="release-newer"[^>]*aria-label="Newer release"[^>]*>&lt;<\/button>/);
  assert.match(html, /id="release-older"[^>]*aria-label="Older release"[^>]*>&gt;<\/button>/);
  assert.match(html, /id="release-position" type="text" inputmode="numeric" pattern="\[0-9\]\*"[^>]*aria-describedby="release-total"/);
  assert.match(html, /id="release-total"/);
  assert.doesNotMatch(html, /release-progress-markers|release-marker/);
  assert.match(app, /function releaseDate\(release\)/);
  assert.match(app, /releases\.published \? h\("span", \{ class: "release-date", text: "Date unavailable" \}\) : null/);
  assert.match(app, /const stepRelease = \(delta\) => \{\s+const count = releases\.versions\.length;\s+if \(count\) showRelease\(releases\.previousIndex \+ delta\);/);
  assert.match(app, /position\.value = String\(current \+ 1\);\s+\$\("#release-total"\)\.textContent = String\(count\)/);
  assert.match(app, /function commitReleaseJump\(\)[\s\S]*Number\.isSafeInteger\(requested\) && requested >= 1 && requested <= count[\s\S]*showRelease\(requested - 1\)[\s\S]*position\.value = String\(releases\.previousIndex \+ 1\)/);
  assert.match(app, /\$\("#release-position"\)\.addEventListener\("change", commitReleaseJump\)/);
  assert.match(app, /\$\("#release-position"\)\.addEventListener\("focus", \(event\) => event\.currentTarget\.select\(\)\)/);
  assert.match(app, /event\.key === "Enter"[\s\S]*commitReleaseJump\(\)[\s\S]*event\.key === "Escape"/);
  assert.match(app, /\$\("#release-newer"\)\.hidden = current === 0/);
  assert.match(app, /\$\("#release-older"\)\.hidden = current === count - 1/);
  assert.match(app, /entries\[current\]\.animate\(/);
  assert.match(app, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.release-nav\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*center/s);
  assert.match(css, /\.release-nav \[hidden\]\s*\{\s*display:\s*none;\s*\}/);
  assert.match(css, /\.release-position\s*\{[^}]*width:\s*4ch;[^}]*border-bottom:\s*1px solid var\(--line-strong\);[^}]*text-align:\s*center/s);
});

test("release number jumps only to valid entries and restores invalid input", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const start = app.indexOf("function commitReleaseJump() {");
  const end = app.indexOf("\nasync function loadReleaseDownloads()", start);
  const position = { value: "4" };
  const context = {
    releases: { versions: ["1.0.77", "1.0.76", "1.0.75", "1.0.74"], previousIndex: 1 },
    $(selector) {
      assert.equal(selector, "#release-position");
      return position;
    },
    showRelease(index) {
      context.releases.previousIndex = index;
      position.value = String(index + 1);
      context.visitedIndex = index;
    }
  };

  assert.notEqual(start, -1);
  assert.ok(end > start);
  vm.runInNewContext(`${app.slice(start, end)}; commitReleaseJump();`, context);
  assert.equal(context.visitedIndex, 3);
  assert.equal(position.value, "4");

  for (const invalid of ["0", "5", "1.5", ""]) {
    position.value = invalid;
    vm.runInNewContext(`${app.slice(start, end)}; commitReleaseJump();`, context);
    assert.equal(context.releases.previousIndex, 3);
    assert.equal(position.value, "4");
  }
});

test("release notes have one combined entry for 1.0.68 instead of duplicate version 1.0.67", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const changelog = JSON.parse(html.match(/<script type="application\/json" id="changelog-data">([\s\S]*?)<\/script>/)[1]);
  const releaseVersions = changelog.releases.map(({ version }) => version);

  assert.equal(new Set(releaseVersions).size, releaseVersions.length);
  assert.equal(releaseVersions.filter((version) => version === "1.0.67").length, 0);
  assert.equal(releaseVersions.filter((version) => version === "1.0.68").length, 1);
  assert.equal(releaseVersions.filter((version) => version === "1.0.77").length, 1);
  assert.match(changelog.releases.find(({ version }) => version === "1.0.68").notes.Improved[0], /Reduced idle controller work/);
  assert.match(changelog.legacy.versions[0], /^1\.0\.\d+$/);
});

test("LED preview scales with its card and selected LEDs stay within their grid cells", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(css, /\.preview\s*\{[^}]*container-type:\s*inline-size/s);
  assert.match(css, /--rail:\s*clamp\(9px,\s*1\.4cqi,\s*16px\)/);
  assert.match(css, /\.led-edge\s*\{[^}]*gap:\s*clamp\(2px,\s*0\.25cqi,\s*3px\)/s);
  assert.match(css, /\.led-pixel\s*\{[^}]*border-radius:\s*clamp\(2px,\s*calc\(var\(--rail\) \* 0\.18\),\s*var\(--r\)\)/s);
  assert.match(css, /\.led-pixel\.selected\s*\{[^}]*outline:\s*1\.5px solid #fff;[^}]*outline-offset:\s*-1\.5px/s);
  assert.match(css, /\.led-pixel:focus-visible:not\(\.selected\)\s*\{\s+outline-offset: 1px;/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /\.led-pixel(?:\.selected)?:hover\s*\{[^}]*transform:\s*scale/);
});

test("Device and Updates views use available width without enlarging the LED preview", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  const monitorRule = css.match(/\.monitor\s*\{([^}]+)\}/)?.[1] || "";
  const narrowViewRule = css.match(/\.view-narrow\s*\{([^}]+)\}/)?.[1] || "";

  assert.match(narrowViewRule, /width:\s*100%;[^}]*max-width:\s*1120px/);
  assert.match(monitorRule, /width:\s*min\(100%,\s*calc\(\(100dvh - 330px\) \* var\(--monitor-aspect-ratio, 1\.7778\)\)\)/);
  assert.doesNotMatch(monitorRule, /780px/);
});

test("dropdowns and text fields use a single border for visible keyboard focus", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(css, /^:focus-visible\s*\{\s+outline: 1\.5px solid #fff;/m);
  assert.match(css, /select:focus-visible,\s+\.input:focus-visible\s*\{\s+outline: none;\s+border-color: var\(--line-focus\);/);
  assert.match(css, /\.release-position:focus\s*\{\s+border-color: var\(--text\);\s+outline: none;/);
});

test("Shift-click selects an inclusive LED range and selected focus keeps its selection mark", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const selection = fs.readFileSync(path.join(__dirname, "..", "led-selection.js"), "utf8");
  const bindEventsStart = app.indexOf("function bindLighting() {");
  const startScreenSyncStart = app.indexOf("function startScreenSync(");
  const bindEvents = app.slice(bindEventsStart, app.indexOf("function bindScenes()", bindEventsStart));
  const startScreenSync = app.slice(startScreenSyncStart, app.indexOf("async function runScreenSyncStart", startScreenSyncStart));

  assert.notEqual(bindEventsStart, -1);
  assert.notEqual(startScreenSyncStart, -1);
  assert.match(bindEvents, /#apply-gradient"\)\.addEventListener\("click", \(\) => void applyGradient\(\)\)/);
  assert.doesNotMatch(startScreenSync, /apply-gradient/);
  assert.match(app, /isLedSelected\(selectedLedIndices, index\)/);
  assert.match(app, /isEdgeSelected\(selectedLedIndices, indices\)/);
  assert.match(app, /fixedColorChanges\(/);
  assert.match(bindEvents, /#select-all"\)\.addEventListener\("click", \(\) => setSelection\(null\)\)/);
  assert.match(bindEvents, /#deselect-all"\)\.addEventListener\("click", \(\) => setSelection\(new Set\(\)\)\)/);
  assert.match(app, /function applyGradient\(\)[\s\S]*queueSettings\(changes, true\)/);
  assert.match(selection, /: \[\.\.\.selection\]/);
  assert.match(selection, /effect: "steady"/);
  assert.match(app, /event\.shiftKey && selectedLedAnchorIndex !== null/);
  assert.match(app, /selectLedRange\(selectedLedAnchorIndex, index\)/);
  assert.match(selection, /function selectLedRange\(anchorIndex, index\)/);
});

test("clicking the preview background or pressing Escape does not clear LED selection", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const selectStart = app.indexOf("function selectPreviewPosition(event) {");
  const selectEnd = app.indexOf("function setSelection(", selectStart);
  const bindStart = app.indexOf("function bindLighting() {");
  const bindEnd = app.indexOf("function bindScenes()", bindStart);
  const selectedLedIndices = new Set([2, 8]);
  const context = {
    selectedLedIndices,
    selectedLedAnchorIndex: 8,
    updatePreview() {
      assert.fail("A click outside an LED should not change the preview");
    }
  };
  const monitorKeydown = app.slice(
    app.indexOf('$("#monitor").addEventListener("keydown"', bindStart),
    app.indexOf('$("#select-all")', bindStart)
  );

  assert.notEqual(selectStart, -1);
  assert.notEqual(selectEnd, -1);
  assert.notEqual(bindStart, -1);
  vm.runInNewContext(
    `${app.slice(selectStart, selectEnd)}\nselectPreviewPosition({ target: { closest: () => null } });`,
    context
  );

  assert.equal(context.selectedLedIndices, selectedLedIndices);
  assert.match(monitorKeydown, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.doesNotMatch(monitorKeydown, /Escape|selectedLedIndices\s*=/);
});

test("Scenes save full lighting setups with explicit management actions", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");
  const sceneData = fs.readFileSync(path.join(__dirname, "..", "scene-data.js"), "utf8");

  assert.match(html, /id="save-scene"[^>]*>Save current setup/);
  assert.match(html, /id="import-scenes"[^>]*>Import/);
  assert.match(html, /id="export-scenes"[^>]*disabled/);
  assert.match(html, /Import adds scenes you don’t have yet without replacing any/);
  assert.match(html, /id="scene-form"/);
  assert.match(html, /id="delete-scene-dialog"/);
  assert.match(html, /id="palette-tuning"/);
  assert.match(html, /id="gradient-start"/);
  assert.match(html, /id="gradient-end"/);
  assert.match(html, /id="apply-gradient"/);
  assert.match(html, /id="deselect-all"[^>]*>Deselect all/);
  assert.match(html, /order you selected the LEDs/);
  assert.match(app, /sceneFromLighting\(/);
  assert.match(app, /function applyGradient\(\)/);
  assert.match(app, /gradientChanges\(/);
  assert.match(app, /function duplicateScene/);
  assert.match(app, /function applyScene/);
  assert.match(app, /settingsFromScene\(scene\)/);
  assert.match(main, /scenes: \[\]/);
  assert.match(main, /normalizeScenes\(input\.scenes\)/);
  assert.match(main, /ipcMain\.handle\("scenes:export"/);
  assert.match(main, /ipcMain\.handle\("scenes:import"/);
  assert.match(main, /size > 1024 \* 1024/);
  assert.match(preload, /exportScenes: \(\) => ipcRenderer\.invoke\("scenes:export"\)/);
  assert.match(preload, /importScenes: \(\) => ipcRenderer\.invoke\("scenes:import"\)/);
  assert.match(sceneData, /function createSceneBackup/);
  assert.match(sceneData, /function readSceneBackup/);
  assert.match(sceneData, /function mergeScenes/);
  assert.match(app, /async function exportScenes\(\)/);
  assert.match(app, /async function importScenes\(\)/);
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
  assert.match(main.slice(prepare, install), /void disconnectDevice\("", \{ scheduleScan: false \}\)/);
  assert.match(main.slice(install, updaterLaunch), /prepareForUpdate\(\)/);
  assert.doesNotMatch(main.slice(install, updaterLaunch), /await/);
});

test("restart status tells users ULLeds will reopen automatically", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  assert.match(app, /ULLeds will reopen automatically/);
  assert.match(app, /requestAnimationFrame\(\(\) => requestAnimationFrame\(resolve\)\)/);
});

test("saved mode is restored at Windows sign-in and sync modes resume automatically", () => {
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
  assert.match(main, /if \(!startHidden \|\| isSyncStartupMode\(settings\.startupMode\)\) createWindow\(\)/);
  assert.match(html, /id="start-with-windows"/);
  assert.doesNotMatch(html, /resume-screen-sync|Resume Screen Sync/);
  assert.match(html, /last color or effect, power state, Screen Sync, or Spotify Sync is restored automatically/);
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
  assert.doesNotMatch(
    app.slice(app.indexOf("async function runScreenSyncStart"), app.indexOf("function applyDeviceState")),
    /getDisplayMedia/
  );
  assert.match(app, /function maybeRestoreStartupMode\(\)/);
  assert.match(app, /if \(mode === "screen"\) void startScreenSync\(\{ automatic: true \}\);\s+else void startSpotifySync\(\{ automatic: true \}\)/);
  assert.doesNotMatch(app.slice(app.indexOf("async function start()"), app.indexOf("\nstart();")), /scanDevices\(/);
  assert.match(main, /if \(!startHidden \|\| isSyncStartupMode\(settings\.startupMode\)\) createWindow\(\)/);
});

test("saved sync modes preserve output during reconnect and fall back when resume fails", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(main, /function updateAnimation\(\{ waitForOutput = false \} = \{\}\)/);
  assert.match(main, /if \(!powerOff && \(screenSyncActive \|\| isSyncStartupMode\(settings\.startupMode\)\)\) return/);
  assert.match(main, /settings\.startupMode = "lighting";\s+saveSettings\(\);/);
  assert.match(main, /parseDeviceLedCount\(response, messageId\)/);
  assert.match(main, /response\[offset \+ 3\] !== messageId \|\| response\[offset \+ 4\] !== 130/);
  assert.match(app, /const startingScreen = lifecycle\.isStarting && sync\.requestedMode === "screen"/);
  assert.match(app, /resumingNow \? "Starting…"/);
  assert.match(app, /startingScreen \? "Starting display capture…"/);
  assert.match(app, /!sessionOwnsStream && \(hardwareSyncStarted \|\| automatic\) && !sync\.lifecycle\.isStopping/);
  assert.match(app, /const result = await window\.ull\.stopScreenSync\(\);\s+state\.settings\.startupMode = result\.startupMode;/);
  assert.match(app, /runSpotifySyncStart\(audioCapture, audioContext, audioReady, automatic\)/);
  assert.match(app, /\(hardwareSyncStarted \|\| automatic\) && !sync\.lifecycle\.isStopping\) \{\s+try \{\s+const result = await window\.ull\.stopScreenSync\(\);\s+state\.settings\.startupMode = result\.startupMode;/);
  assert.match(app, /sync\.autoAttempted = true;\s+updatePreview\(\);\s+if \(mode === "screen"\) void startScreenSync\(\{ automatic: true \}\);\s+else void startSpotifySync\(\{ automatic: true \}\)/);
});

test("sync mode is saved only while active and manual stop restores the lighting mode", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const start = app.slice(app.indexOf("async function runScreenSyncStart"), app.indexOf("function startPerformanceReporting"));
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.doesNotMatch(start, /updateSettings\(\{\s*resumeScreenSync:\s*true\s*\}\)/);
  assert.match(main, /settings\.startupMode = mode;\s+saveSettings\(\)/);
  assert.match(main, /ipcMain\.handle\("screen-sync:stop", async \(\) => \{\s+screenSyncActive = false;\s+settings\.startupMode = "lighting";\s+saveSettings\(\)/);
  assert.match(main, /if \(changes\.power === false\) settings\.startupMode = "lighting"/);
});

test("startup routes saved sync modes correctly and never resumes while powered off", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const start = app.indexOf("function maybeRestoreStartupMode()");
  const end = app.indexOf("\n/* --- Spotify Sync", start);
  let screenMode;
  let spotifyMode;
  const context = {
    window: { ullStartupMode: require("../startup-mode") },
    state: { settings: { startupMode: "lighting", power: true }, device: { connected: true } },
    sync: { autoAttempted: false },
    updatePreview() {},
    startScreenSync(options) { screenMode = options.automatic; },
    startSpotifySync(options) { spotifyMode = options.automatic; }
  };
  vm.runInNewContext(`${app.slice(start, end)}; globalThis.restore = maybeRestoreStartupMode;`, context);

  context.restore();
  assert.equal(screenMode, undefined);
  assert.equal(spotifyMode, undefined);

  context.state.settings.startupMode = "screen";
  context.sync.autoAttempted = false;
  context.restore();
  assert.equal(screenMode, true);

  context.state.settings.startupMode = "spotify";
  context.sync.autoAttempted = false;
  context.restore();
  assert.equal(spotifyMode, true);

  context.state.settings.startupMode = "screen";
  context.state.settings.power = false;
  context.sync.autoAttempted = false;
  context.restore();
  assert.equal(context.sync.autoAttempted, false);
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
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");
  const screenSync = fs.readFileSync(path.join(__dirname, "..", "screen-sync.js"), "utf8");

  assert.match(html, /id="sync-fps-range"[^>]*min="5" max="60"[^>]*value="30"/);
  assert.match(html, /id="sync-fps-number"[^>]*min="5" max="60"[^>]*value="30"/);
  assert.match(main, /syncFps: 30/);
  assert.match(main, /Screen Sync FPS must be an integer from 5 to 60/);
  assert.match(app, /createDesktopCaptureConstraints\(id, state\.settings\.syncFps\)/);
  assert.match(app, /window\.ullScreenSync\.isSampleFrameDue\(session\.lastSample, now, fps\)/);
  assert.match(app, /video\.requestVideoFrameCallback\(sampleFrame\)/);
  assert.match(app, /createLatestFrameSender\(\{/);
  assert.match(app, /performanceCallbackCount \+= 1/);
  assert.match(app, /recordScreenSyncPerformance\(\{/);
  assert.match(main, /ipcMain\.on\("screen-sync:performance"/);
  assert.match(preload, /recordScreenSyncPerformance: \(metrics\)/);
  assert.match(screenSync, /maxFrameRate,\s*maxWidth: MAX_CAPTURE_DIMENSION,\s*maxHeight: MAX_CAPTURE_DIMENSION/);
  assert.match(screenSync, /return lastSample === 0 \|\| now - lastSample >= 900 \/ fps/);
});

test("Screen Sync picture area is persisted and supports cinema widescreen sampling", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const screenSync = fs.readFileSync(path.join(__dirname, "..", "screen-sync.js"), "utf8");

  assert.match(html, /id="sync-content-mode"[\s\S]*value="display"[\s\S]*value="cinema235"/);
  assert.match(app, /syncContentMode: "display"/);
  assert.match(app, /bindSetting\("#sync-content-mode", "syncContentMode", \{ event: "change", immediate: true, read: \(el\) => el\.value \}\)/);
  assert.match(app, /state\.settings\.syncContentMode === "cinema235" \? 2\.35 : null/);
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
  const promptHtml = fs.readFileSync(path.join(uiDirectory, "movie-format-prompt.html"), "utf8");
  const promptCss = fs.readFileSync(path.join(uiDirectory, "movie-format-prompt.css"), "utf8");
  const promptApp = fs.readFileSync(path.join(uiDirectory, "movie-format-prompt.js"), "utf8");

  assert.match(html, /id="sync-auto-detect" type="checkbox"/);
  assert.doesNotMatch(html, /movie-detection|use-detected-format|keep-detecting/);
  assert.match(app, /syncAutoDetect: true/);
  assert.match(app, /detectLetterboxAspectRatio/);
  assert.match(app, /notifyMovieFormat\(stableRatio\)/);
  assert.match(app, /movieFormatPromptGate\.shouldPrompt\(stableRatio\)/);
  assert.match(app, /movieFormatPromptGate\.reset\(\)/);
  assert.match(app, /function applyDetectedMovieFormat/);
  assert.match(main, /width = 410;\s+const height = 92/);
  assert.match(main, /prompt\.setAlwaysOnTop\(true, "screen-saver"\)/);
  assert.match(main, /setVisibleOnAllWorkspaces\(true, \{ visibleOnFullScreen: true \}\)/);
  assert.match(main, /prompt\.showInactive\(\)/);
  assert.match(main, /setTimeout\(\(\) => \{\s+if \(pendingMovieFormat\?\.promptId === message\.promptId\) dismissMovieFormatPrompt\(\);\s+\}, 5000\)/);
  assert.match(main, /choice\.choice === "use"[\s\S]*screen-sync:movie-format-applied/);
  assert.doesNotMatch(main, /Notification\(/);
  assert.match(main, /!settings\.syncAutoDetect/);
  assert.match(app, /letterboxTracker\.isMissingStable\(\)[\s\S]*session\.detectedAspectRatio = null/);
  assert.match(promptHtml, /href="styles\.css"/);
  assert.match(promptHtml, /class="secondary-btn"/);
  assert.match(promptHtml, /class="primary-btn"/);
  assert.match(preload, /onMovieFormatPrompt/);
  assert.match(preload, /chooseMovieFormat/);
  assert.match(preload, /onMovieFormatApplied/);
  assert.match(preload, /notifyMovieFormat: \(aspectRatio\)/);
  assert.match(promptHtml, /id="use-format"/);
  assert.match(promptHtml, /id="keep-current"/);
  assert.match(promptCss, /background: #141415/);
  assert.doesNotMatch(promptCss, /border-left|#D71921|#E51B24/i);
  assert.match(promptCss, /border: 1px solid rgb\(255 255 255 \/ 0\.14\)/);
  assert.match(promptCss, /animation: expire 5s linear forwards/);
  assert.match(promptApp, /choose\("use"\)/);
  assert.match(promptApp, /choose\("keep"\)/);
  assert.match(screenSync, /function detectLetterboxAspectRatio/);
  assert.match(screenSync, /function createLetterboxStability/);
});

test("Updates checks GitHub Releases by default and retains local-folder updates", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8"));

  assert.match(html, /data-view="updates"/);
  assert.match(html, /id="update-source-github"[^>]*value="github"/);
  assert.match(html, /id="update-source-local"[^>]*value="local"/);
  assert.match(html, /Check for updates/);
  assert.match(html, /Checks the public ULLeds GitHub Releases/);
  assert.match(html, /Release notes/);
  assert.match(app, /updateSource: "github"/);
  assert.match(app, /window\.ull\.checkUpdates\(\)/);
  assert.match(main, /autoUpdater\.setFeedURL\(\{\s+provider: "github",\s+owner: "gingermat24",\s+repo: "ULLeds",\s+releaseType: "release"\s+\}\)/);
  assert.match(main, /autoUpdater\.setFeedURL\(\{ provider: "generic", url: updateServer\.url \}\)/);
  assert.match(main, /controller-write-diagnostics\.log/);
  assert.match(html, /controller-write-diagnostics\.log/);
  assert.match(main, /updateSource: "github"/);
  assert.equal(packageJson.build.publish.length, 1);
  assert.deepEqual(packageJson.build.publish[0], {
    provider: "github",
    owner: "gingermat24",
    repo: "ULLeds",
    releaseType: "release"
  });
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
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("the default lighting is green at 50% brightness and the app fills large windows", () => {
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
  assert.match(css, /\.app \{\s+display: flex;\s+flex-direction: column;[\s\S]*height: 100dvh;/);
  assert.match(css, /main \{\s+flex: 1;\s+min-height: 0;[\s\S]*overflow-y: auto;/);
});

test("full reset is confirmed, clears app and imported profile data, and preserves the installation", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");
  const resetData = fs.readFileSync(path.join(__dirname, "..", "reset-data.js"), "utf8");

  assert.match(html, /id="reset-all-data"/);
  assert.match(html, /id="reset-dialog"/);
  assert.match(html, /imported lighting profiles/);
  assert.doesNotMatch(html, /DX Light|DX-Light|QuikLight/);
  assert.match(html, /active compatible controller stays connected and selected/);
  assert.match(app, /window\.ull\.resetData\(\)/);
  assert.match(app, /queue\.changes = \{\}/);
  assert.match(app, /sync\.generation \+= 1/);
  assert.match(app, /generation !== sync\.generation/);
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
  assert.match(html, /Choose a connected controller and review its profile/);
  assert.match(main, /listSupportedControllers\(await listHidDevicesAsync\(\), profiles\)/);
});

test("the interface uses bundled Noto Sans typography and hides product branding", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.doesNotMatch(html, /class="brand"|brand-mark|brand-word/);
  assert.doesNotMatch(html.slice(html.indexOf('<header class="topbar">'), html.indexOf("</header>")), /ULLeds/);
  assert.match(css, /--font: "Noto Sans", "Segoe UI", system-ui, -apple-system, sans-serif;/);
  assert.doesNotMatch(css, /CormorantGaramond|Cormorant Garamond/);
  assert.match(css, /NotoSans\[wdth,wght\]\.ttf/);
  assert.equal(fs.existsSync(path.join(__dirname, "..", "assets", "fonts", "NotoSans-OFL.txt")), true);
  assert.match(css, /--mono: ui-monospace, "Cascadia Code", "SF Mono", Menlo, Consolas, monospace;/);
});

test("the frameless window draws its own controls and removes the native menu bar", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(main, /frame: false/);
  assert.doesNotMatch(main, /titleBarStyle|titleBarOverlay/);
  assert.match(main, /Menu\.setApplicationMenu\(null\)/);
  assert.doesNotMatch(main, /createApplicationMenu/);
  assert.match(main, /ipcMain\.handle\("window:minimize"/);
  assert.match(main, /ipcMain\.handle\("window:toggle-maximize"/);
  assert.match(main, /ipcMain\.handle\("window:close"/);
  assert.match(main, /mainWindow\.on\("maximize", \(\) => sendWindowState\(\)\)/);
  assert.match(main, /mainWindow\.on\("unmaximize", \(\) => sendWindowState\(\)\)/);
  assert.match(css, /\.topbar \{[^}]*[-]webkit-app-region: drag;/s);
  assert.match(css, /[-]webkit-app-region: no-drag/);
  assert.match(css, /body\.is-maximized \.window-btn \.glyph-max \{\s+display: none;/);
});

test("editing a connected strip profile updates the live connection profile and saved profile wins on reconnect", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.match(main, /if \(Object\.hasOwn\(changes, "deviceProfile"\) && connectedInfo\) \{\s+connectedInfo = \{\s+\.\.\.connectedInfo,\s+profile: settings\.deviceProfile\s+\?/);
  assert.match(main, /const savedProfile = settings\.devicePath === selected\.path && settings\.deviceProfile\?\.ledCount\s+\?\s+settings\.deviceProfile\s+:\s+selected\.profile\?\.ledCount/);
});

test("strip profile choices explain edge coverage and LED start direction", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const start = app.indexOf("const PROFILE_EDGE_LAYOUTS = [");
  const end = app.indexOf("\nfunction renderProfileDirectionChoices", start);
  const context = {};

  vm.runInNewContext(`${app.slice(start, end)}; globalThis.profileLabels = {
    edgeCoverageLabel,
    profileStartCorner,
    profileDirectionOptions
  };`, context);

  assert.equal(context.profileLabels.edgeCoverageLabel(1), "Top only");
  assert.equal(context.profileLabels.edgeCoverageLabel(2), "Top + left");
  assert.equal(context.profileLabels.edgeCoverageLabel(3), "Top, left + right");
  assert.equal(context.profileLabels.edgeCoverageLabel(4), "All four sides");
  assert.equal(context.profileLabels.profileStartCorner(1, 0), "top-left");
  assert.equal(context.profileLabels.profileStartCorner(3, 1), "bottom-right");
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.profileLabels.profileDirectionOptions(3))),
    [
      ["Starts at bottom-left", "Up left, across the top left to right, then down right."],
      ["Starts at bottom-right", "Up right, across the top right to left, then down left."]
    ]
  );
});

test("strip profile editing is a single-page save with color order under Advanced", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(html, /id="profile-title"/);
  assert.match(html, /id="profile-cancel"/);
  assert.match(html, /id="profile-save"/);
  assert.doesNotMatch(html, /wizard-back|wizard-next|class="steps"/);
  assert.match(app, /h\("legend", \{ text: "Which sides have LEDs\?" \}\)/);
  assert.match(app, /h\("legend", \{ text: "Where does LED 1 start\?" \}\)/);
  assert.match(app, /h\("summary", \{ text: "Color order \(advanced\)" \}\)/);
  assert.match(app, /if \(setupOnboarding\) changes\.onboarded = true/);
  assert.match(app, /await saveSettingsNow\(changes\);\s+\$\("#setup-dialog"\)\.close\(\)/);
  assert.doesNotMatch(app, /wizardStep|setWizardStep|advanceWizard/);
});

test("screen sync uses an updated strip layout immediately after profile edits", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(app, /const stripLayoutSignature = \(layout\) => JSON\.stringify\(\[layout\.ledCount, layout\.indices\]\)/);
  assert.match(app, /if \(sync\.session\.layoutSignature !== signature\) \{\s+sync\.session\.layout = layout;\s+sync\.session\.layoutSignature = signature;\s+sync\.session\.colors = null;/);
  assert.match(app, /sync\.session\.layout = layout/);
});

test("Screen Sync serializes its stop operation and permits canceling startup", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(html, /<script src="\.\.\/screen-sync-lifecycle\.js"><\/script>/);
  assert.match(app, /sync\.lifecycle\.start\(\(\) => runScreenSyncStart\(options\)\)/);
  assert.match(app, /sync\.lifecycle\.stop\(\(\) => \{/);
  assert.match(app, /lifecycle\.isStopping\s*\?\s*"Stopping…"/);
  assert.match(app, /Boolean\(sync\.session\) \|\| sync\.lifecycle\.isStarting/);
});

test("Screen Sync sends sampled screen colors without synthetic transition blending", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(app, /session\.colors = window\.ullScreenSync\.sampleStripColors\(/);
  assert.doesNotMatch(app, /blendColorArrays/);
});

test("startup UI appears before the controller scan completes", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const start = app.slice(app.indexOf("async function start()"), app.indexOf("\nstart();"));

  assert.ok(start.indexOf("state = await window.ull.initialState()") < start.indexOf("render();"));
  assert.ok(start.indexOf("render();") < start.indexOf("renderReleases();"));
  assert.ok(start.indexOf("renderReleases();") < start.indexOf("void loadReleaseDownloads();"));
  assert.ok(start.indexOf("void loadReleaseDownloads();") < start.indexOf("maybeRestoreStartupMode()"));
  assert.match(start, /maybeRestoreStartupMode\(\)/);
  assert.doesNotMatch(start, /scanDevices\(/);
  assert.match(fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8"), /void scanAndConnect\(\)\.catch/);
  assert.match(app, /if \(!state\.settings\.onboarded\) openSetup\(true\)/);
});

test("main-process controller discovery uses asynchronous HID enumeration", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.match(main, /devicesAsync: listHidDevicesAsync/);
  assert.match(main, /async function getDeviceList\(\) \{\s+const profiles = loadSavedProfiles\(app\.getPath\("appData"\)\);\s+return listSupportedControllers\(await listHidDevicesAsync\(\), profiles\);/);
  assert.match(main, /const devices = await getDeviceList\(\)/);
  assert.match(main, /if \(selected\) await connectDevice\(selected\.path, devices\)/);
  assert.doesNotMatch(main, /listHidDevices\(\)/);
});
