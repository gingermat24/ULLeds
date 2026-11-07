# ULLeds

ULLeds is an independent Windows desktop controller for the USB LED strip
behind a monitor. It is created by **gingermat**.

The active app is implemented from scratch in [`ull/`](./ull/). Its renderer,
preload bridge, and HID controller do not import the earlier recovered
application bundle under `src/`. The Windows installer explicitly packages
only `ull/` and its runtime dependencies.

## Run from source

Requirements: Windows 10/11 x64, Node.js 22.12+, npm, and a USB LED controller
using VID `1A86` / PID `FE07`.

```powershell
npm install
npm start
```

At startup, ULLeds scans for the supported USB controller and looks for a
matching saved strip profile in the existing ULLeds and QuikLight settings.
The controller reports its LED count directly; the count is read-only in the
app. The wizard lets you adjust the saved physical layout and color order.
ULLeds saves settings under `%APPDATA%\ULLeds`.
In the Device settings, **Start ULLeds with Windows** restores the saved
lighting after sign-in. **Resume Screen Sync at startup** captures the primary
display automatically; it is enabled when you start Screen Sync and disabled
when you stop it. The startup sync option uses the primary display, while a
manual start can still choose a display.

## Build the installer

```powershell
npm run dist:win
```

This creates `dist/ULLeds-Setup-<version>-x64.exe`, a standard NSIS setup wizard
that lets users choose an install location and creates Start menu and desktop
shortcuts. The current build is Windows x64 only.

## Local update flow

Updates are intentionally local until a ULLeds GitHub Releases feed exists:

1. Build a newer version by updating `version` in `package.json` and running
   `npm run dist:win`.
2. Share the generated installer, `latest.yml`, and `.blockmap` file together
   in an update folder. Keep the previous installer and its `.blockmap` there
   as well to allow differential downloads.
3. In ULLeds, open **Settings → Updates → Choose folder**, then choose
   that folder. Use **Check for updates** to download the update, then choose
   **Restart and update** when it is ready.

ULLeds serves the selected local feed over loopback HTTP so its updater can
request only changed installer blocks. If a matching old blockmap is missing,
the updater may need to download the full installer. NSIS updates preserve
user settings stored in `%APPDATA%\ULLeds`. A first upgrade from the older
manual-installer flow may require one full installer; later updates can be
differential. When GitHub Releases are ready, the update feed can be hosted
without changing the lighting controls.

## LED control

The app scans for the USB controller with VID `1A86` / PID `FE07` at startup,
on request, and every five seconds when disconnected. It supports color,
brightness, hardware-detected LED count, six RGB channel orders, strip layout,
steady color, breathing, spectrum, and palette-drift effects, plus saved
per-LED colors. The Scenes tab is currently disabled. Moving effects are sent
as paced HID frames; connect the controller to apply changes.

The controller accepts addressable color sections. Click one preview LED to
select it, Ctrl-click to add or remove individual LEDs, or click a side to
select that side. Color changes apply only to the selection; **Select all**
returns to whole-strip editing. ULLeds saves per-LED colors between sessions.
The preview follows the configured physical strip direction.
Screen sync captures the primary display when started in the app, samples the
visible primary-display image near each LED's corresponding edge, and smoothly
updates the preview. It samples only those edge positions, not individual
windows. Screen-sync smoothing favors responsiveness while averaging nearby
pixels to reduce noise. Use **LED color tuning** if your strip's red, green, or
blue output needs calibration; hardware LEDs may not match the monitor exactly.
Sampling and HID writes run at up to 30 FPS. HID writes are
asynchronous and stale queued frames are replaced by the newest colors, so
slow controller writes do not block the app or build a delayed frame backlog.
Closing the window hides ULLeds in the system tray; capture and sync continue
until you choose Quit.

Quitting ULLeds leaves the controller's last color output on; it no longer
sends an all-black frame. Colors and settings are saved in the existing
per-user settings file and restored on the next launch. Windows startup is
enabled by default in installed builds; startup launches minimized to the tray.

## Repository note

The previous recovery work remains in `src/` and `build/` for reference, but
it is not loaded by ULLeds and is not included in the ULLeds installer. Do not
publish or package those files as part of this clean implementation.
