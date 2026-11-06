"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createHidOutputQueue } = require("../hid-output");

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

test("HID writes stay ordered and replace stale pending frames", async () => {
  const queue = createHidOutputQueue();
  const firstWrite = deferred();
  const written = [];
  let first = true;
  const device = {
    async write(report) {
      if (first) {
        first = false;
        await firstWrite.promise;
      }
      written.push(report[0]);
    }
  };
  const current = () => true;
  const active = queue.enqueue(device, [Buffer.from([1]), Buffer.from([2])], current);
  const superseded = queue.enqueue(device, [Buffer.from([3])], current);
  const latest = queue.enqueue(device, [Buffer.from([4])], current);

  assert.deepEqual(await superseded, { written: false, superseded: true });
  firstWrite.resolve();
  assert.deepEqual(await active, { written: true });
  assert.deepEqual(await latest, { written: true });
  assert.deepEqual(written, [1, 2, 4]);
});

test("HID write errors reject the frame and do not block later frames", async () => {
  const queue = createHidOutputQueue();
  const device = {
    async write(report) {
      if (report[0] === 1) throw new Error("USB write failed");
    }
  };

  await assert.rejects(queue.enqueue(device, [Buffer.from([1])]), /USB write failed/);
  assert.deepEqual(await queue.enqueue(device, [Buffer.from([2])]), { written: true });
});
