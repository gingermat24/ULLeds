"use strict";

/* ====================================================================== *
 * spotify-sync.js
 *   1. Cover-art palette
 *   2. Audio analysis (adaptive levels, spectral-flux beats, drop impact)
 *   3. Genre lookup by title/artist (iTunes Search API, no key) + profiles
 *   4. LED color rendering
 * ====================================================================== */

const clampSpotify = (value, min, max) => Math.max(min, Math.min(max, value));
const SPECTRUM_BANDS = 12;
const nowSpotify = () =>
  (typeof performance !== "undefined" && performance.now ? performance.now() : Date.now()) / 1000;
const isUnit = (value) => Number.isFinite(value) && value >= 0 && value <= 1;
const toHex = (channels) => `#${channels.map((c) => c.toString(16).padStart(2, "0")).join("")}`;

/* ---------------------------------------------------------------------- *
 * 1. Cover-art palette
 * ---------------------------------------------------------------------- */

function createSpotifySyncColors(pixels, ledCount) {
  if (!(pixels instanceof Uint8ClampedArray) || pixels.length < 4 || pixels.length % 4 !== 0 ||
      !Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253) {
    throw new TypeError("Spotify cover-art pixels and LED count are invalid.");
  }

  const histogram = new Map();
  const hueHistogram = new Map();
  const neutral = { count: 0, red: 0, green: 0, blue: 0 };
  for (let offset = 0; offset < pixels.length; offset += 4) {
    if (pixels[offset + 3] < 128) continue;
    const red = pixels[offset];
    const green = pixels[offset + 1];
    const blue = pixels[offset + 2];
    const key = `${red >> 4}:${green >> 4}:${blue >> 4}`;
    const bucket = histogram.get(key) || { count: 0, red: 0, green: 0, blue: 0 };
    bucket.count += 1;
    bucket.red += red;
    bucket.green += green;
    bucket.blue += blue;
    histogram.set(key, bucket);

    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const delta = maximum - minimum;
    const saturation = maximum === 0 ? 0 : delta / maximum;
    if (saturation < 0.16) {
      neutral.count += 1;
      neutral.red += red;
      neutral.green += green;
      neutral.blue += blue;
      continue;
    }

    let hue;
    if (maximum === red) hue = ((green - blue) / delta) % 6;
    else if (maximum === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue = (hue * 60 + 360) % 360;
    const hueBin = Math.floor(hue / 30);
    const colorBucket = hueHistogram.get(hueBin) || { count: 0, red: 0, green: 0, blue: 0 };
    colorBucket.count += 1;
    colorBucket.red += red;
    colorBucket.green += green;
    colorBucket.blue += blue;
    hueHistogram.set(hueBin, colorBucket);
  }

  const toColor = (bucket) => ({
    count: bucket.count,
    rgb: [
      Math.round(bucket.red / bucket.count),
      Math.round(bucket.green / bucket.count),
      Math.round(bucket.blue / bucket.count)
    ]
  });
  const candidates = [
    ...(neutral.count ? [toColor(neutral)] : []),
    ...[...hueHistogram.values()].sort((a, b) => b.count - a.count).map(toColor),
    ...[...histogram.values()].sort((a, b) => b.count - a.count).map(toColor)
  ];
  const palette = candidates.reduce((colors, candidate) => {
    if (colors.length >= 5) return colors;
    const distinct = colors.every(({ rgb }) =>
      rgb.reduce((distance, channel, index) => distance + (channel - candidate.rgb[index]) ** 2, 0) >= 28 ** 2
    );
    if (distinct) colors.push(candidate);
    return colors;
  }, []);

  if (palette.length === 0) throw new TypeError("Spotify cover art has no opaque pixels.");
  return Array.from({ length: ledCount }, (_, index) =>
    toHex(palette[Math.floor(index / ledCount * palette.length)].rgb)
  );
}

/* ---------------------------------------------------------------------- *
 * 2. Audio analysis
 *
 * Levels are normalized against each song's own recent floor/peak, so a
 * quiet, slow song still swings across the full 0-1 range. Beats come from
 * spectral flux (positive level change) against an adaptive threshold.
 * Works best with analyser.smoothingTimeConstant <= 0.3 and fftSize 2048.
 * ---------------------------------------------------------------------- */

const MIN_FLUX_PEAK = 0.08;

function createBandState() {
  return { ready: false, prev: 0, floor: 0, peak: 0.3, fluxMean: 0, fluxDev: 0.02, fluxPeak: MIN_FLUX_PEAK, lastOnset: -10 };
}

function createSpotifyAnalyzer(clock = nowSpotify) {
  if (typeof clock !== "function") throw new TypeError("Spotify analyzer clock must be a function.");
  return {
    clock,
    time: null,
    bass: createBandState(),
    mid: createBandState(),
    treble: createBandState(),
    bands: Array.from({ length: SPECTRUM_BANDS }, createBandState),
    energyFast: 0,
    energySlow: 0,
    impact: 0,
    lastImpact: -10
  };
}

let defaultAnalyzer = createSpotifyAnalyzer();
function resetSpotifyAnalyzer() {
  defaultAnalyzer = createSpotifyAnalyzer();
}

function updateBand(state, raw, dt, now, refractory) {
  if (!state.ready) {
    state.ready = true;
    state.prev = raw;
    state.floor = raw;
    state.peak = raw + 0.25;
  }
  // Peak: instant attack, ~6 s release. Floor: instant drop, ~20 s rise.
  state.peak = raw > state.peak ? raw : state.peak - (state.peak - raw) * (1 - Math.exp(-dt / 6));
  state.floor = raw < state.floor ? raw : state.floor + (raw - state.floor) * (1 - Math.exp(-dt / 20));
  const range = Math.max(state.peak - state.floor, 0.16);
  const relative = clampSpotify((raw - state.floor) / range, 0, 1);
  const level = clampSpotify(relative * 0.85 + raw * 0.15, 0, 1);

  const flux = Math.max(0, raw - state.prev);
  state.prev = raw;
  const rate = 1 - Math.exp(-dt / 1.2);
  state.fluxMean += (flux - state.fluxMean) * rate;
  state.fluxDev += (Math.abs(flux - state.fluxMean) - state.fluxDev) * rate;
  state.fluxPeak = Math.max(flux, state.fluxPeak * Math.exp(-dt / 4), MIN_FLUX_PEAK);
  const threshold = state.fluxMean + 1.5 * state.fluxDev + 0.03;
  let onset = clampSpotify((flux - threshold) / (state.fluxPeak * 0.6), 0, 1);
  if (onset > 0) {
    if (now - state.lastOnset < refractory) onset = 0;
    else if (onset > 0.05) state.lastOnset = now;
  }
  return { level, onset };
}

function analyzeSpotifySpectrum(frequencyData, sampleRate, fftSize, previous = null, analyzer = defaultAnalyzer) {
  if (!(frequencyData instanceof Float32Array) || frequencyData.length < 2 ||
      !Number.isFinite(sampleRate) || sampleRate <= 0 ||
      !Number.isInteger(fftSize) || fftSize < frequencyData.length * 2 ||
      !analyzer || typeof analyzer.clock !== "function" ||
      (previous !== null && (typeof previous !== "object" ||
        !["bass", "mid", "treble"].every((key) => isUnit(previous[key]))))) {
    throw new TypeError("Spotify audio spectrum data is invalid.");
  }
  const now = analyzer.clock();
  if (!Number.isFinite(now)) throw new TypeError("Spotify analyzer clock returned an invalid time.");
  const dt = analyzer.time === null ? 1 / 60 : clampSpotify(now - analyzer.time, 0.004, 0.25);
  analyzer.time = now;

  const binWidth = sampleRate / fftSize;
  const bandLevel = (minimumHz, maximumHz) => {
    let firstBin = Math.max(1, Math.ceil(minimumHz / binWidth));
    let lastBin = Math.min(frequencyData.length - 1, Math.floor(maximumHz / binWidth));
    if (lastBin < firstBin) {
      firstBin = lastBin = clampSpotify(Math.round((minimumHz + maximumHz) / 2 / binWidth), 1, frequencyData.length - 1);
    }
    let power = 0;
    let count = 0;
    for (let bin = firstBin; bin <= lastBin; bin += 1) {
      const decibels = frequencyData[bin];
      if (!Number.isFinite(decibels) || decibels <= -120) continue;
      power += 10 ** (decibels / 10);
      count += 1;
    }
    if (!count) return 0;
    return clampSpotify((10 * Math.log10(power / count) + 90) / 65, 0, 1);
  };

  const rawBass = bandLevel(40, 180);
  const rawMid = bandLevel(180, 2400);
  const rawTreble = bandLevel(2400, 11000);
  const bass = updateBand(analyzer.bass, rawBass, dt, now, 0.11);
  const mid = updateBand(analyzer.mid, rawMid, dt, now, 0.09);
  const treble = updateBand(analyzer.treble, rawTreble, dt, now, 0.07);
  const spectrum = analyzer.bands.map((state, index) => {
    const low = 40 * (11000 / 40) ** (index / SPECTRUM_BANDS);
    const high = 40 * (11000 / 40) ** ((index + 1) / SPECTRUM_BANDS);
    return updateBand(state, bandLevel(low, high), dt, now, 1).level;
  });

  // Drop / impact: fast energy surge well above the recent average, on a bass hit.
  const rawEnergy = rawBass * 0.45 + rawMid * 0.35 + rawTreble * 0.2;
  const slowBefore = analyzer.energySlow || rawEnergy;
  analyzer.energyFast += (rawEnergy - analyzer.energyFast) * (1 - Math.exp(-dt / 0.2));
  analyzer.energySlow += (rawEnergy - analyzer.energySlow) * (1 - Math.exp(-dt / 5));
  const surge = clampSpotify((analyzer.energyFast - slowBefore - 0.05) / 0.16, 0, 1);
  analyzer.impact *= Math.exp(-dt / 0.5);
  if (surge > 0.6 && bass.onset > 0.2 && now - analyzer.lastImpact > 1.5) {
    analyzer.impact = 1;
    analyzer.lastImpact = now;
  }

  return {
    bass: bass.level,
    mid: mid.level,
    treble: treble.level,
    energy: clampSpotify(bass.level * 0.45 + mid.level * 0.35 + treble.level * 0.2, 0, 1),
    spectrum,
    onsets: { bass: bass.onset, mid: mid.onset, treble: treble.onset },
    impact: analyzer.impact
  };
}

function smoothSpotifyLevels(previous, current, elapsedMs) {
  const onsetsOk = (levels) => levels.onsets === undefined ||
    (levels.onsets && ["bass", "mid", "treble"].every((key) => isUnit(levels.onsets[key])));
  const impactOk = (levels) => levels.impact === undefined || isUnit(levels.impact);
  if (!previous || !current ||
      !["bass", "mid", "treble", "energy"].every((key) => isUnit(previous[key]) && isUnit(current[key])) ||
      !Array.isArray(previous.spectrum) || !Array.isArray(current.spectrum) ||
      previous.spectrum.length !== current.spectrum.length ||
      !previous.spectrum.every(isUnit) || !current.spectrum.every(isUnit) ||
      ![previous, current].every(onsetsOk) || ![previous, current].every(impactOk) ||
      !Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new TypeError("Spotify audio smoothing data is invalid.");
  }

  // Quick attack so hits land on the beat; slower release so the strip breathes.
  const smooth = (from, to, attackMs, releaseMs) => {
    const amount = 1 - Math.exp(-Math.min(elapsedMs, 1000) / (to > from ? attackMs : releaseMs));
    return from + (to - from) * amount;
  };
  const before = previous.onsets || { bass: 0, mid: 0, treble: 0 };
  const after = current.onsets || { bass: 0, mid: 0, treble: 0 };
  return {
    bass: smooth(previous.bass, current.bass, 35, 170),
    mid: smooth(previous.mid, current.mid, 35, 150),
    treble: smooth(previous.treble, current.treble, 30, 120),
    energy: smooth(previous.energy, current.energy, 40, 180),
    spectrum: current.spectrum.map((level, i) => smooth(previous.spectrum[i], level, 35, 180)),
    onsets: {
      bass: smooth(before.bass, after.bass, 25, 150),
      mid: smooth(before.mid, after.mid, 25, 130),
      treble: smooth(before.treble, after.treble, 20, 110)
    },
    impact: smooth(previous.impact || 0, current.impact || 0, 60, 450)
  };
}

const INACTIVE_PLAYBACK_STATES = new Set(["paused", "stopped", "closed", "opened"]);

/** Unknown or transitional states count as playing; only a known idle state silences the analyzer. */
function isSpotifyPlaybackActive(hasMedia, playbackStatus) {
  if (hasMedia !== true) return false;
  if (typeof playbackStatus !== "string") return true;
  const status = playbackStatus.trim().toLowerCase();
  return status === "" || !INACTIVE_PLAYBACK_STATES.has(status);
}

function silentSpotifyLevels(spectrumLength = 12) {
  if (!Number.isInteger(spectrumLength) || spectrumLength < 1 || spectrumLength > 64) {
    throw new TypeError("Spotify audio spectrum length is invalid.");
  }
  return {
    bass: 0, mid: 0, treble: 0, energy: 0,
    spectrum: Array(spectrumLength).fill(0),
    onsets: { bass: 0, mid: 0, treble: 0 },
    impact: 0
  };
}

/* ---------------------------------------------------------------------- *
 * 3. Genre: lookup + profiles
 * ---------------------------------------------------------------------- */

/**
 * Kept so existing callers don't break. Genre cannot be identified from a few
 * spectrum numbers (a sparse trap intro looks like ambient), so this never
 * guesses: it always returns null. Use lookupSpotifyGenres() instead.
 */
function createSpotifyGenreDetector() {
  return {};
}
function updateSpotifyGenreDetector(detector, levels, elapsedMs) {
  if (!detector || typeof detector !== "object" || !levels || !Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new TypeError("Spotify genre detection data is invalid.");
  }
  return null;
}

const normalizeText = (text) => String(text).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const stripTitleNoise = (title) =>
  title.replace(/[([][^)\]]*[)\]]/g, " ").replace(/\s[-–]\s.*$/, " ");
