"use strict";

const SESSION_END_REASONS = new Set(["shutdown", "critical", "logoff"]);

function shouldTurnOffForSessionEnd(event, { platform, powered, connected }) {
  if (platform !== "win32" || !powered || !connected ||
      !Array.isArray(event?.reasons) ||
      !event.reasons.some((reason) => SESSION_END_REASONS.has(reason))) {
    return false;
  }
  return true;
}

async function turnOffForSessionEnd(event, { platform, powered, connected, writeOff }) {
  if (!shouldTurnOffForSessionEnd(event, { platform, powered, connected })) return false;
  await writeOff();
  return true;
}

module.exports = { shouldTurnOffForSessionEnd, turnOffForSessionEnd };
