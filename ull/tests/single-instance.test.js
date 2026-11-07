"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { acquireSingleInstanceLock } = require("../single-instance");

test("a second launch focuses the existing ULLeds window instead of starting another instance", async () => {
  const app = new EventEmitter();
  let ready;
  app.requestSingleInstanceLock = () => true;
  app.quit = () => assert.fail("The primary instance must keep running.");
  app.whenReady = () => new Promise((resolve) => { ready = resolve; });
  let focused = 0;

  assert.equal(acquireSingleInstanceLock(app, () => { focused += 1; }), true);
  app.emit("second-instance");
  assert.equal(focused, 0);
  ready();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(focused, 1);
});

test("a process without the single-instance lock exits without registering a handler", () => {
  const app = new EventEmitter();
  let quitCount = 0;
  app.requestSingleInstanceLock = () => false;
  app.quit = () => { quitCount += 1; };
  app.whenReady = () => Promise.resolve();
  let focused = false;

  assert.equal(acquireSingleInstanceLock(app, () => { focused = true; }), false);
  assert.equal(quitCount, 1);
  assert.equal(app.listenerCount("second-instance"), 0);
  assert.equal(focused, false);
});
