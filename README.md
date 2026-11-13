# ULLeds

Make the light behind your monitor part of what's on screen.

ULLeds is a Windows app for controlling a compatible USB LED strip mounted
behind your monitor. Match the colors around your screen with **Screen Sync**,
or choose a color and effect yourself.

## What you can do

- **Match your display:** Screen Sync samples colors around the edges of your
  screen and updates the LEDs as the picture changes.
- **React to music:** Spotify Sync reads the current track's cover art and
  analyzes desktop audio locally to pulse and move those colors with the music.
  It does not need Spotify sign-in, and audio is not recorded or uploaded.
- **Watch widescreen movies:** ULLeds can detect stable letterbox bars and ask
  before using the detected picture area. You can turn detection off or choose
  the 2.35:1 picture area yourself.
- **Set the mood:** Pick a color, adjust brightness, or use breathing, spectrum,
  and palette effects.
- **Choose colors by LED:** Select one LED or a section of the strip and give it
  its own color, or blend a two-color gradient across the selected LEDs. Manual
  colors and gradients switch to Solid so the selected colors show on the strip.
- **Save your favorites:** Create named lighting setups and switch between
  them. Export setups as a backup or move them to another PC; importing adds
  new setups without replacing the ones you already have. Device layout and
  Screen Sync preferences stay as they are.

## Compatibility

- Windows 10 or 11, 64-bit
- A compatible USB LED strip controller and an addressable strip

ULLeds does not support every USB or RGB lighting device. Compatibility depends
on the strip controller. The app detects supported controllers when it starts;
the setup wizard helps you arrange the strip to match your monitor.

## Download and updates

Download the latest Windows installer from the
[GitHub Releases page](https://github.com/gingermat24/ULLeds/releases). Starting
with version 1.0.48, ULLeds can check for and install updates from GitHub
Releases in the app. The release-notes carousel also offers the matching
Windows installer for each published version, labeled **Update** or
**Downgrade**. Selecting one downloads and verifies that release through the
in-app updater; restart ULLeds from the update prompt to install it. Earlier
versions must be updated manually.

The release-notes carousel reads published release descriptions from GitHub
when online. The app also bundles a local copy of the changelog so notes remain
available if GitHub cannot be reached; published GitHub notes take precedence
when they load successfully.

## Screen Sync and privacy

Screen Sync analyzes the display locally to choose colors for the LEDs. ULLeds
does not record or upload screen images. It samples the display edges rather
than individual app windows, so the part of the display being shown matters.
Local diagnostics record callback rates and processing times, not screen images
or sampled colors. They are saved to
`%APPDATA%\ULLeds\screen-sync-diagnostics.log`.

Spotify Sync reads cover art locally from Windows media controls and analyzes
the desktop audio mix while active to animate the LEDs. Audio capture is not
limited to Spotify; it includes system output. ULLeds does not record or upload
audio or artwork.

For widescreen content with black bars, optional detection looks for stable
letterbox bars and shows a compact prompt at the top of the screen. Choose
**Use detected** within five seconds to change the picture area for that sync
session; otherwise the prompt closes and the current format stays unchanged.
When the bars disappear for a short, stable period, Screen Sync returns to your
saved picture area. You can also disable detection or select
**Cinema widescreen (2.35:1)** in Device settings.

## After installation

1. Install ULLeds and connect your compatible LED controller.
2. Open ULLeds and follow the setup wizard to match the strip layout to your
   monitor.
3. Choose a color or effect, or select **Start** under Screen Sync.

Closing the window keeps ULLeds running in the system tray, so Screen Sync can
continue. Choose **Quit** from the tray menu to exit completely.

## License

ULLeds original source code and project materials are proprietary and
All Rights Reserved. No permission is granted to copy, modify, publish, or
redistribute them. See [LICENSE](./LICENSE).

The repository is public, so GitHub users can still view and fork it under
GitHub's platform terms. This notice states that no reuse license is granted;
it cannot technically prevent access to or copying of publicly visible
content. Third-party dependencies and assets remain under their respective
licenses; bundled Cormorant Garamond and Noto Sans font licenses are in
`ull/assets/fonts/`.
