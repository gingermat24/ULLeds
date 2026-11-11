"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createDesktopCaptureConstraints,
  createDesktopAudioCaptureConstraints,
  isSampleFrameDue,
  createMovieFormatPromptGate,
  createLetterboxStability,
  detectLetterboxAspectRatio,
  createLatestFrameSender,
  sampleStripColors
} = require("../screen-sync");
const { allocateEdgeIndices, createStripLayout } = require("../strip-layout");

test("screen sync bounds desktop capture resolution and honors the requested frame rate", () => {
  assert.deepEqual(createDesktopCaptureConstraints("screen:1:0", 30), {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: "screen:1:0",
        maxFrameRate: 30,
        maxWidth: 1280,
        maxHeight: 1280
      }
    }
  });
});

test("Spotify desktop loopback uses a tiny primary-display capture with audio enabled", () => {
  assert.deepEqual(createDesktopAudioCaptureConstraints("screen:1:0"), {
    audio: { mandatory: { chromeMediaSource: "desktop" } },
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: "screen:1:0",
        maxFrameRate: 1,
        maxWidth: 16,
        maxHeight: 16
      }
    }
  });
  assert.throws(() => createDesktopAudioCaptureConstraints(""), TypeError);
});

test("30 FPS sampling tolerates capture timestamp jitter without halving samples", () => {
  const callbackTimes = [];
  let timestamp = 0;
  for (let frame = 0; frame < 30; frame += 1) {
    timestamp += frame % 2 === 0 ? 32 : 35;
    callbackTimes.push(timestamp);
  }
  let lastSample = 0;
  let sampled = 0;
  for (const now of callbackTimes) {
    if (!isSampleFrameDue(lastSample, now, 30)) continue;
    sampled += 1;
    lastSample = now;
  }
  assert.ok(sampled >= 28);

  lastSample = 0;
  sampled = 0;
  for (const now of callbackTimes) {
    if (!isSampleFrameDue(lastSample, now, 15)) continue;
    sampled += 1;
    lastSample = now;
  }
  assert.equal(sampled, 15);
});

test("screen sync sends the newest sampled frame as soon as the active write finishes", async () => {
  let colors = ["#111111"];
  let finishFirstSend;
  const firstSend = new Promise((resolve) => { finishFirstSend = resolve; });
  const sent = [];
  const sender = createLatestFrameSender({
    send: async (frame) => {
      sent.push(frame[0]);
      if (sent.length === 1) await firstSend;
    },
    isActive: () => true,
    getColors: () => colors,
    onError: (error) => { throw error; }
  });

  const activeSend = sender();
  await Promise.resolve();
  colors = ["#222222"];
  await sender();
  finishFirstSend();
  await activeSend;
  await sender();

  assert.deepEqual(sent, ["#111111", "#222222"]);
});

test("screen sync does not invent a color from a one-pixel highlight", () => {
  const width = 5;
  const height = 5;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let offset = 0; offset < pixels.length; offset += 4) {
    pixels.set([0, 0, 0, 255], offset);
  }
  pixels.set([255, 0, 0, 255], (1 * width + 1) * 4);
  const colors = sampleStripColors(pixels, width, height, {
    ledCount: 1,
    indices: { top: [0] }
  });

  assert.equal(["#000000", "#ff0000"].includes(colors[0]), true);
});

test("screen sync samples one color for each physical LED position", () => {
  const pixels = new Uint8ClampedArray(16 * 12 * 4);
  for (let index = 0; index < pixels.length; index += 4) {
    pixels.set([24, 96, 180, 255], index);
  }
  const layout = allocateEdgeIndices(75, 3);
  const colors = sampleStripColors(pixels, 16, 12, layout);
  assert.equal(colors.length, 75);
  assert.equal(colors.every((color) => color === "#1860b4"), true);
  assert.throws(() => sampleStripColors(pixels, 15, 12, layout), /image and strip layout/);
});

test("legacy profiles sample the same pixels before and after the position migration", () => {
  const width = 160;
  const height = 90;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      pixels.set([x, y, (x + 3 * y) % 256, 255], (y * width + x) * 4);
    }
  }

  for (let edgeCount = 1; edgeCount <= 4; edgeCount += 1) {
    for (let installationMethod = 0; installationMethod <= 1; installationMethod += 1) {
      const oldLayout = allocateEdgeIndices(75, edgeCount, installationMethod);
      const migratedLayout = createStripLayout(75, { edgeCount, installationMethod });
      assert.deepEqual(
        sampleStripColors(pixels, width, height, migratedLayout),
        sampleStripColors(pixels, width, height, oldLayout)
      );
    }
  }
});

