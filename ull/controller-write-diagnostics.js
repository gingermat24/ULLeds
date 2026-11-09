"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

const COMMANDS = ["RB", "SC"];
const STATUSES = ["written", "superseded", "failed"];

function createControllerWriteDiagnostics(filePath, onError = console.error) {
  let stream = null;
  let summaryTimer = null;
  let windowStartedAt = 0;
  let writes = createWriteStats();
  let settingsSaveMs = [];

  function writeEntry(entry) {
    if (stream) stream.write(`${JSON.stringify({ timestamp: new Date().toISOString(), ...entry })}\n`);
  }

  function flush() {
    if (!stream || !hasSamples()) return;
    writeEntry({
      event: "controller-write-timing",
      windowMs: Math.round(performance.now() - windowStartedAt),
      writes: Object.fromEntries(COMMANDS.map((command) => [command, summarize(writes[command])])),
      settingsSaveMs: summarizeDurations(settingsSaveMs)
    });
    writes = createWriteStats();
    settingsSaveMs = [];
    windowStartedAt = performance.now();
  }

  function scheduleFlush() {
    if (!stream || summaryTimer) return;
    summaryTimer = setTimeout(() => {
      summaryTimer = null;
      flush();
    }, 2000);
    summaryTimer.unref();
  }

  function hasSamples() {
    return settingsSaveMs.length > 0 || COMMANDS.some((command) =>
      STATUSES.some((status) => writes[command].counts[status] > 0)
    );
  }

  function start() {
    if (stream) throw new Error("Controller write diagnostics are already active.");
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const output = fs.createWriteStream(filePath, { flags: "w" });
    output.on("error", (error) => {
      if (stream === output) {
        stream = null;
        if (summaryTimer) clearTimeout(summaryTimer);
        summaryTimer = null;
      }
      onError("Could not write controller timing diagnostics:", error);
    });
    stream = output;
    writes = createWriteStats();
    settingsSaveMs = [];
    windowStartedAt = performance.now();
  }

  function recordWrite({ command, status, reportCount, queueMs, writeMs }) {
    if (!stream) return;
    if (!COMMANDS.includes(command) || !STATUSES.includes(status) ||
        !Number.isInteger(reportCount) || reportCount < 1 ||
        !Number.isFinite(queueMs) || queueMs < 0 ||
        (writeMs !== null && (!Number.isFinite(writeMs) || writeMs < 0))) {
      throw new TypeError("Controller timing diagnostics received invalid write metrics.");
    }
    const summary = writes[command];
    summary.counts[status] += 1;
    summary.reportCount += reportCount;
    summary.queueMs.push(queueMs);
    if (writeMs !== null) summary.writeMs.push(writeMs);
    scheduleFlush();
  }

  function recordSettingsSave(durationMs) {
    if (!stream) return;
    if (!Number.isFinite(durationMs) || durationMs < 0) {
      throw new TypeError("Controller timing diagnostics received an invalid settings-save duration.");
    }
    settingsSaveMs.push(durationMs);
    scheduleFlush();
  }

  function stop() {
    if (!stream) return Promise.resolve();
    if (summaryTimer) clearTimeout(summaryTimer);
    summaryTimer = null;
    flush();
    const output = stream;
    stream = null;
    return new Promise((resolve) => {
      output.once("error", resolve);
      output.end(resolve);
    });
  }

  return Object.freeze({
    get isFlushScheduled() { return Boolean(summaryTimer); },
    recordSettingsSave,
    recordWrite,
    start,
    stop
  });
}

function createWriteStats() {
  return Object.fromEntries(COMMANDS.map((command) => [command, {
    counts: Object.fromEntries(STATUSES.map((status) => [status, 0])),
    reportCount: 0,
    queueMs: [],
    writeMs: []
  }]));
}

function summarize(stats) {
  return {
    ...stats.counts,
    reportCount: stats.reportCount,
    queueWaitMs: summarizeDurations(stats.queueMs),
    deviceWriteMs: summarizeDurations(stats.writeMs)
  };
}

function summarizeDurations(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return {
    samples: values.length,
    p50: round(sorted[Math.floor((sorted.length - 1) * 0.5)]),
    p95: round(sorted[Math.floor((sorted.length - 1) * 0.95)]),
    max: round(sorted.at(-1))
  };
}

function round(value) {
  return Math.round(value * 10) / 10;
}

module.exports = { createControllerWriteDiagnostics };
