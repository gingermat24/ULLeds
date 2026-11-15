"use strict";

const $ = (selector) => document.querySelector(selector);
const pairPanel = $("#pairing-panel");
const connectionPanel = $("#connection-panel");
const remotePanel = $("#remote-panel");
const connection = $(".connection");
let latestState = null;
let refreshTimer = null;
let selectedLedIndices = new Set();
let multiSelectEnabled = false;

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

function getLedLayout(device) {
  const profile = device.profile || {};
  const ledCount = Number(profile.ledCount || device.ledCount);
  if (!Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253) return null;
  return window.ullStripLayout.allocateEdgeIndices(
    ledCount,
    profile.activeEdges || profile.edgeCount || 3,
    profile.installationMethod ?? 0,
    {
      aspectRatio: profile.aspectRatio,
      edgeCounts: profile.allocationMode === "manual" ? profile.edgeCounts : undefined
    }
  );
}

function renderLedMap(settings, layout) {
  const aspectRatio = Number(latestState?.device?.profile?.aspectRatio);
  document.documentElement.style.setProperty(
    "--monitor-aspect-ratio",
    Number.isFinite(aspectRatio) && aspectRatio > 0 ? String(aspectRatio) : "1.7778"
  );
  document.documentElement.style.setProperty(
    "--led-opacity",
    settings.power ? String(settings.brightness / 100) : "0"
  );
  $("#led-map").dataset.power = settings.power ? "on" : "off";
  $("#led-count").textContent = layout
    ? `${layout.ledCount} LEDs`
    : "Connect a controller to preview the strip";
  for (const edge of ["top", "left", "right", "bottom"]) {
    const container = $(`#led-${edge}`);
    const indices = layout?.indices[edge] || [];
    container.hidden = indices.length === 0;
    container.style.setProperty("--pixel-gap", `${25 / Math.max(indices.length, 1)}%`);
    const sameLayout = container.children.length === indices.length &&
      indices.every((index, position) => Number(container.children[position]?.dataset.ledIndex) === index);
    if (!sameLayout) {
      container.replaceChildren(...indices.map((index) => {
        const pixel = document.createElement("button");
        pixel.type = "button";
        pixel.className = "led-pixel";
        pixel.dataset.ledIndex = String(index);
        pixel.setAttribute("aria-label", `Select LED ${index + 1}, ${edge} side`);
        return pixel;
      }));
    }
    for (const [position, index] of indices.entries()) {
      const pixel = container.children[position];
      const color = settings.ledColors?.[index] || settings.color;
      const selected = selectedLedIndices === null || selectedLedIndices.has(index);
      pixel.style.backgroundColor = color;
      pixel.setAttribute("aria-pressed", String(selected));
      pixel.classList.toggle("selected", selected);
      const label = `Select LED ${index + 1}, ${edge} side${selected ? ", selected" : ""}`;
      if (pixel.getAttribute("aria-label") !== label) pixel.setAttribute("aria-label", label);
    }
  }
  renderSelectionSummary(layout);
}

function renderSelectionSummary(layout) {
  const label = $("#selection-label");
  if (selectedLedIndices === null) {
    label.textContent = "All LEDs";
  } else if (selectedLedIndices.size === 0) {
    label.textContent = "Tap a LED to select";
  } else if (selectedLedIndices.size === 1) {
    const index = selectedLedIndices.values().next().value;
    const edge = Object.entries(layout?.indices || {}).find(([, indices]) => indices.includes(index))?.[0];
    label.textContent = `LED ${index + 1}${edge ? ` · ${edge[0].toUpperCase()}${edge.slice(1)}` : ""}`;
  } else {
    label.textContent = `${selectedLedIndices.size} LEDs selected`;
  }
}

