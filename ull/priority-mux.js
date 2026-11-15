"use strict";

const SOURCE_PRIORITIES = Object.freeze({
  manualLighting: 10,
  effects: 20,
  screenSync: 30,
  spotifySync: 40,
  temporaryOverride: 60
});

function createPriorityMux() {
  const inputs = new Map();
  let nextOrder = 0;

  function setInput({
    id,
    priority,
    colors,
    expiresAt = null,
    frameType = "lighting",
    effectBrightness = 1
  }) {
    if (typeof id !== "string" || !id.trim() ||
        !Number.isSafeInteger(priority) ||
        !Array.isArray(colors) || colors.length === 0 ||
        !colors.every((color) => typeof color === "string" && /^#[\da-f]{6}$/i.test(color)) ||
        (expiresAt !== null && !Number.isFinite(expiresAt)) ||
        !["lighting", "realtime"].includes(frameType) ||
        !Number.isFinite(effectBrightness) || effectBrightness < 0 || effectBrightness > 1) {
      throw new TypeError("Priority input details are invalid.");
    }
    if (priority === SOURCE_PRIORITIES.temporaryOverride && expiresAt === null) {
      throw new TypeError("Temporary overrides must have an expiry time.");
    }

    const previous = inputs.get(id);
    inputs.set(id, {
      id,
      priority,
      colors: [...colors],
      expiresAt,
      frameType,
      effectBrightness,
      order: previous?.order ?? nextOrder++
    });
  }

  function release(id) {
    return inputs.delete(id);
  }

  function expire(now) {
    if (!Number.isFinite(now)) throw new TypeError("Priority input expiry time is invalid.");
    const expired = [];
    for (const [id, input] of inputs) {
      if (input.expiresAt !== null && input.expiresAt <= now) {
        inputs.delete(id);
        expired.push(id);
      }
    }
    return expired;
  }

  function getWinner(now) {
    if (!Number.isFinite(now)) throw new TypeError("Priority selection time is invalid.");
    let winner = null;
    for (const input of inputs.values()) {
      if (input.expiresAt !== null && input.expiresAt <= now) continue;
      if (!winner || input.priority > winner.priority ||
          (input.priority === winner.priority && input.order < winner.order)) {
        winner = input;
      }
    }
    if (!winner) return null;
    return Object.freeze({
      id: winner.id,
      priority: winner.priority,
      colors: [...winner.colors],
      expiresAt: winner.expiresAt,
      frameType: winner.frameType,
      effectBrightness: winner.effectBrightness
    });
  }

  return Object.freeze({ setInput, release, expire, getWinner });
}

module.exports = { SOURCE_PRIORITIES, createPriorityMux };
