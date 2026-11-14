"use strict";

const { contextBridge, ipcRenderer } = require("electron");

function listen(channel, callback) {
  const listener = (_event, data) => callback(data);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld("ull", Object.freeze({
  initialState: () => ipcRenderer.invoke("app:initial-state"),
  updateSettings: (settings) => ipcRenderer.invoke("settings:update", settings),
  remoteControlStatus: () => ipcRenderer.invoke("remote-control:status"),
  enableRemoteControl: (address) => ipcRenderer.invoke("remote-control:enable", address),
  disableRemoteControl: () => ipcRenderer.invoke("remote-control:disable"),
  exportScenes: () => ipcRenderer.invoke("scenes:export"),
  importScenes: () => ipcRenderer.invoke("scenes:import"),
  previewSupportIssue: (input) => ipcRenderer.invoke("support:preview", input),
  openGithubSupportIssue: (previewId) => ipcRenderer.invoke("support:open-github", previewId),
  discardSupportIssue: (previewId) => ipcRenderer.invoke("support:discard", previewId),
  resetData: (requestId) => ipcRenderer.invoke("settings:reset", requestId),
  cancelResetData: (requestId) => ipcRenderer.invoke("settings:reset:cancel", requestId),
  flushSettings: (settings) => ipcRenderer.sendSync("settings:flush", settings),
  scanDevices: () => ipcRenderer.invoke("device:scan"),
  connectDevice: (devicePath) => ipcRenderer.invoke("device:connect", devicePath),
  disconnectDevice: () => ipcRenderer.invoke("device:disconnect"),
  startScreenSync: (mode = "screen") => ipcRenderer.invoke("screen-sync:start", mode),
  getSpotifyArtwork: () => ipcRenderer.invoke("spotify-sync:artwork"),
  sendScreenSyncColors: (colors) => ipcRenderer.invoke("screen-sync:colors", colors),
  recordScreenSyncPerformance: (metrics) => ipcRenderer.send("screen-sync:performance", metrics),
  stopScreenSync: () => ipcRenderer.invoke("screen-sync:stop"),
  screenSyncSource: () => ipcRenderer.invoke("screen-sync:source"),
  notifyMovieFormat: (aspectRatio) => ipcRenderer.send("screen-sync:movie-detected", aspectRatio),
  checkUpdates: () => ipcRenderer.invoke("updates:check"),
  installUpdate: () => ipcRenderer.invoke("updates:install"),
  listReleaseDownloads: () => ipcRenderer.invoke("updates:release-downloads"),
  listReleaseHistory: () => ipcRenderer.invoke("updates:release-history"),
  listArchivedReleaseHistory: () => ipcRenderer.invoke("updates:archived-release-history"),
  installRelease: (version) => ipcRenderer.invoke("updates:install-release", version),
  onUpdateProgress: (callback) => listen("updates:progress", callback),
  onUpdateDownloaded: (callback) => listen("updates:downloaded", callback),
  onUpdateError: (callback) => listen("updates:error", callback),
  onDeviceStatus: (callback) => listen("device:status", callback),
  onSettingsUpdated: (callback) => listen("settings:updated", callback),
  onRemoteSyncRequest: (callback) => listen("remote:sync-request", callback),
  reportRemoteSyncResult: (result) => ipcRenderer.send("remote:sync-result", result),
  onDeviceScanRequest: (callback) => listen("device:scan-request", callback),
  onSetupRequest: (callback) => listen("app:open-setup", callback),
  onUpdateCheckRequest: (callback) => listen("updates:check-request", callback),
  onMovieFormatApplied: (callback) => listen("screen-sync:movie-format-applied", callback),
  onMovieFormatPrompt: (callback) => listen("movie-format:prompt", callback),
  chooseMovieFormat: (promptId, choice) => ipcRenderer.send("movie-format:choose", { promptId, choice }),
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  toggleMaximizeWindow: () => ipcRenderer.invoke("window:toggle-maximize"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  onWindowMaximized: (callback) => listen("window:maximized", callback)
}));