const normalizeTrackTitle = (title) => {
  const normalized = normalizeText(stripTitleNoise(title)) || normalizeText(title);
  return normalized.replace(/\bi\b/g, " ").replace(/\s+/g, " ").trim() || normalized;
};
const GENRE_CACHE_LIMIT = 200;
const genreCache = new Map();
const genreInFlight = new Map();

/**
 * Looks up a track's genre via Apple's public iTunes Search API (no key).
 * Returns e.g. ["Hip-Hop/Rap"], or [] when nothing matches or the request fails.
 * Results are cached per title/artist. Run from the Electron main process if
 * the renderer is blocked by CORS.
 */
async function lookupSpotifyGenres(title, artist, options = {}) {
  if (typeof title !== "string" || typeof artist !== "string" ||
      !title.trim() || !artist.trim() || title.length > 200 || artist.length > 200) {
    return [];
  }
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") return [];

  const cleanTitle = normalizeTrackTitle(title);
  const artistTokens = artist.split(/\s*(?:,|&|;|\bfeat\.?|\bft\.?|\bx\b|\band\b)\s*/i)
    .map(normalizeText).filter((token) => token.length > 1);
  const cacheKey = `${normalizeText(artist)}|${cleanTitle}`;
  if (genreCache.has(cacheKey)) return genreCache.get(cacheKey);
  if (genreInFlight.has(cacheKey)) return genreInFlight.get(cacheKey);

  const requestResults = async (params) => {
    const query = new URLSearchParams({ ...params, lang: "en_us" });
    const signal = options.signal ||
      (typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined);
    const response = await fetchImpl(`https://itunes.apple.com/${params.id ? "lookup" : "search"}?${query}`, { signal });
    if (!response.ok) throw new Error(`iTunes lookup failed (${response.status})`);
    const { results } = await response.json();
    return Array.isArray(results) ? results : [];
  };
  const findMatchingTrack = (results) => results.find((item) => {
    if (typeof item?.trackName !== "string" || typeof item.artistName !== "string" ||
        typeof item.primaryGenreName !== "string") return false;
    const track = normalizeTrackTitle(item.trackName);
    const itemArtist = normalizeText(item.artistName);
    return (track.includes(cleanTitle) || cleanTitle.includes(track)) &&
      artistTokens.some((token) => itemArtist.includes(token) || token.includes(itemArtist));
  });

  const attempt = async (country) => {
    const results = await requestResults({
      term: `${artist} ${title}`, entity: "song", limit: "8", ...(country ? { country } : {})
    });
    let hit = findMatchingTrack(results);
    if (hit) return [hit.primaryGenreName];

    const artistResults = await requestResults({
      term: artist, entity: "musicArtist", limit: "10", ...(country ? { country } : {})
    });
    const artistIds = artistResults
      .filter((item) => typeof item?.artistName === "string" && Number.isSafeInteger(item.artistId) &&
        artistTokens.some((token) => normalizeText(item.artistName) === token))
      .map((item) => String(item.artistId))
      .slice(0, 3);
    for (const id of artistIds) {
      hit = findMatchingTrack(await requestResults({
        id, entity: "song", limit: "200", ...(country ? { country } : {})
      }));
      if (hit) return [hit.primaryGenreName];
    }

    return [];
  };

  const job = (async () => {
    try {
      let genres = await attempt(options.country || "it");
      if (genres.length === 0 && !options.country) genres = await attempt("us");
      if (genreCache.size >= GENRE_CACHE_LIMIT) genreCache.delete(genreCache.keys().next().value);
      genreCache.set(cacheKey, genres);
      return genres;
    } catch {
      return []; // not cached, so a later track change retries
    } finally {
      genreInFlight.delete(cacheKey);
    }
  })();
  genreInFlight.set(cacheKey, job);
  return job;
}

