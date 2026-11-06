# DX Light (recovered source)

Editable source for the **DX Light** desktop app — the LED-strip controller that
drives the "PC SYNC Backlight" strips on this PC.

The app was shipped as a compiled Electron bundle (`app.asar`). This repository is
a **reconstruction** of that bundle: the webpack modules have been split back into
individual files, beautified, and given a small build script so the app can be
rebuilt and run from source.

> **Read [NOTICE.md](NOTICE.md) first.** This is not original work by the owner of
> this repository. DX Light is a rebrand of **Robobloq QuikLight Desktop v3.7.21**
> (`@warren-robobloq/quiklight`). The code is third-party proprietary software.
> Keep this repository private and do not redistribute it.

---

## Quick start

```powershell
npm install                 # installs Electron 22.3.27
npm run build               # reassembles build/.webpack from src/
npm start                   # build + launch
```

If `node_modules` is missing or has been pruned (for example after a fresh
`npm install`), restore the bundled dependencies from the installed app:

```powershell
powershell -ExecutionPolicy Bypass -File tools/restore-node-modules.ps1
```

Default source: `C:\Program Files\DX Light\resources`. Override with
`-InstallDir "D:\path\to\DX Light"`.

### Requirements

- Windows 10/11 x64 (the native addons are Windows binaries)
- Node.js 18+ and npm
- The original **DX Light** installation (source of `node_modules` and native
  `.node` binaries)

---

## Repository layout

```
DX-Light/
├── package.json              app metadata and scripts
├── tools/
│   ├── build.js              reassembles build/.webpack from src/
│   ├── extract-locales.js    regenerates src/renderer/locales/*.json
│   ├── inspect-api.js        lists IPC + preload surface
│   └── restore-node-modules.ps1
├── docs/
│   └── ARCHITECTURE.md       how the app works (processes, IPC, HID, config)
├── src/
│   ├── main/                 Electron main process
│   │   ├── runtime.js        app lifecycle, IPC handlers, tray, device logic
│   │   ├── registry.js       webpack module registry (551 modules)
│   │   ├── modules/          individual main-process modules
│   │   └── workers/          worker_threads entry points (editable)
│   ├── preload/
│   │   └── preload.js        contextBridge API
│   ├── renderer/             React UI
│   │   ├── runtime.js        bundled React app (1 MB)
│   │   ├── registry.js       webpack module registry (232 modules)
│   │   ├── modules/          individual renderer modules
│   │   ├── main_window.css   full app stylesheet
│   │   ├── index.html        HTML shell
│   │   ├── locales/*.json    translations (zh-cn, en, es, fr, ru, ja)
│   │   └── static/           icons, backgrounds, UI art
│   └── static/               tray icons (Windows + macOS)
└── build/.webpack/           generated output (git-ignored)
```

`build/.webpack` is generated. Never edit it by hand — edit `src/` and rebuild.

---

## How the rebuild works

The original bundles were webpack output of the form:

```js
(() => {
  var e = { 12345: (module, exports, __webpack_require__) => { ... }, ... };
  // webpack runtime
})();
```

`tools/extract-locales.js` and the extraction step produced two things per process:

1. `src/<process>/modules/<id>.js` — each value of the module map.
2. `src/<process>/registry.js` — the object literal that maps ids to module
   functions.

`tools/build.js` then:

- wraps the registry back into the original IIFE shape,
- writes `build/.webpack/main/index.js` and
  `build/.webpack/renderer/main_window/index.js`,
- copies `index.html`, `main_window.css`, `static/`, locales, preload, and the
  worker scripts into the layout Electron expects,
- copies `native_modules/electron-log-preload.js`.

Main-process module 33884/39590/61089 were rewritten to point at readable worker
filenames (`screen-capture-worker.js`, `audio-worker.js`,
`mouse-tracking-worker.js`) instead of hashed webpack chunk names.

### Where to edit what

| Goal | File |
| --- | --- |
| Window creation, tray, quitting, device connection | `src/main/runtime.js` |
| Screen-sync capture worker | `src/main/workers/screen-capture-worker.js` |
| Music / rhythm analysis worker | `src/main/workers/audio-worker.js` |
| Mouse-position worker (FPS optimization) | `src/main/workers/mouse-tracking-worker.js` |
| IPC bridge exposed to the UI | `src/preload/preload.js` |
| UI behaviour and React components | `src/renderer/runtime.js` |
| Colours, spacing, layout | `src/renderer/main_window.css` |
| Translations | `src/renderer/locales/*.json` |
| UI icons and art | `src/renderer/static/assets/` |

`src/renderer/runtime.js` is a single webpack-concatenated React bundle. Module
boundaries inside the app code were lost during minification; vendor modules are
split into `src/renderer/modules/`. Search inside `runtime.js` for component names,
prop names, or visible strings to find the code you want.

---

## Device notes

The configured strip in this profile:

| Property | Value |
| --- | --- |
| Name | PC SYNC Backlight |
| Device ID | `000603` |
| UUID | `cdab54461abc3bae` |
| Connection | HID (`VID_1A86` / `PID_FE07`) |
| LEDs | 75, 3 edges |
| Wire map | RGB |

HID report format (from `getUsbProtocol` in `src/main/runtime.js`):

```
plain strip:   [1, r, g, b, 254]
addressable:   [1, r, g, b, leds, leds+1, 0, 0, 0, 254]
```

`254` terminates the report. For addressable strips the LED count is embedded in
the payload.

User settings live at:

```
%APPDATA%\quiklight-desktop\config.json
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full config schema, IPC
channel list, worker flow, and process model.

---

## Troubleshooting

**App window opens but no device is found**
Check that the HID device path in `%APPDATA%\quiklight-desktop\config.json`
still matches the strip. Re-scanning from the UI rewrites it.

**`Cannot find module '@warren-robobloq/quiklight'`**
`node_modules` was pruned. Run `tools/restore-node-modules.ps1`.

**Native module version mismatch**
The addons are built for Electron 22.3.27 / Node ABI 110. Do not upgrade Electron
without rebuilding them from source (no public source is available).

**Blank window**
DevTools open automatically when the app runs unpackaged. Check the console for
missing assets or IPC errors. If the window stays hidden, launch with:

```powershell
node_modules\electron\dist\electron.exe .
```

The window hides instead of closing (`close` is intercepted unless the app is
quitting), so use the tray icon or quit from the tray menu.
