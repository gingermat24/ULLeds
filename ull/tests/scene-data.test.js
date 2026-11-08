"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeScenes, sceneFromLighting, settingsFromScene } = require("../scene-data");

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
