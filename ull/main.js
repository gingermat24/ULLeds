"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { performance } = require("node:perf_hooks");
const {
  app,
  BrowserWindow,
  desktopCapturer,
  dialog,
  ipcMain,
  Menu,
  nativeImage,
  screen,
  shell,
  Tray
} = require("electron");
const { autoUpdater } = require("electron-updater");
const { HIDAsync, devicesAsync: listHidDevicesAsync } = require("node-hid");
const {
  buildColorFrames,
  buildDeviceInfoRequest,
  buildHidReports,
  buildScreenSyncFrame,
  parseDeviceLedCount
} = require("./protocol");
const { createLocalUpdateServer } = require("./local-update-server");
const { loadSavedProfiles, resolveDeviceLedCount } = require("./device-profile");
const {
  listSupportedControllers,
  selectPreferredController,
  settingsAfterReset
} = require("./controller-catalog");
const { createHidOutputQueue } = require("./hid-output");
const { resetStoredData } = require("./reset-data");
const { createScreenSyncDiagnostics } = require("./screen-sync-diagnostics");
const { createControllerWriteDiagnostics } = require("./controller-write-diagnostics");
const { normalizeScenes } = require("./scene-data");
const { acquireSingleInstanceLock } = require("./single-instance");

const APP_ID = "com.gingermat.ulleds";
const DEFAULTS = Object.freeze({
  color: "#008100",
  brightness: 50,
  channelGains: [100, 100, 100],
  effect: "steady",
  speed: 48,
  palette: ["#e879a8", "#8d7cff", "#55c8d2"],
  ledColors: {},
  presets: [],
  scenes: [],
  deviceProfile: null,
  devicePath: "",
  power: true,
  onboarded: false,
  updateFolder: "",
  updateSource: "github",
  syncFps: 30,
  syncContentMode: "display",
  syncAutoDetect: true,
  startWithWindows: true,
  resumeScreenSync: false
});
const EFFECTS = new Set(["steady", "breathe", "spectrum", "palette"]);

app.setName("ULLeds");
app.setAppUserModelId(APP_ID);

let mainWindow;
let tray;
let isQuitting = false;
let hidDevice = null;
let deviceError = "";
let connectionPromise = null;
let settings = defaultSettings();
let connectedInfo = null;
let animationTimer = null;
let animationWriting = false;
let controllerWriteDiagnostics = null;
const hidOutputQueue = createHidOutputQueue((timing) => controllerWriteDiagnostics?.recordWrite(timing));
let watcherTimer = null;
let screenSyncActive = false;
let commandId = 1;
let updateServer = null;
let updateServerFolder = "";
let downloadedUpdateVersion = null;
let updateDownloadVersion = null;
let updateCheckPromise = null;
let resetPromise = null;
let screenSyncDiagnostics = null;
let pendingMovieFormat = null;
let movieFormatPromptWindow = null;
let movieFormatPromptTimer = null;
let movieFormatPromptSequence = 0;
const startHidden = process.platform === "win32" && process.argv.includes("--hidden");
const hasSingleInstanceLock = acquireSingleInstanceLock(app, showMainWindow);

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.disableDifferentialDownload = false;

function settingsFile() {
  return path.join(app.getPath("appData"), "ULLeds", "settings.json");
}

function defaultSettings() {
  return { ...DEFAULTS, palette: [...DEFAULTS.palette], ledColors: {}, presets: [] };
}

function readSpotifyArtwork() {
  if (process.platform !== "win32") {
    return Promise.reject(new Error("Spotify Sync is available on Windows only."));
  }
  const helperPath = app.isPackaged
    ? path.join(process.resourcesPath, "app.asar.unpacked", "ull", "spotify-media.exe")
    : path.join(__dirname, "spotify-media.exe");
  return new Promise((resolve, reject) => {
    execFile(helperPath, [], {
      windowsHide: true,
      timeout: 10000,
      maxBuffer: 3 * 1024 * 1024
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr.trim() || `Could not read Spotify cover art: ${error.message}`));
        return;
      }
      const output = stdout.trim();
      if (output === "NONE") {
        resolve(null);
        return;
      }
      const [contentType, data, ...extra] = output.split(/\r?\n/);
      if (!["image/jpeg", "image/png", "image/webp", "image/bmp"].includes(contentType) ||
          !data || extra.length > 0 || !/^[\da-z+/]+={0,2}$/i.test(data)) {
        reject(new Error("Windows returned invalid Spotify cover art."));
        return;
      }
      resolve({ contentType, data });
    });
  });
}

function configureLoginItem() {
  if (process.platform !== "win32" || !app.isPackaged) return;
  app.setLoginItemSettings({
    openAtLogin: settings.startWithWindows,
    args: ["--hidden"]
  });
}

function loadSettings() {
  const file = settingsFile();
  if (!fs.existsSync(file)) return;
  try {
    const stored = JSON.parse(fs.readFileSync(file, "utf8"));
    settings = { ...settings, ...validateSettings(stored) };
  } catch (error) {
    console.error("Could not load ULLeds settings:", error);
    dialog.showMessageBoxSync({
      type: "warning",
      title: "Settings could not be loaded",
      message: "ULLeds could not read its settings file.",
      detail: `${error.message}\n\nThe app will use default settings.`
    });
  }
}

