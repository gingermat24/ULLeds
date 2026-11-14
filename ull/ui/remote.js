"use strict";

const $ = (selector) => document.querySelector(selector);
const pairPanel = $("#pairing-panel");
const connectionPanel = $("#connection-panel");
const remotePanel = $("#remote-panel");
const connection = $(".connection");
let latestState = null;
let refreshTimer = null;

async function request(path, body) {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store"
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);
  return result;
}

function message(selector, text, isError = false) {
  const target = $(selector);
  target.textContent = text;
  target.dataset.error = String(isError);
}

function showPairing() {
  pairPanel.hidden = false;
  connectionPanel.hidden = true;
  remotePanel.hidden = true;
  $("#pairing-pin").focus();
}

function showDisconnected() {
  pairPanel.hidden = true;
  connectionPanel.hidden = false;
  remotePanel.hidden = true;
}

function showRemote() {
  pairPanel.hidden = true;
  connectionPanel.hidden = true;
  remotePanel.hidden = false;
}

function setConnection(online, text) {
  connection.dataset.online = String(online);
  $("#connection-label").textContent = text;
}

function renderPalette(colors) {
  const root = $("#palette");
  root.replaceChildren(...colors.map((color, index) => {
    const row = document.createElement("div");
    row.className = "palette-row";
    const input = document.createElement("input");
    input.type = "color";
    input.value = color;
    input.setAttribute("aria-label", `Palette color ${index + 1}`);
    input.addEventListener("change", () => {
      const palette = [...latestState.settings.palette];
      palette[index] = input.value;
      void updateSettings({ palette });
    });
    row.append(input);
    if (colors.length > 2) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "quiet";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove palette color ${index + 1}`);
      remove.addEventListener("click", () => {
        const palette = [...latestState.settings.palette];
        palette.splice(index, 1);
        void updateSettings({ palette });
      });
      row.append(remove);
    }
    return row;
  }));
  $("#add-color").disabled = colors.length >= 8;
}

function renderScenes(scenes) {
  const root = $("#scenes");
  if (!scenes.length) {
    root.textContent = "No saved scenes yet.";
    root.className = "scenes hint";
    return;
  }
  root.className = "scenes";
  root.replaceChildren(...scenes.map((scene) => {
    const colors = scene.effect === "palette"
      ? scene.palette
      : Object.values(scene.ledColors || {}).slice(0, 8);
    const previewColors = colors.length ? colors : [scene.color];
    const stops = previewColors.map((color, index) =>
      `${color} ${(index / previewColors.length) * 100}% ${((index + 1) / previewColors.length) * 100}%`
    ).join(", ");
    const card = document.createElement("article");
    card.className = "scene-card";
    const preview = document.createElement("div");
    preview.className = "scene-preview";
    preview.setAttribute("aria-hidden", "true");
    preview.style.background = `linear-gradient(90deg, ${stops})`;
    const copy = document.createElement("div");
    copy.className = "scene-copy";
    const name = document.createElement("strong");
    name.className = "scene-name";
    name.textContent = scene.name;
    const effectName = {
      steady: "Solid",
      breathe: "Breathe",
      spectrum: "Spectrum",
      palette: "Palette drift"
    }[scene.effect] || scene.effect;
    const details = [
      effectName,
      scene.effect === "steady" ? null : `${scene.speed}% speed`,
      `${scene.brightness}% brightness`
    ].filter(Boolean);
    const individual = Object.keys(scene.ledColors || {}).length;
    if (individual) details.push(`${individual} individual LEDs`);
    const metadata = document.createElement("div");
    metadata.className = "scene-meta";
    metadata.setAttribute("aria-label", `Details for ${scene.name}`);
    for (const detail of details) {
      const item = document.createElement("span");
      item.textContent = detail;
      metadata.append(item);
    }
    copy.append(name, metadata);
    const actions = document.createElement("div");
    actions.className = "scene-actions";
    const apply = document.createElement("button");
    apply.type = "button";
    apply.className = "primary";
    apply.textContent = "Apply";
    apply.addEventListener("click", () => void runAction(
      "#control-message", () => request("/api/scenes/apply", { id: scene.id }), "Scene applied."
    ));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "quiet";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Delete ${scene.name}`);
    remove.addEventListener("click", () => {
      if (window.confirm(`Delete “${scene.name}”?`)) {
        void runAction("#control-message", () => request("/api/scenes", { action: "delete", id: scene.id }), "Scene deleted.");
      }
    });
    actions.append(apply, remove);
    card.append(preview, copy, actions);
    return card;
  }));
}