/*  bass/mid/treble : how strongly each band's beats drive the lights
 *  floor           : resting brightness between hits
 *  flash           : beat-flash strength
 *  scroll          : palette drift speed
 *  spread          : 0 = whole strip pulses together, 1 = equalizer along the strip
 *  idle            : slow breathing wave so slow songs never look static   */
const DEFAULT_PROFILE = { bass: 1, mid: 1, treble: 1, floor: 0.26, flash: 1, scroll: 0.2, spread: 0.6, idle: 0.3 };
const GENRE_PROFILES = [
  { pattern: /\b(ambient|new age|lo[\s-]?fi|chill(?:out|wave)?|downtempo|meditation|sleep|drone|sad|slowcore|easy listening)\b/,
    bass: 0.95, mid: 1.05, treble: 0.95, floor: 0.3, flash: 0.6, scroll: 0.1, spread: 0.8, idle: 0.45 },
  { pattern: /\b(classical|orchestral|symphonic|opera|choral|baroque|chamber|soundtrack|film score|cinematic)\b/,
    bass: 0.9, mid: 1.2, treble: 1.15, floor: 0.3, flash: 0.55, scroll: 0.12, spread: 0.9, idle: 0.4 },
  { pattern: /\b(folk|country|bluegrass|americana|acoustic|singer[\s-]?songwriter|traditional|cantautor\w*)\b/,
    bass: 1, mid: 1.25, treble: 1.1, floor: 0.3, flash: 0.75, scroll: 0.12, spread: 0.8, idle: 0.35 },
  { pattern: /\b(jazz|blues|soul|r\s*&\s*b|rhythm and blues|funk|motown|doo[\s-]?wop)\b/,
    bass: 1.1, mid: 1.25, treble: 1.2, floor: 0.28, flash: 0.9, scroll: 0.18, spread: 0.75, idle: 0.35 },
  { pattern: /\b(reggae|ska|rocksteady|dub|dancehall|dembow)\b/,
    bass: 1.25, mid: 1.1, treble: 1, floor: 0.24, flash: 1.05, scroll: 0.2, spread: 0.6, idle: 0.3 },
  { pattern: /\b(latin|salsa|samba|bossa nova|cumbia|bachata|merengue|reggaeton|afrobeats?|amapiano)\b/,
    bass: 1.25, mid: 1.1, treble: 1.2, floor: 0.24, flash: 1.2, scroll: 0.28, spread: 0.55, idle: 0.28 },
  { pattern: /\b(rock|metal|metalcore|punk|grunge|emo|hardcore|indie|alternative|shoegaze|garage rock)\b/,
    bass: 1.15, mid: 1.3, treble: 1.1, floor: 0.2, flash: 1.3, scroll: 0.3, spread: 0.55, idle: 0.25 },
  { pattern: /\b(hip[\s-]?hop|rap|trap|drill|phonk|grime|dance|electronic|edm|house|techno|trance|dubstep|drum and bass|dnb|disco|electro|breakbeat|uk garage|future bass|hyperpop)\b/,
    bass: 1.4, mid: 1, treble: 1.15, floor: 0.14, flash: 1.55, scroll: 0.35, spread: 0.45, idle: 0.2 },
  { pattern: /\b(pop|synth[\s-]?pop|k[\s-]?pop|j[\s-]?pop|teen pop|dance pop|city pop)\b/,
    bass: 1.15, mid: 1.1, treble: 1.1, floor: 0.22, flash: 1.2, scroll: 0.25, spread: 0.55, idle: 0.28 },
  { pattern: /\b(gospel|christian|worship|spiritual)\b/,
    bass: 1, mid: 1.2, treble: 1.12, floor: 0.28, flash: 0.85, scroll: 0.15, spread: 0.7, idle: 0.35 }
];

