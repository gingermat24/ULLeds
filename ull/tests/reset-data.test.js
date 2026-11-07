"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { resetStoredData } = require("../reset-data");

test("full reset removes ULLeds settings and only the imported legacy profile files", async (t) => {
  const appData = await fs.mkdtemp(path.join(os.tmpdir(), "ulleds-reset-"));
  t.after(() => fs.rm(appData, { recursive: true, force: true }));
  await fs.mkdir(path.join(appData, "ULLeds"), { recursive: true });
  await fs.writeFile(path.join(appData, "ULLeds", "settings.json"), "{}");
  await fs.writeFile(path.join(appData, "ULLeds", "Preferences"), "{}");
  await fs.mkdir(path.join(appData, "DX Light"), { recursive: true });
  await fs.writeFile(path.join(appData, "DX Light", "config.json"), "{}");
  await fs.writeFile(path.join(appData, "DX Light", "other-data.bin"), "keep");
  await fs.mkdir(path.join(appData, "quiklight-desktop"), { recursive: true });
  await fs.writeFile(path.join(appData, "quiklight-desktop", "config.json"), "{}");
  await fs.mkdir(path.join(appData, "OtherApp"), { recursive: true });
  await fs.writeFile(path.join(appData, "OtherApp", "settings.json"), "{}");

  assert.deepEqual(resetStoredData(appData), ["DX Light", "QuikLight"]);
  await assert.rejects(fs.access(path.join(appData, "ULLeds", "settings.json")));
  assert.equal(await fs.readFile(path.join(appData, "ULLeds", "Preferences"), "utf8"), "{}");
  await assert.rejects(fs.access(path.join(appData, "DX Light", "config.json")));
  await assert.rejects(fs.access(path.join(appData, "quiklight-desktop", "config.json")));
  assert.equal(await fs.readFile(path.join(appData, "DX Light", "other-data.bin"), "utf8"), "keep");
  assert.equal(await fs.readFile(path.join(appData, "OtherApp", "settings.json"), "utf8"), "{}");
});

test("reset rejects an empty data path", () => {
  assert.throws(() => resetStoredData(""), /non-empty string/);
});