function saveSettings() {
  fs.mkdirSync(path.dirname(settingsFile()), { recursive: true });
  fs.writeFileSync(settingsFile(), `${JSON.stringify(settings, null, 2)}\n`, "utf8");
}

function validColor(value) {
  return typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
}

function readControllerLedCount(device) {
  const messageId = commandId >= 255 ? 1 : commandId + 1;
  commandId = messageId;
  const request = buildHidReports(buildDeviceInfoRequest(messageId))[0];
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error, ledCount) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      device.removeListener("data", onData);
      device.removeListener("error", onError);
      if (error) reject(error);
      else resolve(ledCount);
    };
    const onData = (response) => {
      if (!Buffer.isBuffer(response)) return;
      const offset = response[0] === 0 && response[1] === 82 && response[2] === 66 ? 1 : 0;
      if (response[offset] !== 82 || response[offset + 1] !== 66 ||
          response[offset + 3] !== messageId || response[offset + 4] !== 130) return;
      try {
        finish(null, parseDeviceLedCount(response, messageId));
      } catch (error) {
        finish(error);
      }
    };
    const onError = (error) => finish(error);
    const timeout = setTimeout(() => {
      finish(new Error("The controller did not report its LED count."));
    }, 1200);
    device.on("data", onData);
    device.on("error", onError);
    try {
      device.write([...request]).catch((error) => finish(error));
    } catch (error) {
      finish(error);
    }
  });
}

function settingsSnapshot() {
  return {
    ...settings,
    palette: [...settings.palette],
    channelGains: [...settings.channelGains],
    ledColors: { ...settings.ledColors },
    presets: [...settings.presets],
    scenes: normalizeScenes(settings.scenes)
  };
}

