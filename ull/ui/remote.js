"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const pairPanel = $("#pairing-panel");
const connectionPanel = $("#connection-panel");
const remotePanel = $("#remote-panel");
const remoteTabs = $("#remote-tabs");
const connectionStatus = $("#connection-status");

const TOAST_MS = 2600;
const SCENE_NAME_MAX = 36;
const EFFECT_LABELS = {
  steady: "Solid",
  breathe: "Breathe",
  spectrum: "Spectrum",
  palette: "Palette drift"
};

let latestState = null;
let refreshTimer = null;
let selectedLedIndices = new Set();
let multiSelectEnabled = false;
let activePaletteDrag = null;
let renderedPaletteSignature = "";
let toastTimer = null;

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

function toast(text) {
  const element = $("#toast");
  if (!element) return;
  element.textContent = text;
  element.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("visible"), TOAST_MS);
}

function message(selector, text, isError = false) {
  const target = $(selector);
  if (!target) return;
  target.textContent = text;
  target.dataset.error = String(isError);
}

function switchView(name) {
  $$(".tab").forEach((tab) => {
    const active = tab.dataset.view === name;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  $$(".view").forEach((panel) => panel.classList.toggle("hidden", panel.id !== `view-${name}`));
  window.scrollTo({ top: 0 });
}

function showPairing() {
  pairPanel.hidden = false;
  connectionPanel.hidden = true;
  remotePanel.hidden = true;
  remoteTabs.hidden = true;
  $("#pairing-pin").focus();
}

function showDisconnected() {
  pairPanel.hidden = true;
  connectionPanel.hidden = false;
  remotePanel.hidden = true;
  remoteTabs.hidden = true;
}

function showRemote() {
  pairPanel.hidden = true;
  connectionPanel.hidden = true;
  remotePanel.hidden = false;
  remoteTabs.hidden = false;
}

function setConnection(online, text, hasError = false) {
  connectionStatus.classList.toggle("connected", online);
  connectionStatus.classList.toggle("has-error", hasError);
  $("#connection-label").textContent = text;
}

function movePaletteColor(palette, fromIndex, toIndex) {
  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex) ||
      fromIndex < 0 || fromIndex >= palette.length ||
      toIndex < 0 || toIndex >= palette.length ||
      fromIndex === toIndex) return [...palette];
  const reordered = [...palette];
  const [color] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, color);
  return reordered;
}

function reorderPalette(fromIndex, toIndex) {
  if (!latestState) return;
  const palette = movePaletteColor(latestState.settings.palette, fromIndex, toIndex);
  if (palette.every((color, index) => color === latestState.settings.palette[index])) return;
  void updateSettings({ palette });
}

function paletteGripIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 16 16");
  icon.setAttribute("aria-hidden", "true");
  const dots = document.createElementNS("http://www.w3.org/2000/svg", "path");
  dots.setAttribute("d", "M6 4h.01M10 4h.01M6 8h.01M10 8h.01M6 12h.01M10 12h.01");
  icon.append(dots);
  return icon;
}

function paletteRemoveIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  const cross = document.createElementNS("http://www.w3.org/2000/svg", "path");
  cross.setAttribute("d", "M6 6l12 12M18 6L6 18");
  icon.append(cross);
  return icon;
}

function clearPaletteDrag(root) {
  activePaletteDrag = null;
  root.querySelectorAll(".palette-color").forEach((row) => {
    row.classList.remove("is-dragging", "is-drop-target");
  });
}

function updateRangeFill(input) {
  if (!input) return;
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const percent = max > min ? ((Number(input.value) - min) / (max - min)) * 100 : 0;
  input.style.setProperty("--range-fill", `${Math.max(0, Math.min(100, percent))}%`);
}

