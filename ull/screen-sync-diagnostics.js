"use strict";

const fs = require("node:fs");
const path = require("node:path");

const COMMANDS = ["SC", "RB"];
const STATUSES = ["queued", "written", "superseded", "failed"];

function createScreenSyncDiagnostics(filePath, onError = console.error) {
  let stream = null;
  let summaryTimer = null;
  let counts = createCounts();

  function writeEntry(entry) {
    if (stream) stream.write(`${JSON.stringify({ timestamp: new Date().toISOString(), ...entry })}\n`);
  }

  function writeSummary() {
    if (!stream || !COMMANDS.some((command) =>
      STATUSES.some((status) => counts[command][status] > 0)
    )) return;
    writeEntry({ event: "hid-summary", ...counts });
    counts = createCounts();
  }

  function start({ fps, ledCount, audioTracks }) {
    if (stream) throw new Error("Screen Sync diagnostics are already active.");
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const output = fs.createWriteStream(filePath, { flags: "w" });
    output.on("error", (error) => {
      if (stream === output) {
        stream = null;
        if (summaryTimer) clearInterval(summaryTimer);
        summaryTimer = null;
      }
      onError("Could not write Screen Sync diagnostics:", error);
    });
    stream = output;
    counts = createCounts();
    writeEntry({ event: "session-start", fps, ledCount, audioTracks });
    summaryTimer = setInterval(writeSummary, 1000);
    summaryTimer.unref();
  }

  function recordHidWrite(command, status) {
    if (!stream) return;
    if (!COMMANDS.includes(command) || !STATUSES.includes(status)) {
      throw new TypeError("Screen Sync diagnostics received an invalid HID write status.");
    }
    counts[command][status] += 1;
  }

  function recordRendererPerformance(metrics) {
    if (!stream) return;
    if (!metrics || typeof metrics !== "object") {
      throw new TypeError("Screen Sync diagnostics received invalid renderer performance metrics.");
    }
    const {
      windowMs,
      callbackCount,
      sampleCount,
      sampleTotalMs,
      sampleMaxMs
    } = metrics;
    if (![windowMs, callbackCount, sampleCount, sampleTotalMs, sampleMaxMs].every(Number.isFinite) ||
        windowMs <= 0 ||
        !Number.isInteger(callbackCount) || callbackCount < 0 ||
        !Number.isInteger(sampleCount) || sampleCount < 0 || sampleCount > callbackCount ||
        sampleTotalMs < 0 || sampleMaxMs < 0 || sampleMaxMs > sampleTotalMs) {
      throw new TypeError("Screen Sync diagnostics received invalid renderer performance metrics.");
    }
    writeEntry({
      event: "renderer-performance",
      windowMs: Math.round(windowMs),
      callbackCount,
      callbackFps: round(callbackCount * 1000 / windowMs),
      sampleCount,
      sampledFps: round(sampleCount * 1000 / windowMs),
      sampleAverageMs: sampleCount ? round(sampleTotalMs / sampleCount) : null,
      sampleMaxMs: round(sampleMaxMs)
    });
  }

  function stop(reason) {
    if (!stream) return Promise.resolve();
    if (summaryTimer) clearInterval(summaryTimer);
    summaryTimer = null;
    writeSummary();
    writeEntry({ event: "session-stop", reason });
    const output = stream;
    stream = null;
    return new Promise((resolve) => {
      output.once("error", resolve);
      output.end(resolve);
    });
  }

  return Object.freeze({
    get isActive() { return Boolean(stream); },
    recordHidWrite,
    recordRendererPerformance,
    start,
    stop
  });
}

function createCounts() {
  return Object.fromEntries(COMMANDS.map((command) => [
    command,
    Object.fromEntries(STATUSES.map((status) => [status, 0]))
  ]));
}

function round(value) {
  return Math.round(value * 10) / 10;
}

module.exports = { createScreenSyncDiagnostics };
