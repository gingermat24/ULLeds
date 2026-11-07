# ULLeds Performance Profile

Profile date: 2026-11-07

This report records the baseline and the Screen Sync capture-resolution experiment. Use it as the comparison point for future performance work; it does not claim that every bug or performance issue has been eliminated.

## Baseline

The installed app was running Screen Sync at 30 FPS with a 75-LED strip. The primary display was 2560 x 1440. A WPR CPU trace was requested for 15 seconds; the recorded event interval was about 36.3 seconds.

| Process or thread | CPU time in trace | Share reported by PerfView |
|---|---:|---:|
| ULLeds main (PID 19436) | 6.128 s | 8.2% |
| ULLeds renderer (PID 6284) | 6.691 s | 9.0% |
| ULLeds GPU (PID 30808) | 6.335 s | 8.5% |
| Windows Desktop Window Manager | 6.741 s | 9.0% |

The main process's `desktopCaptureThread` accumulated 2.952 CPU seconds; the renderer's `CrRendererMain` accumulated 3.208 seconds. These thread values are subsets of their process totals and must not be added again. The ULLeds main, renderer, and GPU processes together accounted for about 25.6% of the sampled CPU.

The trace contained 80,008 CPU samples, 1,588,717 stack walks, and 4,211,070 events, with zero lost events. Stack attribution was incomplete, so the trace identifies the capture/rendering pipeline as the area to investigate but not a specific JavaScript function.

Previously measured isolated costs were small:

| Operation | p50 | p95 |
|---|---:|---:|
| 320 x 180 LED color sampling, 75 LEDs | 0.0392 ms | 0.1313 ms |
| Screen Sync frame construction | 0.0483 ms | 0.1299 ms |
| Full canvas readback after scaling a 1920 x 1080 source to 320 x 180 | 0.4 ms | 0.7 ms |
| Four narrow edge-strip readbacks | 1.0 ms | 1.7 ms |

This ruled out edge-only readback as an optimization and made capture/compositing a more promising target than JavaScript sampling.

## Capture-resolution experiment

A temporary Electron harness captured the primary display at 30 FPS, sampled the same 75 LED edge positions into a 320-pixel canvas, and measured the Electron process tree. Color comparisons used pairs with matching `captureTime`; the harness stored only aggregate statistics, not screen frames or screenshots.

| Capture ceiling | Stream size from 2560 x 1440 | Electron process-tree CPU in 15 s | Sampling p50 / p95 | Color comparison |
|---|---:|---:|---:|---|
| Full resolution | 2560 x 1440 | 6.31 s in the paired 1280 run | 15.6 / 20.6 ms | Reference |
| 320 px | 320 x 180 | 3.27 s in one paired run (63% below that run's full-resolution result) | 0.5 / 0.9 ms | Color error varied substantially by scene; rejected |
| 640 px | 640 x 360 | 3.23 s in its paired run (35% below that run's full-resolution result) | 1.2 / 1.8 ms | Error also varied substantially by scene |
| 960 px | 960 x 540 | Not measured separately | Not measured separately | One comparison had p95 channel error 38/255; not selected |
| 1280 px | 1280 x 720 | 3.25 s in the paired run (48% below that run's full-resolution result) | 3.3 / 4.4 ms | Two comparisons had p95 per-LED channel error 2/255 |

The 1280-pixel color comparisons covered 338 and 340 matched frames. Their mean absolute channel errors were 1.52 and 0.74; p95 absolute channel error was 2 in both. The fractions of LED samples with a maximum channel error above 10 were 2.25% and 1.05%; above 25, 1.46% and 0.16%. There were occasional larger outliers (maximum errors 82 and 53), so equivalence is not exact and may depend on the displayed content.

The 320- and 640-pixel comparisons varied more between runs, including worse p95 errors on another captured scene. The 1280-pixel cap was chosen as the more conservative compromise: on a 2560 x 1440 source it reduces capture pixels by 75%, retained 30 FPS in the harness, kept the app's existing 320-pixel sampling canvas unchanged, and showed the most stable measured color error among the tested reduced resolutions.

The process-tree CPU numbers are local harness measurements, not guaranteed percentages for the installed ULLeds app. The full-resolution CPU baseline varied between runs (4.95 to 8.89 seconds in the 320/640 trials and 6.31 seconds in the 1280 trial). DWM's per-run CPU delta was unavailable from the simple process sampler, so no compositor reduction is claimed for the before/after harness comparison.

## Change and validation

Screen Sync now requests a maximum capture width and height of 1280 pixels while retaining the existing 320-pixel sampling canvas and selected FPS. Lower-resolution displays are not upscaled by these maximum constraints.

The focused and full Node test suites passed after the change: 78 tests, 0 failures. The 1280-pixel behavior was exercised against the real Electron desktop-capture API in the temporary harness.

## Future use

- Treat this profile as a local baseline, not a universal result across displays, GPUs, refresh rates, or media.
- For a future comparison, repeat with the same screen content, FPS, display, and measurement interval; inspect both full-screen and ordinary desktop use.
- If users report a visible color change, test reverting the capture cap before changing sampling or HID behavior.
- Profile other work only after measuring the user-visible scenario; do not infer a hot function from process totals alone.
- No captured screen imagery or raw ETL trace is retained in the repository.
