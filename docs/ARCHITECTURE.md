# ULLeds architecture

## Active application

The clean implementation is under `ull/`. The Electron main process owns USB
enumeration, HID writes, settings persistence, update checks, and window
lifecycle. The renderer is a small local HTML/CSS/JavaScript interface and has
no Node integration.

```
ull/main.js
  ├─ USB HID scan / connection (node-hid)
  ├─ paced light effects and settings in Electron userData
  ├─ loopback update feed and differential NSIS updates
  └─ context-isolated BrowserWindow
       ├─ ull/preload.js (allowlisted IPC methods)
       └─ ull/ui/ (interface, preview, controls)
```

The preload exposes named methods only. Renderer input is validated in the
main process before it is saved or sent to the controller. Device discovery
matches USB VID `0x1a86` and PID `0xfe07`.

On startup, ULLeds imports a saved strip profile from the existing ULLeds
or QuikLight per-user configuration when its HID path matches the connected
controller. A single saved profile may be reused when it is the only supported
controller present. ULLeds queries the controller for its LED count and treats
that value as read-only. RGB order and physical placement are not reported by
the controller; when no saved profile can be matched, the setup wizard collects
those details rather than guessing.

The count query uses the controller's read-only device-info action (`130`),
matches the response message ID, and validates the reported count before
opening the device for lighting control. A saved count is never used as a
substitute when that query fails.

## HID output

The PC SYNC Backlight accepts `RB` section commands over HID. Each section is
five bytes: 1-based start LED, RGB values, and inclusive end LED. ULLeds merges
adjacent LEDs with the same color, appends an off section through controller
address 254, and sends the data with report ID zero in 64-byte HID reports.
Packets contain at most 49 sections so the one-byte packet length cannot
overflow. Brightness and the saved RGB channel order are applied before
encoding.

The strip preview follows physical ordering from the saved installation
direction. Direction 0 starts at the left-bottom and travels up the left,
across the top, and down the right. Direction 1 starts at the right-bottom
and follows the reverse route. Individual colors are stored by zero-based LED
index in `settings.json`; selecting one LED, Ctrl-selecting multiple LEDs, or
selecting a side changes only those LEDs. Selecting all returns to whole-strip
color changes. Moving effects still animate as a uniform color.

Screen sync captures the shared display at a bounded resolution, samples near
each LED's corresponding screen edge, and eases the preview continuously.
Hardware uses the controller's dedicated `SC` / action `128` sync-screen packet
with its 16-bit length and addressable LED ranges, rather than ordinary `RB`
static-color packets. Sampling and asynchronous HID writes run at up to 30 FPS.
Unchanged colors are skipped and queued stale frames are replaced. Hidden-window
renderer throttling is disabled so sync continues when the main window is hidden
to the system tray. Electron's display-capture request handler selects the
primary screen after the user starts sync.

The app stores user preferences in `%APPDATA%\ULLeds\settings.json` to preserve
existing settings through the rebrand and installer updates. Closing the window
hides the app to the tray; choosing Quit ends sync and disconnects the HID
device. Quitting does not send an off frame, so the controller retains its last
output. A controller scan runs at startup, on request, and every five seconds
while no controller is connected.

## Local updates

`npm run dist:win` creates an NSIS installer, its `.blockmap`, and a
`latest.yml` manifest. The user chooses a local update folder; ULLeds serves it
over loopback HTTP to `electron-updater`, which verifies the installer digest,
supports ranged differential downloads, and applies the update after restart.
Preserving the previous installer and its blockmap in the folder allows the
downloader to compare old and new installer blocks. User settings remain under
`%APPDATA%\ULLeds` and are not replaced with the application files.

The package allowlist includes the ULLeds app and its package metadata only;
the earlier recovery bundle under `src/` is not loaded or shipped.
