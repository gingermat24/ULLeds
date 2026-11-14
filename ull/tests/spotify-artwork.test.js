"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { parseSpotifyArtworkOutput, parseSpotifyPlaybackStatus } = require("../spotify-artwork");

test("Spotify media output exposes bounded artwork and local track details", () => {
  const media = {
    contentType: "image/png",
    title: "Night \"Drive\"",
    artist: "Example Artist",
    album: "Example Album",
    playbackStatus: "Playing",
    data: "aGVsbG8="
  };

  assert.deepEqual(parseSpotifyArtworkOutput(JSON.stringify(media)), media);
  assert.equal(parseSpotifyArtworkOutput("NONE"), null);
});

test("Spotify media output rejects malformed metadata and oversized artwork", () => {
  const media = {
    contentType: "image/png",
    title: "Track",
    artist: "Artist",
    album: "Album",
    playbackStatus: "Playing",
    data: "aGVsbG8="
  };

  assert.throws(() => parseSpotifyArtworkOutput("{invalid"), /invalid Spotify media details/);
  assert.throws(() => parseSpotifyArtworkOutput(JSON.stringify({ ...media, contentType: "text/html" })), /invalid Spotify media details/);
  assert.throws(() => parseSpotifyArtworkOutput(JSON.stringify({ ...media, playbackStatus: "Unknown" })), /invalid Spotify media details/);
  assert.throws(() => parseSpotifyArtworkOutput(JSON.stringify({ ...media, title: "x".repeat(513) })), /invalid Spotify media details/);
  assert.throws(() => parseSpotifyArtworkOutput(JSON.stringify({
    ...media,
    data: "A".repeat(2_800_000)
  })), /invalid Spotify media details/);
});

test("Spotify playback-status output is lightweight and validated", () => {
  assert.equal(parseSpotifyPlaybackStatus("Playing\r\n"), "Playing");
  assert.equal(parseSpotifyPlaybackStatus("NONE"), null);
  assert.throws(() => parseSpotifyPlaybackStatus("unknown"), /invalid Spotify playback status/);
  assert.throws(() => parseSpotifyPlaybackStatus("{\"playbackStatus\":\"Playing\"}"), /invalid Spotify playback status/);
});