function validateSettings(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Settings must be an object.");
  }
  const next = {};
  if ("color" in input) {
    if (!validColor(input.color)) throw new TypeError("Color must be a six-digit hex value.");
    next.color = input.color;
  }
  if ("brightness" in input) {
    const value = Number(input.brightness);
    if (!Number.isFinite(value)) throw new TypeError("Brightness must be a number.");
    next.brightness = Math.round(Math.max(0, Math.min(100, value)));
  }
  if ("channelGains" in input) {
    if (!Array.isArray(input.channelGains) || input.channelGains.length !== 3 ||
        input.channelGains.some((gain) => !Number.isInteger(gain) || gain < 50 || gain > 150)) {
      throw new RangeError("RGB channel gains must be integers from 50% to 150%.");
    }
    next.channelGains = [...input.channelGains];
  }
  if ("ledCount" in input) {
    const value = Number(input.ledCount);
    if (!Number.isInteger(value) || value < 1 || value > 253) {
      throw new RangeError("LED count must be between 1 and 253.");
    }
    next.ledCount = value;
  }
  if ("effect" in input) {
    if (!EFFECTS.has(input.effect)) throw new TypeError("Choose a supported lighting effect.");
    next.effect = input.effect;
  }
  if ("speed" in input) {
    const value = Number(input.speed);
    if (!Number.isFinite(value)) throw new TypeError("Effect speed must be a number.");
    next.speed = Math.round(Math.max(1, Math.min(100, value)));
  }
  if ("syncFps" in input) {
    const value = Number(input.syncFps);
    if (!Number.isInteger(value) || value < 5 || value > 60) {
      throw new RangeError("Screen Sync FPS must be an integer from 5 to 60.");
    }
    next.syncFps = value;
  }
  if ("syncContentMode" in input) {
    if (!["display", "cinema235"].includes(input.syncContentMode)) {
      throw new TypeError("Choose a supported Screen Sync picture area.");
    }
    next.syncContentMode = input.syncContentMode;
  }
  if ("palette" in input) {
    if (!Array.isArray(input.palette) || input.palette.length < 2 || input.palette.length > 8 ||
        !input.palette.every(validColor)) {
      throw new TypeError("A palette must contain 2 to 8 valid colors.");
    }
    next.palette = input.palette.slice();
  }
  if ("ledColors" in input) {
    if (!input.ledColors || typeof input.ledColors !== "object" || Array.isArray(input.ledColors)) {
      throw new TypeError("LED colors must be an object indexed by LED number.");
    }
    const entries = Object.entries(input.ledColors);
    if (entries.length > 253 || entries.some(([index, color]) =>
      !/^(?:0|[1-9]\d*)$/.test(index) || Number(index) > 252 || !validColor(color))) {
      throw new TypeError("Each individual LED color must have a valid LED index and hex value.");
    }
    next.ledColors = Object.fromEntries(entries);
  }
  if ("presets" in input) {
    if (!Array.isArray(input.presets) || input.presets.length > 30) {
      throw new TypeError("There can be at most 30 saved scenes.");
    }
    next.presets = input.presets.map((preset) => {
      if (!preset || typeof preset.name !== "string" || !preset.name.trim() ||
          preset.name.length > 36 || !validColor(preset.color)) {
        throw new TypeError("Each saved scene needs a name and a valid color.");
      }
      return { name: preset.name.trim(), color: preset.color };
    });
  }
  if ("scenes" in input) next.scenes = normalizeScenes(input.scenes);
  if ("deviceProfile" in input) {
    const profile = input.deviceProfile;
    if (profile === null) {
      next.deviceProfile = null;
    } else if (profile && typeof profile === "object" && !Array.isArray(profile)) {
      const ledCount = Number(profile.ledCount);
      const edgeCount = Number(profile.edgeCount);
      const installationMethod = profile.installationMethod == null ? 0 : Number(profile.installationMethod);
      const colorOrder = typeof profile.colorOrder === "string" ? profile.colorOrder.toUpperCase() : "";
      const positions = new Set(["top", "monitor-back", "monitor-front", "desk"]);
      const matchedBy = profile.matchedBy || "manual";
      if (!Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253 ||
          !Number.isInteger(edgeCount) || edgeCount < 1 || edgeCount > 4 ||
          !Number.isInteger(installationMethod) || installationMethod < 0 || installationMethod > 1 ||
          !/^[RGB]{3}$/.test(colorOrder) || new Set(colorOrder).size !== 3 ||
          !positions.has(profile.position) ||
          typeof profile.name !== "string" || !profile.name.trim() ||
          !["device path", "single connected controller", "manual"].includes(matchedBy) ||
          ("color" in profile && profile.color !== null && !validColor(profile.color))) {
        throw new TypeError("Device profile details are invalid.");
      }
      next.deviceProfile = {
        name: profile.name.trim().slice(0, 48),
        ledCount,
        edgeCount,
        installationMethod,
        colorOrder,
        position: profile.position,
        matchedBy,
        color: typeof profile.color === "string" && /^#[\da-f]{6}$/i.test(profile.color)
          ? profile.color.toLowerCase()
          : null
      };
    } else {
      throw new TypeError("Device profile must be an object or null.");
    }
  }
  if ("devicePath" in input) {
    if (typeof input.devicePath !== "string" || input.devicePath.length > 2048) {
      throw new TypeError("Selected controller path is invalid.");
    }
    next.devicePath = input.devicePath;
  }
  if ("power" in input) {
    if (typeof input.power !== "boolean") throw new TypeError("Power must be on or off.");
    next.power = input.power;
  }
  if ("onboarded" in input) {
    if (typeof input.onboarded !== "boolean") throw new TypeError("Setup state must be boolean.");
    next.onboarded = input.onboarded;
  }
  if ("updateFolder" in input) {
    if (typeof input.updateFolder !== "string" || input.updateFolder.length > 2048) {
      throw new TypeError("Update folder path is invalid.");
    }
    next.updateFolder = input.updateFolder;
  }
  if ("updateSource" in input) {
    if (!["github", "local"].includes(input.updateSource)) {
      throw new TypeError("Choose a supported update source.");
    }
    next.updateSource = input.updateSource;
  }
  for (const key of ["startWithWindows", "resumeScreenSync", "syncAutoDetect"]) {
    if (key in input) {
      if (typeof input[key] !== "boolean") throw new TypeError(`${key} must be a boolean.`);
      next[key] = input[key];
    }
  }
  return next;
}

async function getDeviceList() {
  const profiles = loadSavedProfiles(app.getPath("appData"));
  return listSupportedControllers(await listHidDevicesAsync(), profiles);
}

function hueColor(hue) {
  const h = ((hue % 360) + 360) % 360 / 60;
  const chroma = 1;
  const x = chroma * (1 - Math.abs((h % 2) - 1));
  const bands = [[1, x, 0], [x, 1, 0], [0, 1, x], [0, x, 1], [x, 0, 1], [1, 0, x]];
  const rgb = bands[Math.floor(h)];
  return `#${rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("")}`;
}

function animatedColor(now) {
  const seconds = (now / 1000) * (0.12 + settings.speed / 180);
  if (settings.effect === "breathe") {
    return {
      color: settings.color,
      brightness: 0.16 + (Math.sin(seconds * Math.PI * 2) + 1) * 0.42
    };
  }
  if (settings.effect === "spectrum") return { color: hueColor(seconds * 55), brightness: 1 };
  if (settings.effect === "palette") {
    const colors = settings.palette;
    const step = (seconds * 0.55) % colors.length;
    const index = Math.floor(step);
    const blend = step - index;
    const from = colors[index];
    const to = colors[(index + 1) % colors.length];
    const fromRgb = from.slice(1).match(/../g);
    const toRgb = to.slice(1).match(/../g);
    return { color: `#${fromRgb.map((part, channel) => {
      const a = parseInt(part, 16);
      const b = parseInt(toRgb[channel], 16);
      return Math.round(a + (b - a) * blend).toString(16).padStart(2, "0");
    }).join("")}`, brightness: 1 };
  }
  return { color: settings.color, brightness: 1 };
}

