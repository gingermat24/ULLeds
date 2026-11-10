"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  shouldTurnOffForSessionEnd,
  turnOffForSessionEnd
} = require("../shutdown-power");

test("Windows session-end query is delayed only when a connected strip needs power-off", () => {
  const query = { reasons: ["shutdown"] };
  assert.equal(shouldTurnOffForSessionEnd(query, {
    platform: "win32",
    powered: true,
    connected: true
  }), true);
  assert.equal(shouldTurnOffForSessionEnd({ reasons: ["close-app"] }, {
    platform: "win32",
    powered: true,
    connected: true
  }), false);
  assert.equal(shouldTurnOffForSessionEnd(query, {
    platform: "win32",
    powered: false,
    connected: true
  }), false);
});

test("Windows shutdown turns LEDs off only when they were on and connected", async () => {
  let writeCount = 0;
  const writeOff = async () => { writeCount += 1; };
  const shutdown = { reasons: ["shutdown"] };

  assert.equal(await turnOffForSessionEnd(shutdown, {
    platform: "win32",
    powered: true,
    connected: true,
    writeOff
  }), true);
  assert.equal(writeCount, 1);

  for (const options of [
    { platform: "win32", powered: false, connected: true },
    { platform: "win32", powered: true, connected: false },
    { platform: "linux", powered: true, connected: true }
  ]) {
    assert.equal(await turnOffForSessionEnd(shutdown, { ...options, writeOff }), false);
  }
  assert.equal(writeCount, 1);
});

test("normal app-close session events do not turn LEDs off", async () => {
  let writeCount = 0;
  const handled = await turnOffForSessionEnd(
    { reasons: ["close-app"] },
    {
      platform: "win32",
      powered: true,
      connected: true,
      writeOff: async () => { writeCount += 1; }
    }
  );
  assert.equal(handled, false);
  assert.equal(writeCount, 0);
});

test("shutdown write failures are propagated to the caller", async () => {
  const failure = new Error("HID write failed");
  await assert.rejects(
    turnOffForSessionEnd(
      { reasons: ["shutdown"] },
      {
        platform: "win32",
        powered: true,
        connected: true,
        writeOff: async () => { throw failure; }
      }
    ),
    failure
  );
});
