"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  analyzeSpotifySpectrum,
  createSpotifyAnalyzer,
  createSpotifyGenreDetector,
  createSpotifyReactiveColors,
  createSpotifySyncColors,
  isSpotifyPlaybackActive,
  lookupSpotifyGenres,
  silentSpotifyLevels,
  smoothSpotifyLevels,
  updateSpotifyGenreDetector
} = require("../spotify-sync");

test("Spotify Sync extracts cover-art colors and assigns artwork colors across the whole strip", () => {
  const pixels = new Uint8ClampedArray(4 * 4 * 4);
  for (let pixel = 0; pixel < 16; pixel += 1) {
    const color = pixel < 12 ? [240, 24, 32] : pixel < 14 ? [24, 48, 240] : [24, 220, 48];
    pixels.set([...color, 255], pixel * 4);
  }

  const colors = createSpotifySyncColors(pixels, 16);

  assert.equal(colors.length, 16);
  assert.ok(colors.every((color) => color !== "#000000"));
  assert.ok(colors.filter((color) => color === "#f01820").length > colors.filter((color) => color === "#1830f0").length);
  assert.ok(colors.includes("#1830f0"));
  assert.ok(colors.includes("#18dc30"));
});

test("Spotify Sync rejects invalid cover-art pixels and LED counts", () => {
  assert.throws(() => createSpotifySyncColors([255, 0, 0, 255], 4), TypeError);
  assert.throws(() => createSpotifySyncColors(new Uint8ClampedArray(5), 4), TypeError);
  assert.throws(() => createSpotifySyncColors(new Uint8ClampedArray(4), 0), TypeError);
});

test("Spotify Sync preserves small accent colors from mostly neutral cover art", () => {
  const pixels = new Uint8ClampedArray(1000 * 4);
  for (let index = 0; index < 1000; index += 1) {
    const color = index < 900 ? [248, 248, 248]
      : index < 950 ? [244, 44, 156]
        : [32, 96, 240];
    pixels.set([...color, 255], index * 4);
  }

  const colors = createSpotifySyncColors(pixels, 20);
  const count = (color) => colors.filter((candidate) => candidate === color).length;

  assert.ok(count("#f8f8f8") >= 5, "dominant neutral color should remain present");
  assert.ok(count("#f42c9c") >= 5, "small pink accent should reach multiple LEDs");
  assert.ok(count("#2060f0") >= 5, "small blue accent should reach multiple LEDs");
});

test("Spotify Sync reacts to live audio while cover art stays unchanged", () => {
  const artwork = ["#d82040", "#2548d8", "#e4c228"];
  const quiet = createSpotifyReactiveColors(
    artwork,
    { bass: 0.02, mid: 0.01, treble: 0.01, energy: 0.02 },
    24,
    0
  );
  const beat = createSpotifyReactiveColors(
    artwork,
    { bass: 0.95, mid: 0.72, treble: 0.48, energy: 0.8 },
    24,
    0
  );

  assert.equal(quiet.length, 24);
  assert.equal(beat.length, 24);
  assert.notDeepEqual(beat, quiet);
  assert.ok(new Set(beat).size > 1, "audio-reactive frame should spread colors across the strip");
});

test("Spotify Sync responds to bass and drifts the palette deterministically", () => {
  const artwork = ["#d82040", "#2548d8", "#e4c228"];
  const levels = (bass) => ({ bass, mid: 0.4, treble: 0.3, energy: 0.4 });
  const quiet = createSpotifyReactiveColors(artwork, levels(0.1), 24, 0, 100);
  const beat = createSpotifyReactiveColors(artwork, levels(0.9), 24, 0, 100);
  const luminance = (color) => color.slice(1).match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16))
    .reduce((sum, channel) => sum + channel, 0);
  const drifted = createSpotifyReactiveColors(artwork, levels(0.9), 24, 601, 100);

  assert.ok(luminance(beat[5]) > luminance(quiet[5]), "bass should increase the audio-driven output");
  assert.notDeepEqual(drifted, beat, "palette drift should change colors over time");
  assert.deepEqual(createSpotifyReactiveColors(artwork, levels(0.9), 24, 601, 100), drifted);
});

