# Architecture

How DX Light / Robobloq QuikLight Desktop v3.7.21 is put together, and where each
piece lives in this recovered repository.

---

## 1. Process model

```
┌──────────────────────────────────────────────────────────────┐
│ Electron main process  (src/main/runtime.js)                 │
│                                                              │
│  • app lifecycle, single-instance lock, tray, login item    │
│  • device discovery / connection                             │
│  • IPC handlers (renderer → hardware)                        │
│  • screen-sync + rhythm + mouse workers                     │
└───────────────┬──────────────────────────┬───────────────────┘
                │ ipcRenderer.invoke/send   │ worker_threads
                │                           │
┌───────────────▼──────────────┐  ┌─────────▼──────────────────────────────────┐
│ Renderer (React)             │  │ screen-capture-worker.js                   │
│ src/renderer/runtime.js      │  │ audio-worker.js                            │
│                              │  │ mouse-tracking-worker.js                   │
│  • UI, settings, device list │  │                                            │
│  • calls window.electronAPI  │  │  native @warren-robobloq/quiklight addon   │
└───────────────▲──────────────┘  └────────────────────────────────────────────┘
                │ contextBridge
┌───────────────┴──────────────┐
│ Preload  src/preload/preload.js │
└──────────────────────────────┘
```

The main window is created at 1280×800 with `contextIsolation: true`,
`backgroundThrottling: false`, and `nodeIntegrationInWorker: true`. It loads the
renderer bundle from `build/.webpack/renderer/main_window/index.js`.

Only one instance is allowed: `app.requestSingleInstanceLock()`; a second launch
focuses the existing window.

---

## 2. Boot sequence

1. `src/main/runtime.js` starts.
2. `global.store`, `global.app`, `global.shell`, `global.QuikLight`, `global.os`,
   `global.path`, `global.macOSVersion` are exported for modules that expect a
   global.
3. `app.whenReady()` → create the tray, create the main window, register the
   `activate` handler.
4. The renderer loads, calls `electronAPI.getDisplays()` and
   `electronAPI.getMachineID()`, then reads the device list from the store.
5. Native device scan (`@warren-robobloq/quiklight`) produces device descriptors;
   USB HID devices are matched against stored `uuid`s.
6. Connected devices receive an initial color frame.

Quitting is unusual: both `before-quit` and `powerMonitor` shutdown prevent the
default exit, run cleanup (`turnOffLights`, stop workers, disconnect devices), then
call `app.exit(0)`.

---

## 3. Device / HID protocol

`getUsbProtocol(uuid, off)` in `src/main/runtime.js` builds the report:

```
plain strip:   [1, r, g, b, 254]
addressable:   [1, r, g, b, leds, leds+1, 0, 0, 0, 254]
```

- `leds` is `devices[].lampsAmount`; the addressable form is used when
  `0 < lampsAmount < 254`.
- `254` is the report terminator.
- Colors pass through `hexToRgb` → `ajustColorOrder(rgb, wireMap)` → `lowLight`.
  `wireMap` reorders channels for strips wired as RGB/GRB/BRG etc.
- `off = true` sends an all-zero payload (used to blank the strip before a new
  frame).
- BLE devices use `getBleProtocol()` — a single on/off byte.

Writes go through the native device objects exposed by the SDK
(`setSectionLED`, `turnOffLight`, `setSwitchStatus`), never through raw
`node-hid` calls in app code.

Configured strip in this profile: HID `VID_1A86` / `PID_FE07`, 75 LEDs, 3 edges,
wire map `RGB`.

---

## 4. Screen sync pipeline

```
start sync
  ├─ screen-capture-worker.js  (worker_threads)
  │    startCaptureMultiScreens(cb, displays, finalSyncSpeed, samplingRate)
  │    cb(frame) → parentPort.postMessage(frame)
  │
  ├─ main: receives frame, finds current device(s)
  ├─ getUsbProtocol(uuid, off) → report bytes
  └─ device.setSectionLED(report)
```

- `finalSyncSpeed = user syncSpeed + 20` (clamped/derived in runtime).
- `samplingRate` controls how often the native side samples displays.
- One worker handles all displays (`displays` array from `getDisplays`).
- On stop: post `"exit"` to the worker → `stopCaptureMultiScreens()` →
  `parentPort.close()`.