function writeColor(color, effectBrightness = 1) {
  if (!hidDevice) return;
  const profile = settings.deviceProfile;
  const ledCount = profile?.ledCount;
  if (!Number.isInteger(ledCount)) throw new Error("The controller's LED count has not been detected.");
  const colors = Array.from({ length: ledCount }, (_, index) =>
    settings.effect === "steady" && settings.ledColors[index]
      ? settings.ledColors[index]
      : color
  );
  return writeColors(colors, effectBrightness);
}

function enqueueHidReports(device, reports, command = "RB") {
  return hidOutputQueue.enqueue(device, reports, () => hidDevice === device, command);
}

async function writeColors(colors, effectBrightness = 1) {
  if (!hidDevice) return;
  const device = hidDevice;
  const profile = settings.deviceProfile;
  const ledCount = profile?.ledCount;
  if (!Number.isInteger(ledCount)) throw new Error("The controller's LED count has not been detected.");
  if (!Array.isArray(colors) || colors.length !== ledCount) {
    throw new RangeError(`Expected exactly ${ledCount} colors for the connected strip.`);
  }
  const firstMessageId = commandId >= 255 ? 1 : commandId + 1;
  const packets = buildColorFrames(
    colors,
    settings.brightness,
    settings.power,
    effectBrightness,
    profile?.colorOrder || "RGB",
    firstMessageId,
    settings.channelGains
  );
  commandId = ((firstMessageId - 1 + packets.length) % 255) + 1;
  const trace = screenSyncDiagnostics?.isActive;
  if (trace) screenSyncDiagnostics.recordHidWrite("RB", "queued");
  try {
    const result = await enqueueHidReports(device, packets.flatMap(buildHidReports));
    if (trace) screenSyncDiagnostics.recordHidWrite("RB", result.written ? "written" : "superseded");
  } catch (error) {
    if (trace) screenSyncDiagnostics.recordHidWrite("RB", "failed");
    throw error;
  }
}

async function writeScreenSyncColors(colors) {
  if (!hidDevice) return;
  const device = hidDevice;
  const profile = settings.deviceProfile;
  const ledCount = profile?.ledCount;
  if (!Number.isInteger(ledCount)) throw new Error("The controller's LED count has not been detected.");
  if (!Array.isArray(colors) || colors.length !== ledCount) {
    throw new RangeError(`Expected exactly ${ledCount} colors for the connected strip.`);
  }
  const messageId = commandId >= 255 ? 1 : commandId + 1;
  const packet = buildScreenSyncFrame(
    colors,
    settings.brightness,
    settings.power,
    profile?.colorOrder || "RGB",
    messageId,
    settings.channelGains
  );
  commandId = messageId;
  screenSyncDiagnostics?.recordHidWrite("SC", "queued");
  try {
    const result = await enqueueHidReports(device, buildHidReports(packet), "SC");
    screenSyncDiagnostics?.recordHidWrite("SC", result.written ? "written" : "superseded");
  } catch (error) {
    screenSyncDiagnostics?.recordHidWrite("SC", "failed");
    throw error;
  }
}

function updateAnimation({ preserveOutput = false, waitForOutput = false } = {}) {
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
  }
  // Powering off must always reach the controller, even while Screen Sync is
  // still winding down or an output restore is in progress. Otherwise the
  // lights can stay lit while the interface reports Off.
  const powerOff = !settings.power;
  if (!powerOff && (screenSyncActive || (preserveOutput && settings.resumeScreenSync))) return;
  if (!hidDevice || powerOff || settings.effect === "steady") {
    if (hidDevice) {
      const device = hidDevice;
      const output = writeColor(settings.color);
      if (waitForOutput) {
        return output.catch((error) => {
          console.error("LED color write failed:", error);
          if (hidDevice === device) disconnectDevice(error.message);
          throw error;
        });
      }
      output.catch((error) => {
        console.error("LED color write failed:", error);
        if (hidDevice === device) disconnectDevice(error.message);
      });
    }
    return;
  }
  const interval = Math.max(40, Math.round(170 - settings.speed * 1.25));
  animationTimer = setInterval(async () => {
    if (animationWriting || !hidDevice) return;
    animationWriting = true;
    const device = hidDevice;
    try {
      const frame = animatedColor(Date.now());
      await writeColor(frame.color, frame.brightness);
    } catch (error) {
      console.error("LED animation write failed:", error);
      if (hidDevice === device) disconnectDevice(error.message);
    } finally {
      animationWriting = false;
    }
  }, interval);
  animationTimer.unref();
}

function deviceState() {
  return connectedInfo
    ? {
      connected: true,
      name: connectedInfo.name,
      serialNumber: connectedInfo.serialNumber,
      profile: connectedInfo.profile,
      devicePath: connectedInfo.path,
      error: ""
    }
    : {
      connected: false,
      name: settings.deviceProfile?.name || "PC SYNC Backlight",
      serialNumber: "",
      profile: settings.deviceProfile,
      devicePath: settings.devicePath,
      error: deviceError
    };
}

function broadcastDeviceState(error = "") {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("device:status", { ...deviceState(), error });
  }
}