function renderPalette(colors) {
  const root = $("#palette");
  if (!root) return;
  const signature = JSON.stringify(colors);
  $("#add-color").disabled = colors.length >= 8;
  if (signature === renderedPaletteSignature) return;

  const scrollLeft = root.scrollLeft;
  root.replaceChildren(...colors.map((color, index) => {
    const item = document.createElement("div");
    item.className = "palette-color";
    item.dataset.paletteIndex = String(index);
    item.setAttribute("role", "listitem");

    const input = document.createElement("input");
    input.type = "color";
    input.className = "swatch";
    input.value = color;
    input.setAttribute("aria-label", `Palette color ${index + 1}`);
    input.addEventListener("change", () => {
      const palette = [...latestState.settings.palette];
      palette[index] = input.value;
      void updateSettings({ palette });
    });

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "icon-btn palette-drag-handle";
    handle.setAttribute("aria-label", `Drag palette color ${index + 1} to reorder`);
    handle.title = "Drag to reorder";
    handle.append(paletteGripIcon());
    handle.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
      event.preventDefault();
      activePaletteDrag = { pointerId: event.pointerId, fromIndex: index };
      handle.setPointerCapture(event.pointerId);
      item.classList.add("is-dragging");
    });
    handle.addEventListener("pointermove", (event) => {
      if (activePaletteDrag?.pointerId !== event.pointerId) return;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".palette-color");
      if (!target || !root.contains(target)) return;
      root.querySelectorAll(".palette-color").forEach((entry) => {
        entry.classList.toggle("is-drop-target", entry === target && entry !== item);
      });
    });
    handle.addEventListener("pointerup", (event) => {
      if (activePaletteDrag?.pointerId !== event.pointerId) return;
      const fromIndex = activePaletteDrag.fromIndex;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".palette-color");
      const toIndex = target && root.contains(target) ? Number(target.dataset.paletteIndex) : fromIndex;
      clearPaletteDrag(root);
      reorderPalette(fromIndex, toIndex);
    });
    handle.addEventListener("pointercancel", () => clearPaletteDrag(root));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon-btn palette-remove";
    remove.append(paletteRemoveIcon());
    remove.disabled = colors.length <= 2;
    remove.title = remove.disabled ? "At least two palette colors are required" : `Remove palette color ${index + 1}`;
    remove.setAttribute("aria-label", `Remove palette color ${index + 1}`);
    remove.addEventListener("click", () => {
      const palette = [...latestState.settings.palette];
      palette.splice(index, 1);
      void updateSettings({ palette });
    });

    item.append(input, handle, remove);
    return item;
  }));
  root.scrollLeft = scrollLeft;
  renderedPaletteSignature = signature;
}

function openSceneDialog() {
  const input = $("#scene-name");
  input.value = "";
  $("#scene-dialog").showModal();
  input.focus();
}

function confirmDeleteScene(scene) {
  $("#delete-scene-name").textContent = `Delete “${scene.name}”? This cannot be undone.`;
  $("#delete-scene-dialog").showModal();
  $("#confirm-delete-scene").onclick = () => {
    $("#delete-scene-dialog").close();
    void runAction("#control-message", () => request("/api/scenes", { action: "delete", id: scene.id }), `Deleted ${scene.name}.`);
  };
}

