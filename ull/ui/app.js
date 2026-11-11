"use strict";

/* ==========================================================================
   ULLeds renderer

    1. Constants and state        7. Scenes
    2. Helpers                    8. Screen Sync and Spotify Sync
    3. Settings persistence       9. Updates and release notes
    4. Device and connection     10. Setup wizard and reset
    5. Lighting preview          11. Event binding
    6. Color and selection       12. Startup
   ========================================================================== */


/* ==========================================================================
   1. Constants and state
   ========================================================================== */

const MAX_SCENES = 30;
const MAX_PALETTE_COLORS = 8;
const MAX_LEDS = 253;
const SCENE_NAME_MAX = 36;
const FPS = { min: 5, max: 60, fallback: 30 };
const TOAST_MS = 2600;
const VERSION_NOTICE_MS = 8000;

const EFFECT_LABELS = {
  steady: "Solid",
  breathe: "Breathe",
  spectrum: "Spectrum",
  palette: "Palette drift"
};

let state = {
  settings: {
    color: "#008100",
    brightness: 50,
    channelGains: [100, 100, 100],
    ledCount: null,
    effect: "steady",
    speed: 48,
    palette: ["#e879a8", "#8d7cff", "#55c8d2"],
    ledColors: {},
    scenes: [],
    deviceProfile: null,
    devicePath: "",
    power: true,
    onboarded: false,
    updateFolder: "",
    updateSource: "github",
    syncFps: FPS.fallback,
    syncContentMode: "display",
    syncAutoDetect: true,
    startWithWindows: true,
    startupMode: "lighting"
  },
  device: { connected: false, name: "", serialNumber: "" }
};

// Debounced settings writes.
const queue = { changes: {}, timer: null, flushing: null };

// LED selection: a Set of indices, or null meaning "all LEDs".
let selectedLedIndices = new Set();
let selectedLedAnchorIndex = null;

// Screen Sync / Spotify Sync. Only one session can run at a time.
const sync = {
  session: null,
  lifecycle: window.ullScreenSyncLifecycle.createScreenSyncLifecycle(),
  generation: 0,
  requestedMode: null,
  autoAttempted: false,
  screenError: "",
  spotifyError: ""
};

// Device discovery.
const devices = { list: [], connecting: false, connectingPath: "" };

// Updates and release notes.
const updates = { busy: false, progress: { phase: "idle", percent: null, transferred: 0, total: 0 } };
const releases = {
  builtin: [],          // from the changelog block in index.html
  published: null,      // Map(version → release) once GitHub history loads
  installers: null,     // Map(version → installer) once GitHub downloads load
  latest: null,         // newest installer
  selected: null,       // version currently shown
  versions: [],         // versions in display order
  previousIndex: null
};

let setupOnboarding = false;
let sceneDialogMode = null;
let pendingVersionNotice = null;
let toastTimer;
let versionNoticeTimer;


/* ==========================================================================
   2. Helpers
   ========================================================================== */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/** Tiny element builder: h("button", { class: "btn", onclick }, "Label") */
function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? "" : value);
  }
  node.append(...children.filter(Boolean));
  return node;
}

const currentProfile = () => state.device.profile || state.settings.deviceProfile;

function buildLayout(ledCount, profile) {
  return window.ullStripLayout.allocateEdgeIndices(
    ledCount,
    clamp(Number(profile?.edgeCount) || 3, 1, 4),
    profile?.installationMethod ?? 0
  );
}

const stripLayoutSignature = (layout) => JSON.stringify([layout.ledCount, layout.indices]);

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("visible"), TOAST_MS);
}

// Saved profiles and live HID data can still carry the original vendor name.
// Show a neutral product label instead of the legacy branding.
function deviceLabel(value, fallback = "USB LED controller") {
  const text = String(value || "").trim();
  if (!text) return fallback;
  const cleaned = text
    .replace(/\brobo\s*bloq\b/gi, "")
    .replace(/\bpc\s*sync\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s·,:;-]+|[\s·,:;-]+$/g, "")
    .trim();
  if (!cleaned || /^backlight$/i.test(cleaned)) return fallback;
  return cleaned;
}