function disconnectDevice(error = "") {
  if (animationTimer) clearInterval(animationTimer);
  animationTimer = null;
  let closePromise = Promise.resolve();
  if (hidDevice) {
    closePromise = hidDevice.close().catch((closeError) => {
      console.error("Could not close the LED controller:", closeError);
    });
  }
  hidDevice = null;
  screenSyncActive = false;
  void screenSyncDiagnostics?.stop("controller-disconnected").catch((diagnosticError) => {
    console.error("Could not finalize Screen Sync diagnostics:", diagnosticError);
  });
  connectedInfo = null;
  deviceError = error;
  broadcastDeviceState(error);
  return closePromise;
}

function prepareForUpdate() {
  if (watcherTimer) clearInterval(watcherTimer);
  watcherTimer = null;
  if (animationTimer) clearInterval(animationTimer);
  animationTimer = null;
  screenSyncActive = false;

  void disconnectDevice();

  tray?.destroy();
  tray = null;
}

async function connectDevice(targetPath, knownDevices = null) {
  while (connectionPromise) await connectionPromise;
  if (hidDevice && connectedInfo?.path === targetPath) return deviceState();
  const pending = connectDeviceNow(targetPath, knownDevices).catch((error) => {
    console.error("Could not connect to the LED controller:", error);
    disconnectDevice(error.message);
    return { ...deviceState(), error: `Could not open the controller: ${error.message}` };
  });
  connectionPromise = pending;
  try {
    return await pending;
  } finally {
    if (connectionPromise === pending) connectionPromise = null;
  }
}

async function connectDeviceNow(targetPath, knownDevices) {
  const devices = knownDevices || await getDeviceList();
  const selected = devices.find((device) => device.path === targetPath);
  if (!selected) throw new Error("That LED controller is no longer available. Scan again.");
  await disconnectDevice();
  try {
    hidDevice = await HIDAsync.open(selected.path);
    hidDevice.on("error", (error) => disconnectDevice(error.message));
    const savedProfile = settings.devicePath === selected.path && settings.deviceProfile?.ledCount
      ? settings.deviceProfile
      : selected.profile?.ledCount
        ? selected.profile
        : devices.length === 1 && settings.deviceProfile?.ledCount
        ? settings.deviceProfile
        : null;
    let reportedLedCount;
    let ledCountError;
    try {
      reportedLedCount = await readControllerLedCount(hidDevice);
    } catch (error) {
      ledCountError = error;
    }
    const ledCountResult = resolveDeviceLedCount(reportedLedCount, savedProfile);
    if (!ledCountResult) {
      throw ledCountError || new Error("The controller returned an invalid LED count.");
    }
    if (ledCountResult.countSource === "saved profile") {
      console.warn(
        `The controller did not report its LED count (${ledCountError?.message || "invalid response"}); ` +
        `using the matching saved count of ${ledCountResult.ledCount}.`
      );
    }
    const { ledCount, countSource } = ledCountResult;
    const profile = {
      name: savedProfile?.name || selected.name || "PC SYNC Backlight",
      ledCount,
      edgeCount: savedProfile?.edgeCount || 3,
      installationMethod: savedProfile?.installationMethod ?? 0,
      colorOrder: savedProfile?.colorOrder || "RGB",
      position: savedProfile?.position || "monitor-back",
      matchedBy: savedProfile?.matchedBy || "manual",
      color: savedProfile?.color || null,
      countSource
    };
    connectedInfo = { ...selected, profile };
    settings.ledCount = ledCount;
    settings.deviceProfile = { ...profile };
    settings.devicePath = selected.path;
    settings.ledColors = Object.fromEntries(
      Object.entries(settings.ledColors).filter(([index]) => Number(index) < ledCount)
    );
    if (!settings.color && profile.color) settings.color = profile.color;
    saveSettings();
    deviceError = "";
    updateAnimation({ preserveOutput: settings.resumeScreenSync });
    broadcastDeviceState();
    return { ...deviceState(), error: "" };
  } catch (error) {
    disconnectDevice(error.message);
    return { ...deviceState(), error: `Could not open the controller: ${error.message}` };
  }
}

async function scanAndConnect() {
  if (connectionPromise) await connectionPromise;
  const devices = await getDeviceList();
  if (hidDevice && !devices.some((device) => device.path === connectedInfo?.path)) {
    await disconnectDevice("The selected controller is no longer available.");
  }
  if (!hidDevice && devices.length) {
    const selected = selectPreferredController(
      devices,
      settings.devicePath,
      connectedInfo?.path
    );
    if (selected) await connectDevice(selected.path, devices);
  }
  return {
    devices,
    ...deviceState()
  };
}