test("screen sync samples manually placed coordinates for every physical LED", () => {
  const width = 100;
  const height = 100;
  const pixels = new Uint8ClampedArray(width * height * 4);
  const colors = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0]
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const colorIndex = (y >= 50 ? 2 : 0) + (x >= 50 ? 1 : 0);
      pixels.set([...colors[colorIndex], 255], (y * width + x) * 4);
    }
  }

  const sampled = sampleStripColors(pixels, width, height, {
    ledCount: 4,
    indices: { top: [0], right: [1], bottom: [2], left: [3] },
    positions: [
      { x: 25, y: 25, edge: "top" },
      { x: 75, y: 25, edge: "right" },
      { x: 25, y: 75, edge: "bottom" },
      { x: 75, y: 75, edge: "left" }
    ]
  });

  assert.deepEqual(sampled, ["#ff0000", "#00ff00", "#0000ff", "#ffff00"]);
});

test("screen sync rejects malformed manual positions instead of silently reverting to edges", () => {
  const pixels = new Uint8ClampedArray(4 * 4 * 4);
  assert.throws(() => sampleStripColors(pixels, 4, 4, {
    ledCount: 1,
    indices: { top: [0] },
    positions: [{ x: 50, y: 50, edge: "diagonal" }]
  }), /image and strip layout/);
});

test("optimized screen sampling preserves the closest representative color", () => {
  let seed = 193;
  for (let frame = 0; frame < 20; frame += 1) {
    const width = 30;
    const height = 30;
    const pixels = new Uint8ClampedArray(width * height * 4);
    for (let offset = 0; offset < pixels.length; offset += 4) {
      seed = (seed * 16807) % 2147483647;
      const red = seed % 256;
      seed = (seed * 16807) % 2147483647;
      const green = seed % 256;
      seed = (seed * 16807) % 2147483647;
      pixels.set([red, green, seed % 256, 255], offset);
    }

    const samples = [];
    for (let y = 1; y <= 3; y += 1) {
      for (let x = 14; x <= 16; x += 1) {
        const offset = (y * width + x) * 4;
        samples.push({
          red: pixels[offset],
          green: pixels[offset + 1],
          blue: pixels[offset + 2],
          distance: (x - 15) ** 2 + (y - 2) ** 2
        });
      }
    }
    const expected = samples.reduce((best, candidate) => {
      const cost = samples.reduce((sum, sample) =>
        sum +
          (candidate.red - sample.red) ** 2 +
          (candidate.green - sample.green) ** 2 +
          (candidate.blue - sample.blue) ** 2, 0);
      const bestCost = samples.reduce((sum, sample) =>
        sum +
          (best.red - sample.red) ** 2 +
          (best.green - sample.green) ** 2 +
          (best.blue - sample.blue) ** 2, 0);
      return cost < bestCost || (cost === bestCost && candidate.distance < best.distance)
        ? candidate
        : best;
    });
    const colors = sampleStripColors(pixels, width, height, {
      ledCount: 1,
      indices: { top: [0] }
    });
    const expectedColor = `#${[expected.red, expected.green, expected.blue]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")}`;
    assert.equal(colors[0], expectedColor);
  }
});

test("screen sync samples a widescreen picture rectangle instead of its letterbox bars", () => {
  const width = 160;
  const height = 90;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const inPicture = y >= 11 && y < 79;
      pixels.set(inPicture ? [24, 96, 180, 255] : [0, 0, 0, 255], (y * width + x) * 4);
    }
  }

  const colors = sampleStripColors(pixels, width, height, {
    ledCount: 4,
    indices: { top: [0], right: [1], bottom: [2], left: [3] }
  }, 2.35);

  assert.deepEqual(colors, Array(4).fill("#1860b4"));
});

test("automatic widescreen detection keeps top LEDs inside the picture despite isolated bar noise", () => {
  const width = 320;
  const height = 180;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      pixels.set(y >= 22 && y < 158 ? [24, 96, 180, 255] : [0, 0, 0, 255],
        (y * width + x) * 4);
    }
  }
  for (const sample of [4, 18]) {
    const x = Math.round((sample + 0.5) / 24 * (width - 1));
    for (const y of [10, height - 11]) {
      pixels.set([255, 255, 255, 255], (y * width + x) * 4);
    }
  }
  const detectedRatio = detectLetterboxAspectRatio(pixels, width, height);
  const layout = {
    ledCount: 4,
    indices: { top: [0], right: [1], bottom: [2], left: [3] }
  };
  const automaticColors = sampleStripColors(pixels, width, height, layout, detectedRatio);
  const savedWidescreenColors = sampleStripColors(pixels, width, height, layout, 2.35);

  assert.equal(detectedRatio, 2.35);
  assert.equal(automaticColors[0], "#1860b4");
  assert.deepEqual(automaticColors, savedWidescreenColors);
});

