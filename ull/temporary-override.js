"use strict";

const OVERRIDE_DURATIONS_MS = Object.freeze([5000, 15000, 30000, 60000]);
const OVERRIDE_EFFECTS = new Set(["steady", "breathe", "spectrum", "palette"]);

function validateOverride(input) {
  if (!input || typeof input !== "object" || Array.isArray(input) ||
      typeof input.color !== "string" || !/^#[\da-f]{6}$/i.test(input.color) ||
      !OVERRIDE_EFFECTS.has(input.effect) ||
      !Number.isInteger(input.speed) || input.speed < 1 || input.speed > 100 ||
      !OVERRIDE_DURATIONS_MS.includes(input.durationMs) ||
      !Array.isArray(input.palette) || input.palette.length < 1 || input.palette.length > 8 ||
      !input.palette.every((color) => typeof color === "string" && /^#[\da-f]{6}$/i.test(color))) {
    throw new TypeError("Temporary override settings are invalid.");
  }
  return {
    color: input.color,
    effect: input.effect,
    speed: input.speed,
    durationMs: input.durationMs,
    palette: [...input.palette]
  };
}

function createTemporaryOverride({
  applyFrame,
  onRelease,
  onChange = () => {},
  onError,
  setTimeoutImpl = setTimeout,
  clearTimeoutImpl = clearTimeout,
  setIntervalImpl = setInterval,
  clearIntervalImpl = clearInterval,
  now = Date.now
} = {}) {
  if ([applyFrame, onRelease, onError, setTimeoutImpl, clearTimeoutImpl,
    setIntervalImpl, clearIntervalImpl, now].some((value) => typeof value !== "function") ||
      typeof onChange !== "function") {
    throw new TypeError("Temporary override dependencies are invalid.");
  }

  let active = null;
  let expirationTimer = null;
  let animationTimer = null;

  function getStatus() {
    if (!active) return { active: false, expiresAt: null, remainingMs: 0 };
    return {
      active: true,
      color: active.color,
      effect: active.effect,
      durationMs: active.durationMs,
      expiresAt: active.expiresAt,
      remainingMs: Math.max(0, active.expiresAt - now())
    };
  }

  function stopTimers() {
    if (expirationTimer) clearTimeoutImpl(expirationTimer);
    if (animationTimer) clearIntervalImpl(animationTimer);
    expirationTimer = null;
    animationTimer = null;
  }

  function publishFrame(lease) {
    if (active !== lease) return;
    const fail = (error) => {
      if (active === lease) {
        void clear({ restore: false }).catch((releaseError) => onError(releaseError, lease));
      }
      onError(error, lease);
    };
    try {
      void Promise.resolve(applyFrame(lease, now()))
        .catch(fail);
    } catch (error) {
      fail(error);
    }
  }

  function clear({ restore = true } = {}) {
    const lease = active;
    if (!lease) return Promise.resolve(getStatus());
    active = null;
    stopTimers();

    let output;
    try {
      output = onRelease(lease, { restore });
    } catch (error) {
      onChange(getStatus());
      return Promise.reject(error);
    }
    onChange(getStatus());
    return Promise.resolve(output).then(() => getStatus());
  }

  function start(input) {
    const configuration = validateOverride(input);
    stopTimers();
    const lease = Object.freeze({
      ...configuration,
      palette: Object.freeze(configuration.palette),
      expiresAt: now() + configuration.durationMs
    });
    active = lease;
    onChange(getStatus());

    expirationTimer = setTimeoutImpl(() => {
      if (active !== lease) return;
      void clear().catch((error) => onError(error, lease));
    }, configuration.durationMs);
    expirationTimer?.unref?.();

    if (lease.effect !== "steady") {
      const interval = Math.max(40, Math.round(170 - lease.speed * 1.25));
      animationTimer = setIntervalImpl(() => publishFrame(lease), interval);
      animationTimer?.unref?.();
    }

    let output;
    try {
      output = applyFrame(lease, now());
    } catch (error) {
      if (active === lease) void clear({ restore: false }).catch((cleanupError) => onError(cleanupError, lease));
      throw error;
    }
    return Promise.resolve(output).then(() => getStatus(), async (error) => {
      if (active === lease) {
        await clear({ restore: false }).catch((cleanupError) => onError(cleanupError, lease));
      }
      throw error;
    });
  }

  return Object.freeze({ start, clear, getStatus });
}

module.exports = { OVERRIDE_DURATIONS_MS, createTemporaryOverride };