function setSettings(input, updateOutput = true) {
  if (input && Object.hasOwn(input, "ledCount")) {
    throw new TypeError("LED count is read from the controller and cannot be changed here.");
  }
  if (input?.deviceProfile && input.deviceProfile.ledCount !== settings.ledCount) {
    throw new TypeError("The controller's detected LED count cannot be changed in the strip profile.");
  }
  const changes = validateSettings(input);
  settings = { ...settings, ...changes };
  if (changes.syncAutoDetect === false) dismissMovieFormatPrompt();
  if (Object.hasOwn(changes, "deviceProfile") && connectedInfo) {
    connectedInfo = {
      ...connectedInfo,
      profile: settings.deviceProfile
        ? {
          ...settings.deviceProfile,
          countSource: connectedInfo.profile?.countSource || "controller"
        }
        : null
    };
  }
  const saveStartedAt = performance.now();
  saveSettings();
  controllerWriteDiagnostics?.recordSettingsSave(performance.now() - saveStartedAt);
  if (Object.hasOwn(changes, "startWithWindows")) configureLoginItem();
  if (updateOutput && hidDevice &&
      ["color", "brightness", "channelGains", "effect", "speed", "palette", "ledColors", "power"]
    .some((key) => Object.hasOwn(changes, key))) {
    updateAnimation();
  }
  return { settings: settingsSnapshot(), ...deviceState() };
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function dismissMovieFormatPrompt() {
  if (movieFormatPromptTimer) clearTimeout(movieFormatPromptTimer);
  movieFormatPromptTimer = null;
  pendingMovieFormat = null;
  const prompt = movieFormatPromptWindow;
  movieFormatPromptWindow = null;
  if (prompt && !prompt.isDestroyed()) prompt.close();
}

function showMovieFormatPrompt(message) {
  dismissMovieFormatPrompt();
  pendingMovieFormat = message;
  const { bounds } = screen.getPrimaryDisplay();
  const width = 410;
  const height = 92;
  const prompt = new BrowserWindow({
    x: Math.round(bounds.x + (bounds.width - width) / 2),
    y: bounds.y + 16,
    width,
    height,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    focusable: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  movieFormatPromptWindow = prompt;
  prompt.setAlwaysOnTop(true, "screen-saver");
  prompt.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  prompt.setMenuBarVisibility(false);
  prompt.on("closed", () => {
    if (movieFormatPromptWindow === prompt) {
      movieFormatPromptWindow = null;
      if (movieFormatPromptTimer) clearTimeout(movieFormatPromptTimer);
      movieFormatPromptTimer = null;
      pendingMovieFormat = null;
    }
  });
  prompt.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  prompt.once("ready-to-show", () => {
    if (pendingMovieFormat?.promptId !== message.promptId || prompt.isDestroyed()) return;
    prompt.webContents.send("movie-format:prompt", message);
    prompt.showInactive();
    movieFormatPromptTimer = setTimeout(() => {
      if (pendingMovieFormat?.promptId === message.promptId) dismissMovieFormatPrompt();
    }, 5000);
    movieFormatPromptTimer.unref();
  });
  prompt.loadFile(path.join(__dirname, "ui", "movie-format-prompt.html")).catch((error) => {
    console.error("Could not show the widescreen detection prompt:", error);
    if (movieFormatPromptWindow === prompt) dismissMovieFormatPrompt();
  });
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, "assets", "app.ico"))
    .resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip("ULLeds — screen sync stays active while hidden");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Show ULLeds", click: showMainWindow },
    { type: "separator" },
    {
      label: "Quit ULLeds",
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]));
  tray.on("click", showMainWindow);
  tray.on("double-click", showMainWindow);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 760,
    minWidth: 640,
    minHeight: 480,
    show: false,
    title: "ULLeds",
    icon: path.join(__dirname, "assets", "app.ico"),
    backgroundColor: "#0A0A0B",
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false
    }
  });
  mainWindow.once("ready-to-show", () => {
    if (!startHidden) mainWindow.show();
  });
  mainWindow.on("close", (event) => {
    if (isQuitting) return;
    event.preventDefault();
    mainWindow.hide();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
    screenSyncActive = false;
    updateAnimation();
  });
  mainWindow.on("maximize", () => sendWindowState());
  mainWindow.on("unmaximize", () => sendWindowState());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.session.setDisplayMediaRequestHandler(async (request, callback) => {
    if (!request.audioRequested || !request.videoRequested ||
        request.frame?.url !== mainWindow?.webContents.getURL()) {
      callback({});
      return;
    }
    try {
      const sources = await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width: 0, height: 0 }
      });
      const primaryDisplayId = String(screen.getPrimaryDisplay().id);
      const source = sources.find((candidate) => candidate.display_id === primaryDisplayId) || sources[0];
      if (!source) throw new Error("No display is available for desktop audio capture.");
      callback({ video: source, audio: "loopback" });
    } catch (error) {
      console.error("Could not provide Spotify desktop audio capture:", error);
      callback({});
    }
  });
  mainWindow.loadFile(path.join(__dirname, "ui", "index.html"));
}

function sendWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("window:maximized", mainWindow.isMaximized());
}

ipcMain.handle("window:minimize", () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.minimize();
});

ipcMain.handle("window:toggle-maximize", () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});

ipcMain.handle("window:close", () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.close();
});