function renderState(data) {
  latestState = data;
  const { settings, device, sync } = data;
  $("#device-name").textContent = device.name || "ULLeds";
  $("#device-status").textContent = device.connected
    ? `${device.ledCount || "USB"} LEDs connected`
    : "LED controller disconnected";
  const power = $("#power-toggle");
  power.textContent = settings.power ? "On" : "Off";
  power.setAttribute("aria-pressed", String(settings.power));
  $("#color").value = settings.color;
  $("#color-value").textContent = settings.color.toUpperCase();
  const brightnessEditing = [$("#brightness"), $("#brightness-number")].includes(document.activeElement);
  if (!brightnessEditing) {
    $("#brightness").value = settings.brightness;
    $("#brightness-number").value = settings.brightness;
  }
  $("#effect").value = settings.effect;
  $("#speed-field").hidden = settings.effect === "steady";
  $("#speed").value = settings.speed;
  $("#speed-value").textContent = `${settings.speed}%`;
  $("#palette-section").hidden = settings.effect !== "palette";
  renderPalette(settings.palette);
  ["red", "green", "blue"].forEach((channel, index) => {
    const value = settings.channelGains[index];
    $(`#gain-${channel}`).value = value;
    $(`#gain-${channel}-value`).textContent = `${value}%`;
  });
  $("#sync-fps").value = settings.syncFps;
  $("#sync-fps-value").textContent = `${settings.syncFps} FPS`;
  $("#sync-content").value = settings.syncContentMode;
  $("#sync-auto-detect").checked = settings.syncAutoDetect;
  $("#spotify-sensitivity").value = settings.spotifySensitivity;
  $("#spotify-sensitivity-value").textContent = `${settings.spotifySensitivity}%`;
  $("#screen-sync").setAttribute("aria-pressed", String(sync.active && sync.mode === "screen"));
  $("#spotify-sync").setAttribute("aria-pressed", String(sync.active && sync.mode === "spotify"));
  $("#stop-sync").disabled = !sync.active;
  renderScenes(settings.scenes);
  setConnection(true, "Connected");
}

async function loadState() {
  try {
    const data = await request("/api/state");
    renderState(data);
    showRemote();
  } catch (error) {
    if (/pair this phone/i.test(error.message)) {
      showPairing();
      setConnection(true, "Pairing needed");
    } else {
      setConnection(false, "Reconnecting");
      if (!latestState) showDisconnected();
    }
  }
}

async function runAction(selector, action, successMessage = "") {
  try {
    await action();
    message(selector, successMessage);
    await loadState();
  } catch (error) {
    message(selector, error.message, true);
  }
}

function updateSettings(changes) {
  return runAction("#control-message", () => request("/api/settings", changes), "Updated.");
}

function saveBrightness(value, input) {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    input.value = latestState.settings.brightness;
    $("#brightness").value = latestState.settings.brightness;
    message("#control-message", "Brightness must be a whole number from 0 to 100.", true);
    return;
  }
  input.value = String(value);
  $("#brightness").value = value;
  void updateSettings({ brightness: value });
}

async function setSyncMode(mode) {
  await runAction("#sync-message", () => request("/api/sync", { mode }),
    mode === "lighting" ? "Sync stopped." : `${mode === "screen" ? "Screen" : "Spotify"} Sync requested.`);
}