test("Spotify audio response accents band-specific attacks without chaotic color jumps", () => {
  const color = ["#808080"];
  const quiet = {
    bass: 0,
    mid: 0,
    treble: 0,
    energy: 0,
    spectrum: Array(12).fill(0),
    onsets: { bass: 0, mid: 0, treble: 0 }
  };
  const trebleOnly = {
    bass: 0,
    mid: 0,
    treble: 1,
    energy: 0.2,
    spectrum: [...Array(6).fill(0), ...Array(6).fill(1)],
    onsets: { bass: 0, mid: 0, treble: 1 }
  };
  const bassBeat = { ...quiet, bass: 1, energy: 0.45, onsets: { bass: 1, mid: 0, treble: 0 } };
  const restingColors = createSpotifyReactiveColors(color, quiet, 12, 0);
  const trebleColors = createSpotifyReactiveColors(color, trebleOnly, 12, 30);
  const beatColors = createSpotifyReactiveColors(color, bassBeat, 12, 300);
  const brightness = (frameColor) => Number.parseInt(frameColor.slice(1), 16);

  assert.ok(trebleColors.some((frameColor) => frameColor !== restingColors[0]));
  assert.ok(beatColors.every((frameColor) => brightness(frameColor) >= brightness(restingColors[0]) + 12));
  assert.ok(new Set(beatColors).size > 1, "the spectrum should produce a spatial equalizer response");
  assert.ok(beatColors.every((frameColor) => brightness(frameColor) <= brightness("#b0b0b0")));
});

test("Spotify audio analysis detects a fresh bass hit but not a sustained note", () => {
  const spectrumFrame = (bassDecibels) => {
    const frame = new Float32Array(1024).fill(-120);
    frame[4] = bassDecibels;
    return frame;
  };
  let time = 0;
  const analyzer = createSpotifyAnalyzer(() => time);
  const analyze = (frame) => {
    time += 1 / 60;
    return analyzeSpotifySpectrum(frame, 48000, 2048, null, analyzer);
  };
  const previous = analyze(spectrumFrame(-55));
  const hit = analyze(spectrumFrame(-25));
  const sustained = analyze(spectrumFrame(-25));
  const restingLevels = smoothSpotifyLevels(silentSpotifyLevels(), previous, 16);
  const hitLevels = smoothSpotifyLevels(restingLevels, hit, 16);
  const sustainedLevels = smoothSpotifyLevels(hitLevels, sustained, 16);
  const render = (levels) => createSpotifyReactiveColors(["#404040"], levels, 12, 0, 100)[0];
  const brightness = (color) => Number.parseInt(color.slice(1), 16);

  assert.ok(hit.onsets.bass > 0.5, "a sharp bass increase should register as an attack");
  assert.equal(sustained.onsets.bass, 0, "a sustained note should not retrigger as a new hit");
  assert.ok(
    brightness(render(hitLevels)) >= brightness(render(restingLevels)) + 8,
    "a bass attack should produce a visible LED accent"
  );
  assert.ok(sustainedLevels.onsets.bass < hitLevels.onsets.bass);
});

test("Spotify genre hints adapt responses across common styles and aliases", () => {
  const artwork = ["#d82040", "#2548d8", "#e4c228"];
  const levels = {
    bass: 0.2,
    mid: 0.2,
    treble: 0.2,
    energy: 0.2,
    spectrum: Array(12).fill(0.2),
    onsets: { bass: 0.7, mid: 0.7, treble: 0.7 }
  };
  const neutral = createSpotifyReactiveColors(artwork, levels, 24, 0.1, 100);
  const response = (genre) => createSpotifyReactiveColors(artwork, levels, 24, 0.1, 100, [genre]);
  const genres = [
    "Pop", "K-pop", "Trap", "Drum and bass", "Rock", "Metal", "Punk",
    "Jazz", "R&B", "Blues", "Country", "Bluegrass", "Classical", "Opera",
    "Ambient", "Lo-fi", "Reggae", "Ska", "Salsa", "Reggaeton", "Afrobeat",
    "Gospel", "Worship"
  ];
  const genreResponses = genres.map(response);

  for (const colors of genreResponses) assert.notDeepEqual(colors, neutral);
  assert.deepEqual(response("K-pop"), response("Pop"));
  assert.deepEqual(response("Bluegrass"), response("Country"));
  assert.deepEqual(response("Lo-fi"), response("Ambient"));
  assert.notDeepEqual(response("Trap"), response("Rock"));
  assert.notDeepEqual(response("Jazz"), response("Country"));
});