ipcMain.handle("settings:reset", async () => {
  if (resetPromise) return resetPromise;
  resetPromise = (async () => {
    if (connectionPromise) await connectionPromise;
    screenSyncActive = false;

    if (updateServer) {
      await updateServer.close();
      updateServer = null;
      updateServerFolder = "";
    }

    const activeProfile = connectedInfo?.profile || settings.deviceProfile;
    const activePath = connectedInfo?.path || settings.devicePath;
    const removedLegacyProfiles = resetStoredData(app.getPath("appData"));
    settings = settingsAfterReset(defaultSettings(), activeProfile, activePath);
    deviceError = "";
    saveSettings();
    configureLoginItem();

    if (hidDevice) updateAnimation();
    const device = hidDevice ? deviceState() : await scanAndConnect();
    return {
      settings: settingsSnapshot(),
      device,
      removedLegacyProfiles
    };
  })();
  try {
    return await resetPromise;
  } finally {
    resetPromise = null;
  }
});
ipcMain.handle("app:initial-state", () => ({
  version: app.getVersion(),
  settings: settingsSnapshot(),
  device: deviceState()
}));
ipcMain.handle("settings:update", async (_event, input) => {
  const powerChanged = input && Object.hasOwn(input, "power");
  const result = setSettings(input, !powerChanged);
  if (powerChanged) await updateAnimation({ waitForOutput: true });
  return result;
});
ipcMain.on("settings:flush", (event, input) => {
  try {
    event.returnValue = { result: setSettings(input) };
  } catch (error) {
    event.returnValue = { error: error.message };
  }
});
ipcMain.handle("device:scan", () => scanAndConnect());
ipcMain.handle("device:connect", (_event, targetPath) => connectDevice(targetPath));
ipcMain.handle("device:disconnect", () => {
  disconnectDevice();
  return deviceState();
});
ipcMain.handle("screen-sync:start", (_event, mode = "screen") => {
  if (!["screen", "spotify"].includes(mode)) throw new TypeError("Screen Sync mode is invalid.");
  if (!hidDevice) throw new Error("Connect the LED controller before starting screen sync.");
  if (!settings.power) throw new Error("Turn the LEDs on before starting screen sync.");
  screenSyncDiagnostics.start({
    fps: settings.syncFps,
    ledCount: settings.deviceProfile.ledCount
  });
  dismissMovieFormatPrompt();
  screenSyncActive = true;
  updateAnimation();
  return { active: true };
});
ipcMain.handle("spotify-sync:artwork", () => readSpotifyArtwork());
ipcMain.handle("screen-sync:colors", (_event, colors) => {
  if (!screenSyncActive || !hidDevice || !settings.power) return { active: false };
  const ledCount = settings.deviceProfile?.ledCount;
  if (!Number.isInteger(ledCount)) throw new Error("The controller's LED count has not been detected.");
  if (!Array.isArray(colors) || colors.length !== ledCount || !colors.every(validColor)) {
    throw new TypeError(`Screen sync must provide one valid color for each of the ${ledCount} LEDs.`);
  }
  return writeScreenSyncColors(colors).then(() => ({ active: true }));
});
ipcMain.on("screen-sync:performance", (event, metrics) => {
  if (!mainWindow || event.sender !== mainWindow.webContents || !screenSyncActive) return;
  try {
    screenSyncDiagnostics.recordRendererPerformance(metrics);
  } catch (error) {
    console.error("Could not record Screen Sync performance metrics:", error);
  }
});
ipcMain.handle("screen-sync:stop", async () => {
  screenSyncActive = false;
  dismissMovieFormatPrompt();
  try {
    await updateAnimation({ waitForOutput: true });
  } finally {
    await screenSyncDiagnostics.stop("user");
  }
  return { active: false };
});
ipcMain.handle("screen-sync:source", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: 0, height: 0 }
  });
  const primaryDisplayId = String(screen.getPrimaryDisplay().id);
  const source = sources.find((candidate) => candidate.display_id === primaryDisplayId) || sources[0];
  if (!source) throw new Error("No display is available to sync.");
  return { id: source.id };
});
ipcMain.on("screen-sync:movie-detected", (event, aspectRatio) => {
  if (!mainWindow || mainWindow.isDestroyed() || event.sender !== mainWindow.webContents ||
      !screenSyncActive || !settings.syncAutoDetect ||
      !Number.isFinite(aspectRatio) || aspectRatio < 1.78 || aspectRatio > 2.6) {
    return;
  }
  const ratio = Math.round(aspectRatio * 100) / 100;
  const ratioLabel = `${ratio.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}:1`;
  const message = {
    promptId: String(++movieFormatPromptSequence),
    aspectRatio: ratio,
    title: "Widescreen picture detected",
    body: `Use the ${ratioLabel} picture area for Screen Sync?`
  };
  showMovieFormatPrompt(message);
});
ipcMain.on("movie-format:choose", (event, choice) => {
  const prompt = movieFormatPromptWindow;
  const message = pendingMovieFormat;
  if (!prompt || prompt.isDestroyed() || event.sender !== prompt.webContents ||
      !message || typeof choice?.promptId !== "string" ||
      choice.promptId !== message.promptId || !["use", "keep"].includes(choice.choice) ||
      !screenSyncActive || !settings.syncAutoDetect) {
    return;
  }
  if (choice.choice === "use" && mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("screen-sync:movie-format-applied", {
      aspectRatio: message.aspectRatio
    });
  }
  dismissMovieFormatPrompt();
});
ipcMain.handle("updates:choose-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Choose a local ULLeds update folder",
    properties: ["openDirectory"]
  });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  if (updateServer) {
    await updateServer.close();
    updateServer = null;
    updateServerFolder = "";
  }
  setSettings({ updateFolder: result.filePaths[0], updateSource: "local" });
  return { canceled: false, folder: settings.updateFolder };
});
ipcMain.handle("updates:check", async () => {
  if (!app.isPackaged) {
    return { available: false, error: "Updates are available from the installed app." };
  }
  if (settings.updateSource === "local" && !settings.updateFolder) {
    return { available: false, error: "Choose the folder containing the ULLeds update first." };
  }
  if (downloadedUpdateVersion) {
    return { available: true, downloaded: true, version: downloadedUpdateVersion };
  }
  if (updateDownloadVersion) {
    return { available: true, downloading: true, version: updateDownloadVersion };
  }
  if (updateCheckPromise) return updateCheckPromise;

  updateCheckPromise = (async () => {
    try {
      if (settings.updateSource === "local") {
        if (!updateServer || updateServerFolder !== settings.updateFolder) {
          if (updateServer) await updateServer.close();
          updateServer = await createLocalUpdateServer(settings.updateFolder);
          updateServerFolder = settings.updateFolder;
        }
        autoUpdater.setFeedURL({ provider: "generic", url: updateServer.url });
      } else {
        autoUpdater.setFeedURL({
          provider: "github",
          owner: "gingermat24",
          repo: "ULLeds",
          releaseType: "release"
        });
      }
      const result = await autoUpdater.checkForUpdates();
      if (!result) return { available: false, error: "The update service did not return a result." };
      if (!result.isUpdateAvailable) {
        return { available: false, upToDate: true, version: app.getVersion() };
      }
      updateDownloadVersion = result.updateInfo.version;
      result.downloadPromise?.catch((error) => console.error("ULLeds update download failed:", error));
      return { available: true, downloading: true, version: updateDownloadVersion };
    } catch (error) {
      return { available: false, error: `Could not check or download the update: ${error.message}` };
    }
  })();
  try {
    return await updateCheckPromise;
  } finally {
    updateCheckPromise = null;
  }
});
ipcMain.handle("updates:install", () => {
  if (!downloadedUpdateVersion) {
    return { installing: false, error: "The update has not finished downloading yet." };
  }
  const version = downloadedUpdateVersion;
  isQuitting = true;
  prepareForUpdate();
  autoUpdater.quitAndInstall(true, true);
  return { installing: true, version };
});

