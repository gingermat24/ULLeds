"use strict";

const EFFECTS = new Set(["steady", "breathe", "spectrum", "palette"]);

function validColor(value) {
  return typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
}

function normalizeScenes(scenes) {
  if (!Array.isArray(scenes) || scenes.length > 30) {
    throw new TypeError("There can be at most 30 saved scenes.");
  }
  const ids = new Set();
  return scenes.map((scene) => {
    if (!scene || typeof scene !== "object" || Array.isArray(scene) ||
        typeof scene.id !== "string" || !/^[\da-z-]{1,64}$/i.test(scene.id) ||
        ids.has(scene.id) || typeof scene.name !== "string" || !scene.name.trim() ||
        scene.name.trim().length > 36 || !validColor(scene.color) ||
        !Number.isInteger(scene.brightness) || scene.brightness < 0 || scene.brightness > 100 ||
        !EFFECTS.has(scene.effect) || !Number.isInteger(scene.speed) ||
        scene.speed < 1 || scene.speed > 100 ||
        !Array.isArray(scene.palette) || scene.palette.length < 2 || scene.palette.length > 8 ||
        !scene.palette.every(validColor) || !scene.ledColors ||
        typeof scene.ledColors !== "object" || Array.isArray(scene.ledColors)) {
      throw new TypeError("Saved scene details are invalid.");
    }
    const ledColors = Object.entries(scene.ledColors);
    if (ledColors.length > 253 || ledColors.some(([index, color]) =>
      !/^(?:0|[1-9]\d*)$/.test(index) || Number(index) > 252 || !validColor(color))) {
      throw new TypeError("Saved scene LED colors are invalid.");
    }
    ids.add(scene.id);
    return {
      id: scene.id,
      name: scene.name.trim(),
      color: scene.color.toLowerCase(),
      brightness: scene.brightness,
      effect: scene.effect,
      speed: scene.speed,
      palette: scene.palette.map((color) => color.toLowerCase()),
      ledColors: Object.fromEntries(ledColors.map(([index, color]) =>
        [index, color.toLowerCase()]
      ))
    };
  });
}

function sceneFromLighting(id, name, lighting) {
  if (!lighting || typeof lighting !== "object" || Array.isArray(lighting)) {
    throw new TypeError("Lighting settings are required to save a scene.");
  }
  return normalizeScenes([{
    id,
    name,
    color: lighting.color,
    brightness: lighting.brightness,
    effect: lighting.effect,
    speed: lighting.speed,
    palette: lighting.palette,
    ledColors: lighting.ledColors
  }])[0];
}

function settingsFromScene(scene) {
  const normalized = normalizeScenes([scene])[0];
  return {
    color: normalized.color,
    brightness: normalized.brightness,
    effect: normalized.effect,
    speed: normalized.speed,
    palette: [...normalized.palette],
    ledColors: { ...normalized.ledColors }
  };
}

const sceneData = Object.freeze({ normalizeScenes, sceneFromLighting, settingsFromScene });
if (typeof module !== "undefined" && module.exports) module.exports = sceneData;
else globalThis.ullSceneData = sceneData;