function selectEdge(edge) {
  const layout = getLedLayout(latestState.device);
  const indices = layout?.indices[edge] || [];
  if (!indices.length) return;
  if (multiSelectEnabled) {
    const selection = selectedLedIndices === null
      ? new Set(Array.from({ length: layout.ledCount }, (_, index) => index))
      : new Set(selectedLedIndices);
    indices.forEach((index) => selection.add(index));
    selectedLedIndices = selection;
  } else {
    selectedLedIndices = new Set(indices);
  }
  renderLedMap(latestState.settings, layout);
  updateColorControl(latestState.settings, layout.ledCount);
}

function selectLed(index) {
  const layout = getLedLayout(latestState.device);
  if (!layout) return;
  selectedLedIndices = multiSelectEnabled
    ? window.ullLedSelection.selectLed(
      selectedLedIndices === null
        ? new Set(Array.from({ length: layout.ledCount }, (_, led) => led))
        : selectedLedIndices,
      index,
      true
    )
    : window.ullLedSelection.selectLed(new Set(), index);
  renderLedMap(latestState.settings, layout);
  updateColorControl(latestState.settings, layout.ledCount);
}

function updateColorControl(settings, ledCount) {
  const color = window.ullLedSelection.dominantColor(
    selectedLedIndices,
    settings.ledColors || {},
    settings.color,
    ledCount
  );
  if (document.activeElement !== $("#color")) $("#color").value = color;
  $("#color-value").textContent = color.toUpperCase();
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
  const layout = getLedLayout(device);
  if (selectedLedIndices && layout) {
    selectedLedIndices = new Set([...selectedLedIndices].filter((index) => index < layout.ledCount));
  }
  renderLedMap(settings, layout);
  updateColorControl(settings, layout?.ledCount);
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
  $("#screen-sync").disabled = !device.connected;
  $("#spotify-sync").disabled = !device.connected;
  $("#stop-sync").disabled = !sync.active;
  $("#sync-status").textContent = sync.active
    ? `${sync.mode === "spotify" ? "Spotify" : "Screen"} Sync active`
    : "Not active";
  $("#sync-note").textContent = !device.connected
    ? "Connect the LED controller to start Sync."
    : sync.active && sync.mode === "spotify"
      ? "Spotify audio is analyzed locally on your PC."
      : sync.active
        ? "Screen colors are captured on your PC."
        : "Spotify audio is analyzed locally on your PC.";
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
$("#color").addEventListener("change", (event) => {
  if (!latestState) return;
  const selected = selectedLedIndices === null ? null : selectedLedIndices;
  if (!selected || selected.size === 0) {
    void updateSettings({ color: event.target.value });
    return;
  }
  const changes = window.ullLedSelection.fixedColorChanges(
    latestState.settings.color,
    latestState.settings.ledColors || {},
    selected,
    event.target.value
  );
  void updateSettings(changes);
});
$("#led-map").addEventListener("click", (event) => {
  const pixel = event.target.closest(".led-pixel");
  if (pixel) {
    selectLed(Number(pixel.dataset.ledIndex));
    return;
  }
  const edge = event.target.closest(".led-edge");
  if (edge && latestState) selectEdge(edge.dataset.edge);
});
$("#multi-select").addEventListener("change", (event) => {
  multiSelectEnabled = event.target.checked;
  $(".selection-help").textContent = multiSelectEnabled
    ? "Tap lights to add or remove them. With no selection, color applies to all LEDs."
    : "Tap a light or edge to target it. With no selection, color applies to all LEDs.";
});
$("#select-all").addEventListener("click", () => {
  selectedLedIndices = null;
  if (latestState) {
    const layout = getLedLayout(latestState.device);
    renderLedMap(latestState.settings, layout);
    updateColorControl(latestState.settings, layout?.ledCount);
  }
});
$("#clear-selection").addEventListener("click", () => {
  selectedLedIndices = new Set();
  if (latestState) {
    const layout = getLedLayout(latestState.device);
    renderLedMap(latestState.settings, layout);
    updateColorControl(latestState.settings, layout?.ledCount);
  }
});
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