function calibratedColor(color, gains = [100, 100, 100]) {
  const channels = color.slice(1).match(/../g).map((part, index) =>
    clamp(Math.round(Number.parseInt(part, 16) * gains[index] / 100), 0, 255)
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function updateRangeFill(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const percent = max > min ? ((Number(input.value) - min) / (max - min)) * 100 : 0;
  input.style.setProperty("--range-fill", `${clamp(percent, 0, 100)}%`);
}

const updateRangeFills = () => $$('input[type="range"]').forEach(updateRangeFill);

function updateMonitorAspectRatio() {
  const { width, height } = window.screen;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
  document.documentElement.style.setProperty("--monitor-aspect-ratio", String(width / height));
}

function stopTracks(stream) {
  stream?.getTracks().forEach((track) => track.stop());
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
  $("main").scrollTo({ top: 0 });
}


/* ==========================================================================
   3. Settings persistence
   ========================================================================== */

function queueSettings(changes, immediate = false) {
  Object.assign(state.settings, changes);
  Object.assign(queue.changes, changes);
  updatePreview();
  clearTimeout(queue.timer);
  if (immediate) {
    queue.timer = null;
    void flushSettingsQueue();
    return;
  }
  queue.timer = setTimeout(() => {
    queue.timer = null;
    void flushSettingsQueue();
  }, 16);
}

async function flushSettingsQueue() {
  if (queue.flushing) return queue.flushing;
  queue.flushing = (async () => {
    while (Object.keys(queue.changes).length) {
      const pending = queue.changes;
      queue.changes = {};
      try {
        const result = await window.ull.updateSettings(pending);
        state.settings = result.settings;
        Object.assign(state.settings, queue.changes);
        state.device = result;
        renderConnection();
        updatePreview();
        if (Object.hasOwn(pending, "scenes")) renderScenes();
        if (Object.hasOwn(pending, "palette")) renderPalette();
      } catch (error) {
        queue.changes = { ...pending, ...queue.changes };
        console.error("Could not save ULLeds settings:", error);
        toast(`Could not save settings: ${error.message}`);
        break;
      }
    }
  })();
  try {
    await queue.flushing;
  } finally {
    queue.flushing = null;
  }
}

/** Save settings immediately and adopt the controller's reply. */
async function saveSettingsNow(changes) {
  const result = await window.ull.updateSettings(changes);
  state.settings = result.settings;
  state.device = result;
  return result;
}


/* ==========================================================================
   4. Device and connection
   ========================================================================== */

function applyDeviceState(device) {
  state.device = device;
  const profile = device.connected && device.profile;
  if (!device.connected && sync.session) stopScreenSync("Controller disconnected.");
  if (profile?.ledCount) {
    const hadProfile = Boolean(state.settings.deviceProfile);
    state.settings.deviceProfile = profile;
    state.settings.ledCount = profile.ledCount;
    state.settings.devicePath = device.devicePath;
    if (!hadProfile && profile.color) state.settings.color = profile.color;
  }
}

function renderConnection() {
  const indicator = $("#device-status");
  const label = $("#device-label");
  const { connected, error } = state.device;

  indicator.classList.toggle("connected", connected);
  indicator.classList.toggle("has-error", Boolean(error));

  const details = connected
    ? deviceLabel(state.device.name, "LED controller connected")
    : error || "No LED controller connected";
  label.textContent = connected ? "Connected" : error ? "Connection issue" : "Not connected";
  label.title = details;
  indicator.title = details;

  renderDeviceSelector();

  $("#settings-device").textContent = connected
    ? `${deviceLabel(state.device.name)}${state.device.serialNumber ? ` · ${state.device.serialNumber}` : ""}`
    : (error || "Not connected");

  renderProfile(currentProfile());
}

function renderDeviceSelector() {
  const select = $("#controller-select");
  const currentPath = devices.connectingPath || state.device.devicePath || state.settings.devicePath || "";
  const options = devices.list.map((device, index) => {
    const ids = `${Number(device.vendorId).toString(16).padStart(4, "0")}:${Number(device.productId).toString(16).padStart(4, "0")}`;
    const iface = device.interface == null ? null : `interface ${device.interface}`;
    const detail = device.serialNumber
      ? [device.serialNumber, iface].filter(Boolean).join(" · ")
      : [ids, iface || `controller ${index + 1}`].join(" · ");
    return { value: device.path, label: `${deviceLabel(device.name)} · ${detail}` };
  });

  if (options.length === 0) {
    select.replaceChildren(new Option("No compatible controller found", ""));
    select.disabled = true;
    return;
  }
  select.replaceChildren(...options.map(({ value, label }) => new Option(label, value)));
  select.disabled = devices.connecting;
  select.value = options.some((option) => option.value === currentPath)
    ? currentPath
    : state.device.connected && options.some((option) => option.value === state.device.devicePath)
      ? state.device.devicePath
      : "";
}

function renderProfile(profile) {
  const countSource = profile?.countSource === "saved profile"
    ? "saved setup"
    : state.device.connected ? "detected" : "last saved";
  $("#settings-count").textContent = profile?.ledCount
    ? `${profile.ledCount} LEDs · ${countSource}`
    : "Not detected";
  $("#settings-order").textContent = profile?.colorOrder || "Not configured";
  $("#settings-layout").textContent = profile?.edgeCount
    ? `${edgeCoverageLabel(profile.edgeCount)} · starts ${profileStartCorner(profile.edgeCount, profile.installationMethod ?? 0)}`
    : "Not configured";
}

async function scanDevices() {
  $("#device-label").textContent = "Scanning for the controller…";
  try {
    const result = await window.ull.scanDevices();
    devices.list = result.devices || [];
    applyDeviceState(result);
    render();
    if ($("#setup-dialog").open) updateProfileCount();
    if (!state.device.connected && !result.error) {
      toast(devices.list.length ? "Controller found but not connected." : "No supported USB controller found.");
    }
  } catch (error) {
    state.device = { connected: false, error: error.message };
    renderConnection();
    toast(`Scan failed: ${error.message}`);
  }
}

async function connectSelectedDevice(devicePath) {
  if (!devicePath || devices.connecting) return;
  devices.connecting = true;
  devices.connectingPath = devicePath;
  renderDeviceSelector();
  try {
    const device = await window.ull.connectDevice(devicePath);
    applyDeviceState(device);
    render();
    toast(device.connected
      ? `Connected to ${deviceLabel(device.name)}.`
      : device.error || "Could not connect to that controller.");
  } catch (error) {
    toast(`Could not connect to the selected controller: ${error.message}`);
  } finally {
    devices.connecting = false;
    devices.connectingPath = "";
    renderDeviceSelector();
  }
}


/* ==========================================================================
   5. Lighting preview
   ========================================================================== */

function setPixelColor(pixel, color) {
  if (pixel.dataset.color === color) return;
  pixel.style.backgroundColor = color;
  pixel.dataset.color = color;
}

/** Paint the live preview from a session's sampled colors. */
function paintSessionPixels(session) {
  for (const pixel of session.pixelElements) {
    setPixelColor(pixel, session.colors[Number(pixel.dataset.ledIndex)]);
  }
}

function renderEdgePixels(container, indices, edge) {
  const sameLayout = container.children.length === indices.length &&
    indices.every((index, position) => Number(container.children[position]?.dataset.ledIndex) === index);

  if (!sameLayout) {
    container.replaceChildren(...indices.map((index) =>
      h("button", {
        type: "button",
        class: "led-pixel",
        dataset: { ledIndex: String(index) },
        "aria-label": `Select LED ${index + 1}, ${edge} side`
      })
    ));
  }

  for (const [position, index] of indices.entries()) {
    const pixel = container.children[position];
    const selected = window.ullLedSelection.isLedSelected(selectedLedIndices, index);
    const color = calibratedColor(
      sync.session?.colors?.[index] || state.settings.ledColors?.[index] || state.settings.color,
      state.settings.channelGains
    );
    const label = `Select LED ${index + 1}, ${edge} side${selected ? ", selected" : ""}`;

    setPixelColor(pixel, color);
    if (pixel.getAttribute("aria-label") !== label) pixel.setAttribute("aria-label", label);
    pixel.setAttribute("aria-pressed", String(selected));
    pixel.classList.toggle("selected", selected);
  }
}

function selectedColor() {
  if (!selectedLedIndices?.size) return state.settings.color;
  const first = selectedLedIndices.values().next().value;
  return state.settings.ledColors?.[first] || state.settings.color;
}

/** Re-render everything that depends on settings, device or selection. */
function updatePreview() {
  const settings = state.settings;
  const profile = currentProfile();
  const count = Number.isInteger(profile?.ledCount) ? clamp(profile.ledCount, 1, MAX_LEDS) : 0;
  const layout = count ? buildLayout(count, profile) : { counts: {}, indices: {} };

  if (selectedLedIndices && count) {
    selectedLedIndices = new Set([...selectedLedIndices].filter((index) => index < count));
  }
  if (selectedLedAnchorIndex !== null && selectedLedAnchorIndex >= count) {
    selectedLedAnchorIndex = null;
  }

  renderMonitor(settings, profile, count, layout);
  renderSelectionSummary(count, layout);
  renderControls(settings);
  renderSyncControls(settings);

  if (sync.session) {
    const signature = stripLayoutSignature(layout);
    if (sync.session.layoutSignature !== signature) {
      sync.session.layout = layout;
      sync.session.layoutSignature = signature;
      sync.session.colors = null;
    }
    sync.session.pixelElements = $$(".led-pixel");
  }

  updateRangeFills();
}

function renderMonitor(settings, profile, count, layout) {
  for (const edge of ["top", "left", "right", "bottom"]) {
    const indices = layout.indices[edge] || [];
    const container = $(`#led-${edge}`);
    renderEdgePixels(container, indices, edge);
    container.classList.toggle("hidden", indices.length === 0);
    container.classList.toggle("selected", window.ullLedSelection.isEdgeSelected(selectedLedIndices, indices));
  }

  $("#monitor").dataset.power = settings.power ? "on" : "off";
  $("#preview-title").textContent = "LED layout preview";

  const root = document.documentElement.style;
  root.setProperty("--led-color", settings.color);
  root.setProperty("--led-opacity", settings.power ? String(settings.brightness / 100) : "0");

  $("#preview-led-count").textContent = count
    ? `${count} LEDs ${profile?.countSource === "saved profile"
      ? "from saved setup"
      : state.device.connected ? "detected" : "saved"}`
    : "Waiting for controller";

  $("#power-toggle").setAttribute("aria-checked", String(settings.power));
  $("#power-toggle").setAttribute("aria-label", `LED power: ${settings.power ? "on" : "off"}`);
  $("#power-state").textContent = settings.power ? "On" : "Off";
}

function renderSelectionSummary(count, layout) {
  const label = $("#selection-label");
  if (selectedLedIndices === null) {
    label.textContent = "All LEDs";
  } else if (selectedLedIndices.size === 0) {
    label.textContent = "No LEDs selected";
  } else if (selectedLedIndices.size === 1) {
    const index = selectedLedIndices.values().next().value;
    const edge = Object.entries(layout.indices).find(([, indices]) => indices.includes(index))?.[0];
    label.textContent = `LED ${index + 1}${edge ? ` · ${edge[0].toUpperCase()}${edge.slice(1)}` : ""}`;
  } else {
    label.textContent = `${selectedLedIndices.size} LEDs selected`;
  }

  const selectedCount = selectedLedIndices === null ? count : selectedLedIndices.size;
  const button = $("#apply-gradient");
  button.disabled = selectedCount === 0;
  button.textContent = selectedCount
    ? `Apply across ${plural(selectedCount, "LED")}`
    : "Apply gradient";
}

function renderControls(settings) {
  const gainIds = ["red", "green", "blue"];
  gainIds.forEach((name, index) => {
    $(`#rgb-${name}`).value = settings.channelGains[index];
    $(`#rgb-${name}-value`).textContent = `${settings.channelGains[index]}%`;
  });

  const color = selectedColor();
  $("#color-picker").value = color;
  $("#hex-color").value = color;
  $("#brightness").value = settings.brightness;
  $("#brightness-value").textContent = `${settings.brightness}%`;
  $("#speed").value = settings.speed;
  $("#speed-value").textContent = `${settings.speed}%`;
  $("#effect").value = settings.effect;
  $("#palette-tuning").classList.toggle("hidden", settings.effect !== "palette");
  $("#speed-control").classList.toggle("hidden", settings.effect === "steady");

  const fps = clamp(Number(settings.syncFps) || FPS.fallback, FPS.min, FPS.max);
  $("#sync-fps-range").value = fps;
  if (document.activeElement !== $("#sync-fps-number")) $("#sync-fps-number").value = fps;
  $("#sync-content-mode").value = settings.syncContentMode || "display";
  $("#sync-auto-detect").checked = settings.syncAutoDetect !== false;
}

function renderSyncControls(settings) {
  const { lifecycle } = sync;
  const startingScreen = lifecycle.isStarting && sync.requestedMode === "screen";
  const startingSpotify = lifecycle.isStarting && sync.requestedMode === "spotify";
  const restoringScreen = settings.startupMode === "screen" &&
    sync.autoAttempted && !sync.session && !sync.screenError;
  const restoringSpotify = settings.startupMode === "spotify" &&
    sync.autoAttempted && !sync.session && !sync.spotifyError;

  const setToggle = (button, { active, starting, resumingNow = false }) => {
    button.textContent = lifecycle.isStopping
      ? "Stopping…"
      : active ? "Stop" : resumingNow ? "Starting…" : "Start";
    button.disabled = lifecycle.isStopping || (lifecycle.isStarting && !starting);
    button.classList.toggle("is-active", active || resumingNow);
  };

  setToggle($("#screen-sync-toggle"), {
    active: sync.session?.mode === "screen" || startingScreen,
    starting: startingScreen,
    resumingNow: restoringScreen
  });
  setToggle($("#spotify-sync-toggle"), {
    active: sync.session?.mode === "spotify" || startingSpotify,
    starting: startingSpotify,
    resumingNow: restoringSpotify
  });

  $("#screen-sync-description").textContent = sync.session
    ? sync.session.mode === "spotify" ? "Spotify Sync is active" : "Matching the primary display"
    : startingScreen ? "Starting display capture…"
    : restoringScreen ? "Resuming display capture…"
    : sync.screenError || "Match LEDs to your display";

  $("#spotify-sync-description").textContent = sync.session?.mode === "spotify"
    ? "Reading Spotify cover art on this PC"
    : restoringSpotify ? "Resuming Spotify Sync…"
    : sync.spotifyError || "Use colors from the currently playing track";
}

function render() {
  $("#app-version").textContent = state.version || "—";
  $("#start-with-windows").checked = state.settings.startWithWindows;
  renderUpdates();
  renderScenes();
  renderPalette();
  renderConnection();
  updatePreview();
}

function renderPalette() {
  $("#palette-swatches").replaceChildren(...state.settings.palette.map((color, index) =>
    h("input", {
      type: "color",
      class: "swatch",
      value: color,
      "aria-label": `Palette color ${index + 1}`,
      oninput: (event) => {
        const palette = [...state.settings.palette];
        palette[index] = event.target.value;
        queueSettings({ palette });
      }
    })
  ));
}


/* ==========================================================================
   6. Color and selection
   ========================================================================== */

const syncIsActive = () => Boolean(sync.session) || sync.lifecycle.isStarting;

/** Manual lighting changes end any running sync first. */
function stopActiveSync() {
  return syncIsActive() ? stopScreenSync("", true) : Promise.resolve();
}

function applyColor(color, all = false) {
  void stopActiveSync();
  try {
    queueSettings(window.ullLedSelection.fixedColorChanges(
      state.settings.color,
      state.settings.ledColors,
      all ? null : selectedLedIndices,
      color
    ), true);
  } catch (error) {
    toast(error.message);
  }
}

async function applyGradient() {
  const ledCount = Number(currentProfile()?.ledCount);
  if (!Number.isInteger(ledCount) || ledCount < 1 || ledCount > MAX_LEDS) {
    return toast("Connect a controller with a detected LED count before applying a gradient.");
  }
  if (selectedLedIndices?.size === 0) return toast("Select at least one LED first.");
  try {
    const selectedCount = selectedLedIndices === null ? ledCount : selectedLedIndices.size;
    const changes = window.ullLedSelection.gradientChanges(
      state.settings.ledColors,
      selectedLedIndices,
      ledCount,
      $("#gradient-start").value,
      $("#gradient-end").value
    );
    await stopActiveSync();
    queueSettings(changes, true);
    toast(`Applied a gradient across ${selectedCount} LEDs.`);
  } catch (error) {
    console.error("Could not apply LED gradient:", error);
    toast(`Could not apply gradient: ${error.message}`);
  }
}

function selectPreviewPosition(event) {
  const pixel = event.target.closest(".led-pixel");
  const edge = pixel?.closest(".led-edge") || event.target.closest(".led-edge");
  if (!edge) return;

  if (pixel) {
    const index = Number(pixel.dataset.ledIndex);
    selectedLedIndices = event.shiftKey && selectedLedAnchorIndex !== null
      ? window.ullLedSelection.selectLedRange(selectedLedAnchorIndex, index)
      : window.ullLedSelection.selectLed(selectedLedIndices, index, event.ctrlKey || event.metaKey);
    selectedLedAnchorIndex = index;
  } else {
    const profile = currentProfile();
    const count = Number(profile?.ledCount);
    if (!Number.isInteger(count)) return;
    selectedLedIndices = new Set(buildLayout(count, profile).indices[edge.dataset.edge] || []);
    selectedLedAnchorIndex = null;
  }
  updatePreview();
}

function setSelection(indices) {
  selectedLedIndices = indices;
  selectedLedAnchorIndex = null;
  updatePreview();
}


/* ==========================================================================
   7. Scenes
   ========================================================================== */

function renderScenes() {
  const root = $("#scene-grid");
  const scenes = state.settings.scenes || [];
  $("#export-scenes").disabled = scenes.length === 0;

  if (!scenes.length) {
    root.replaceChildren(h("div", { class: "empty" },
      h("h3", { text: "Save a setup for later" }),
      h("p", { text: "Your current color, brightness, effect, speed, palette and individual LED colors are saved together." }),
      h("button", { class: "btn", type: "button", text: "Save current setup", onclick: () => openSceneDialog("create") })
    ));
    return;
  }

  root.replaceChildren(...scenes.map(buildSceneCard));
}

function buildSceneCard(scene) {
  const previewColors = scene.effect === "palette" ? scene.palette : Object.values(scene.ledColors).slice(0, 8);
  const colors = previewColors.length ? previewColors : [scene.color];
  const stops = colors.map((color, index) =>
    `${color} ${(index / colors.length) * 100}% ${((index + 1) / colors.length) * 100}%`
  ).join(", ");

  const individual = Object.keys(scene.ledColors).length;
  const summary = [
    EFFECT_LABELS[scene.effect] ?? scene.effect,
    scene.effect === "steady" ? null : `${scene.speed}% speed`,
    `${scene.brightness}% brightness`,
    individual ? `${individual} individual LEDs` : null
  ].filter(Boolean).join(" · ");

  const action = (label, className, handler) => h("button", {
    class: className,
    type: "button",
    text: label,
    "aria-label": `${label} ${scene.name}`,
    onclick: handler
  });

  const ribbon = h("div", { class: "scene-ribbon", "aria-hidden": "true" });
  ribbon.style.background = `linear-gradient(90deg, ${stops})`;

  return h("article", { class: "scene" },
    ribbon,
    h("div", {}, h("h3", { text: scene.name }), h("p", { text: summary })),
    h("div", { class: "scene-actions" },
      action("Apply", "btn btn-primary btn-sm", () => applyScene(scene)),
      action("Rename", "btn btn-ghost btn-sm", () => openSceneDialog("rename", scene)),
      action("Duplicate", "btn btn-ghost btn-sm", () => duplicateScene(scene)),
      action("Delete", "btn btn-ghost btn-sm", () => confirmDeleteScene(scene))
    )
  );
}

function openSceneDialog(mode, scene = null) {
  if (mode === "create" && state.settings.scenes.length >= MAX_SCENES) {
    return toast(`You can save up to ${MAX_SCENES} lighting setups.`);
  }
  const renaming = mode === "rename";
  sceneDialogMode = { mode, id: scene?.id || null };
  $("#scene-dialog-title").textContent = renaming ? "Rename this setup" : "Name this setup";
  $("#scene-dialog-copy").textContent = renaming
    ? "Choose a name that will help you find this lighting later."
    : "This saves your current lighting without changing device or Screen Sync settings.";
  $("#save-scene-name").textContent = renaming ? "Save name" : "Save setup";
  $("#scene-name").value = scene?.name || "";
  $("#scene-dialog").showModal();
  $("#scene-name").focus();
  if (renaming) $("#scene-name").select();
}

function saveSceneName(event) {
  event.preventDefault();
  const renaming = sceneDialogMode?.mode === "rename";
  const name = $("#scene-name").value.trim();
  if (!name || name.length > SCENE_NAME_MAX) {
    toast(`Enter a setup name from 1 to ${SCENE_NAME_MAX} characters.`);
    $("#scene-name").focus();
    return;
  }

  const scenes = [...state.settings.scenes];
  if (renaming) {
    const index = scenes.findIndex((scene) => scene.id === sceneDialogMode.id);
    if (index === -1) return toast("That setup no longer exists.");
    scenes[index] = { ...scenes[index], name };
  } else {
    if (scenes.length >= MAX_SCENES) return toast(`You can save up to ${MAX_SCENES} lighting setups.`);
    scenes.push(window.ullSceneData.sceneFromLighting(`scene-${crypto.randomUUID()}`, name, state.settings));
  }

  queueSettings({ scenes }, true);
  $("#scene-dialog").close();
  sceneDialogMode = null;
  toast(renaming ? "Setup renamed." : "Setup saved.");
}

function duplicateScene(scene) {
  if (state.settings.scenes.length >= MAX_SCENES) {
    return toast(`You can save up to ${MAX_SCENES} lighting setups.`);
  }
  const copy = window.ullSceneData.sceneFromLighting(
    `scene-${crypto.randomUUID()}`,
    `${scene.name} copy`.slice(0, SCENE_NAME_MAX),
    scene
  );
  queueSettings({ scenes: [...state.settings.scenes, copy] }, true);
  toast(`Copied ${scene.name}.`);
}

function confirmDeleteScene(scene) {
  $("#delete-scene-name").textContent = `Delete “${scene.name}”? This cannot be undone.`;
  $("#delete-scene-dialog").showModal();
  $("#confirm-delete-scene").onclick = () => {
    queueSettings({ scenes: state.settings.scenes.filter((entry) => entry.id !== scene.id) }, true);
    $("#delete-scene-dialog").close();
    toast(`Deleted ${scene.name}.`);
  };
}

async function applyScene(scene) {
  await stopActiveSync();
  selectedLedIndices = new Set();
  selectedLedAnchorIndex = null;

  const lighting = window.ullSceneData.settingsFromScene(scene);
  const ledCount = Number(currentProfile()?.ledCount);
  if (Number.isInteger(ledCount) && ledCount > 0) {
    lighting.ledColors = Object.fromEntries(
      Object.entries(lighting.ledColors).filter(([index]) => Number(index) < ledCount)
    );
  }
  queueSettings(lighting, true);
  toast(`Applied ${scene.name}.`);
}

async function exportScenes() {
  try {
    const result = await window.ull.exportScenes();
    if (result.canceled) return;
    toast(`Exported ${plural(result.count, "lighting setup")}.`);
  } catch (error) {
    console.error("Could not export lighting setups:", error);
    toast(`Could not export setups: ${error.message}`);
  }
}

async function importScenes() {
  try {
    const result = await window.ull.importScenes();
    if (result.canceled) return;
    state.settings = result.settings;
    renderScenes();
    if (result.imported === 0) {
      toast(result.skipped ? "Those setups are already in ULLeds." : "No setups were imported.");
      return;
    }
    const skipped = result.skipped ? ` ${result.skipped} already existed and were skipped.` : "";
    toast(`Imported ${plural(result.imported, "lighting setup")}.${skipped}`);
  } catch (error) {
    console.error("Could not import lighting setups:", error);
    toast(`Could not import setups: ${error.message}`);
  }
}


/* ==========================================================================
   8. Screen Sync and Spotify Sync
   Both modes share one session slot (sync.session), one lifecycle guard and
   one generation counter. A start that finds the generation changed was
   cancelled and must release everything it acquired.
   ========================================================================== */

function teardownSession(session) {
  if (!session) return;
  clearInterval(session.performanceTimer);
  clearTimeout(session.pollTimer);
  cancelAnimationFrame(session.frame);
  cancelAnimationFrame(session.audioFrame);
  if (session.videoFrame && typeof session.video?.cancelVideoFrameCallback === "function") {
    session.video.cancelVideoFrameCallback(session.videoFrame);
  }
  session.stream?.getTracks().forEach((track) => {
    track.onended = null;
    track.stop();
  });
  stopTracks(session.audioStream);
  if (session.audioContext && session.audioContext.state !== "closed") {
    void session.audioContext.close().catch((error) =>
      console.error("Could not close the Spotify audio analyzer:", error)
    );
  }
}

function stopScreenSync(message = "") {
  const pending = sync.lifecycle.stop(() => {
    sync.generation += 1;
    sync.requestedMode = null;
    const session = sync.session;
    sync.session = null;
    sync.screenError = "";
    teardownSession(session);
  }, async () => {
    try {
      const result = await window.ull.stopScreenSync();
      state.settings.startupMode = result.startupMode;
    } catch (error) {
      toast(`Could not stop LED sync: ${error.message}`);
    }
  });

  updatePreview();
  if (message) toast(message);
  return pending.then(() => {
    updatePreview();
  }, (error) => {
    updatePreview();
    toast(`Could not stop screen sync cleanly: ${error.message}`);
  });
}

async function ensurePowerOn() {
  if (state.settings.power) return;
  await saveSettingsNow({ power: true });
  render();
}

function createFrameSender(session, stoppedMessage) {
  return window.ullScreenSync.createLatestFrameSender({
    send: (colors) => window.ull.sendScreenSyncColors(colors),
    isActive: () => sync.session === session,
    getColors: () => session.colors,
    onError: (error) => stopScreenSync(`${stoppedMessage}: ${error.message}`)
  });
}

/* --- Screen Sync ---------------------------------------------------------- */

function startScreenSync(options = {}) {
  sync.requestedMode = "screen";
  const pending = sync.lifecycle.start(() => runScreenSyncStart(options));
  updatePreview();
  return pending.catch((error) => {
    toast(`Could not start screen sync: ${error.message}`);
  }).finally(() => {
    if (sync.requestedMode === "screen") sync.requestedMode = null;
    updatePreview();
  });
}

async function runScreenSyncStart({ automatic = false } = {}) {
  const generation = ++sync.generation;
  const cancelled = () => generation !== sync.generation;

  if (!state.device.connected) return toast("Connect the LED controller before starting screen sync.");
  if (!navigator.mediaDevices?.getUserMedia) {
    return toast("Screen sharing is not available in this app environment.");
  }
  const profile = currentProfile();
  const ledCount = Number(profile?.ledCount);
  if (!Number.isInteger(ledCount)) return toast("The controller has not reported its LED count.");
  const layout = buildLayout(ledCount, profile);

  let stream;
  let hardwareSyncStarted = false;
  updatePreview();

  try {
    const capture = window.ull.screenSyncSource().then(({ id }) =>
      navigator.mediaDevices.getUserMedia(
        window.ullScreenSync.createDesktopCaptureConstraints(id, state.settings.syncFps)
      )
    );
    await ensurePowerOn();
    stream = await capture;
    if (cancelled()) return stopTracks(stream);

    const video = h("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
    if (cancelled()) return stopTracks(stream);

    if (!stream.getVideoTracks().length) throw new Error("The display capture did not provide a video track.");
    if (stream.getAudioTracks().length) {
      throw new Error("Screen Sync received an audio track; audio input is not supported.");
    }
    if (!video.videoWidth || !video.videoHeight) {
      throw new Error("The shared display has no available video dimensions.");
    }

    const scale = Math.min(1, 320 / Math.max(video.videoWidth, video.videoHeight));
    const canvas = h("canvas");
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Could not start screen color sampling.");

    await window.ull.startScreenSync();
    state.settings.startupMode = "screen";
    hardwareSyncStarted = true;
    if (cancelled()) return stopTracks(stream);

    const session = {
      mode: "screen",
      stream,
      video,
      canvas,
      context,
      letterboxTracker: window.ullScreenSync.createLetterboxStability(),
      movieFormatPromptGate: window.ullScreenSync.createMovieFormatPromptGate(),
      detectedAspectRatio: null,
      frame: 0,
      videoFrame: 0,
      lastSample: 0,
      colors: null,
      layout,
      layoutSignature: stripLayoutSignature(layout)
    };
    sync.session = session;
    startPerformanceReporting(session);
    sync.screenError = "";

    const sendLatestFrame = createFrameSender(session, "Screen sync stopped");
    stream.getVideoTracks()[0].onended = () => {
      if (sync.session === session) stopScreenSync("Screen sharing ended.");
    };
    session.frame = requestAnimationFrame(createScreenSampler(session, sendLatestFrame));
    updatePreview();
  } catch (error) {
    const sessionOwnsStream = sync.session?.stream === stream;
    if (!sessionOwnsStream) stopTracks(stream);
    if (!sessionOwnsStream && (hardwareSyncStarted || automatic) && !sync.lifecycle.isStopping) {
      try {
        const result = await window.ull.stopScreenSync();
        state.settings.startupMode = result.startupMode;
      } catch (stopError) {
        console.error("Could not stop screen sync after startup failed:", stopError);
      }
    }
    if (sessionOwnsStream) stopScreenSync();

    const message = automatic
      ? `Could not resume screen sync: ${error.message}. Start it manually from Lighting.`
      : error.name === "NotAllowedError"
        ? "Screen sharing was canceled or blocked."
        : `Could not start screen sync: ${error.message}`;
    if (automatic) sync.screenError = message;
    updatePreview();
    toast(message);
  } finally {
    updatePreview();
  }
}

function startPerformanceReporting(session) {
  const resetWindow = (now) => Object.assign(session, {
    performanceWindowStartedAt: now,
    performanceCallbackCount: 0,
    performanceSampleCount: 0,
    performanceSampleTotalMs: 0,
    performanceSampleMaxMs: 0
  });
  resetWindow(performance.now());

  session.performanceTimer = window.setInterval(() => {
    if (sync.session !== session) return;
    const now = performance.now();
    window.ull.recordScreenSyncPerformance({
      windowMs: now - session.performanceWindowStartedAt,
      callbackCount: session.performanceCallbackCount,
      sampleCount: session.performanceSampleCount,
      sampleTotalMs: session.performanceSampleTotalMs,
      sampleMaxMs: session.performanceSampleMaxMs
    });
    resetWindow(now);
  }, 1000);
}

const manualPictureRatio = () => (state.settings.syncContentMode === "cinema235" ? 2.35 : null);

function createScreenSampler(session, sendLatestFrame) {
  const { video, canvas, context } = session;

  const sampleFrame = (now) => {
    if (sync.session !== session) return;
    session.performanceCallbackCount += 1;
    if (typeof video.requestVideoFrameCallback === "function") {
      session.videoFrame = video.requestVideoFrameCallback(sampleFrame);
    } else {
      session.frame = requestAnimationFrame(sampleFrame);
    }

    const fps = clamp(Number(state.settings.syncFps) || FPS.fallback, FPS.min, FPS.max);
    if (!window.ullScreenSync.isSampleFrameDue(session.lastSample, now, fps) || video.readyState < 2) return;
    session.lastSample = now;
    session.performanceSampleCount += 1;

    const startedAt = performance.now();
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      trackLetterbox(session, pixels, now);
      session.colors = window.ullScreenSync.sampleStripColors(
        pixels,
        canvas.width,
        canvas.height,
        session.layout,
        session.detectedAspectRatio || manualPictureRatio()
      );
      paintSessionPixels(session);
      void sendLatestFrame();
    } catch (error) {
      stopScreenSync(`Screen sync stopped: ${error.message}`);
    } finally {
      const duration = performance.now() - startedAt;
      session.performanceSampleTotalMs += duration;
      session.performanceSampleMaxMs = Math.max(session.performanceSampleMaxMs, duration);
    }
  };

  return sampleFrame;
}

/** Watch for stable letterbox bars and offer the detected movie format. */
function trackLetterbox(session, pixels, now) {
  if (state.settings.syncAutoDetect === false) {
    session.letterboxTracker.reset();
    return;
  }
  const { canvas } = session;
  const ratio = window.ullScreenSync.detectLetterboxAspectRatio(pixels, canvas.width, canvas.height);
  const stableRatio = session.letterboxTracker.update(ratio, now);

  if (session.detectedAspectRatio !== null && session.letterboxTracker.isMissingStable()) {
    session.detectedAspectRatio = null;
    toast("Widescreen ended; Screen Sync returned to your saved picture area.");
  }

  const manual = manualPictureRatio();
  if (stableRatio !== null &&
      (manual === null || Math.abs(manual - stableRatio) > 0.05) &&
      session.movieFormatPromptGate.shouldPrompt(stableRatio)) {
    window.ull.notifyMovieFormat(stableRatio);
  }
}

function applyDetectedMovieFormat({ aspectRatio }) {
  if (sync.session?.mode !== "screen" || !Number.isFinite(aspectRatio) ||
      aspectRatio < 1.78 || aspectRatio > 2.6) return;
  const ratio = Math.round(aspectRatio * 100) / 100;
  sync.session.detectedAspectRatio = ratio;
  toast(`Using ${ratio.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}:1 for this Screen Sync session.`);
}

function maybeRestoreStartupMode() {
  const mode = state.settings.startupMode;
  if (sync.autoAttempted || !state.device.connected || !state.settings.power ||
      !window.ullStartupMode.isSyncStartupMode(mode)) return;
  sync.autoAttempted = true;
  updatePreview();
  if (mode === "screen") void startScreenSync({ automatic: true });
  else void startSpotifySync({ automatic: true });
}

/* --- Spotify Sync --------------------------------------------------------- */

function startSpotifySync({ automatic = false } = {}) {
  if (!state.device.connected) {
    toast("Connect the LED controller before starting Spotify Sync.");
    return Promise.resolve(false);
  }
  if (sync.lifecycle.isStarting || sync.lifecycle.isStopping) return Promise.resolve(false);
  if (typeof navigator.mediaDevices?.getUserMedia !== "function") {
    toast("Desktop audio capture is not available in this app environment.");
    return Promise.resolve(false);
  }

  const closeAudioContext = (context) => {
    if (context && context.state !== "closed") {
      void context.close().catch((error) =>
        console.error("Could not close the Spotify audio analyzer:", error)
      );
    }
  };

  let audioCapture;
  let audioContext;
  let audioReady;
  try {
    audioCapture = window.ull.screenSyncSource().then(({ id }) =>
      navigator.mediaDevices.getUserMedia(
        window.ullScreenSync.createDesktopAudioCaptureConstraints(id)
      )
    ).then((stream) => {
      stream.getVideoTracks().forEach((track) => track.stop());
      return stream;
    });
    audioContext = new AudioContext();
    audioReady = audioContext.resume();
  } catch (error) {
    void audioCapture?.then(stopTracks);
    void audioReady?.catch(() => {});
    closeAudioContext(audioContext);
    toast(`Could not start desktop audio capture: ${error.message}`);
    return Promise.resolve(false);
  }

  sync.requestedMode = "spotify";
  const pending = sync.lifecycle.start(() =>
    runSpotifySyncStart(audioCapture, audioContext, audioReady, automatic)
  );
  updatePreview();
  return pending.catch((error) => {
    void audioCapture.then(stopTracks, () => {});
    closeAudioContext(audioContext);
    sync.spotifyError = error.message;
    toast(`${automatic ? "Could not resume" : "Could not start"} Spotify Sync: ${error.message}`);
  }).finally(() => {
    if (sync.requestedMode === "spotify") sync.requestedMode = null;
    updatePreview();
  });
}

async function runSpotifySyncStart(audioCapture, audioContext, audioReady, automatic) {
  const generation = ++sync.generation;
  const cancelled = () => generation !== sync.generation;

  if (!state.device.connected) throw new Error("Connect the LED controller before starting Spotify Sync.");
  if (typeof window.ull.getSpotifyArtwork !== "function") {
    throw new Error("Spotify cover-art reading is not available in this app environment.");
  }
  const profile = currentProfile();
  const ledCount = Number(profile?.ledCount);
  if (!Number.isInteger(ledCount)) throw new Error("The controller has not reported its LED count.");
  const layout = buildLayout(ledCount, profile);

  let session;
  let audioStream;
  let hardwareSyncStarted = false;
  updatePreview();

  try {
    const [artwork, stream] = await Promise.all([window.ull.getSpotifyArtwork(), audioCapture, audioReady]);
    audioStream = stream;
    if (!artwork) throw new Error("Start a track in the Spotify desktop app before enabling Spotify Sync.");
    if (!stream.getAudioTracks().length) {
      throw new Error("Windows did not provide desktop audio. Check the system audio capture permission.");
    }
    if (cancelled()) {
      stopTracks(stream);
      await audioContext.close();
      return;
    }

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.72;
    audioContext.createMediaStreamSource(stream).connect(analyser);

    await ensurePowerOn();
    await window.ull.startScreenSync("spotify");
    state.settings.startupMode = "spotify";
    hardwareSyncStarted = true;
    if (cancelled()) {
      await window.ull.stopScreenSync();
      return;
    }

    session = {
      mode: "spotify",
      pollTimer: null,
      colors: null,
      palette: null,
      audioLevels: { bass: 0, mid: 0, treble: 0, energy: 0 },
      audioStream,
      audioContext,
      analyser,
      frequencyData: new Float32Array(analyser.frequencyBinCount),
      audioFrame: 0,
      startedAt: performance.now(),
      layout,
      layoutSignature: stripLayoutSignature(layout)
    };
    sync.session = session;
    sync.spotifyError = "";

    const sendLatestFrame = createFrameSender(session, "Spotify Sync stopped");
    updatePreview();
    await applySpotifyArtwork(session, artwork, sendLatestFrame);
    session.audioFrame = requestAnimationFrame((now) => sampleSpotifyAudio(session, now, sendLatestFrame));
    session.pollTimer = window.setTimeout(() => void pollSpotifyArtwork(session, sendLatestFrame), 1500);
    toast("Spotify Sync is active. Music response uses local desktop audio.");
  } catch (error) {
    if (sync.session === session) {
      await stopScreenSync();
    } else if ((hardwareSyncStarted || automatic) && !sync.lifecycle.isStopping) {
      try {
        const result = await window.ull.stopScreenSync();
        state.settings.startupMode = result.startupMode;
      } catch (stopError) {
        console.error("Could not stop LED sync after Spotify Sync startup failed:", stopError);
      }
    }
    if (sync.session !== session) {
      stopTracks(audioStream);
      if (audioContext && audioContext.state !== "closed") await audioContext.close();
    }
    throw error;
  }
}

async function applySpotifyArtwork(session, artwork, sendLatestFrame) {
  if (!artwork?.contentType || !artwork.data) {
    throw new Error("Spotify has no cover art available for the current track.");
  }
  const image = new Image();
  image.src = `data:${artwork.contentType};base64,${artwork.data}`;
  await image.decode();
  if (sync.session !== session) return;

  const canvas = h("canvas");
  canvas.width = 48;
  canvas.height = 48;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Could not read Spotify cover art.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  session.palette = window.ullSpotifySync.createSpotifySyncColors(
    context.getImageData(0, 0, canvas.width, canvas.height).data,
    5
  );
  session.artworkData = artwork.data;
  renderSpotifyFrame(session, performance.now(), sendLatestFrame);
}

function renderSpotifyFrame(session, now, sendLatestFrame) {
  if (sync.session !== session || !session.palette) return;
  session.colors = window.ullSpotifySync.createSpotifyReactiveColors(
    session.palette,
    session.audioLevels,
    session.layout.ledCount,
    Math.max(0, now - session.startedAt) / 1000
  );
  paintSessionPixels(session);
  void sendLatestFrame();
}

function sampleSpotifyAudio(session, now, sendLatestFrame) {
  if (sync.session !== session) return;
  session.analyser.getFloatFrequencyData(session.frequencyData);
  session.audioLevels = window.ullSpotifySync.analyzeSpotifySpectrum(
    session.frequencyData,
    session.audioContext.sampleRate,
    session.analyser.fftSize
  );
  renderSpotifyFrame(session, now, sendLatestFrame);
  session.audioFrame = requestAnimationFrame((next) => sampleSpotifyAudio(session, next, sendLatestFrame));
}

async function pollSpotifyArtwork(session, sendLatestFrame) {
  if (sync.session !== session) return;
  try {
    const artwork = await window.ull.getSpotifyArtwork();
    if (sync.session !== session) return;
    if (artwork && artwork.data !== session.artworkData) {
      await applySpotifyArtwork(session, artwork, sendLatestFrame);
    }
  } catch (error) {
    if (sync.session === session) console.error("Could not refresh Spotify cover art:", error);
  } finally {
    if (sync.session === session) {
      session.pollTimer = window.setTimeout(() => void pollSpotifyArtwork(session, sendLatestFrame), 1500);
    }
  }
}


/* ==========================================================================
   9. Updates and release notes
   ========================================================================== */

const IDLE_PROGRESS = Object.freeze({ phase: "idle", percent: null, transferred: 0, total: 0 });

function setUpdatePhase(phase, extra = {}) {
  updates.progress = { ...IDLE_PROGRESS, phase, ...extra };
}

function renderUpdates() {
  const local = state.settings.updateSource === "local";
  $$('input[name="update-source"]').forEach((input) => {
    input.checked = input.value === (local ? "local" : "github");
  });
  $("#update-folder-label").textContent = state.settings.updateFolder || "No folder selected";
  $("#local-update-controls").classList.toggle("hidden", !local);
  $("#github-update-note").classList.toggle("hidden", local);
  $("#check-updates").disabled = updates.busy;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** unit).toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function formatUpdateProgress({ percent, transferred, total }) {
  const amount = `${formatBytes(transferred)}${total > 0 ? ` of ${formatBytes(total)}` : " downloaded"}`;
  return Number.isFinite(percent) ? `${amount} · ${Math.round(percent)}%` : amount;
}

function showUpdateMessage(message, error = false, readyToInstall = false) {
  const root = $("#update-message");
  root.classList.remove("hidden");
  root.classList.toggle("error", error);
  $("#update-status-text").textContent = message;

  const { phase, percent } = updates.progress;
  const active = phase === "checking" || phase === "downloading" || phase === "installing";
  const progress = $("#update-progress");
  const detail = $("#update-progress-detail");
  progress.classList.toggle("hidden", !active);
  detail.classList.toggle("hidden", !active);
  progress.classList.toggle("indeterminate", active && percent === null);

  if (active && Number.isFinite(percent)) {
    const value = clamp(percent, 0, 100);
    $("#update-progress-fill").style.width = `${value}%`;
    progress.setAttribute("aria-valuenow", String(Math.round(value)));
  } else {
    $("#update-progress-fill").style.width = active ? "35%" : "0";
    progress.removeAttribute("aria-valuenow");
  }

  detail.textContent = phase === "checking"
    ? "Connecting to the selected update source…"
    : phase === "installing"
      ? "ULLeds will reopen automatically. Please wait; do not launch it manually."
      : active ? formatUpdateProgress(updates.progress) : "";

  $("#update-actions").replaceChildren(...(readyToInstall
    ? [h("button", { class: "btn btn-primary", type: "button", text: "Restart and update", onclick: installUpdate })]
    : []));
}

function showUpdateReady(version) {
  setUpdatePhase("ready");
  showUpdateMessage(`ULLeds ${version} is ready. Your saved settings will be kept.`, false, true);
}

/** Shared handling for "an update is available" results. */
function showUpdateAvailable(result) {
  if (result.downloaded || updates.progress.phase === "ready") {
    showUpdateReady(result.version);
    return;
  }
  if (updates.progress.phase !== "downloading") setUpdatePhase("downloading");
  showUpdateMessage(`Downloading ULLeds ${result.version}…`);
}

function selectUpdateSource(source) {
  if (!["github", "local"].includes(source)) throw new TypeError("Unsupported update source.");
  queueSettings({ updateSource: source }, true);
  renderUpdates();
  showUpdateMessage(
    source === "github"
      ? "Updates will be checked against the public ULLeds GitHub Releases."
      : state.settings.updateFolder
        ? `Local update folder: ${state.settings.updateFolder}`
        : "Choose the folder containing the ULLeds update package."
  );
}

async function chooseUpdateFolder() {
  try {
    const result = await window.ull.chooseUpdateFolder();
    if (result.canceled) return;
    state.settings.updateFolder = result.folder;
    state.settings.updateSource = "local";
    render();
    showUpdateMessage(`Update source set to ${result.folder}`);
  } catch (error) {
    showUpdateMessage(`Could not select the update folder: ${error.message}`, true);
  }
}

async function checkUpdates() {
  const local = state.settings.updateSource === "local";
  if (local && !state.settings.updateFolder) {
    showUpdateMessage("Choose the folder containing the ULLeds update package.");
    return;
  }
  if (updates.busy) return;

  updates.busy = true;
  const button = $("#check-updates");
  button.disabled = true;
  button.textContent = "Checking…";
  setUpdatePhase("checking");
  showUpdateMessage(local ? "Checking the local update folder…" : "Checking GitHub Releases…");

  try {
    const result = await window.ull.checkUpdates();
    if (result.available) {
      showUpdateAvailable(result);
    } else if (result.upToDate) {
      setUpdatePhase("idle");
      showUpdateMessage(`ULLeds ${result.version} is up to date.`);
    } else {
      setUpdatePhase("error");
      showUpdateMessage(result.error || "No update is available.", Boolean(result.error));
    }
  } catch (error) {
    setUpdatePhase("error");
    showUpdateMessage(`Update check failed: ${error.message}`, true);
  } finally {
    updates.busy = false;
    button.disabled = false;
    button.textContent = "Check for updates";
    renderUpdates();
  }
}

async function installUpdate() {
  setUpdatePhase("installing");
  showUpdateMessage("Installing the update and restarting ULLeds…");
  const button = $("#update-actions button");
  if (button) button.disabled = true;
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  try {
    const result = await window.ull.installUpdate();
    if (result.installing) {
      showUpdateMessage(`Restarting to update ULLeds to ${result.version}…`);
    } else {
      setUpdatePhase("error");
      showUpdateMessage(result.error || "No update is available.", Boolean(result.error));
    }
  } catch (error) {
    setUpdatePhase("error");
    showUpdateMessage(`Could not install the update: ${error.message}`, true);
  }
}

/** Install a specific published release (Update or Downgrade button). */
async function startReleaseUpdate(version, button) {
  if (updates.busy) return false;
  updates.busy = true;
  switchView("updates");
  if (button) button.disabled = true;
  setUpdatePhase("checking");
  showUpdateMessage(`Preparing ULLeds ${version}…`);

  try {
    const result = await window.ull.installRelease(version);
    if (result.available) {
      showUpdateAvailable(result);
      return true;
    }
    setUpdatePhase(result.upToDate ? "idle" : "error");
    showUpdateMessage(result.error || `ULLeds ${result.version} is already installed.`, Boolean(result.error));
    return false;
  } catch (error) {
    setUpdatePhase("error");
    showUpdateMessage(`Could not prepare ULLeds ${version}: ${error.message}`, true);
    return false;
  } finally {
    updates.busy = false;
    if (button) button.disabled = false;
    renderUpdates();
  }
}

/* --- Startup update banner ------------------------------------------------ */

function dismissVersionNotice() {
  clearTimeout(versionNoticeTimer);
  $("#version-notice").classList.add("hidden");
}

function showVersionNotice(installer) {
  const setupDialog = $("#setup-dialog");
  if (setupDialog.open) {
    pendingVersionNotice = installer;
    setupDialog.addEventListener("close", () => {
      if (!pendingVersionNotice) return;
      const pending = pendingVersionNotice;
      pendingVersionNotice = null;
      showVersionNotice(pending);
    }, { once: true });
    return;
  }

  $("#version-notice-title").textContent = `ULLeds ${installer.version} is available`;
  const button = $("#version-notice-update");
  button.onclick = () => {
    void startReleaseUpdate(installer.version, button).then((started) => {
      if (started) dismissVersionNotice();
    });
  };
  $("#version-notice").classList.remove("hidden");
  clearTimeout(versionNoticeTimer);
  versionNoticeTimer = setTimeout(dismissVersionNotice, VERSION_NOTICE_MS);
}

/* --- Release notes -------------------------------------------------------- */

const compareReleaseVersions = (a, b) => window.ullGithubReleases.compareVersions(a, b);

/** Built-in changelog from the JSON block in index.html, newest first. */
function loadBuiltinChangelog() {
  const data = JSON.parse($("#changelog-data").textContent);
  const entries = data.releases.map(({ version, notes }) => ({
    version,
    categories: Object.entries(notes).map(([name, items]) => ({ name, items }))
  }));
  for (const version of data.legacy.versions) {
    entries.push({ version, categories: [{ name: "History", items: [data.legacy.note] }] });
  }
  return entries;
}

/** Keep only well-formed { name, items[] } categories with real text. */
function cleanCategories(categories) {
  if (!Array.isArray(categories)) return [];
  return categories
    .filter((category) => typeof category?.name === "string" && Array.isArray(category.items))
    .map((category) => ({
      name: category.name,
      items: category.items.filter((item) => typeof item === "string" && item.trim())
    }))
    .filter((category) => category.items.length > 0);
}

function releaseEntries() {
  const byVersion = new Map(releases.builtin.map((entry) => [entry.version, entry]));
  for (const version of releases.published?.keys() ?? []) {
    if (!byVersion.has(version)) byVersion.set(version, { version, categories: [] });
  }
  return [...byVersion.values()].sort((a, b) => compareReleaseVersions(b.version, a.version));
}

function releaseBadge(version) {
  const isInstalled = version === state.version;
  if (!releases.installers) return isInstalled ? "Current" : "";
  if (version === releases.latest?.version) return isInstalled ? "Current" : "Latest";
  return isInstalled ? "Installed" : "";
}

function releaseDate(release) {
  const iso = typeof release?.date === "string" && !Number.isNaN(Date.parse(release.date)) ? release.date : null;
  if (iso) {
    const text = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
      .format(new Date(iso));
    return h("time", { class: "release-date", datetime: iso, text });
  }
  return releases.published ? h("span", { class: "release-date", text: "Date unavailable" }) : null;
}

function releaseAction(version) {
  const installer = releases.installers?.get(version);
  if (!installer || !state.version) return null;
  const comparison = compareReleaseVersions(version, state.version);
  if (comparison === 0) return null;
  const label = comparison > 0 ? "Update" : "Downgrade";
  const button = h("button", {
    class: "btn btn-sm",
    type: "button",
    text: label,
    "aria-label": `${label} to ULLeds ${version}`
  });
  button.addEventListener("click", () => void startReleaseUpdate(version, button));
  return button;
}

function buildReleaseEntry(entry) {
  const { version } = entry;
  const published = releases.published?.get(version);
  const fromGithub = cleanCategories(published?.categories);
  const categories = fromGithub.length ? fromGithub : cleanCategories(entry.categories);
  const badge = releaseBadge(version);
  const legacy = releases.published && !published;

  return h("article", { class: "panel release", hidden: true },
    h("header", { class: "release-head" },
      h("h3", { text: `ULLeds ${version}` }),
      badge && h("span", { class: "badge", text: badge }),
      legacy && h("span", { class: "badge badge-quiet", text: "Legacy" }),
      releaseAction(version),
      releaseDate(published)
    ),
    ...categories.map(({ name, items }) =>
      h("div", { class: "release-category" },
        h("strong", { text: name }),
        h("ul", {}, ...items.map((item) => h("li", { text: item })))
      )
    )
  );
}

function renderReleases() {
  const entries = releaseEntries();
  releases.versions = entries.map((entry) => entry.version);
  releases.previousIndex = null;

  $("#release-track").replaceChildren(...entries.map(buildReleaseEntry));
  const selected = releases.versions.indexOf(releases.selected);
  showRelease(selected >= 0 ? selected : 0);
}

function showRelease(index) {
  const count = releases.versions.length;
  if (count === 0) return;
  const current = clamp(index, 0, count - 1);
  const entries = [...$("#release-track").children];

  entries.forEach((entry, i) => { entry.hidden = i !== current; });

  const previous = releases.previousIndex;
  if (previous !== null && previous !== current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const direction = current > previous ? 1 : -1;
    entries[current].animate(
      [{ opacity: 0, transform: `translateX(${direction * 8}px)` }, { opacity: 1, transform: "translateX(0)" }],
      { duration: 200, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
    );
  }

  releases.selected = releases.versions[current];
  releases.previousIndex = current;
  const position = $("#release-position");
  position.value = String(current + 1);
  $("#release-total").textContent = String(count);
  $("#release-newer").hidden = current === 0;
  $("#release-older").hidden = current === count - 1;
}

const stepRelease = (delta) => {
  const count = releases.versions.length;
  if (count) showRelease(releases.previousIndex + delta);
};

function commitReleaseJump() {
  const position = $("#release-position");
  const raw = position.value.trim();
  const requested = Number(raw);
  const count = releases.versions.length;
  if (/^\d+$/.test(raw) && Number.isSafeInteger(requested) && requested >= 1 && requested <= count) {
    showRelease(requested - 1);
  } else {
    position.value = String(releases.previousIndex + 1);
  }
}

async function loadReleaseDownloads() {
  const status = $("#release-status");
  try {
    const [installers, history] = await Promise.all([
      window.ull.listReleaseDownloads(),
      window.ull.listReleaseHistory()
    ]);
    if (!Array.isArray(installers)) throw new Error("GitHub returned an invalid release list.");
    if (!Array.isArray(history)) throw new Error("GitHub returned an invalid release history.");

    releases.installers = new Map(installers.map((installer) => [installer.version, installer]));
    releases.latest = installers[0] ?? null;
    releases.published = new Map(
      history
        .filter((release) => typeof release?.version === "string" && /^\d+\.\d+\.\d+$/.test(release.version))
        .map((release) => [release.version, release])
    );
    status.classList.add("hidden");
    renderReleases();

    if (releases.latest && state.version && compareReleaseVersions(releases.latest.version, state.version) > 0) {
      showVersionNotice(releases.latest);
    }
  } catch (error) {
    console.error("Could not load GitHub release downloads:", error);
    status.textContent = "Could not load releases from GitHub. Showing the built-in release notes.";
    status.classList.remove("hidden");
  }
}


/* ==========================================================================
   10. Strip profile and reset
   ========================================================================== */

const PROFILE_EDGE_LAYOUTS = [
  { value: 1, title: "Top only", edges: ["top"] },
  { value: 2, title: "Top + left", edges: ["top", "left"] },
  { value: 3, title: "Top, left + right", edges: ["top", "left", "right"] },
  { value: 4, title: "All four sides", edges: ["top", "left", "right", "bottom"] }
];

function edgeCoverageLabel(edgeCount) {
  return PROFILE_EDGE_LAYOUTS.find((layout) => layout.value === Number(edgeCount))?.title || "Not configured";
}

function profileStartCorner(edgeCount, installationMethod) {
  const horizontal = Number(edgeCount) === 1 ? "top" : "bottom";
  const side = Number(installationMethod) === 1 ? "right" : "left";
  return `${horizontal}-${side}`;
}

function profileCount() {
  const saved = currentProfile();
  return state.device.connected && Number.isInteger(state.device.profile?.ledCount)
    ? state.device.profile.ledCount
    : Number.isInteger(saved?.ledCount)
      ? saved.ledCount
      : Number.isInteger(state.settings.ledCount) ? state.settings.ledCount : null;
}

function updateProfileCount() {
  const count = profileCount();
  $("#profile-led-count").textContent = count
    ? `${count} LEDs ${state.device.connected ? "detected" : "saved"}`
    : "Not detected";
  $("#profile-scan").textContent = state.device.connected ? "Scan again" : "Scan for controller";
}

function profileEdgeDiagram(activeEdges) {
  const coordinates = {
    top: [12, 8, 60, 8],
    right: [60, 8, 60, 40],
    bottom: [12, 40, 60, 40],
    left: [12, 8, 12, 40]
  };
  const lines = Object.entries(coordinates).map(([edge, [x1, y1, x2, y2]]) =>
    h("line", {
      x1, y1, x2, y2,
      class: `profile-diagram-edge${activeEdges.includes(edge) ? " is-active" : ""}`
    })
  );
  return h("svg", { class: "profile-diagram", viewBox: "0 0 72 48", "aria-hidden": "true" },
    h("rect", { x: 15, y: 11, width: 42, height: 26, rx: 2, class: "profile-diagram-screen" }),
    ...lines
  );
}

function profileChoice(name, value, title, description, checked, illustration = null) {
  const input = h("input", { type: "radio", name, value: String(value) });
  input.checked = checked;
  return h("label", { class: `profile-choice${illustration ? " profile-layout-choice" : ""}` },
    input,
    illustration,
    h("span", { class: "profile-choice-copy" },
      h("strong", { text: title }),
      h("span", { text: description })
    )
  );
}

function profileDirectionOptions(edgeCount) {
  if (edgeCount === 1) {
    return [
      ["Top-left start", "Runs across the top from left to right."],
      ["Top-right start", "Runs across the top from right to left."]
    ];
  }
  const routes = {
    2: [
      ["Starts at bottom-left", "Up the left edge, then across the top from left to right."],
      ["Starts at bottom-right", "Up the right edge, then across the top from right to left."]
    ],
    3: [
      ["Starts at bottom-left", "Up left, across the top left to right, then down right."],
      ["Starts at bottom-right", "Up right, across the top right to left, then down left."]
    ],
    4: [
      ["Starts at bottom-left", "Up left, across the top, down right, then across the bottom right to left."],
      ["Starts at bottom-right", "Up right, across the top, down left, then across the bottom left to right."]
    ]
  };
  return routes[edgeCount] || routes[3];
}

function renderProfileDirectionChoices(edgeCount, selectedMethod) {
  const container = $("#profile-direction-choices");
  const options = profileDirectionOptions(edgeCount);
  const leftStart = profileChoice(
    "installationMethod", 0, options[0][0], options[0][1], selectedMethod === 0
  );
  const rightStart = profileChoice(
    "installationMethod", 1, options[1][0], options[1][1], selectedMethod === 1
  );
  container.replaceChildren(leftStart, rightStart);
}

function selectField(label, id, setting, value, options) {
  const select = h("select", { id, dataset: { setting } },
    ...options.map(([optionValue, text]) => h("option", { value: optionValue, text }))
  );
  select.value = value;
  return h("label", { class: "field", for: id }, h("span", { text: label }), select);
}

function renderProfileEditor() {
  const current = currentProfile() || {};
  const edgeCount = PROFILE_EDGE_LAYOUTS.some((layout) => layout.value === Number(current.edgeCount))
    ? Number(current.edgeCount)
    : 3;
  const installationMethod = current.installationMethod === 1 ? 1 : 0;
  const content = $("#profile-content");

  $("#profile-title").textContent = setupOnboarding ? "Set up your LED strip" : "Edit strip layout";
  $("#profile-copy").textContent = "Match the layout to how your LEDs are installed. ULLeds detects the LED count from your controller.";
  $("#profile-save").textContent = setupOnboarding ? "Save and start using ULLeds" : "Save profile";
  $("#profile-cancel").textContent = setupOnboarding ? "Set up later" : "Cancel";

  content.replaceChildren(
    h("div", { class: "profile-count" },
      h("div", { class: "profile-count-copy" },
        h("span", { text: "LED count" }),
        h("strong", { id: "profile-led-count", text: "Not detected" })
      ),
      h("button", {
        class: "btn",
        id: "profile-scan",
        type: "button",
        text: "Scan for controller",
        onclick: scanDevices
      })
    ),
    h("fieldset", { class: "profile-section" },
      h("legend", { text: "Which sides have LEDs?" }),
      h("p", { class: "hint", text: "Choose the edges your strip covers. The pictures show exactly which edges each choice means." }),
      h("div", { class: "profile-layout-choices" },
        ...PROFILE_EDGE_LAYOUTS.map((layout) => profileChoice(
          "edgeCount",
          layout.value,
          layout.title,
          `${layout.value} ${layout.value === 1 ? "side" : "sides"}`,
          edgeCount === layout.value,
          profileEdgeDiagram(layout.edges)
        ))
      )
    ),
    h("fieldset", { class: "profile-section" },
      h("legend", { text: "Where does LED 1 start?" }),
      h("p", { class: "hint", text: "This sets the direction used for LED numbers, per-LED colors, and gradients." }),
      h("div", { class: "profile-direction-choices", id: "profile-direction-choices" })
    ),
    h("details", { class: "disclosure profile-advanced" },
      h("summary", { text: "Color order (advanced)" }),
      h("div", { class: "profile-advanced-content" },
        h("p", { class: "hint", text: "Most controllers use RGB. Change this only if colors appear in the wrong order." }),
        selectField("LED color order", "profile-color-order", "colorOrder", current.colorOrder || "RGB",
          ["RGB", "GRB", "RBG", "GBR", "BRG", "BGR"].map((order) => [order, order]))
      )
    )
  );
  updateProfileCount();
  renderProfileDirectionChoices(edgeCount, installationMethod);
}

function openSetup(onboarding = !state.settings.onboarded) {
  setupOnboarding = onboarding;
  renderProfileEditor();
  $("#setup-dialog").showModal();
}

async function saveProfile() {
  try {
    let current = currentProfile() || {};
    let detectedCount = profileCount();
    if (!Number.isInteger(detectedCount)) {
      await scanDevices();
      current = currentProfile() || {};
      detectedCount = profileCount();
    }
    if (!Number.isInteger(detectedCount)) {
      return toast("Connect your controller so ULLeds can detect the LED count.");
    }

    const field = (name) => $(`[name="${name}"]:checked`)?.value;
    const changes = {
      deviceProfile: {
        name: deviceLabel(state.device.profile?.name || current.name),
        ledCount: detectedCount,
        edgeCount: Number(field("edgeCount")),
        installationMethod: Number(field("installationMethod")),
        colorOrder: $("#profile-color-order").value,
        position: current.position || "monitor-back",
        matchedBy: "manual",
        color: state.settings.color
      }
    };
    if (setupOnboarding) changes.onboarded = true;
    await saveSettingsNow(changes);
    $("#setup-dialog").close();
    render();
    toast("Strip profile saved.");
  } catch (error) {
    toast(`Profile could not be saved: ${error.message}`);
  }
}

function bindProfileEditor() {
  $("#profile-cancel").addEventListener("click", () => $("#setup-dialog").close());
  $("#profile-save").addEventListener("click", saveProfile);
  $("#profile-content").addEventListener("change", (event) => {
    if (event.target.name === "edgeCount") {
      const selectedMethod = Number($('[name="installationMethod"]:checked')?.value || 0);
      renderProfileDirectionChoices(Number(event.target.value), selectedMethod);
    }
  });
}

async function resetAllData() {
  const button = $("#confirm-reset");
  button.disabled = true;
  button.textContent = "Resetting…";
  clearTimeout(queue.timer);
  queue.timer = null;
  queue.changes = {};
  if (queue.flushing) await queue.flushing;
  queue.changes = {};
  stopScreenSync();
  sync.autoAttempted = true;

  try {
    const result = await window.ull.resetData();
    state.settings = result.settings;
    state.device = result.device;
    selectedLedIndices = new Set();
    selectedLedAnchorIndex = null;
    sync.screenError = "";
    $("#reset-dialog").close();
    render();
    openSetup();
    const message = result.removedLegacyProfiles.length
      ? "All ULLeds data and imported legacy profiles were reset."
      : "All ULLeds data was reset.";
    toast(result.device.connected ? message : `${message} The controller is not connected; scan again after setup.`);
  } catch (error) {
    toast(`Could not reset ULLeds data: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = "Delete and reset";
  }
}


/* ==========================================================================
   11. Event binding
   ========================================================================== */

/** Wire a control so changing it queues one setting. */
function bindSetting(selector, key, { event = "input", immediate = false, read } = {}) {
  $(selector).addEventListener(event, (e) => {
    const value = read ? read(e.target) : Number(e.target.value);
    queueSettings({ [key]: value }, immediate);
  });
}

function bindNavigation() {
  $$(".tab").forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));

  $(".tabs").addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const tabs = $$(".tab").filter((tab) => tab.offsetWidth > 0);
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(current + step + tabs.length) % tabs.length];
    next.focus();
    switchView(next.dataset.view);
  });

  $("#window-minimize").addEventListener("click", () => window.ull.minimizeWindow());
  $("#window-maximize").addEventListener("click", () => window.ull.toggleMaximizeWindow());
  $("#window-close").addEventListener("click", () => window.ull.closeWindow());
  if (typeof window.ull.onWindowMaximized === "function") {
    window.ull.onWindowMaximized((isMaximized) => {
      document.body.classList.toggle("is-maximized", Boolean(isMaximized));
    });
  }

  document.addEventListener("input", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.type === "range") {
      updateRangeFill(event.target);
    }
  });
  // Releasing a slider saves right away instead of waiting for the debounce.
  document.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.type === "range") {
      clearTimeout(queue.timer);
      queue.timer = null;
      void flushSettingsQueue();
    }
  });
}

function bindLighting() {
  $("#monitor").addEventListener("click", selectPreviewPosition);
  $("#monitor").addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.classList.contains("led-edge")) {
      event.preventDefault();
      selectPreviewPosition(event);
    }
  });
  $("#select-all").addEventListener("click", () => setSelection(null));
  $("#deselect-all").addEventListener("click", () => setSelection(new Set()));

  $("#power-toggle").addEventListener("click", () => {
    void stopActiveSync();
    queueSettings({ power: !state.settings.power }, true);
  });

  $("#color-picker").addEventListener("input", (event) => applyColor(event.target.value));
  $("#hex-color").addEventListener("change", (event) => {
    const value = event.target.value.trim();
    if (/^#[\da-f]{6}$/i.test(value)) {
      applyColor(value.toLowerCase());
    } else {
      event.target.value = selectedColor();
      toast("Enter a color in #RRGGBB format.");
    }
  });
  $("#apply-gradient").addEventListener("click", () => void applyGradient());

  bindSetting("#brightness", "brightness");
  bindSetting("#speed", "speed");
  bindSetting("#effect", "effect", { event: "change", immediate: true, read: (el) => el.value });

  ["red", "green", "blue"].forEach((name, index) => {
    $(`#rgb-${name}`).addEventListener("input", (event) => {
      const channelGains = [...state.settings.channelGains];
      channelGains[index] = Number(event.target.value);
      queueSettings({ channelGains });
    });
  });
  $("#reset-color-tuning").addEventListener("click", () => {
    queueSettings({ channelGains: [100, 100, 100] }, true);
  });

  $("#add-palette-color").addEventListener("click", () => {
    if (state.settings.palette.length >= MAX_PALETTE_COLORS) {
      return toast("A palette can have up to eight colors.");
    }
    queueSettings({ palette: [...state.settings.palette, state.settings.color] }, true);
  });

  const toggleSync = (start) => () => {
    if (syncIsActive()) void stopScreenSync();
    else start();
  };
  $("#screen-sync-toggle").addEventListener("click", toggleSync(() => startScreenSync()));
  $("#spotify-sync-toggle").addEventListener("click", toggleSync(() => startSpotifySync()));
}

function bindScenes() {
  $("#save-scene").addEventListener("click", () => openSceneDialog("create"));
  $("#import-scenes").addEventListener("click", importScenes);
  $("#export-scenes").addEventListener("click", exportScenes);
  $("#scene-form").addEventListener("submit", saveSceneName);
  $("#cancel-scene").addEventListener("click", () => {
    $("#scene-dialog").close();
    sceneDialogMode = null;
  });
  $("#cancel-delete-scene").addEventListener("click", () => $("#delete-scene-dialog").close());
}

function bindDeviceSettings() {
  $("#scan-device").addEventListener("click", scanDevices);
  $("#controller-select").addEventListener("change", (event) => void connectSelectedDevice(event.target.value));
  $("#open-setup").addEventListener("click", () => openSetup(false));
  $("#reset-all-data").addEventListener("click", () => $("#reset-dialog").showModal());
  $("#confirm-reset").addEventListener("click", resetAllData);

  bindSetting("#sync-fps-range", "syncFps");
  $("#sync-fps-number").addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (Number.isInteger(value) && value >= FPS.min && value <= FPS.max) queueSettings({ syncFps: value });
  });
  $("#sync-fps-number").addEventListener("change", (event) => {
    const value = Number(event.target.value);
    if (!Number.isInteger(value) || value < FPS.min || value > FPS.max) {
      event.target.value = state.settings.syncFps;
      toast(`Screen Sync FPS must be from ${FPS.min} to ${FPS.max}.`);
    }
  });
  bindSetting("#sync-content-mode", "syncContentMode", { event: "change", immediate: true, read: (el) => el.value });

  $("#sync-auto-detect").addEventListener("change", (event) => {
    queueSettings({ syncAutoDetect: event.target.checked }, true);
    const session = sync.session;
    if (!event.target.checked && session?.mode === "screen") {
      session.letterboxTracker.reset();
      session.detectedAspectRatio = null;
      session.movieFormatPromptGate.reset();
    }
  });

  bindSetting("#start-with-windows", "startWithWindows", { event: "change", immediate: true, read: (el) => el.checked });
}

