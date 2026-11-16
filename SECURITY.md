# Security policy

## Supported versions

Security fixes are made against the latest published ULLeds release. Older
versions are not patched; update from the
[Releases page](https://github.com/gingermat24/ULLeds/releases) or from the
in-app update prompt.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

1. Open the **Security** tab of this repository and use **Report a
   vulnerability** (GitHub private vulnerability reporting), if it is offered.
2. If private reporting is not available, open an issue that describes the
   area affected and the impact, without publishing reproduction details,
   credentials, or personal data. Mention that you would like a private channel
   and wait for a reply before sharing specifics.

Useful details: ULLeds version, Windows build, controller `VID:PID`, the exact
steps, and whether the phone remote or the updater is involved.

This is a single-maintainer hobby project, so responses are best-effort. There
is no bug bounty.

## What the app does with your data

ULLeds is local-first:

- Screen Sync samples the display locally. Screen images, sampled colors, and
  audio are never recorded, saved, or uploaded.
- Spotify Sync captures the desktop audio mix to drive the LEDs, and only while
  Windows reports Spotify as playing. That mix is the whole default output
  device, not only Spotify, and it is never recorded, saved, or uploaded.
- Diagnostics are opt-in and saved locally under `%APPDATA%\ULLeds`. They record
  callback rates and processing times, not screen content.
- The support form only opens a prefilled GitHub issue draft in your browser.
  Nothing is submitted until you submit it on GitHub, and you decide whether to
  attach a diagnostics file.
- The updater checks the public GitHub Releases feed. Local-folder update
  sources are disabled because their metadata and installers cannot be
  authenticated.

## Phone remote

The phone remote is a local HTTP server, and it is only as private as the
network it runs on.

- It binds to a private IPv4 interface only (10/8, 172.16/12, or 192.168/16)
  and refuses to start when no such interface exists.
- Requests from outside the selected subnet are rejected, and requests whose
  `Host` header does not match the paired address are rejected to block DNS
  rebinding.
- Pairing needs the six-digit PIN shown on the PC. PIN comparison is
  constant-time; five failures from one address lock that address out for five
  minutes.
- Successful pairing issues a random 256-bit session token. Only its SHA-256
  hash is stored, and the browser cookie is `HttpOnly` and `SameSite=Strict`.

Treat the PIN like a Wi-Fi password:

- Use the remote only on a trusted home network. Guest, hotel, campus, and
  public Wi-Fi networks are shared with strangers.
- Never forward the remote port through your router, and do not expose it with
  a tunnel, reverse proxy, or VPN split that makes it reachable from the
  internet.
- Turn the remote off when you are not using it. Disabling the remote, or
  resetting app data, revokes the PIN and unpairs every phone. Merely closing
  the window or restarting ULLeds does not: a paired phone stays signed in
  until its session expires.

## Third-party components

Electron, `node-hid`, `electron-updater`, and `qrcode` are used under their own
licenses. Bundled font licenses are in `ull/assets/fonts/`. Report
vulnerabilities in those projects to their maintainers as well; ULLeds pins
versions and updates them in normal releases.