test("Spotify genres are looked up by matching track and artist, then cached", async () => {
  const countries = [];
  const fetchImpl = async (url) => {
    const query = new URL(url).searchParams;
    if (query.get("term")?.includes("Blue Night")) countries.push(query.get("country"));
    const results = query.get("country") === "it"
      ? [
          { trackName: "Blue Night", artistName: "Betty Boop", primaryGenreName: "Cartoon" },
          { trackName: "Another Song", artistName: "Lead Artist", primaryGenreName: "Pop" }
        ]
      : [{ trackName: "Blue Night - Remastered", artistName: "Lead Artist", primaryGenreName: "Hip-Hop/Rap" }];
    return { ok: true, json: async () => ({ results }) };
  };
  const genres = await lookupSpotifyGenres(
    "Blue Night (feat. Guest) - Remastered",
    "Lead Artist feat. Guest",
    { fetchImpl }
  );

  assert.deepEqual(genres, ["Hip-Hop/Rap"]);
  assert.deepEqual(countries, ["it", "us"]);
  assert.deepEqual(await lookupSpotifyGenres(
    "Blue Night (feat. Guest) - Remastered",
    "Lead Artist feat. Guest",
    { fetchImpl: async () => { throw new Error("cached result should avoid another request"); } }
  ), ["Hip-Hop/Rap"]);
  assert.deepEqual(countries, ["it", "us"]);
});

test("Spotify genre lookup matches Italian titles when media metadata omits the article", async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({
      results: [{
        trackName: "VIVERE PER FARE I SOLDI/FARE I SOLDI PER VIVERE",
        artistName: "LILCR",
        primaryGenreName: "Hip-Hop/Rap"
      }]
    })
  });

  assert.deepEqual(await lookupSpotifyGenres(
    "VIVERE PER FARE SOLDI/FARE SOLDI PER VIVERE",
    "LILCR",
    { fetchImpl }
  ), ["Hip-Hop/Rap"]);
});

test("Spotify genre lookup searches the artist catalog when title search omits a track", async () => {
  const requestedUrls = [];
  const fetchImpl = async (url) => {
    requestedUrls.push(new URL(url));
    const query = requestedUrls.at(-1).searchParams;
    if (query.get("entity") === "song" && query.has("term")) {
      return { ok: true, json: async () => ({ results: [] }) };
    }
    if (query.get("entity") === "musicArtist") {
      return {
        ok: true,
        json: async () => ({
          results: [{ artistId: 1598102954, artistName: "Niky Savage" }]
        })
      };
    }
    if (query.get("id") === "1598102954") {
      return {
        ok: true,
        json: async () => ({
          results: [
            { trackName: "WAO", artistName: "Niky Savage & BLSSD", primaryGenreName: "Hip-Hop/Rap" },
            { trackName: "Another Song", artistName: "Niky Savage", primaryGenreName: "Pop" }
          ]
        })
      };
    }
    throw new Error(`Unexpected iTunes request: ${url}`);
  };

  assert.deepEqual(await lookupSpotifyGenres("WAO", "Niky Savage", { fetchImpl }), ["Hip-Hop/Rap"]);
  assert.ok(requestedUrls.some((url) => url.searchParams.get("id") === "1598102954"));
});

test("Spotify genre lookup returns no match and retries after request failures", async () => {
  let attempts = 0;
  const title = "Uncached Lookup Failure Track";
  const artist = "Uncached Lookup Failure Artist";
  assert.deepEqual(await lookupSpotifyGenres(title, artist, {
    fetchImpl: async () => {
      attempts += 1;
      throw new Error("offline");
    }
  }), []);
  assert.deepEqual(await lookupSpotifyGenres(title, artist, {
    fetchImpl: async (url) => {
      attempts += 1;
      return {
        ok: true,
        json: async () => ({
          results: [{ trackName: title, artistName: artist, primaryGenreName: "Electronic" }]
        })
      };
    }
  }), ["Electronic"]);
  assert.equal(attempts, 2);
});

