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
  resetData: () => ipcRenderer.invoke("settings:reset"),
  flushSettings: (settings) => ipcRenderer.sendSync("settings:flush", settings),
  scanDevices: () => ipcRenderer.invoke("device:scan"),
  connectDevice: (devicePath) => ipcRenderer.invoke("device:connect", devicePath),
  disconnectDevice: () => ipcRenderer.invoke("device:disconnect"),
  startScreenSync: () => ipcRenderer.invoke("screen-sync:start"),
  sendScreenSyncColors: (colors) => ipcRenderer.invoke("screen-sync:colors", colors),
  stopScreenSync: () => ipcRenderer.invoke("screen-sync:stop"),
  screenSyncSource: () => ipcRenderer.invoke("screen-sync:source"),
  chooseUpdateFolder: () => ipcRenderer.invoke("updates:choose-folder"),
  checkUpdates: () => ipcRenderer.invoke("updates:check"),
  installUpdate: () => ipcRenderer.invoke("updates:install"),
  onUpdateProgress: (callback) => listen("updates:progress", callback),
  onUpdateDownloaded: (callback) => listen("updates:downloaded", callback),
  onUpdateError: (callback) => listen("updates:error", callback),
  onDeviceStatus: (callback) => listen("device:status", callback),
  onDeviceScanRequest: (callback) => listen("device:scan-request", callback),
  onSetupRequest: (callback) => listen("app:open-setup", callback),
  onUpdateFolderRequest: (callback) => listen("updates:choose-folder", callback),
  onUpdateCheckRequest: (callback) => listen("updates:check-request", callback)
}));
