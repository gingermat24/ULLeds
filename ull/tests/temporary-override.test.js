"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { OVERRIDE_DURATIONS_MS, createTemporaryOverride } = require("../temporary-override");

function createHarness() {
  let time = 1000;
  const timeouts = [];
  const intervals = [];
  const frames = [];
  const releases = [];
  const changes = [];
  const errors = [];
  const manager = createTemporaryOverride({
    now: () => time,
    setTimeoutImpl: (callback, delay) => {
      const timer = { callback, delay, cleared: false, unref() {} };
      timeouts.push(timer);
      return timer;
    },
    clearTimeoutImpl: (timer) => { timer.cleared = true; },
    setIntervalImpl: (callback, delay) => {
      const timer = { callback, delay, cleared: false, unref() {} };
      intervals.push(timer);
      return timer;
    },
    clearIntervalImpl: (timer) => { timer.cleared = true; },
    applyFrame: (lease, at) => frames.push({ lease, at }),
    onRelease: (lease, options) => releases.push({ lease, options }),
    onChange: (status) => changes.push(status),
    onError: (error) => errors.push(error)
  });
  return {
    manager,
    timeouts,
    intervals,
    frames,
    releases,
    changes,
    errors,
    setTime: (value) => { time = value; }
  };
}

function override(options = {}) {
  return {
    color: "#cc33ff",
    effect: "steady",
    speed: 48,
    durationMs: 15000,
    palette: ["#cc33ff", "#224466"],
    ...options
  };
}

test("temporary override accepts only supported durations and valid lighting settings", () => {
  assert.deepEqual(OVERRIDE_DURATIONS_MS, [5000, 15000, 30000, 60000]);
  const { manager } = createHarness();
  for (const settings of [
    override({ durationMs: 10000 }),
    override({ color: "purple" }),
    override({ effect: "unknown" }),
    override({ speed: 0 }),
    override({ palette: [] })
  ]) {
    assert.throws(() => manager.start(settings), TypeError);
  }
});

test("starting and clearing an override releases it and restores through the caller", async () => {
  const harness = createHarness();
  const { manager } = harness;
  const status = await manager.start(override());

  assert.equal(status.active, true);
  assert.equal(status.expiresAt, 16000);
  assert.equal(status.remainingMs, 15000);
  assert.equal(harness.frames.length, 1);
  assert.equal(harness.intervals.length, 0);

  const cleared = await manager.clear();
  assert.equal(cleared.active, false);
  assert.deepEqual(harness.releases[0].options, { restore: true });
  assert.equal(harness.timeouts[0].cleared, true);
  assert.deepEqual(harness.errors, []);
});

test("animated override publishes updates and expiry restores the next input", async () => {
  const harness = createHarness();
  await harness.manager.start(override({ effect: "breathe" }));
  assert.equal(harness.intervals.length, 1);
  assert.ok(harness.intervals[0].delay >= 40);

  harness.setTime(3000);
  harness.intervals[0].callback();
  assert.equal(harness.frames.length, 2);

  harness.setTime(16000);
  harness.timeouts[0].callback();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(harness.manager.getStatus().active, false);
  assert.deepEqual(harness.releases[0].options, { restore: true });
  assert.equal(harness.intervals[0].cleared, true);
});

test("replacing an override invalidates its old expiry without releasing the new source", async () => {
  const harness = createHarness();
  await harness.manager.start(override());
  await harness.manager.start(override({ color: "#00aabb", durationMs: 5000 }));

  harness.timeouts[0].callback();
  assert.equal(harness.manager.getStatus().color, "#00aabb");
  assert.equal(harness.releases.length, 0);
  assert.equal(harness.timeouts[0].cleared, true);

  await harness.manager.clear({ restore: false });
  assert.deepEqual(harness.releases[0].options, { restore: false });
  assert.equal(harness.changes.at(-1).active, false);
});
