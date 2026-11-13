"use strict";

const MAX_ARTWORK_BYTES = 2 * 1024 * 1024;
const MAX_ARTWORK_BASE64_LENGTH = Math.ceil(MAX_ARTWORK_BYTES / 3) * 4;
const CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/bmp"]);
const PLAYBACK_STATES = new Set(["Playing", "Paused", "Stopped", "Changing", "Opened", "Closed"]);

function parseSpotifyArtworkOutput(output) {
  if (typeof output !== "string") {
    throw new TypeError("Windows returned invalid Spotify media details.");
  }
  const trimmed = output.trim();
  if (trimmed === "NONE") return null;

  let artwork;
  try {
    artwork = JSON.parse(trimmed);
  } catch {
    throw new Error("Windows returned invalid Spotify media details.");
  }

  if (!artwork || typeof artwork !== "object" || Array.isArray(artwork) ||
      !CONTENT_TYPES.has(artwork.contentType) ||
      typeof artwork.data !== "string" || artwork.data.length === 0 ||
      artwork.data.length > MAX_ARTWORK_BASE64_LENGTH ||
      artwork.data.length % 4 !== 0 ||
      !/^[\da-z+/]+={0,2}$/i.test(artwork.data) ||
      ["title", "artist", "album"].some((key) =>
        typeof artwork[key] !== "string" || artwork[key].length > 512) ||
      !PLAYBACK_STATES.has(artwork.playbackStatus)) {
    throw new Error("Windows returned invalid Spotify media details.");
  }
  return artwork;
}

module.exports = { parseSpotifyArtworkOutput };