/** Blends every matching tag (e.g. "pop rap" = pop + hip-hop). */
function resolveGenreProfile(genres) {
  const tags = genres.join(" ").toLowerCase();
  const matches = GENRE_PROFILES.filter(({ pattern }) => pattern.test(tags));
  if (matches.length === 0) return DEFAULT_PROFILE;
  const profile = {};
  for (const key of Object.keys(DEFAULT_PROFILE)) {
    profile[key] = matches.reduce((sum, match) => sum + match[key], 0) / matches.length;
  }
  return profile;
}

/* ---------------------------------------------------------------------- *
 * 4. LED rendering
 * ---------------------------------------------------------------------- */

function createSpotifyReactiveColors(palette, levels, ledCount, elapsedSeconds, sensitivity = 65, genres = []) {
  if (!Array.isArray(palette) || palette.length === 0 ||
      !palette.every((color) => typeof color === "string" && /^#[\da-f]{6}$/i.test(color)) ||
      !levels || !["bass", "mid", "treble", "energy"].every((key) => isUnit(levels[key])) ||
      (levels.onsets !== undefined &&
        (!levels.onsets || !["bass", "mid", "treble"].every((key) => isUnit(levels.onsets[key])))) ||
      (levels.impact !== undefined && !isUnit(levels.impact)) ||
      (levels.spectrum !== undefined &&
        (!Array.isArray(levels.spectrum) || levels.spectrum.length === 0 || !levels.spectrum.every(isUnit))) ||
      !Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253 ||
      !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0 ||
      !Number.isFinite(sensitivity) || sensitivity < 0 || sensitivity > 100 ||
      !Array.isArray(genres) || !genres.every((genre) => typeof genre === "string" && genre.length <= 128)) {
    throw new TypeError("Spotify audio-reactive colors are invalid.");
  }

  const profile = resolveGenreProfile(genres);
  const rgbPalette = palette.map((color) => color.slice(1).match(/.{2}/g).map((c) => Number.parseInt(c, 16)));
  const last = rgbPalette.length - 1;
  const response = 0.4 + (sensitivity / 100) * 0.9; // 0.4 .. 1.3, never fully static
  const onsets = levels.onsets || { bass: 0, mid: 0, treble: 0 };
  const impact = levels.impact || 0;
  const spectrum = levels.spectrum && levels.spectrum.length > 1 ? levels.spectrum : null;

  const drive = clampSpotify(
    levels.bass * profile.bass * 0.45 + levels.mid * profile.mid * 0.3 + levels.treble * profile.treble * 0.25, 0, 1);
  const hits = clampSpotify(
    onsets.bass * profile.bass * 0.75 + onsets.mid * profile.mid * 0.35 + onsets.treble * profile.treble * 0.25, 0, 1.3);
  const pulse = clampSpotify(hits * profile.flash * response, 0, 0.9);
  const shove = (onsets.bass * profile.bass * 0.06 + impact * 0.05) * Math.min(response, 1.2);
  const drift = elapsedSeconds * profile.scroll * 0.25;
  const whiteMix = clampSpotify(pulse * 0.25 + impact * 0.18 * profile.flash, 0, 0.35);

  return Array.from({ length: ledCount }, (_, index) => {
    const x = ledCount > 1 ? index / (ledCount - 1) : 0;

    // Palette position: gradient + slow drift + small kick shove, ping-ponged into range.
    const travelled = (x * 0.8 + drift + shove) % 2;
    const position = (travelled > 1 ? 2 - travelled : travelled) * last;
    const first = Math.floor(position);
    const second = Math.min(first + 1, last);
    const blend = position - first;

    // Spectrum is mirrored: bass in the middle, treble toward the ends.
    let spectral = drive;
    if (spectrum) {
      const at = Math.abs(x * 2 - 1) * (spectrum.length - 1);
      const lower = Math.floor(at);
      const upper = Math.min(lower + 1, spectrum.length - 1);
      spectral = spectrum[lower] + (spectrum[upper] - spectrum[lower]) * (at - lower);
    }
    const local = profile.spread * spectral + (1 - profile.spread) * drive;
    const breath = profile.idle * 0.35 * (0.5 + 0.5 * Math.sin(elapsedSeconds * 1.1 + x * 3.4));
    const body = clampSpotify(local * response * 0.85 + breath, 0, 1);
    const brightness = clampSpotify(
      (profile.floor + (1 - profile.floor) * body + pulse * 0.25) * (1 + impact * 0.1), 0, 1);

    const color = rgbPalette[first].map((channel, i) => {
      const mixed = (channel * (1 - blend) + rgbPalette[second][i] * blend) * brightness;
      return Math.round(clampSpotify(mixed + (255 - mixed) * whiteMix * brightness, 0, 255));
    });
    return toHex(color);
  });
}

const spotifySync = Object.freeze({
  analyzeSpotifySpectrum,
  createSpotifyAnalyzer,
  createSpotifyGenreDetector,
  createSpotifyReactiveColors,
  createSpotifySyncColors,
  isSpotifyPlaybackActive,
  lookupSpotifyGenres,
  resetSpotifyAnalyzer,
  silentSpotifyLevels,
  smoothSpotifyLevels,
  updateSpotifyGenreDetector
});
if (typeof module !== "undefined" && module.exports) module.exports = spotifySync;
else globalThis.ullSpotifySync = spotifySync;