function renderScenes(scenes) {
  const root = $("#scenes");
  if (!root) return;
  if (!scenes.length) {
    const empty = document.createElement("div");
    empty.className = "empty card";
    const heading = document.createElement("h3");
    heading.textContent = "Save a setup for later";
    const copy = document.createElement("p");
    copy.textContent = "Your current color, brightness, effect, speed, palette and individual LED colors are saved together.";
    const button = document.createElement("button");
    button.className = "btn";
    button.type = "button";
    button.textContent = "Save current setup";
    button.addEventListener("click", openSceneDialog);
    empty.append(heading, copy, button);
    root.replaceChildren(empty);
    return;
  }

  root.replaceChildren(...scenes.map((scene) => {
    const colors = scene.effect === "palette"
      ? scene.palette
      : Object.values(scene.ledColors || {}).slice(0, 8);
    const previewColors = colors.length ? colors : [scene.color];
    const stops = previewColors.map((color, index) =>
      `${color} ${(index / previewColors.length) * 100}% ${((index + 1) / previewColors.length) * 100}%`
    ).join(", ");

    const card = document.createElement("article");
    card.className = "scene card";

    const ribbon = document.createElement("div");
    ribbon.className = "scene-ribbon";
    ribbon.setAttribute("aria-hidden", "true");
    ribbon.style.background = `linear-gradient(90deg, ${stops})`;

    const copy = document.createElement("div");
    copy.className = "scene-copy";
    const name = document.createElement("h3");
    name.textContent = scene.name;

    const individual = Object.keys(scene.ledColors || {}).length;
    const details = [
      EFFECT_LABELS[scene.effect] || scene.effect,
      scene.effect === "steady" ? null : `${scene.speed}% speed`,
      `${scene.brightness}% brightness`,
      individual ? `${individual} individual LEDs` : null
    ].filter(Boolean);

    const metadata = document.createElement("ul");
    metadata.className = "scene-meta";
    metadata.setAttribute("aria-label", `Details for ${scene.name}`);
    for (const detail of details) {
      const item = document.createElement("li");
      item.textContent = detail;
      metadata.append(item);
    }
    copy.append(name, metadata);

    const actions = document.createElement("div");
    actions.className = "scene-actions";

    const apply = document.createElement("button");
    apply.type = "button";
    apply.className = "btn btn-primary btn-sm";
    apply.textContent = "Apply";
    apply.setAttribute("aria-label", `Apply ${scene.name}`);
    apply.addEventListener("click", () => void runAction(
      "#control-message", () => request("/api/scenes/apply", { id: scene.id }), `Applied ${scene.name}.`
    ));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-ghost btn-sm";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", `Delete ${scene.name}`);
    remove.addEventListener("click", () => confirmDeleteScene(scene));

    actions.append(apply, remove);
    card.append(ribbon, copy, actions);
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
    : "Waiting for controller";
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
    label.textContent = "No LEDs selected";
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
  if (document.activeElement !== $("#hex-color")) $("#hex-color").value = color;
}

function applySelectedColor(hexColor) {
  if (!latestState) return;
  const selected = selectedLedIndices === null ? null : selectedLedIndices;
  if (!selected || selected.size === 0) {
    void updateSettings({ color: hexColor });
    return;
  }
  const changes = window.ullLedSelection.fixedColorChanges(
    latestState.settings.color,
    latestState.settings.ledColors || {},
    selected,
    hexColor
  );
  void updateSettings(changes);
}

function renderTemporaryOverride(status) {
  const active = Boolean(status?.active);
  $("#override-status").textContent = active
    ? `Active · ${EFFECT_LABELS[status.effect] || "Lighting"} (${Math.ceil(status.remainingMs / 1000)}s)`
    : "No override active";
  $("#start-override").disabled = !latestState?.device.connected || !latestState.settings.power;
  $("#clear-override").disabled = !active;
}

function renderState(data) {
  latestState = data;
  const { settings, device, sync } = data;
  $("#device-name").textContent = device.name || "Lighting";
  $("#device-status").textContent = device.connected
    ? `${device.ledCount || "USB"} LEDs connected`
    : "Not connected";

  const power = $("#power-toggle");
  $("#power-state").textContent = settings.power ? "On" : "Off";
  power.setAttribute("aria-checked", String(settings.power));
  power.setAttribute("aria-label", `LED power: ${settings.power ? "on" : "off"}`);

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
    updateRangeFill($("#brightness"));
  }

  $("#effect").value = settings.effect;
  $("#speed-field").classList.toggle("hidden", settings.effect === "steady");
  $("#speed").value = settings.speed;
  $("#speed-value").textContent = `${settings.speed}%`;
  updateRangeFill($("#speed"));
  $("#palette-section").classList.toggle("hidden", settings.effect !== "palette");
  renderPalette(settings.palette);

  ["red", "green", "blue"].forEach((channel, index) => {
    const value = settings.channelGains[index];
    $(`#gain-${channel}`).value = value;
    $(`#gain-${channel}-value`).textContent = `${value}%`;
    updateRangeFill($(`#gain-${channel}`));
  });

  $("#sync-fps").value = settings.syncFps;
  $("#sync-fps-value").textContent = `${settings.syncFps} FPS`;
  updateRangeFill($("#sync-fps"));
  $("#sync-content").value = settings.syncContentMode;
  $("#sync-auto-detect").checked = settings.syncAutoDetect;
  $("#spotify-sensitivity").value = settings.spotifySensitivity;
  $("#spotify-sensitivity-value").textContent = `${settings.spotifySensitivity}%`;
  updateRangeFill($("#spotify-sensitivity"));

  const activeSources = Array.isArray(sync.sources) ? sync.sources : [];
  const screenActive = activeSources.length > 0
    ? activeSources.includes("screen")
    : sync.active && sync.mode === "screen";
  const spotifyActive = activeSources.length > 0
    ? activeSources.includes("spotify")
    : sync.active && sync.mode === "spotify";

  const setSyncBtn = (selector, active) => {
    const btn = $(selector);
    btn.textContent = active ? "Stop" : "Start";
    btn.setAttribute("aria-pressed", String(active));
    btn.classList.toggle("is-active", active);
    btn.disabled = !device.connected;
  };
  setSyncBtn("#screen-sync", screenActive);
  setSyncBtn("#spotify-sync", spotifyActive);

  $("#screen-sync-description").textContent = !device.connected
    ? "Connect the LED controller on your PC"
    : screenActive
      ? "Matching your PC display"
      : "Match LEDs to your display";

  $("#spotify-sync-description").textContent = !device.connected
    ? "Connect the LED controller on your PC"
    : spotifyActive
      ? "Syncing to Spotify playback on your PC"
      : "Match LEDs to Spotify";

  renderTemporaryOverride(data.temporaryOverride);
  renderScenes(settings.scenes);
  setConnection(true, device.connected ? "Connected" : "Controller offline", !device.connected);
}

async function loadState() {
  try {
    const data = await request("/api/state");
    renderState(data);
    showRemote();
  } catch (error) {
    if (/pair this phone/i.test(error.message)) {
      showPairing();
      setConnection(false, "Pairing needed");
    } else {
      setConnection(false, "Reconnecting", true);
      if (!latestState) showDisconnected();
    }
  }
}

async function runAction(selector, action, successMessage = "") {
  try {
    await action();
    message(selector, successMessage);
    if (successMessage) toast(successMessage);
    await loadState();
  } catch (error) {
    message(selector, error.message, true);
    toast(error.message);
  }
}

function updateSettings(changes) {
  return runAction("#control-message", () => request("/api/settings", changes), "Updated.");
}

function saveBrightness(value, input) {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    input.value = latestState.settings.brightness;
    $("#brightness").value = latestState.settings.brightness;
    updateRangeFill($("#brightness"));
    message("#control-message", "Brightness must be a whole number from 0 to 100.", true);
    return;
  }
  input.value = String(value);
  $("#brightness").value = value;
  updateRangeFill($("#brightness"));
  void updateSettings({ brightness: value });
}

