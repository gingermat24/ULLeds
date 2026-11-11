"use strict";

const STARTUP_MODES = Object.freeze(["lighting", "screen", "spotify"]);

function normalizeStartupMode(value, legacyResumeScreenSync = false) {
  if (STARTUP_MODES.includes(value)) return value;
  return legacyResumeScreenSync ? "screen" : "lighting";
}

function isSyncStartupMode(value) {
  return value === "screen" || value === "spotify";
}

const startupMode = Object.freeze({ normalizeStartupMode, isSyncStartupMode });
if (typeof module !== "undefined" && module.exports) module.exports = startupMode;
else globalThis.ullStartupMode = startupMode;
