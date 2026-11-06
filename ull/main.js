"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
  app,
  BrowserWindow,
  desktopCapturer,
  dialog,
  ipcMain,
  Menu,
  nativeImage,
  screen,
  session,
  shell,
  Tray
} = require("electron");
const { autoUpdater } = require("electron-updater");
const { HIDAsync, devices: listHidDevices } = require("node-hid");
const {
  buildColorFrames,
  buildDeviceInfoRequest,
  buildHidReports,
  buildScreenSyncFrame,
  isSupportedController,
  parseDeviceLedCount
} = require("./protocol");
const { createLocalUpdateServer } = require("./local-update-server");
const { loadSavedProfiles, profileForDevice } = require("./device-profile");
const { createHidOutputQueue } = require("./hid-output");

const APP_ID = "com.gingermat.ulleds";
const DEFAULTS = Object.freeze({
  color: "#e879a8",
  brightness: 72,
  effect: "steady",
  speed: 48,
  palette: ["#e879a8", "#8d7cff", "#55c8d2"],
  ledColors: {},
  presets: [],
  deviceProfile: null,
  power: true,
  onboarded: false,
  updateFolder: ""
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
let settings = { ...DEFAULTS, palette: [...DEFAULTS.palette], ledColors: {}, presets: [] };
let connectedInfo = null;
let animationTimer = null;
let animationWriting = false;
const hidOutputQueue = createHidOutputQueue();
let watcherTimer = null;
let screenSyncActive = false;
let commandId = 1;
let updateServer = null;
let updateServerFolder = "";
let downloadedUpdateVersion = null;
let updateDownloadVersion = null;
let updateCheckPromise = null;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.disableDifferentialDownload = false;

function settingsFile() {
  return path.join(app.getPath("appData"), "ULLeds", "settings.json");
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
      if (response.length < 5 || response[3] !== messageId || response[4] !== 130) return;
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
    ledColors: { ...settings.ledColors },
    presets: [...settings.presets]
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
  return next;
}

function getDeviceList() {
  const supported = listHidDevices().filter((device) => isSupportedController(device) && device.path);
  const profiles = loadSavedProfiles(app.getPath("appData"));
  return supported.map((device) => ({
      path: device.path,
      name: typeof device.product === "string" && device.product !== "USBHID"
        ? device.product
        : "PC SYNC Backlight",
      serialNumber: device.serialNumber || "",
      profile: profileForDevice(device, supported, profiles)
    }));
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

function enqueueHidReports(device, reports) {
  return hidOutputQueue.enqueue(device, reports, () => hidDevice === device);
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
    firstMessageId
  );
  commandId = ((firstMessageId - 1 + packets.length) % 255) + 1;
  await enqueueHidReports(device, packets.flatMap(buildHidReports));
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
    messageId
  );
  commandId = messageId;
  await enqueueHidReports(device, buildHidReports(packet));
}

function updateAnimation() {
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
  }
  if (screenSyncActive) return;
  if (!hidDevice || !settings.power || settings.effect === "steady") {
    if (hidDevice) {
      const device = hidDevice;
      writeColor(settings.color).catch((error) => {
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
      error: ""
    }
    : {
      connected: false,
      name: settings.deviceProfile?.name || "PC SYNC Backlight",
      serialNumber: "",
      profile: settings.deviceProfile,
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

async function connectDevice(targetPath) {
  if (connectionPromise) return connectionPromise;
  const pending = connectDeviceNow(targetPath).catch((error) => {
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

async function connectDeviceNow(targetPath) {
  const selected = getDeviceList().find((device) => device.path === targetPath);
  if (!selected) throw new Error("That LED controller is no longer available. Scan again.");
  await disconnectDevice();
  try {
    hidDevice = await HIDAsync.open(selected.path);
    hidDevice.on("error", (error) => disconnectDevice(error.message));
    const savedProfile = selected.profile?.ledCount
      ? selected.profile
      : settings.deviceProfile?.ledCount
        ? settings.deviceProfile
        : null;
    const ledCount = await readControllerLedCount(hidDevice);
    const profile = {
      name: savedProfile?.name || selected.name || "PC SYNC Backlight",
      ledCount,
      edgeCount: savedProfile?.edgeCount || 3,
      installationMethod: savedProfile?.installationMethod ?? 0,
      colorOrder: savedProfile?.colorOrder || "RGB",
      position: savedProfile?.position || "monitor-back",
      matchedBy: savedProfile?.matchedBy || "manual",
      color: savedProfile?.color || null,
      countSource: "controller"
    };
    connectedInfo = { ...selected, profile };
    settings.ledCount = ledCount;
    settings.deviceProfile = { ...profile };
    settings.ledColors = Object.fromEntries(
      Object.entries(settings.ledColors).filter(([index]) => Number(index) < ledCount)
    );
    if (!settings.color && profile.color) settings.color = profile.color;
    saveSettings();
    deviceError = "";
    updateAnimation();
    broadcastDeviceState();
    return { ...deviceState(), error: "" };
  } catch (error) {
    disconnectDevice(error.message);
    return { ...deviceState(), error: `Could not open the controller: ${error.message}` };
  }
}

async function scanAndConnect() {
  const devices = getDeviceList();
  if (connectionPromise) await connectionPromise;
  else if (!hidDevice && devices.length) await connectDevice(devices[0].path);
  return {
    devices: devices.map(({ name, serialNumber, profile }) => ({ name, serialNumber, profile })),
    ...deviceState()
  };
}

function setSettings(input) {
  if (input && Object.hasOwn(input, "ledCount")) {
    throw new TypeError("LED count is read from the controller and cannot be changed here.");
  }
  if (input?.deviceProfile && input.deviceProfile.ledCount !== settings.ledCount) {
    throw new TypeError("The controller's detected LED count cannot be changed in the strip profile.");
  }
  const changes = validateSettings(input);
  settings = { ...settings, ...changes };
  saveSettings();
  if (hidDevice && ["color", "brightness", "effect", "speed", "palette", "ledColors", "power"]
    .some((key) => Object.hasOwn(changes, key))) {
    updateAnimation();
  }
  return { settings: settingsSnapshot(), ...deviceState() };
}

function createApplicationMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: "ULLeds",
      submenu: [
        { label: "Setup wizard", click: () => mainWindow?.webContents.send("app:open-setup") },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    {
      label: "Device",
      submenu: [
        { label: "Scan for LED controller", click: () => mainWindow?.webContents.send("device:scan-request") },
        { label: "Disconnect", click: () => disconnectDevice() }
      ]
    },
    {
      label: "Updates",
      submenu: [
        {
          label: "Choose local update folder…",
          click: () => mainWindow?.webContents.send("updates:choose-folder")
        },
        {
          label: "Check for updates",
          click: () => mainWindow?.webContents.send("updates:check-request")
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
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
    backgroundColor: "#151a22",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false
    }
  });
  mainWindow.once("ready-to-show", () => mainWindow.show());
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
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.loadFile(path.join(__dirname, "ui", "index.html"));
}

ipcMain.handle("app:initial-state", () => ({
  version: app.getVersion(),
  settings: settingsSnapshot(),
  device: deviceState()
}));
ipcMain.handle("settings:update", (_event, input) => setSettings(input));
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
ipcMain.handle("screen-sync:start", () => {
  if (!hidDevice) throw new Error("Connect the LED controller before starting screen sync.");
  if (!settings.power) throw new Error("Turn the LEDs on before starting screen sync.");
  screenSyncActive = true;
  updateAnimation();
  return { active: true };
});
ipcMain.handle("screen-sync:colors", (_event, colors) => {
  if (!screenSyncActive || !hidDevice) return { active: false };
  const ledCount = settings.deviceProfile?.ledCount;
  if (!Number.isInteger(ledCount)) throw new Error("The controller's LED count has not been detected.");
  if (!Array.isArray(colors) || colors.length !== ledCount || !colors.every(validColor)) {
    throw new TypeError(`Screen sync must provide one valid color for each of the ${ledCount} LEDs.`);
  }
  return writeScreenSyncColors(colors).then(() => ({ active: true }));
});
ipcMain.handle("screen-sync:stop", () => {
  screenSyncActive = false;
  updateAnimation();
  return { active: false };
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
  setSettings({ updateFolder: result.filePaths[0] });
  return { canceled: false, folder: settings.updateFolder };
});
ipcMain.handle("updates:check", async () => {
  if (!app.isPackaged) {
    return { available: false, error: "Differential updates are available in the installed app." };
  }
  if (!settings.updateFolder) {
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
      if (!updateServer || updateServerFolder !== settings.updateFolder) {
        if (updateServer) await updateServer.close();
        updateServer = await createLocalUpdateServer(settings.updateFolder);
        updateServerFolder = settings.updateFolder;
      }
      autoUpdater.setFeedURL({ provider: "generic", url: updateServer.url });
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
  session.defaultSession.setDisplayMediaRequestHandler(async (request, callback) => {
    if (!request.userGesture || !request.videoRequested) {
      callback(null);
      return;
    }
    try {
      const sources = await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width: 0, height: 0 }
      });
      const primaryDisplayId = String(screen.getPrimaryDisplay().id);
      const source = sources.find((candidate) => candidate.display_id === primaryDisplayId) || sources[0];
      if (!source) throw new Error("No display is available to capture.");
      callback({ video: source });
    } catch (error) {
      console.error("Could not start screen capture:", error);
      callback(null);
    }
  });
  loadSettings();
  createApplicationMenu();
  createTray();
  createWindow();
  const devices = getDeviceList();
  if (devices.length) await connectDevice(devices[0].path);
  watcherTimer = setInterval(async () => {
    try {
      if (!hidDevice) {
        const device = getDeviceList()[0];
        if (device) {
          await connectDevice(device.path);
        }
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
