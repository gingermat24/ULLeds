"use strict";

function createHidOutputQueue() {
  let writing = false;
  let pending = null;

  async function drain() {
    if (writing) return;
    writing = true;
    try {
      while (pending) {
        const job = pending;
        pending = null;
        try {
          for (const report of job.reports) {
            if (!job.isCurrent()) throw new Error("The LED controller disconnected during a write.");
            await job.device.write([...report]);
          }
          job.resolve({ written: true });
        } catch (error) {
          job.reject(error);
        }
      }
    } finally {
      writing = false;
      if (pending) void drain();
    }
  }

  function enqueue(device, reports, isCurrent = () => true) {
    if (!device || !Array.isArray(reports) || reports.length === 0 || typeof isCurrent !== "function") {
      throw new TypeError("A device and one or more HID reports are required.");
    }
    return new Promise((resolve, reject) => {
      if (pending) pending.resolve({ written: false, superseded: true });
      pending = { device, reports, isCurrent, resolve, reject };
      void drain();
    });
  }

  return Object.freeze({ enqueue });
}

module.exports = { createHidOutputQueue };
