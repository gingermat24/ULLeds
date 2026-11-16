# Future improvements

Product work that is known, deliberately deferred, and not yet scheduled. The
README describes current behavior; this file describes where it should go.

## Screen Sync

- **Multi-monitor display selection.** Screen Sync currently samples whichever
  display Windows marks as primary. Let users choose the display to follow, or
  combine several displays into one strip mapping.
- **Widescreen detection edge cases.** 1.0.98 made detection tolerant of
  near-black bars and dark scenes, separated stable detection from the prompt
  policy, and stopped re-prompting for a ratio already accepted in the session.
  Still missing: clearing an accepted picture area requires stopping and starting
  Screen Sync, detection only covers 1.78–2.6:1, and prompt timing is fixed
  rather than adjustable.

## Spotify Sync

- **Per-app audio capture.** Spotify Sync analyzes the Windows desktop mix,
  because Electron's desktop capture exposes no per-app audio source. 1.0.99
  only reads that mix while Spotify reports playback, so other apps no longer
  animate the strip while nothing is playing. True Spotify-only capture needs
  native WASAPI process loopback (`ActivateAudioInterfaceAsync` with
  `AUDIOCLIENT_ACTIVATION_TYPE_PROCESS_LOOPBACK`) and a PCM delivery path into
  the renderer; it is not scheduled.

## Device and hardware

- **Broader controller support.** Only the documented HID protocol is
  supported. Additional controllers need their protocols documented and
  validated before they are listed, so compatibility claims stay honest.
- **Per-controller quirks.** Keep recording controllers that report the
  supported IDs but need different brightness or color-order handling, so the
  Device page can suggest the right defaults.

## App experience

- **Tray quick actions and optional global hotkeys.** Switch to Solid, pause
  sync, or toggle the phone remote without opening the window.
- **First-run guidance when no controller is found.** Explain the supported
  hardware and what to check instead of only reporting that nothing was
  detected.
- **User-defined patterns.** Simple per-LED sequences or short timelines,
  stored with scenes.

## Out of scope

- **macOS and Linux.** Screen capture and the media helper are Windows-specific,
  and the controller protocol is validated only on Windows.
- **Cloud accounts, telemetry, or uploading captures.** Local-only behavior is a
  product decision, not a missing feature.