async function toggleSyncMode(mode, currentlyActive) {
  const nextMode = currentlyActive ? "lighting" : mode;
  await runAction(
    "#sync-message",
    () => request("/api/sync", { mode: nextMode }),
    nextMode === "lighting" ? "Sync stopped." : `${mode === "screen" ? "Screen" : "Spotify"} Sync requested.`
  );
}

$$(".tab").forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));

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
  $("#hex-color").value = event.target.value;
  applySelectedColor(event.target.value);
});
$("#hex-color").addEventListener("change", (event) => {
  const value = event.target.value.trim();
  if (/^#[\da-f]{6}$/i.test(value)) {
    const normalized = value.toLowerCase();
    $("#color").value = normalized;
    event.target.value = normalized;
    applySelectedColor(normalized);
  } else {
    event.target.value = $("#color").value;
    toast("Enter a color in #RRGGBB format.");
  }
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
  updateRangeFill(event.target);
});
$("#brightness").addEventListener("change", (event) =>
  saveBrightness(Number(event.target.value), $("#brightness-number"))
);
$("#brightness-number").addEventListener("input", (event) => {
  const value = event.currentTarget.valueAsNumber;
  if (Number.isInteger(value) && value >= 0 && value <= 100) {
    $("#brightness").value = value;
    updateRangeFill($("#brightness"));
  }
});
$("#brightness-number").addEventListener("change", (event) => {
  const input = event.currentTarget;
  saveBrightness(input.valueAsNumber, input);
});
$("#brightness").addEventListener("blur", () => void loadState());
$("#brightness-number").addEventListener("blur", () => void loadState());
$("#effect").addEventListener("change", (event) => void updateSettings({ effect: event.target.value }));
$("#speed").addEventListener("input", (event) => {
  $("#speed-value").textContent = `${event.target.value}%`;
  updateRangeFill(event.target);
});
$("#speed").addEventListener("change", (event) => void updateSettings({ speed: Number(event.target.value) }));
$("#add-color").addEventListener("click", () => {
  if (latestState?.settings.palette.length < 8) {
    void updateSettings({ palette: [...latestState.settings.palette, latestState.settings.color] });
  }
});
["red", "green", "blue"].forEach((channel, index) => {
  $(`#gain-${channel}`).addEventListener("input", (event) => {
    $(`#gain-${channel}-value`).textContent = `${event.target.value}%`;
    updateRangeFill(event.target);
  });
  $(`#gain-${channel}`).addEventListener("change", (event) => {
    const channelGains = [...latestState.settings.channelGains];
    channelGains[index] = Number(event.target.value);
    void updateSettings({ channelGains });
  });
});
$("#reset-color-tuning").addEventListener("click", () => {
  void updateSettings({ channelGains: [100, 100, 100] });
});
$("#screen-sync").addEventListener("click", () => {
  const active = $("#screen-sync").getAttribute("aria-pressed") === "true";
  void toggleSyncMode("screen", active);
});
$("#spotify-sync").addEventListener("click", () => {
  const active = $("#spotify-sync").getAttribute("aria-pressed") === "true";
  void toggleSyncMode("spotify", active);
});
$("#sync-fps").addEventListener("input", (event) => {
  $("#sync-fps-value").textContent = `${event.target.value} FPS`;
  updateRangeFill(event.target);
});
$("#sync-fps").addEventListener("change", (event) => void updateSettings({ syncFps: Number(event.target.value) }));
$("#sync-content").addEventListener("change", (event) => void updateSettings({ syncContentMode: event.target.value }));
$("#sync-auto-detect").addEventListener("change", (event) => void updateSettings({ syncAutoDetect: event.target.checked }));
$("#spotify-sensitivity").addEventListener("input", (event) => {
  $("#spotify-sensitivity-value").textContent = `${event.target.value}%`;
  updateRangeFill(event.target);
});
$("#spotify-sensitivity").addEventListener("change", (event) => void updateSettings({ spotifySensitivity: Number(event.target.value) }));
$("#start-override").addEventListener("click", () => {
  if (!latestState) return;
  const input = {
    color: $("#override-color").value,
    effect: $("#override-effect").value,
    durationMs: Number($("#override-duration").value)
  };
  void runAction("#override-message", () => request("/api/override", input), "Temporary override started.");
});
$("#clear-override").addEventListener("click", () => {
  void runAction("#override-message", () => request("/api/override/clear", {}), "Override cleared.");
});
$("#save-scene").addEventListener("click", openSceneDialog);
$("#scene-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#scene-name").value.trim();
  if (!name || name.length > SCENE_NAME_MAX) {
    toast(`Enter a setup name from 1 to ${SCENE_NAME_MAX} characters.`);
    $("#scene-name").focus();
    return;
  }
  $("#scene-dialog").close();
  void runAction("#control-message", () => request("/api/scenes", { action: "save", name }), "Setup saved.");
});
$("#cancel-scene").addEventListener("click", () => $("#scene-dialog").close());
$("#cancel-delete-scene").addEventListener("click", () => $("#delete-scene-dialog").close());

$("#unpair").addEventListener("click", async () => {
  try {
    await request("/api/unpair", {});
    latestState = null;
    showPairing();
    setConnection(false, "Pairing needed");
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