$("#pairing-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  button.disabled = true;
  message("#pairing-message", "Pairing…");
  try {
    await request("/api/pair", { pin: $("#pairing-pin").value });
    $("#pairing-pin").value = "";
    message("#pairing-message", "");
    await loadState();
  } catch (error) {
    message("#pairing-message", error.message, true);
  } finally {
    button.disabled = false;
  }
});

$("#retry-connection").addEventListener("click", () => void loadState());
$("#power-toggle").addEventListener("click", () => {
  if (latestState) void updateSettings({ power: !latestState.settings.power });
});
$("#color").addEventListener("change", (event) => void updateSettings({ color: event.target.value }));
$("#brightness").addEventListener("input", (event) => {
  $("#brightness-number").value = event.target.value;
});
$("#brightness").addEventListener("change", (event) =>
  saveBrightness(Number(event.target.value), $("#brightness-number"))
);
$("#brightness-number").addEventListener("input", (event) => {
  const value = event.currentTarget.valueAsNumber;
  if (Number.isInteger(value) && value >= 0 && value <= 100) {
    $("#brightness").value = value;
  }
});
$("#brightness-number").addEventListener("change", (event) => {
  const input = event.currentTarget;
  saveBrightness(input.valueAsNumber, input);
});
$("#brightness").addEventListener("blur", () => void loadState());
$("#brightness-number").addEventListener("blur", () => void loadState());
$("#effect").addEventListener("change", (event) => void updateSettings({ effect: event.target.value }));
$("#speed").addEventListener("change", (event) => void updateSettings({ speed: Number(event.target.value) }));
$("#add-color").addEventListener("click", () => {
  if (latestState?.settings.palette.length < 8) {
    void updateSettings({ palette: [...latestState.settings.palette, latestState.settings.color] });
  }
});
["red", "green", "blue"].forEach((channel, index) => {
  $(`#gain-${channel}`).addEventListener("change", (event) => {
    const channelGains = [...latestState.settings.channelGains];
    channelGains[index] = Number(event.target.value);
    void updateSettings({ channelGains });
  });
});
$("#screen-sync").addEventListener("click", () => void setSyncMode("screen"));
$("#spotify-sync").addEventListener("click", () => void setSyncMode("spotify"));
$("#stop-sync").addEventListener("click", () => void setSyncMode("lighting"));
$("#sync-fps").addEventListener("change", (event) => void updateSettings({ syncFps: Number(event.target.value) }));
$("#sync-content").addEventListener("change", (event) => void updateSettings({ syncContentMode: event.target.value }));
$("#sync-auto-detect").addEventListener("change", (event) => void updateSettings({ syncAutoDetect: event.target.checked }));
$("#spotify-sensitivity").addEventListener("change", (event) => void updateSettings({ spotifySensitivity: Number(event.target.value) }));
$("#save-scene").addEventListener("click", () => {
  const name = window.prompt("Name this lighting scene");
  if (name?.trim()) {
    void runAction("#control-message", () => request("/api/scenes", { action: "save", name }),
      "Scene saved.");
  }
});
$("#unpair").addEventListener("click", async () => {
  try {
    await request("/api/unpair", {});
    latestState = null;
    showPairing();
    setConnection(true, "Pairing needed");
  } catch (error) {
    message("#sync-message", error.message, true);
  }
});

function stopRefresh() {
  if (refreshTimer === null) return;
  window.clearInterval(refreshTimer);
  refreshTimer = null;
}

function startRefresh() {
  if (refreshTimer !== null) return;
  void loadState();
  refreshTimer = window.setInterval(() => {
    if (!document.hidden) void loadState();
  }, 2000);
}

window.addEventListener("pagehide", stopRefresh);
window.addEventListener("pageshow", () => {
  if (!document.hidden) startRefresh();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopRefresh();
  else startRefresh();
});
startRefresh();
