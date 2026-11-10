"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeScenes,
  sceneFromLighting,
  settingsFromScene,
  createSceneBackup,
  readSceneBackup,
  mergeScenes
} = require("../scene-data");

const lighting = {
  color: "#008100",
  brightness: 50,
  effect: "palette",
  speed: 48,
  palette: ["#e879a8", "#8d7cff", "#55c8d2"],
  ledColors: { 0: "#ff0000", 74: "#0000ff" }
};

test("saved scenes capture and restore lighting without device or sync preferences", () => {
  const scene = sceneFromLighting("scene-1234", "Movie", lighting);
  assert.deepEqual(settingsFromScene(scene), lighting);
  assert.deepEqual(normalizeScenes([scene]), [scene]);
});

test("saved scenes reject invalid identity, values, excess scenes, and duplicate IDs", () => {
  const scene = sceneFromLighting("scene-1234", "Movie", lighting);
  assert.throws(() => normalizeScenes([{ ...scene, name: " " }]), /scene details/);
  assert.throws(() => normalizeScenes([{ ...scene, effect: "unknown" }]), /scene details/);
  assert.throws(() => normalizeScenes([{ ...scene, ledColors: { 253: "#ff0000" } }]), /LED colors/);
  assert.throws(() => normalizeScenes([scene, scene]), /scene details/);
  assert.throws(() => normalizeScenes(Array.from({ length: 31 }, (_, index) =>
    ({ ...scene, id: `scene-${index}` })
  )), /30 saved scenes/);
});

test("restoring one scene returns independent palette and LED color copies", () => {
  const scene = sceneFromLighting("scene-1234", "Movie", lighting);
  const restored = settingsFromScene(scene);
  restored.palette[0] = "#000000";
  restored.ledColors[0] = "#000000";
  assert.equal(scene.palette[0], "#e879a8");
  assert.equal(scene.ledColors[0], "#ff0000");
});

test("scene backups contain only validated lighting scenes", () => {
  const scene = sceneFromLighting("scene-1234", "Movie", lighting);
  const backup = createSceneBackup([scene]);

  assert.deepEqual(backup, {
    format: "ulleds-scenes",
    version: 1,
    scenes: [scene]
  });
  assert.deepEqual(readSceneBackup(JSON.parse(JSON.stringify(backup))), [scene]);
  assert.throws(() => readSceneBackup({ ...backup, version: 2 }), /supported ULLeds/);
  assert.throws(() => readSceneBackup({ ...backup, scenes: [{ ...scene, color: "invalid" }] }),
    /scene details/);
});

test("import merges new scenes, skips existing IDs, and rejects overflow without truncation", () => {
  const current = sceneFromLighting("scene-current", "Desk", lighting);
  const incoming = [
    current,
    sceneFromLighting("scene-new", "Movie", { ...lighting, color: "#123456" })
  ];
  const merged = mergeScenes([current], incoming);

  assert.deepEqual(merged, {
    scenes: [current, incoming[1]],
    imported: 1,
    skipped: 1
  });
  assert.throws(() => mergeScenes(
    Array.from({ length: 30 }, (_, index) =>
      sceneFromLighting(`scene-${index}`, `Setup ${index}`, lighting)
    ),
    [incoming[1]]
  ), /30 saved scenes/);
});
