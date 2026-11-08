"use strict";

const { performance } = require("node:perf_hooks");

function createHidOutputQueue(onTiming = () => {}) {
  let writing = false;
  let pending = null;

  function reportTiming(job, status, queueMs, writeMs = null) {
    try {
      onTiming({
        command: job.command,
        status,
        reportCount: job.reports.length,
        queueMs,
        writeMs
      });
    } catch (error) {
      console.error("Could not record controller write timing:", error);
    }
  }

  async function drain() {
    if (writing) return;
    writing = true;
    try {
      while (pending) {
        const job = pending;
        pending = null;
        const startedAt = performance.now();
        try {
          for (const report of job.reports) {
            if (!job.isCurrent()) throw new Error("The LED controller disconnected during a write.");
            await job.device.write([...report]);
          }
          job.resolve({ written: true });
          reportTiming(job, "written", startedAt - job.queuedAt, performance.now() - startedAt);
        } catch (error) {
          job.reject(error);
          reportTiming(job, "failed", startedAt - job.queuedAt, performance.now() - startedAt);
        }
      }
    } finally {
      writing = false;
      if (pending) void drain();
    }
  }

  function enqueue(device, reports, isCurrent = () => true, command = "RB") {
    if (!device || !Array.isArray(reports) || reports.length === 0 || typeof isCurrent !== "function") {
      throw new TypeError("A device and one or more HID reports are required.");
    }
    return new Promise((resolve, reject) => {
      if (pending) {
        const superseded = pending;
        superseded.resolve({ written: false, superseded: true });
        reportTiming(superseded, "superseded", performance.now() - superseded.queuedAt);
      }
      pending = { device, reports, isCurrent, resolve, reject, command, queuedAt: performance.now() };
      void drain();
    });
  }

  return Object.freeze({ enqueue });
}

module.exports = { createHidOutputQueue };