autoUpdater.on("download-progress", (progress) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updates:progress", {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total
    });
  }
});
autoUpdater.on("update-downloaded", (update) => {
  downloadedUpdateVersion = update.version;
  updateDownloadVersion = null;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updates:downloaded", { version: update.version });
  }
});
autoUpdater.on("error", (error) => {
  updateDownloadVersion = null;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updates:error", { message: error.message });
  }
});

app.whenReady().then(async () => {
  if (!hasSingleInstanceLock) return;
  controllerWriteDiagnostics = createControllerWriteDiagnostics(
    path.join(app.getPath("appData"), "ULLeds", "controller-write-diagnostics.log")
  );
  try {
    controllerWriteDiagnostics.start();
  } catch (error) {
    controllerWriteDiagnostics = null;
    console.error("Could not start controller timing diagnostics:", error);
  }
  screenSyncDiagnostics = createScreenSyncDiagnostics(
    path.join(app.getPath("appData"), "ULLeds", "screen-sync-diagnostics.log")
  );
  loadSettings();
  configureLoginItem();
  Menu.setApplicationMenu(null);
  createTray();
  createWindow();
  void scanAndConnect().catch((error) => {
    console.error("Could not scan for the LED controller:", error);
    deviceError = error.message;
    broadcastDeviceState(error.message);
  });
  watcherTimer = setInterval(async () => {
    try {
      if (!hidDevice) {
        await scanAndConnect();
      }
    } catch (error) {
      console.error("Could not scan for the LED controller:", error);
      deviceError = error.message;
      broadcastDeviceState(error.message);
    }
  }, 5000);
  watcherTimer.unref();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch((error) => {
  console.error("ULLeds failed to start:", error);
  dialog.showErrorBox("ULLeds could not start", error.message);
  app.quit();
});

app.on("before-quit", () => {
  isQuitting = true;
  dismissMovieFormatPrompt();
  void controllerWriteDiagnostics?.stop().catch((error) => {
    console.error("Could not finalize controller timing diagnostics:", error);
  });
  if (watcherTimer) clearInterval(watcherTimer);
  screenSyncActive = false;
  disconnectDevice();
  if (updateServer) {
    updateServer.close().catch((error) => console.error("Could not stop the local update server:", error));
    updateServer = null;
  }
  tray?.destroy();
  tray = null;
});