test("movie-area detection recognizes stable 2.35:1 bars and ignores full-screen content", () => {
  const width = 320;
  const height = 180;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      pixels.set(y >= 22 && y < 158 ? [30, 120, 210, 255] : [0, 0, 0, 255],
        (y * width + x) * 4);
    }
  }
  assert.equal(detectLetterboxAspectRatio(pixels, width, height), 2.35);

  pixels.fill(255);
  assert.equal(detectLetterboxAspectRatio(pixels, width, height), null);
  pixels.fill(0);
  for (let offset = 3; offset < pixels.length; offset += 4) pixels[offset] = 255;
  assert.equal(detectLetterboxAspectRatio(pixels, width, height), null);
});

test("movie-area detection requires stable bars and only reports a format once", () => {
  const detector = createLetterboxStability();
  assert.equal(detector.update(2.35, 0), null);
  assert.equal(detector.update(2.36, 900), null);
  assert.equal(detector.update(2.35, 1000), 2.35);
  assert.equal(detector.update(2.35, 2000), null);
  assert.equal(detector.update(null, 3000), null);
  assert.equal(detector.update(null, 4500), null);
  assert.equal(detector.update(2.35, 4600), null);
  assert.equal(detector.update(2.35, 5600), 2.35);
});

test("movie format prompt gate suppresses repeat ratios for the whole sync session", () => {
  const gate = createMovieFormatPromptGate();
  assert.equal(gate.shouldPrompt(2.35), true);
  assert.equal(gate.shouldPrompt(2.35), false);
  assert.equal(gate.shouldPrompt(2.39), false);
  assert.equal(gate.shouldPrompt(2.44), false);
  assert.equal(gate.shouldPrompt(2.20), true);
  assert.equal(gate.shouldPrompt(2.35), false);
  gate.reset();
  assert.equal(gate.shouldPrompt(2.35), true);
  assert.throws(() => gate.shouldPrompt(null), TypeError);
});

test("movie-area detection reports when bars have stably disappeared", () => {
  const detector = createLetterboxStability({ stableDuration: 0, disappearanceDuration: 1500 });
  assert.equal(detector.update(2.35, 0), null);
  assert.equal(detector.update(2.35, 1), 2.35);
  assert.equal(detector.isMissingStable(), false);
  assert.equal(detector.update(null, 100), null);
  assert.equal(detector.update(null, 1599), null);
  assert.equal(detector.isMissingStable(), false);
  assert.equal(detector.update(null, 1600), null);
  assert.equal(detector.isMissingStable(), true);
  assert.equal(detector.update(2.35, 1700), null);
  assert.equal(detector.isMissingStable(), false);
});

test("screen sync preserves different screen colors at individual LED positions", () => {
  const width = 80;
  const height = 45;
  const pixels = new Uint8ClampedArray(width * height * 4);
  const colors = [
    [255, 0, 0, 255],
    [0, 255, 0, 255],
    [0, 0, 255, 255],
    [255, 255, 0, 255]
  ];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const color = colors[Math.min(3, Math.floor(x / 20))];
      pixels.set(color, (y * width + x) * 4);
    }
  }
  assert.deepEqual(
    sampleStripColors(pixels, width, height, {
      ledCount: 4,
      indices: { top: [0, 1, 2, 3] }
    }),
    ["#ff0000", "#00ff00", "#0000ff", "#ffff00"]
  );
});

test("screen sync maps front-view left and right screen colors to matching strip sides in either direction", () => {
  const width = 80;
  const height = 45;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      pixels.set(x < width / 2 ? [255, 0, 0, 255] : [0, 0, 255, 255], (y * width + x) * 4);
    }
  }

  for (const installationMethod of [0, 1]) {
    const layout = allocateEdgeIndices(75, 3, installationMethod);
    const colors = sampleStripColors(pixels, width, height, layout);
    assert.equal(layout.indices.left.every((index) => colors[index] === "#ff0000"), true);
    assert.equal(layout.indices.right.every((index) => colors[index] === "#0000ff"), true);
    assert.equal(colors[layout.indices.top[0]], "#ff0000");
    assert.equal(colors[layout.indices.top.at(-1)], "#0000ff");
  }
});