`getCompressColor(x, y)` is a separate IPC helper that averages a screen region
into one color (used by the "pick color from screen" tool).

---

## 5. Rhythm / music pipeline

```
startAudioWorker(enabled)
  ├─ audio-worker.js  (worker_threads)
  │    startStream(level => postMessage(level <= 0.01 ? 0 : level), interval)
  ├─ main: level → pulse / color scaling → HID report
  └─ stop: post "exit" → stopStream()
```

`sendRhythmType`, `sendRhythmColor`, `sendSoundSensitivity` configure the effect.
Colors come from `devices[].rhythmColors` (7 pairs in the current config).

---

## 6. Mouse tracking (FPS optimization)

```
mouse-tracking-worker.js
  startMouseTracking(pos => postMessage(pos), 100)
```

When the "FPS optimization" setting is enabled, mouse movement is used to reduce
screen-capture work while the cursor is active. Windows only.

---

## 7. Configuration

Stored by `electron-store` at:

```
%APPDATA%\quiklight-desktop\config.json
```

Schema (single `devices` array; one object per strip):

| Key | Type | Meaning |
| --- | --- | --- |
| `id` | string | 6-digit device ID (`"000603"`) |
| `uuid` | string | stable device UUID used to re-match on reconnect |
| `name` | string | user-facing name |
| `lampsAmount` | number | LED count |
| `edgeNumber` | number | number of physical strip edges (3) |
| `location` | number | placement preset (1 = monitor back) |
| `installationMethod` | number | mounting preset |
| `specification` | number | LED density (60/m) |
| `type` | string | `"hid"`, `"serialport"`, `"ble"`, `"dongle"` |
| `productType` | string | `"light"` |
| `path` | string | Windows device path (HID) |
| `wireMap` | string | channel order, e.g. `"RGB"` |
| `redSeries` / `greenSeries` / `blueSeries` | number[3] | per-edge channel mapping |
| `hue` | string | static color as hex |
| `brightnessColor` | `{r,g,b,a}` | brightness overlay |
| `whiteBrightValue` / `whiteMode` / `whiteColorDriver` | number | white-channel settings |
| `effectType` / `effectIndex` | number | selected dynamic effect |
| `dynamicSpeed` | number | effect speed |
| `pickupSensitivity` | number | sound pickup sensitivity |
| `rhythmType` | number | music mode |
| `rhythmColors` | `[string,string][]` | 7 color pairs |
| `isSwitchOn` | bool | master on/off |
| `isSyncScreen` | bool | screen-sync enabled |
| `isAutoOff` / `offDuration` | number | auto power-off |
| `syncMode` | number | screen-sync mode |
| `displayId` | string | target display, e.g. `"\\\\.\\DISPLAY1"` |
| `displaySize` | number | sampling size |
| `isInitialized` | bool | has been configured |
| `isDongleChild` | bool (optional) | child of a wireless dongle |

`electron-store` is initialized in main module `81687` / `79620`; `store.get` and
`store.set` are also exposed to the renderer through the preload `store` API.

Other persisted keys: `openAtLogin`, `language`, `syncSpeed`,
`fpsOptimization`, `autoLaunch`.

---

## 8. IPC surface

### 8.1 `ipcRenderer.invoke` (request/response)

Registered with `ipcMain.handle` across `runtime.js`, `60613.js`, and `15967.js`.

| Channel | Purpose |
| --- | --- |
| `getDisplays` | list monitors for screen sync |
| `getMachineID` | hardware ID (licensing/telemetry) |
| `hasScreenRecordingPermission` | macOS permission probe |
| `getOpenAtLoginStatus` | read login-item state |
| `getCompressColor` | average color of a screen region |
| `defaultDevice` / `defaultGroupDevice` | store lookups |
| `findByUUID` | find a stored device |
| `insertOne` / `updateByUUID` / `updateGroupDevice` | persist device changes |
| `getFeedback` | read hardware feedback/state |
| `openExternal` | open URL in system browser |
| `updateBreakingSyncScreen` | show/hide the "sync interrupted" overlay |
| `writeData` | raw device write |
| `sendStaticColor` | set solid color |
| `sendSwitch` | master on/off |
| `sendBrightness` | brightness |
| `sendWhiteBright` | white-channel brightness |
| `sendLedEffect` | dynamic effect + index |
| `sendDynamicSpeed` | effect speed |
| `sendSoundSensitivity` | music sensitivity |
| `sendRhythmColor` | music palette |
| `sendRhythmType` | music mode |
| `sendLineSequence` | LED direction / sequence |
| `sendDeviceLocation` | placement preset |
| `sendEdgeNumber` | number of edges |
| `sendPowerDirection` | power-injection direction |
| `sendLedQuantity` | LED count |
| `startAudioWorker` | start/stop rhythm worker |

