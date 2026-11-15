# ULLeds architecture

## Active application

The clean implementation is under `ull/`. The Electron main process owns USB
enumeration, device connection lifecycle, settings persistence, update checks,
and window lifecycle. The renderer is a small local HTML/CSS/JavaScript
interface and has no Node integration.

```
ull/main.js
  ├─ USB device scan / app lifecycle
  ├─ ull/pc-sync-hid-device.js (HID protocol and output adapter)
  ├─ ull/lighting-animation.js (effect timer and stale-frame reconciliation)
  ├─ ull/temporary-override.js (expiring priority-60 lighting lease)
  ├─ settings in Electron userData
  ├─ ull/priority-mux.js (standalone in-memory source arbitration)
  ├─ GitHub Releases update feed and differential NSIS updates
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

The count query uses the controller's read-only device-info action (`130`) and
validates the reported count before opening the device for lighting control.
Valid device-info replies are accepted even if another HID reader changes the
response message ID. If the controller does not report a valid count, only a
matching saved profile can provide a fallback, which is recorded in the
connection profile.

Optional phone control is served by `ull/remote-control.js` over HTTP on a
user-selected private IPv4 interface. Requests are restricted to that
interface's subnet, state-changing requests require the remote page's origin,
and pairing requires a rate-limited PIN before a time-limited in-memory session
is issued. The phone can also start or clear an expiring lighting override;
these requests do not change saved settings or scenes. The phone API does not
expose device paths, serial numbers, or general Electron IPC. The server stops
when remote control is disabled or ULLeds quits.
Because this local HTTP traffic is not encrypted, users should pair only on a
trusted private network and must not forward the port to the internet.
Enabling phone control also keeps ULLeds in the tray and restores the server at
Windows sign-in. Screen and Spotify Sync requests are relayed through the
trusted renderer; the PC may still need to grant capture permissions.

## Input priority

`ull/priority-mux.js` is a deterministic, in-memory source arbiter. Its
interface is `setInput({ id, priority, colors, expiresAt, frameType,
effectBrightness })`, `release(id)`, `expire(now)`, and `getWinner(now)`.
Larger priority values win; equal
priorities keep the earliest registered input in front. The default levels
are manual lighting 10, effects 20, Screen Sync 30, Spotify Sync 40, and
temporary override 60. Priority-60 inputs require an explicit expiry time.
The winning frame also carries its output type so Screen and Spotify keep using
the controller's realtime `SC` path while ordinary lighting uses `RB`.
Screen Sync and Spotify Sync own independent renderer capture lifecycles and
can both publish frames; the higher-priority source is written, and stopping
it reveals the next active source. Stopping all sync sources returns to effects
or manual lighting. Effects keep publishing priority-20 frames while a higher
priority source wins, so the latest effect frame is ready when that source is
released. A temporary override snapshots its color, effect, speed, and palette
into a priority-60 lease; supported durations are 5, 15, 30, and 60 seconds.
It can be replaced or cleared from the desktop app or paired phone, expires
automatically, and is cleared on power-off or controller disconnect. Releasing
it immediately writes the next winning source without changing saved settings
or scenes. The Lighting preview shows the winning source.

`ull/lighting-animation.js` owns the lighting-effect interval. When a setting
change happens during an in-flight animation write, it reconciles the output
after that write completes so a stale effect frame cannot remain visible.

## HID output

`ull/pc-sync-hid-device.js` owns the controller's HID session, device LED-count
query, packet construction, HID report framing, and paced output queue. Its
interface is `open(path, onError)`, `readLedCount()`,
`writeFrame(colors, options)`, `close()`, and `isConnected`. Main-process code
passes normalized colors and lighting calibration; it does not construct
controller packets. The adapter preserves the existing static-lighting `RB`
and realtime `SC` output paths.

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

Screen Sync captures the shared display at a bounded resolution, samples near
each LED's corresponding screen edge, and eases the preview continuously.
Hardware uses the controller's dedicated `SC` / action `128` sync-screen packet
with its 16-bit length and addressable LED ranges, rather than ordinary `RB`
static-color packets. Sampling and asynchronous HID writes run at up to 30 FPS.
Unchanged colors are skipped and queued stale frames are replaced. Hidden-window
renderer throttling is disabled so sync continues when the main window is hidden
to the system tray. The main process selects the primary display and provides
its capture-source ID through an allowlisted preload method. Spotify Sync uses
the same desktop-capture path with low-resolution video and loopback audio to
analyze local audio while applying the current track's cover-art colors.
Letterbox detection compares sampled edge rows with the picture center, allowing
near-black bars while rejecting uniformly dark frames. Stable detection, prompt
deduplication, and picture-area selection are separate decisions. An accepted
automatic picture area stays in effect after the bars disappear until the sync
session restarts or the Screen Sync picture-area setting changes.

The app stores user preferences in `%APPDATA%\ULLeds\settings.json` to preserve
existing settings through the rebrand and installer updates. It also stores a
startup mode: ordinary lighting restores the saved color/effect and power
state, while active Screen Sync or Spotify Sync is restarted after the
controller connects. Turning power off or manually stopping sync returns the
startup mode to ordinary lighting. The old Screen Sync resume preference is
migrated for existing installations.

Closing the window hides the app to the tray; choosing Quit ends sync and
disconnects the HID device. Quitting does not send an off frame, so the
controller retains its last output. At Windows sign-in, ordinary lighting modes
defer creating the hidden renderer window; sync modes create it so capture can
resume. A controller scan runs once at startup, on request, and every five
seconds while no controller is connected.

## Updates

`npm run dist:win` creates an NSIS installer, its `.blockmap`, and a
`latest.yml` manifest. Packaged builds check the public ULLeds GitHub Releases
feed; `electron-updater` verifies the installer digest, supports ranged
differential downloads, and applies the update after restart. Local-folder
update sources are disabled until ULLeds can authenticate both the update
metadata and the installer. User settings remain under `%APPDATA%\ULLeds` and
are not replaced with the application files.

The package allowlist includes the ULLeds app and its package metadata only.
The recovered DX Light 3.7.21 bundle that the app was originally based on is
not part of the working tree; it remains available in git history.
