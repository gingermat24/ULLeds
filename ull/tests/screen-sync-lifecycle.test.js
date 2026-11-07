"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createScreenSyncLifecycle } = require("../screen-sync-lifecycle");

test("repeated Stop clicks cancel one in-flight start and stop hardware once", async () => {
  const lifecycle = createScreenSyncLifecycle();
  let finishStart;
  let canceled = 0;
  let stopped = 0;
  const start = lifecycle.start(() => new Promise((resolve) => {
    finishStart = resolve;
  }));
  await Promise.resolve();
  const cancel = () => { canceled += 1; };
  const stop = () => { stopped += 1; };

  const firstStop = lifecycle.stop(cancel, stop);
  const secondStop = lifecycle.stop(cancel, stop);
  const thirdStop = lifecycle.stop(cancel, stop);
  assert.equal(firstStop, secondStop);
  assert.equal(secondStop, thirdStop);
  assert.equal(lifecycle.isStopping, true);
  assert.equal(canceled, 1);
  assert.equal(stopped, 0);

  finishStart();
  await Promise.all([start, firstStop]);
  assert.equal(stopped, 1);
  assert.equal(lifecycle.isStarting, false);
  assert.equal(lifecycle.isStopping, false);
});

test("a new sync session cannot start until the previous stop has completed", async () => {
  const lifecycle = createScreenSyncLifecycle();
  let finishStop;
  let started = 0;
  const stop = lifecycle.stop(() => {}, () => new Promise((resolve) => {
    finishStop = resolve;
  }));
  await Promise.resolve();

  assert.equal(await lifecycle.start(() => { started += 1; }), false);
  finishStop();
  await stop;
  assert.equal(await lifecycle.start(() => { started += 1; }), true);
  assert.equal(started, 1);
});