### 8.2 `ipcRenderer.send` (fire-and-forget)

`launchAtStartup`, `setScreenWorker`, `resetSoftware`, `setDongleScan`,
`updateConnectDevices`, `enableTransparency`, `checkUpdate`, `renderer-error`,
`unhandled-rejection`.

`updateConnectDevices` is also used to inject a device discovered by the renderer.

### 8.3 main → renderer events

Sent with `webContents.send`, subscribed in preload with `ipcRenderer.on`:

| Event | Payload |
| --- | --- |
| `getDeviceData` | full device array after a scan/change |
| `disconnect` | device path that disappeared |
| `displayAdded` | new display descriptor |
| `displayRemoved` | removed display descriptor |
| `reportSyncScreen` | screen-sync status |
| `checkUpdateReply` | update check result |

### 8.4 Preload globals

| Global | Contents |
| --- | --- |
| `electronAPI` | all IPC wrappers above, plus `app` and `shell` |
| `QuikLight` | `getMonitors()` from the native addon |
| `pluginsAPI` | `macOSVersion` |
| `nodeAPI` | `os`, `path` |
| `store` | `get(key)`, `set(key, value)` |

Renderer errors and unhandled rejections are forwarded to main automatically.

---

## 9. Build layout constraints

These paths are hard-coded in the app and must be preserved:

```
build/.webpack/main/index.js
build/.webpack/main/{screen-capture,audio,mouse-tracking}-worker.js
build/.webpack/main/native_modules/electron-log-preload.js
build/.webpack/renderer/main_window/index.html
build/.webpack/renderer/main_window/index.js
build/.webpack/renderer/main_window/preload.js
build/.webpack/renderer/main_window.css
build/.webpack/renderer/static/...
```

- Main webpack public path is `""`, so worker URLs resolve relative to
  `build/.webpack/main/index.js`.
- `__webpack_require__.ab` points at `__dirname + "/native_modules/"`, which is why
  `native_modules/` must sit next to `index.js`.
- The renderer HTML references `../main_window/index.js`, `../main_window.css`,
  and `../main_window/preload.js`.
- Tray assets are read from `./src/static/` when unpackaged and `./static/` when
  packaged (`app.isPackaged`).
- `package.json` `main` must stay `build/.webpack/main/index.js`.

---

## 10. Editing guidance

**Startup / window / tray / quitting** → `src/main/runtime.js` (end of file has the
`whenReady`, `browser-window-created`, `window-all-closed`, `before-quit` block).

**Device behavior** → the `getUsbProtocol` / `send` class near the top of
`runtime.js`, plus IPC handlers from `S.handle("send…")`.

**UI layout and styling** → `src/renderer/main_window.css` is the fastest surface;
component markup lives inside `src/renderer/runtime.js`.

**Strings** → `src/renderer/locales/*.json`; run `node tools/extract-locales.js`
only if you need to re-derive them from the bundle.

**Workers** → edit `src/main/workers/*.js` directly; `build.js` copies them next to
the main bundle.

### Gotchas

- `src/renderer/runtime.js` is one minified webpack IIFE. There are no component
  module boundaries; use search on visible strings/class names.
- Do not upgrade Electron: native addons (`quiklight.node`, `node-hid`, `usb`,
  `@serialport`) are compiled for Electron 22 / Node ABI 110.
- `npm install` can prune the pre-populated `node_modules`; rerun
  `tools/restore-node-modules.ps1` if the app reports missing modules.
- HID writes are serialized with `await sleep(49)` between reports to avoid
  saturating the controller.
- The app is a rebrand; branding strings and tray icons are the only
  DX-Light-specific assets.