test("the compatibility genre detector does not guess from audio levels", () => {
  assert.deepEqual(createSpotifyGenreDetector(), {});
  assert.equal(updateSpotifyGenreDetector(createSpotifyGenreDetector(), {
    bass: 0.9,
    mid: 0.2,
    treble: 0.1,
    energy: 0.7,
    onsets: { bass: 1, mid: 0, treble: 0 },
    impact: 1
  }, 1000), null);
  assert.throws(() => updateSpotifyGenreDetector({}, null, 50), /genre detection data is invalid/i);
});

test("Spotify audio analysis separates bass, mids, and treble energy", () => {
  let time = 0;
  const analyzer = createSpotifyAnalyzer(() => time);
  const silence = new Float32Array(1024).fill(-Infinity);
  const spectrum = new Float32Array(1024).fill(-Infinity);
  spectrum[4] = -18;
  spectrum[20] = -24;
  spectrum[150] = -30;

  time += 1 / 60;
  analyzeSpotifySpectrum(silence, 48000, 2048, null, analyzer);
  time += 1 / 60;
  const levels = analyzeSpotifySpectrum(spectrum, 48000, 2048, null, analyzer);

  assert.ok(levels.bass > 0.5);
  assert.ok(levels.mid > 0.5);
  assert.ok(levels.treble > 0.5);
  assert.deepEqual(levels.onsets, { bass: 1, mid: 1, treble: 1 });
  assert.ok(levels.energy > 0);
  assert.equal(levels.spectrum.length, 12);
  assert.ok(levels.spectrum.every((level) => Number.isFinite(level) && level >= 0 && level <= 1));
});

test("Spotify audio smoothing softens sudden changes and releases more gradually", () => {
  const quiet = { bass: 0, mid: 0, treble: 0, energy: 0, spectrum: Array(12).fill(0) };
  const loud = { bass: 1, mid: 1, treble: 1, energy: 1, spectrum: Array(12).fill(1) };
  const attack = smoothSpotifyLevels(quiet, loud, 16);
  const release = smoothSpotifyLevels(attack, quiet, 16);

  assert.ok(attack.energy > 0 && attack.energy < 0.5);
  assert.ok(release.energy > 0 && release.energy < attack.energy);
  assert.throws(() => smoothSpotifyLevels(quiet, loud, -1), TypeError);
});

test("Spotify audio meter levels span a visible range from quiet to loud signals", () => {
  let time = 0;
  const analyzer = createSpotifyAnalyzer(() => time);
  const analyzeBass = (decibels) => {
    const frequencyData = new Float32Array(1024).fill(-Infinity);
    frequencyData[4] = decibels;
    time += 1 / 60;
    return analyzeSpotifySpectrum(frequencyData, 48000, 2048, null, analyzer).bass;
  };
  const quiet = analyzeBass(-65);
  const moderate = analyzeBass(-48);
  const loud = analyzeBass(-30);

  assert.ok(quiet < moderate);
  assert.ok(moderate < loud);
  assert.ok(loud - quiet > 0.5);
});

test("Spotify audio response control scales the color movement", () => {
  const artwork = ["#d82040", "#2548d8", "#e4c228"];
  const levels = { bass: 0.95, mid: 0.72, treble: 0.48, energy: 0.8 };
  const still = createSpotifyReactiveColors(artwork, levels, 24, 0.25, 0);
  const responsive = createSpotifyReactiveColors(artwork, levels, 24, 0.25, 100);

  assert.notDeepEqual(responsive, still);
  assert.throws(() => createSpotifyReactiveColors(artwork, levels, 24, 0, -1), TypeError);
  assert.throws(() => createSpotifyReactiveColors(artwork, levels, 24, 0, 101), TypeError);
});

test("Spotify reactive colors reject invalid audio levels and palettes", () => {
  assert.throws(() => createSpotifyReactiveColors([], {}, 8, 0), TypeError);
  assert.throws(() => createSpotifyReactiveColors(["red"], {}, 8, 0), TypeError);
  assert.throws(() => createSpotifyReactiveColors(
    ["#ffffff"],
    { bass: -1, mid: 0, treble: 0, energy: 0 },
    8,
    0
  ), TypeError);
});

