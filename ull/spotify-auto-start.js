"use strict";

function createSpotifyAutoStartGate() {
  let lastStatus = null;
  let playbackPending = false;
  let attemptMade = false;

  return Object.freeze({
    observe(status, enabled) {
      if (!enabled) {
        lastStatus = null;
        playbackPending = false;
        attemptMade = false;
        return false;
      }

      if (status !== "Playing") {
        lastStatus = status;
        playbackPending = false;
        attemptMade = false;
        return false;
      }

      if (lastStatus !== "Playing") {
        playbackPending = true;
        attemptMade = false;
      }
      lastStatus = "Playing";
      return playbackPending && !attemptMade;
    },
    markAttempted() {
      if (playbackPending) attemptMade = true;
    },
    reset() {
      lastStatus = null;
      playbackPending = false;
      attemptMade = false;
    }
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { createSpotifyAutoStartGate };
}
if (typeof window !== "undefined") {
  window.ullSpotifyAutoStart = Object.freeze({ createSpotifyAutoStartGate });
}
