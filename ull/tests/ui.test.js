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

test("Device and Updates views use available width up to a readable maximum", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  const views = [...html.matchAll(/<section\b[^>]*class="([^"]*)"[^>]*id="view-(light|scenes|settings|updates)"/g)];

  assert.equal(views.length, 4);
  assert.ok(views.every(([, classes]) => classes.split(/\s+/).includes("view")));
  assert.match(css, /\.view \{ width: 100%; max-width: 100rem; margin-inline: 0; \}/);
  assert.match(css, /main \{[^}]*padding: var\(--sp-2\) var\(--gutter\) var\(--gutter\);/s);
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
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");

  assert.match(html, /id="version-notice"[^>]*role="status"/);
  assert.match(html, /id="version-notice-update"[^>]*>Update</);
  assert.match(html, /github-releases\.js/);
  assert.match(app, /listReleaseDownloads\(\)/);
  assert.match(app, /listReleaseHistory\(\)/);
  assert.match(app, /listArchivedReleaseHistory\(\)/);
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
  assert.match(preload, /listArchivedReleaseHistory: \(\) => ipcRenderer\.invoke\("updates:archived-release-history"\)/);
  assert.match(preload, /installRelease: \(version\) => ipcRenderer\.invoke\("updates:install-release", version\)/);
  assert.match(main, /handleMainWindow\("updates:release-downloads"/);
  assert.match(main, /handleMainWindow\("updates:release-history"/);
  assert.match(main, /handleMainWindow\("updates:archived-release-history"/);
  assert.match(main, /raw\.githubusercontent\.com\/gingermat24\/ULLeds\/dev\/docs\/release-history\.json/);
  assert.match(main, /fetchInstallersFromReleasePages/);
  assert.match(main, /using public release pages/);
  assert.match(main, /getReleaseTagsFromHtml/);
  assert.match(main, /getReleaseInstallerFromHtml/);
  assert.match(main, /handleMainWindow\("updates:install-release"/);
  assert.match(main, /autoUpdater\.setFeedURL\(\{\s+provider: "generic",\s+url: new URL\("\.", installer\.url\)\.href\s+\}\)/);
  assert.match(main, /autoUpdater\.allowDowngrade = versionComparison < 0/);
  assert.match(main, /result\.updateInfo\.version !== version/);
  assert.doesNotMatch(main, /updates:download-release|shell\.openExternal\(installer\.url\)/);
  assert.match(css, /\.update-banner \{[^}]*margin: 0 var\(--gutter\) var\(--sp-3\);/s);
  assert.match(app, /versionNoticeTimer = setTimeout\(dismissVersionNotice, VERSION_NOTICE_MS\)/);
  assert.match(css, /animation: drain 8s linear forwards/);
});

test("Spotify Sync combines local cover art with live desktop audio analysis", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");
  const helper = fs.readFileSync(path.join(__dirname, "..", "spotify-media.cs"), "utf8");

  assert.match(html, /Spotify Sync/);
  assert.match(html, /id="spotify-sync-toggle"/);
  assert.match(html, /row-inline spotify-sync-row/);
  assert.match(html, /id="spotify-track-title"/);
  assert.match(html, /id="spotify-track-artist"/);
  assert.match(html, /id="spotify-details" data-expanded="false" aria-hidden="true" inert/);
  assert.match(html, /id="spotify-meter"/);
  assert.match(html, /id="spotify-sensitivity" type="range" min="0" max="100" value="100"/);
  assert.match(html, /id="spotify-sensitivity-value" for="spotify-sensitivity">100%/);
  assert.match(html, /Desktop audio is analyzed on this PC and never recorded or uploaded/);
  assert.match(app, /details\.dataset\.expanded = String\(spotifyExpanded\)/);
  assert.match(app, /details\.inert = !spotifyExpanded/);
  assert.match(app, /spotifyActive \|\| spotifyStarting/);
  assert.match(app, /Syncing to the current track/);
  assert.match(css, /\.spotify-details \{[^}]*grid-template-rows: 0fr;[^}]*transition:[\s\S]*var\(--ease\)/);
  assert.match(css, /\.spotify-details\[data-expanded="true"\] \{[^}]*grid-template-rows: 1fr;/);
  assert.match(css, /\.spotify-group \{ min-width: 0; \}/);
  assert.match(css, /\.spotify-meter span \{[^}]*border-radius: calc\(var\(--r-sm\) \/ 2\);/);
  assert.match(app, /0\.06 \+ level \* 0\.94/);
  assert.match(app, /window\.ull\.getSpotifyArtwork\(\)/);
  assert.match(app, /createSpotifySyncColors\([\s\S]*\n\s+5\s*\)/);
  assert.match(app, /window\.ull\.screenSyncSource\(\)\.then\(\(\{ id \}\) =>\s+navigator\.mediaDevices\.getUserMedia\(/);
  assert.match(app, /createDesktopAudioCaptureConstraints\(id\)/);
  assert.match(app, /new AudioContext\(\)/);
  assert.match(app, /analyser\.getFloatFrequencyData/);
  assert.match(app, /analyzeSpotifySpectrum/);
  assert.match(app, /createSpotifyReactiveColors/);
  assert.match(app, /renderSpotifyMeter\(session\)/);
  assert.match(app, /smoothSpotifyLevels\(\s+session\.audioLevels,\s+measuredLevels,\s+elapsedMs\s+\)/);
  assert.match(app, /Number\(state\.settings\.spotifySensitivity \?\? 100\)/);
  assert.match(app, /queueSettings\(\{ spotifySensitivity: Number\(event\.target\.value\) \}, true\)/);
  assert.match(app, /artwork\.title, artwork\.artist, artwork\.album, artwork\.contentType, artwork\.playbackStatus, artwork\.data/);
  assert.match(app, /if \(!artwork\) \{\s+if \(session\.hasMedia\)/);
  assert.match(app, /session\.hasMedia = true/);
  assert.match(app, /Waiting for a Spotify track/);
  assert.match(app, /if \(sync\.session\?\.mode === mode\)/);
  assert.match(app, /await stopScreenSync\(\);\s+if \(!sync\.session && !sync\.lifecycle\.isStopping\) start\(\)/);
  assert.match(app, /session\.audioFrame = requestAnimationFrame/);
  assert.match(app, /window\.ull\.getSpotifyArtwork\(\),\s+audioCapture,\s+audioReady/);
  assert.match(app, /artworkIdentity !== session\.artworkIdentity/);
  assert.match(app, /matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.match(app, /window\.ull\.startScreenSync\("spotify"\)/);
  assert.match(main, /handleMainWindow\("spotify-sync:artwork", \(\) => readSpotifyArtwork\(\)\)/);
  assert.match(main, /settings\.startupMode = mode;\s+saveSettings\(\)/);
  assert.match(main, /execFile\(helperPath/);
  assert.match(main, /spotify-media\.exe/);
  assert.match(main, /spotifySensitivity: 100/);
  assert.match(main, /stored\.spotifySensitivity === 65/);
  assert.match(main, /Spotify response must be an integer from 0 to 100/);
  assert.match(main, /parseSpotifyArtworkOutput\(stdout\)/);
  assert.match(helper, /properties\.Title/);
  assert.match(helper, /properties\.Artist/);
  assert.match(helper, /properties\.AlbumTitle/);
  assert.match(helper, /EscapeJson/);
  assert.match(helper, /Console\.OutputEncoding = new UTF8Encoding\(false\)/);
  assert.match(helper, /buffer\.Length > 2 \* 1024 \* 1024/);
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

test("the interface uses consistent neutral dark and light color systems", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  for (const source of [html, app, css]) {
    assert.doesNotMatch(source, /data-glass|liquid-glass-toggle|glass-clarity|LIQUID_GLASS|--glass-/);
  }
  assert.match(html, /<html lang="en">/);
  assert.doesNotMatch(html, /class="brand"|brand-mark|brand-word/);
  assert.match(css, /--text: #f3f3f4/i);
  assert.match(css, /--bg: #0b0b0c/i);
  assert.match(css, /--surface: #141416/i);
  assert.match(css, /--accent: #f3f3f4/i);
  assert.match(css, /@media \(prefers-color-scheme: light\)/);
  const nonMonochrome = [...css.matchAll(/#([0-9a-f]{6})\b/gi)]
    .map(([, color]) => color.toLowerCase())
    .filter((color) => !["e5484d", "ff8f86", "c43a2f"].includes(color) &&
      Math.max(parseInt(color.slice(0, 2), 16), parseInt(color.slice(2, 4), 16), parseInt(color.slice(4, 6), 16)) -
      Math.min(parseInt(color.slice(0, 2), 16), parseInt(color.slice(2, 4), 16), parseInt(color.slice(4, 6), 16)) > 10);
  assert.deepEqual(nonMonochrome, [], "UI colors should be monochrome apart from semantic errors");
  assert.doesNotMatch(css, /backdrop-filter/);
  assert.doesNotMatch(css, /#(?:D71921|E51B24|FF0000)\b/i);
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
  assert.match(main, /handleMainWindow\("settings:update", async \(_event, input\) => \{\s+const powerChanged = input && Object\.hasOwn\(input, "power"\);\s+const result = setSettings\(input, !powerChanged\);\s+if \(powerChanged\) await updateAnimation\(\{ waitForOutput: true \}\);/);
  assert.match(main, /const powerOff = !settings\.power;\s+if \(!powerOff && \(screenSyncActive \|\| isSyncStartupMode\(settings\.startupMode\)\)\) return;/);
  assert.match(main, /if \(!hidDevice \|\| powerOff \|\| settings\.effect === "steady"\) \{/);
  assert.match(main, /if \(!hidDevice \|\| powerOff \|\| settings\.effect === "steady"\) \{[\s\S]*?if \(hidDevice\) \{[\s\S]*?writeColor\(settings\.color\)[\s\S]*?return;\s+\}/);
  const animation = main.slice(main.indexOf("function updateAnimation"), main.indexOf("function deviceState"));
  assert.match(animation, /settings\.effect === "steady"[\s\S]*?return;\s+\}\s+const interval/);
  assert.match(main, /handleMainWindow\("screen-sync:colors", \(_event, colors\) => \{\s+if \(!screenSyncActive \|\| !hidDevice \|\| !settings\.power\) return \{ active: false \};/);
  assert.match(main, /handleMainWindow\("screen-sync:stop", async \(\) => \{\s+screenSyncActive = false;\s+settings\.startupMode = "lighting";\s+saveSettings\(\);\s+dismissMovieFormatPrompt\(\);\s+try \{\s+await updateAnimation\(\{ waitForOutput: true \}\);\s+\} finally \{\s+await screenSyncDiagnostics\.stop\("user"\);/);
  assert.match(main, /function updateAnimation\(\{ waitForOutput = false \}/);
});

test("Windows session shutdown powers off connected LEDs without changing saved power", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const shutdownPower = fs.readFileSync(path.join(__dirname, "..", "shutdown-power.js"), "utf8");

  const queryEnd = main.slice(
    main.indexOf('window.on("query-session-end"'),
    main.indexOf('window.on("close"', main.indexOf('window.on("query-session-end"'))
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

test("topbar omits the wordmark and adapts navigation to the window", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");

  assert.match(css, /\.topbar \{[^}]*display: flex;[^}]*align-items: center;[^}]*min-height: var\(--bar\);/s);
  assert.doesNotMatch(html.slice(html.indexOf('<header class="topbar">'), html.indexOf("</header>")), /ULLeds/);
  assert.match(css, /\.tabs \{[^}]*display: flex;/s);
  assert.match(css, /\.tab\.active \{ background: var\(--surface-3\); color: var\(--text\); \}/);
  assert.match(css, /\.topbar :is\(button, \.tabs, \.status, \.window-controls\) \{\s+-webkit-app-region: no-drag;/);
  assert.match(css, /\.status \{[^}]*display: flex;[^}]*margin-left: auto;/s);
  assert.doesNotMatch(css.match(/\.status \{([^}]*)\}/s)?.[1] || "", /background|border:/);
  assert.match(css, /\.status-dot \{ flex: none; width: 0\.5rem; height: 0\.5rem;/);
  assert.match(css, /\.status\.connected \.status-dot \{\s+background: var\(--text\);\s+\}/);
  assert.match(css, /\.window-controls \{ display: flex; align-self: stretch; flex: none; \}/);
  assert.match(css, /\.window-btn \{[^}]*background: transparent;/s);
  assert.match(css, /\.status-label \{\s+overflow: hidden;\s+text-overflow: ellipsis;\s+white-space: nowrap;/);
  assert.match(css, /main \{\s+flex: 1;\s+min-height: 0;[\s\S]*overflow-y: auto;/);
  assert.match(css, /\.app \{\s+display: flex;\s+flex-direction: column;[\s\S]*height: 100dvh;/);
  assert.match(css, /--gutter: clamp\(1rem, 2\.5vw, 2\.5rem\)/);
  assert.match(css, /\.topbar \{[^}]*padding: var\(--sp-2\) 0 var\(--sp-2\) var\(--gutter\);/s);
  assert.match(css, /@media \(max-width: 40rem\) \{\s+\.tab \{ padding: 0 var\(--sp-3\); \}\s+\.status-label \{ display: none; \}/);
  assert.match(main, /backgroundColor: "#0B0B0B",\s+frame: false,/);
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

test("tab content aligns with the topbar gutter and its spacing is balanced", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(css, /\.topbar \{[^}]*padding:\s*var\(--sp-2\) 0 var\(--sp-2\) var\(--gutter\);/s);
  assert.match(css, /\.tabs \{[^}]*display:\s*flex;/s);
  assert.match(css, /\.tab \{[^}]*padding:\s*0 var\(--sp-3\);/s);
  assert.match(css, /\.view \{[^}]*margin-inline:\s*0;/s);
  assert.match(css, /main \{[^}]*padding:\s*var\(--sp-2\) var\(--gutter\) var\(--gutter\);/s);
});

test("lighting layout adapts to the window and the monitor preview matches the display ratio", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const controls = css.match(/\.controls\s*\{([^}]*)\}/)?.[1] || "";

  assert.match(css, /\.lighting \{ display: grid; grid-template-columns: minmax\(0, 1fr\); gap: var\(--sp-4\); \}/);
  assert.match(controls, /align-content: start;/);
  assert.match(css, /\.preview \{[^}]*height: clamp\(22rem, 62cqh, 36rem\);/s);
  assert.match(css, /\.monitor \{[^}]*aspect-ratio: var\(--monitor-aspect-ratio, 16 \/ 9\);/s);
  assert.match(css, /\.monitor \{[^}]*width: min\(100cqw, calc\(100cqh \* var\(--monitor-aspect-ratio, 1\.7778\)\)\);/s);
  assert.match(css, /@container \(min-width: 56rem\) \{\s+\.lighting \{ grid-template-columns: minmax\(0, 1fr\) clamp\(19rem, 28cqw, 28rem\);/);
  assert.match(app, /function updateMonitorAspectRatio\(\) \{\s+const \{ width, height \} = window\.screen;\s+if \(!Number\.isFinite\(width\) \|\| !Number\.isFinite\(height\) \|\| width <= 0 \|\| height <= 0\) return;\s+document\.documentElement\.style\.setProperty\("--monitor-aspect-ratio", String\(width \/ height\)\);/);
  assert.match(app, /updateMonitorAspectRatio\(\);\s+window\.addEventListener\("resize", updateMonitorAspectRatio\);/);
});

test("lighting spacing and control sizes stay consistent while resizing the window", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(css, /--gutter:\s*clamp\(1rem,\s*2\.5vw,\s*2\.5rem\);/);
  assert.match(css, /--ctl:\s*2\.5rem;/);
  assert.match(css, /--ctl-sm:\s*2rem;/);
  assert.match(css, /--r:\s*0\.75rem;/);
  assert.match(css, /--fs-md:\s*0\.9375rem;/);
  assert.match(css, /--sp-1:\s*0\.25rem;/);
  assert.match(css, /--sp-2:\s*0\.5rem;/);
  assert.match(css, /--sp-3:\s*0\.75rem;/);
  assert.match(css, /--sp-4:\s*1rem;/);
  assert.match(css, /--sp-5:\s*1\.5rem;/);
  assert.match(css, /--sp-6:\s*2rem;/);
  assert.match(css, /\.card, \.panel \{[^}]*background: var\(--surface\);/s);
  assert.match(css, /h2\s*\{[^}]*font-size:\s*var\(--fs-xl\);/s);
  assert.match(css, /\.lighting\s*\{[^}]*gap:\s*var\(--sp-4\);/s);
  assert.match(css, /@container \(min-width: 56rem\)/);
  assert.match(css, /font-family:\s*"Noto Sans"/);
  assert.doesNotMatch(css, /Cormorant/);
  assert.match(css, /@media \(max-width: 40rem\)/);
  assert.match(css, /container-type: size/);
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
  assert.match(css, /\.switch::after \{[^}]*top: 0\.1875rem;[^}]*left: 0\.1875rem;/s);
  assert.match(css, /\.switch:is\(:checked, \[aria-checked="true"\]\)::after \{[^}]*transform: translateX\(1\.25rem\);/s);
  assert.match(css, /\.switch \{[\s\S]*border-radius: var\(--r-full\);/);
});

test("Device settings are grouped by controller, sync, startup, and reset", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  const sectionOrder = [
    "group-controller",
    "group-sync",
    "group-startup",
    "group-support",
    "group-reset"
  ].map((id) => html.indexOf(`id="${id}"`));

  assert.ok(sectionOrder.every((index) => index >= 0));
  assert.deepEqual(sectionOrder, [...sectionOrder].sort((a, b) => a - b));
  assert.match(html, /aria-labelledby="group-controller"[\s\S]*id="controller-select"/);
  assert.match(html, /aria-labelledby="group-sync"[\s\S]*id="sync-fps-range"/);
  assert.match(html, /aria-labelledby="group-startup"[\s\S]*id="start-with-windows"/);
  assert.match(html, /aria-labelledby="group-support"[\s\S]*id="open-support"/);
  assert.match(html, /aria-labelledby="group-reset"[\s\S]*id="reset-all-data"/);
  assert.match(css, /\.groups \{[^}]*display: grid;[^}]*gap: var\(--sp-4\);/s);
});

test("support request requires user details and explicit opt-in before opening a public GitHub draft", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");
  const supportBundle = fs.readFileSync(path.join(__dirname, "..", "support-bundle.js"), "utf8");

  assert.match(html, /id="support-problem"[^>]*maxlength="5000"[^>]*required/);
  assert.match(html, /id="support-screen-sync" type="checkbox"/);
  assert.match(html, /id="support-controller-timing" type="checkbox"/);
  assert.match(html, /id="support-preview"[^>]*hidden/);
  assert.match(html, /diagnostic logs are not put in the draft URL/);
  assert.match(html, /saved as a local JSON file\. You can review and attach that file yourself in GitHub/);
  assert.match(html, /id="support-attachment" hidden/);
  assert.match(app, /problem: \$\("#support-problem"\)\.value/);
  assert.match(app, /screenSync: \$\("#support-screen-sync"\)\.checked/);
  assert.match(app, /controllerTiming: \$\("#support-controller-timing"\)\.checked/);
  assert.match(app, /Your changes were not sent/);
  assert.match(preload, /previewSupportIssue: \(input\) => ipcRenderer\.invoke\("support:preview", input\)/);
  assert.match(preload, /openGithubSupportIssue: \(previewId\) => ipcRenderer\.invoke\("support:open-github", previewId\)/);
  assert.match(preload, /discardSupportIssue: \(previewId\) => ipcRenderer\.invoke\("support:discard", previewId\)/);
  assert.match(main, /event\.senderFrame !== event\.sender\.mainFrame/);
  assert.match(main, /screen-sync-diagnostics\.log/);
  assert.match(main, /controller-write-diagnostics\.log/);
  assert.match(main, /shell\.openExternal\(createGithubIssueUrl\(preparedSupportIssue\)\)/);
  assert.match(main, /showSaveDialog\(mainWindow,[\s\S]*Save optional diagnostics to attach to your GitHub issue/);
  assert.match(main, /fs\.promises\.writeFile\(result\.filePath, preparedSupportIssue\.attachmentContent, "utf8"\)/);
  assert.match(main, /createGithubIssueUrl\(report\)/);
  assert.match(main, /osVersion: os\.release\(\)/);
  assert.doesNotMatch(main, /app\.getSystemVersion/);
  assert.match(supportBundle, /MAX_DIAGNOSTIC_BYTES = 8 \* 1024/);
  assert.match(supportBundle, /Object\.keys\(options\)\.some/);
  assert.match(supportBundle, /https:\/\/github\.com\/gingermat24\/ULLeds\/issues\/new/);
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
  assert.match(html, /<button[^>]*id="release-newer"[^>]*aria-label="Newer release"[^>]*>[\s\S]*?<svg/);
  assert.match(html, /<button[^>]*id="release-older"[^>]*aria-label="Older release"[^>]*>[\s\S]*?<svg/);
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
  assert.match(css, /\.release-nav\[hidden\], \.release-nav \[hidden\], \.release\[hidden\] \{\s*display: none;/);
  assert.match(css, /\.release-position \{[^}]*width: 3\.25rem;[^}]*background: var\(--surface-2\);[^}]*text-align: center;/s);
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

test("release carousel merges published notes with archived notes without bundling history", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.doesNotMatch(html, /changelog-data|Built-in changelog/);
  assert.match(html, /id="release-navigation"[^>]*hidden/);
  assert.match(html, /id="release-status"[^>]*role="status"[^>]*aria-live="polite">Loading release notes from GitHub/);
  assert.match(app, /window\.ullGithubReleases\.mergeReleaseHistory/);
  assert.match(app, /releases\.archived \?\? \[\]/);
  assert.doesNotMatch(app, /loadBuiltinChangelog|releases\.builtin/);
  assert.match(app, /Offline\. Changelog can't load\./);
  assert.match(app, /Could not load the changelog from GitHub\. Check your connection and try again\./);
  assert.match(app, /No release notes are available on GitHub\./);
});

test("LED preview scales with its card and selected LEDs stay within their grid cells", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(css, /\.preview-stage \{[^}]*container-type: size;/s);
  assert.match(css, /--rail: clamp\(0\.4rem, 1\.1vw, 0\.8rem\)/);
  assert.match(css, /\.led-edge \{[^}]*display: grid;[^}]*gap: min\(0\.375rem, var\(--pixel-gap, 25%\)\);/s);
  assert.match(css, /\.led-top, \.led-bottom \{[^}]*grid-auto-columns: minmax\(0, 1fr\);/s);
  assert.match(css, /\.led-left, \.led-right \{[^}]*grid-auto-rows: minmax\(0, 1fr\);/s);
  assert.match(css, /\.led-pixel \{[^}]*border-radius: calc\(var\(--r-sm\) \/ 2\);/s);
  assert.match(css, /\.led-pixel\.selected \{[^}]*box-shadow: 0 0 0 0\.125rem var\(--text\);/s);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /\.led-pixel(?:\.selected)?:hover\s*\{[^}]*transform:\s*scale/);
  assert.match(app, /const pixelGap = `\$\{25 \/ Math\.max\(indices\.length, 1\)\}%`/);
  assert.match(app, /container\.style\.setProperty\("--pixel-gap", pixelGap\)/);
});

test("Device and Updates views use available width without enlarging the LED preview", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  const monitorRule = css.match(/\.monitor \{([^}]+)\}/)?.[1] || "";
  const viewRule = css.match(/\.view \{([^}]+)\}/)?.[1] || "";

  assert.match(viewRule, /max-width: 100rem/);
  assert.match(viewRule, /margin-inline: 0/);
  assert.match(monitorRule, /width: min\(100cqw, calc\(100cqh \* var\(--monitor-aspect-ratio, 1\.7778\)\)\)/);
  assert.doesNotMatch(monitorRule, /780px/);
});

test("dropdowns and text fields use a single border for visible keyboard focus", () => {
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(css, /^:focus-visible\s*\{\s+outline: 2px solid color-mix\(in srgb, var\(--text\) 60%, transparent\);/m);
  assert.doesNotMatch(css, /select:focus-visible,\s+\.input:focus-visible\s*\{\s+outline: none/);
  assert.match(css, /\.release-position \{[^}]*background: var\(--surface-2\);/s);
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
  assert.match(html, /Import adds new scenes without replacing existing ones\./);
  assert.match(html, /id="scene-form"/);
  assert.match(html, /id="delete-scene-dialog"/);
  assert.match(html, /id="palette-tuning"/);
  assert.match(html, /id="gradient-start"/);
  assert.match(html, /id="gradient-end"/);
  assert.match(html, /id="apply-gradient"/);
  assert.match(html, /id="deselect-all"[^>]*>Deselect all/);
  assert.match(html, /Blend two colors across the selected LEDs/);
  assert.match(app, /sceneFromLighting\(/);
  assert.match(app, /function applyGradient\(\)/);
  assert.match(app, /gradientChanges\(/);
  assert.match(app, /function duplicateScene/);
  assert.match(app, /function applyScene/);
  assert.match(app, /settingsFromScene\(scene\)/);
  assert.match(main, /scenes: \[\]/);
  assert.match(main, /normalizeScenes\(input\.scenes\)/);
  assert.match(main, /handleMainWindow\("scenes:export"/);
  assert.match(main, /handleMainWindow\("scenes:import"/);
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
  const install = main.indexOf('handleMainWindow("updates:install"');
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
  assert.match(main, /createTray\(\);\s+createWindow\(\{ loadUI: !startHidden \|\| isSyncStartupMode\(settings\.startupMode\) \}\);/);
  assert.doesNotMatch(main.slice(main.indexOf("app.whenReady()"), main.indexOf("}).catch((error) => {", main.indexOf("app.whenReady()"))), /if \(!startHidden/);
  assert.match(html, /id="start-with-windows"/);
  assert.doesNotMatch(html, /resume-screen-sync|Resume Screen Sync/);
  assert.match(html, /ULLeds restores your previous mode when it starts\./);
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
  assert.match(main, /createTray\(\);\s+createWindow\(\{ loadUI: !startHidden \|\| isSyncStartupMode\(settings\.startupMode\) \}\);/);
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

test("hidden Windows startup keeps a window alive for session-end LED shutdown", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const startup = main.slice(main.indexOf("app.whenReady()"), main.indexOf("}).catch((error) => {", main.indexOf("app.whenReady()")));
  const createWindow = main.slice(main.indexOf("function createWindow"), main.indexOf('mainWindow.on("close"'));

  assert.match(startup, /createTray\(\);\s+createWindow\(\{ loadUI: !startHidden \|\| isSyncStartupMode\(settings\.startupMode\) \}\);/);
  assert.match(createWindow, /show: false/);
  assert.match(createWindow, /window\.on\("query-session-end"/);
  assert.match(createWindow, /if \(loadUI\) loadMainWindowPage\(\)/);
  assert.match(createWindow, /showMainWindowWhenReady\) window\.show\(\)/);
  assert.match(main, /if \(!mainWindowPageLoaded\) \{\s+showMainWindowWhenReady = true;\s+loadMainWindowPage\?\.\(\)/);
  assert.match(main, /const startHidden = process\.platform === "win32" && process\.argv\.includes\("--hidden"\)/);
});

test("sync mode is saved only while active and manual stop restores the lighting mode", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const start = app.slice(app.indexOf("async function runScreenSyncStart"), app.indexOf("function startPerformanceReporting"));
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.doesNotMatch(start, /updateSettings\(\{\s*resumeScreenSync:\s*true\s*\}\)/);
  assert.match(main, /settings\.startupMode = mode;\s+saveSettings\(\)/);
  assert.match(main, /handleMainWindow\("screen-sync:stop", async \(\) => \{\s+screenSyncActive = false;\s+settings\.startupMode = "lighting";\s+saveSettings\(\)/);
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
  assert.match(main, /onMainWindow\("screen-sync:performance"/);
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
  assert.match(promptHtml, /class="btn btn-sm" type="button">Keep current/);
  assert.match(promptHtml, /class="btn btn-primary btn-sm" type="button">Use detected/);
  assert.match(preload, /onMovieFormatPrompt/);
  assert.match(preload, /chooseMovieFormat/);
  assert.match(preload, /onMovieFormatApplied/);
  assert.match(preload, /notifyMovieFormat: \(aspectRatio\)/);
  assert.match(promptHtml, /id="use-format"/);
  assert.match(promptHtml, /id="keep-current"/);
  assert.match(promptCss, /--surface: #141416/);
  assert.doesNotMatch(promptCss, /border-left|#D71921|#E51B24/i);
  assert.match(promptCss, /background: var\(--surface\)/);
  assert.match(promptCss, /animation: expire 5s linear forwards/);
  assert.match(promptApp, /choose\("use"\)/);
  assert.match(promptApp, /choose\("keep"\)/);
  assert.match(screenSync, /function detectLetterboxAspectRatio/);
  assert.match(screenSync, /function createLetterboxStability/);
});

test("Updates use GitHub Releases only and local-folder updates are disabled", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const preload = fs.readFileSync(path.join(__dirname, "..", "preload.js"), "utf8");
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8"));

  assert.match(html, /data-view="updates"/);
  assert.doesNotMatch(html, /update-source-local|choose-update-folder|local-update-controls/);
  assert.match(html, /Local-folder updates are disabled until installers can be authenticated/);
  assert.match(html, /Check for updates/);
  assert.match(html, /Checks public ULLeds GitHub Releases/);
  assert.match(html, /Release notes/);
  assert.match(app, /window\.ull\.checkUpdates\(\)/);
  assert.match(main, /autoUpdater\.setFeedURL\(\{\s+provider: "github",\s+owner: "gingermat24",\s+repo: "ULLeds",\s+releaseType: "release"\s+\}\)/);
  assert.doesNotMatch(main, /createLocalUpdateServer|updateServer|updates:choose-folder/);
  assert.match(main, /delete stored\.updateFolder;\s+delete stored\.updateSource;/);
  assert.match(main, /Local-folder updates are disabled until installers can be authenticated/);
  assert.doesNotMatch(preload, /chooseUpdateFolder|onUpdateFolderRequest/);
  assert.match(main, /controller-write-diagnostics\.log/);
  assert.doesNotMatch(html, /controller-write-diagnostics\.log/);
  assert.equal(packageJson.build.publish.length, 1);
  assert.deepEqual(packageJson.build.publish[0], {
    provider: "github",
    owner: "gingermat24",
    repo: "ULLeds",
    releaseType: "release"
  });
});

test("local renderer pages enforce CSP, navigation, and main-frame IPC boundaries", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const prompt = fs.readFileSync(path.join(uiDirectory, "movie-format-prompt.html"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.match(html, /http-equiv="Content-Security-Policy"[^>]*default-src 'none'/);
  assert.match(prompt, /http-equiv="Content-Security-Policy"[^>]*default-src 'none'/);
  assert.match(main, /function restrictWindowNavigation\(window, pagePath\)/);
  assert.match(main, /window\.webContents\.on\("will-navigate"/);
  assert.match(main, /window\.webContents\.on\("will-redirect"/);
  assert.match(main, /window\.webContents\.setWindowOpenHandler\(\(\) => \(\{ action: "deny" \}\)\)/);
  assert.match(main, /function isTrustedMainFrame\(event\)/);
  assert.match(main, /function handleMainWindow\(channel, handler\)/);
  assert.equal((main.match(/ipcMain\.handle\(/g) || []).length, 1);
  assert.match(main, /event\.senderFrame !== event\.sender\.mainFrame/);
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
  assert.match(css, /@container \(min-width: 56rem\)/);
  assert.match(css, /@media \(max-width: 40rem\)/);
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
  assert.match(html, /preferences and imported profiles/);
  assert.doesNotMatch(html, /DX Light|DX-Light|QuikLight/);
  assert.match(html, /The active controller stays connected/);
  assert.match(app, /window\.ull\.resetData\(\)/);
  assert.match(app, /queue\.changes = \{\}/);
  assert.match(app, /sync\.generation \+= 1/);
  assert.match(app, /generation !== sync\.generation/);
  assert.match(preload, /resetData: \(\) => ipcRenderer\.invoke\("settings:reset"\)/);
  assert.match(main, /handleMainWindow\("settings:reset"/);
  assert.match(main, /settings = settingsAfterReset\(defaultSettings\(\), activeProfile, activePath\)/);
  const resetHandler = main.slice(main.indexOf('handleMainWindow("settings:reset"'), main.indexOf('handleMainWindow("app:initial-state"'));
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

test("the interface uses bundled Noto Sans typography without a header wordmark", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.doesNotMatch(html, /class="brand"|brand-mark|brand-word/);
  assert.doesNotMatch(html.slice(html.indexOf('<header class="topbar">'), html.indexOf("</header>")), /ULLeds/);
  assert.match(css, /--font: "Noto Sans", "Segoe UI", system-ui, sans-serif;/);
  assert.doesNotMatch(css, /CormorantGaramond|Cormorant Garamond/);
  assert.match(css, /NotoSans\[wdth,wght\]\.ttf/);
  assert.equal(fs.existsSync(path.join(__dirname, "..", "assets", "fonts", "NotoSans-OFL.txt")), true);
  assert.match(css, /--font: "Noto Sans", "Segoe UI", system-ui, sans-serif;/);
});

test("the frameless window draws its own controls and removes the native menu bar", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");

  assert.match(main, /frame: false/);
  assert.doesNotMatch(main, /titleBarStyle|titleBarOverlay/);
  assert.match(main, /Menu\.setApplicationMenu\(null\)/);
  assert.doesNotMatch(main, /createApplicationMenu/);
  assert.match(main, /handleMainWindow\("window:minimize"/);
  assert.match(main, /handleMainWindow\("window:toggle-maximize"/);
  assert.match(main, /handleMainWindow\("window:close"/);
  assert.match(main, /window\.on\("maximize", \(\) => sendWindowState\(\)\)/);
  assert.match(main, /window\.on\("unmaximize", \(\) => sendWindowState\(\)\)/);
  assert.match(css, /\.topbar \{[^}]*[-]webkit-app-region: drag;/s);
  assert.match(css, /[-]webkit-app-region: no-drag/);
  assert.match(css, /body\.is-maximized \.window-btn \.glyph-max \{\s+display: none;/);
});

test("editing a connected strip profile updates the live connection profile and saved profile wins on reconnect", () => {
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.match(main, /if \(Object\.hasOwn\(changes, "deviceProfile"\) && connectedInfo\) \{\s+connectedInfo = \{\s+\.\.\.connectedInfo,\s+profile: settings\.deviceProfile\s+\?/);
  assert.match(main, /const savedProfile = settings\.devicePath === selected\.path && settings\.deviceProfile\?\.ledCount\s+\?\s+settings\.deviceProfile\s+:\s+selected\.profile\?\.ledCount/);
});

test("strip layout normalizes legacy edge counts and supports every directly selected side", () => {
  const { normalizeActiveEdges } = require("../strip-layout");
  assert.deepEqual(normalizeActiveEdges(2), ["top", "left"]);
  assert.deepEqual(normalizeActiveEdges(["top", "bottom"]), ["top", "bottom"]);
  assert.deepEqual(normalizeActiveEdges(["top", "right", "bottom", "left"]), [
    "top", "right", "bottom", "left"
  ]);
  assert.equal(normalizeActiveEdges(["top", "unknown"]), null);
});

test("strip profile editor selects individual edges and supports estimated or manual counts", () => {
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const main = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");

  assert.match(app, /const PROFILE_EDGES = \["top", "right", "bottom", "left"\]/);
  assert.match(app, /activeEdges: profileActiveEdges\(current\)/);
  assert.match(app, /"auto", "Estimate automatically"/);
  assert.match(app, /"manual", "Enter counts manually"/);
  assert.match(app, /The controller reports the total only/);
  assert.match(app, /document\.createElementNS\("http:\/\/www\.w3\.org\/2000\/svg", tag\)/);
  assert.match(app, /return svg\("svg", \{ class: "profile-diagram"/);
  assert.match(app, /top: \[18, 8, 54, 8\],\s+right: \[60, 14, 60, 34\],\s+bottom: \[54, 40, 18, 40\],\s+left: \[12, 34, 12, 14\]/);
  assert.match(app, /profileDraft\.allocationMode === "auto" \? "~" : ""/);
  assert.match(app, /text: active\s+\? `\$\{profileDraft\.allocationMode === "auto" \? "~" : ""\}\$\{count\}`\s+: "Off"/);
  assert.doesNotMatch(app, /`\$\{profileDraft\.allocationMode === "auto" \? "~" : ""\}\$\{count\} LEDs`/);
  assert.match(app, /edgeCounts: allocationMode === "manual" \? layout\.counts : null/);
  assert.doesNotMatch(app, /PROFILE_EDGE_LAYOUTS/);
  assert.match(app, /id: "profile-edge-picker"/);
  assert.match(app, /id: "profile-manual-counts"/);
  assert.match(main, /normalizeActiveEdges\(edgeSelection\)/);
  assert.match(main, /Object\.values\(edgeCounts\)\.reduce\(\(sum, count\) => sum \+ count, 0\) === ledCount/);
});

test("strip profile editing keeps optional counts and color order out of the main flow", () => {
  const html = fs.readFileSync(path.join(uiDirectory, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(uiDirectory, "app.js"), "utf8");

  assert.match(html, /id="profile-title"/);
  assert.match(html, /id="profile-cancel"/);
  assert.match(html, /id="profile-save"/);
  assert.doesNotMatch(html, /wizard-back|wizard-next|class="steps"/);
  assert.match(app, /h\("legend", \{ text: "Choose your monitor edges" \}\)/);
  assert.match(app, /h\("div", \{ class: "profile-direction-row", role: "group", "aria-label": "LED 1 starts from" \}/);
  assert.match(app, /h\("summary", \{ text: "Advanced" \}\)/);
  assert.match(app, /id: "profile-advanced-details"/);
  assert.match(app, /if \(mode === "manual"\) \$\("#profile-advanced-details"\)\.open = true/);
  assert.match(app, /h\("h3", \{ text: "LED counts" \}\)/);
  assert.match(app, /h\("h3", \{ text: "Color order" \}\)/);
  assert.doesNotMatch(app, /id: "profile-allocation-details"|h\("summary", \{ text: "Color order" \}\)/);
  assert.match(app, /profileDraft\.installationMethod/);
  assert.match(app, /if \(setupOnboarding\) changes\.onboarded = true/);
  assert.match(app, /await saveSettingsNow\(changes\);\s+\$\("#setup-dialog"\)\.close\(\)/);
  assert.doesNotMatch(app, /wizardStep|setWizardStep|advanceWizard/);

  const css = fs.readFileSync(path.join(uiDirectory, "styles.css"), "utf8");
  assert.match(css, /\.profile-edge-picker \{[^}]*grid-template-areas: "\. top \." "left monitor right" "\. bottom \.";[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);[^}]*width: min\(100%, 21rem\);/s);
  assert.match(css, /\.profile-edge-option \{[^}]*min-height: 3\.25rem;/s);
  assert.match(css, /\.profile-diagram \{[^}]*width: min\(4\.5rem, 100%\);/s);
  assert.match(css, /\.profile-advanced-content \{[^}]*display: grid;/s);
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