test("Spotify audio analysis only follows playback while Spotify is playing", () => {
  assert.equal(isSpotifyPlaybackActive(true, "Playing"), true);
  assert.equal(isSpotifyPlaybackActive(true, "Changing"), true);
  assert.equal(isSpotifyPlaybackActive(true, "Paused"), false);
  assert.equal(isSpotifyPlaybackActive(true, "Stopped"), false);
  assert.equal(isSpotifyPlaybackActive(true, "Closed"), false);
  assert.equal(isSpotifyPlaybackActive(true, "Opened"), false);
  assert.equal(isSpotifyPlaybackActive(true, "  paused "), false);
  assert.equal(isSpotifyPlaybackActive(false, "Playing"), false);
  assert.equal(isSpotifyPlaybackActive(true, null), true);
});

test("silent Spotify levels rest the strip on the cover-art palette", () => {
  assert.deepEqual(silentSpotifyLevels(4), {
    bass: 0,
    mid: 0,
    treble: 0,
    energy: 0,
    spectrum: [0, 0, 0, 0],
    onsets: { bass: 0, mid: 0, treble: 0 },
    impact: 0
  });
  assert.equal(silentSpotifyLevels().spectrum.length, 12);
  assert.throws(() => silentSpotifyLevels(0), TypeError);
  assert.throws(() => silentSpotifyLevels(65), TypeError);
  assert.throws(() => silentSpotifyLevels(4.5), TypeError);
});

test("pure audio noise causes no false beats or visible color flicker", () => {
  const palette = ["#d82040", "#2548d8", "#e4c228"];
  const toRgb = (color) => color.slice(1).match(/.{2}/g).map((channel) => Number.parseInt(channel, 16));
  const averageColorDelta = (left, right) => {
    let total = 0;
    for (let index = 0; index < left.length; index += 1) {
      const leftRgb = toRgb(left[index]);
      const rightRgb = toRgb(right[index]);
      for (let channel = 0; channel < leftRgb.length; channel += 1) {
        total += Math.abs(leftRgb[channel] - rightRgb[channel]) / 3;
      }
    }
    return total / left.length;
  };
  const quiet = silentSpotifyLevels();
  let time = 0;
  const analyzer = createSpotifyAnalyzer(() => time);
  let levels = quiet;
  let previous = createSpotifyReactiveColors(palette, levels, 75, 0, 100);
  let maximumDelta = 0;
  let falseBeats = 0;
  let randomState = 17;
  const random = () => {
    randomState = (randomState * 1664525 + 1013904223) >>> 0;
    return randomState / 0x100000000;
  };

  for (let frame = 1; frame <= 1800; frame += 1) {
    time = frame / 60;
    const frequencyData = Float32Array.from({ length: 1024 }, () => -80 + random() * 2);
    const measured = analyzeSpotifySpectrum(frequencyData, 48000, 2048, null, analyzer);
    if (Object.values(measured.onsets).some((onset) => onset > 0.05)) falseBeats += 1;
    levels = smoothSpotifyLevels(levels, measured, 1000 / 60);
    const colors = createSpotifyReactiveColors(palette, levels, 75, frame / 60, 100);
    maximumDelta = Math.max(maximumDelta, averageColorDelta(previous, colors));
    previous = colors;
  }

  assert.equal(falseBeats, 0);
  assert.ok(maximumDelta < 2, `pure noise changed average LED color by ${maximumDelta.toFixed(1)} RGB levels`);
});

test("Spotify palette drift is repeatable for unchanged audio at the same time", () => {
  const palette = ["#d82040", "#2548d8", "#e4c228"];
  const levels = { bass: 0.3, mid: 0.2, treble: 0.1, energy: 0.22, spectrum: Array(12).fill(0.2) };
  const initial = createSpotifyReactiveColors(palette, levels, 75, 0, 100);
  const later = createSpotifyReactiveColors(palette, levels, 75, 601, 100);

  assert.notDeepEqual(later, initial);
  assert.deepEqual(createSpotifyReactiveColors(palette, levels, 75, 601, 100), later);
});