function bindUpdates() {
  $$('input[name="update-source"]').forEach((input) => {
    input.addEventListener("change", () => selectUpdateSource(input.value));
  });
  $("#choose-update-folder").addEventListener("click", chooseUpdateFolder);
  $("#check-updates").addEventListener("click", checkUpdates);
  $("#version-notice-dismiss").addEventListener("click", dismissVersionNotice);

  $("#release-newer").addEventListener("click", () => stepRelease(-1));
  $("#release-older").addEventListener("click", () => stepRelease(1));
  $("#release-position").addEventListener("change", commitReleaseJump);
  $("#release-position").addEventListener("focus", (event) => event.currentTarget.select());
  $("#release-position").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitReleaseJump();
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      event.currentTarget.value = String(releases.previousIndex + 1);
      event.currentTarget.blur();
    }
  });
}

/** Messages pushed from the main process. */
function bindMainProcessEvents() {
  window.ull.onDeviceStatus((device) => {
    applyDeviceState(device);
    render();
    if (!device.connected) sync.autoAttempted = false;
    else maybeRestoreStartupMode();
  });
  window.ull.onMovieFormatApplied(applyDetectedMovieFormat);

  window.ull.onUpdateProgress((progress) => {
    setUpdatePhase("downloading", {
      percent: Number.isFinite(progress.percent) ? progress.percent : null,
      transferred: Number.isFinite(progress.transferred) ? progress.transferred : 0,
      total: Number.isFinite(progress.total) ? progress.total : 0
    });
    showUpdateMessage("Downloading update…");
  });
  window.ull.onUpdateDownloaded(({ version }) => showUpdateReady(version));
  window.ull.onUpdateError(({ message }) => {
    setUpdatePhase("error");
    showUpdateMessage(`Update failed: ${message}`, true);
  });

  window.ull.onDeviceScanRequest(scanDevices);
  window.ull.onSetupRequest(() => openSetup());
  window.ull.onUpdateFolderRequest(() => {
    switchView("updates");
    selectUpdateSource("local");
    chooseUpdateFolder();
  });
  window.ull.onUpdateCheckRequest(() => {
    switchView("updates");
    checkUpdates();
  });

  // Last chance to persist pending changes synchronously.
  window.addEventListener("beforeunload", () => {
    clearTimeout(queue.timer);
    const pending = queue.changes;
    queue.changes = {};
    if (Object.keys(pending).length === 0) return;
    try {
      const response = window.ull.flushSettings(pending);
      if (response.error) throw new Error(response.error);
      state.settings = response.result.settings;
      state.device = response.result;
    } catch (error) {
      console.error("Could not save the latest ULLeds settings before closing:", error);
    }
  });
}

function bindEvents() {
  bindNavigation();
  bindLighting();
  bindScenes();
  bindDeviceSettings();
  bindUpdates();
  bindProfileEditor();
  bindMainProcessEvents();
}


/* ==========================================================================
   12. Startup
   ========================================================================== */

async function start() {
  bindEvents();
  updateMonitorAspectRatio();
  window.addEventListener("resize", updateMonitorAspectRatio);

  try {
    releases.builtin = loadBuiltinChangelog();
    state = await window.ull.initialState();
    render();
    renderReleases();
    void loadReleaseDownloads();
    if (!state.settings.onboarded) openSetup(true);
    maybeRestoreStartupMode();
  } catch (error) {
    toast(`ULLeds could not load: ${error.message}`);
  }
}

start();