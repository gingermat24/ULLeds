"use strict";

const SESSION_END_REASONS = new Set(["shutdown", "critical", "logoff"]);

async function turnOffForSessionEnd(event, { platform, powered, connected, writeOff }) {
  if (platform !== "win32" || !powered || !connected ||
      !Array.isArray(event?.reasons) ||
      !event.reasons.some((reason) => SESSION_END_REASONS.has(reason))) {
    return false;
  }
  await writeOff();
  return true;
}

module.exports = { turnOffForSessionEnd };
