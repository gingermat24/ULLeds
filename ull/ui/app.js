"use strict";

const SCENES_ENABLED = false;
const DEFAULT_SCENES = [
  { name: "Rose dusk", color: "#e879a8" },
  { name: "Deep violet", color: "#8d7cff" },
  { name: "Lagoon", color: "#55c8d2" },
  { name: "Soft amber", color: "#f0ac65" }
];

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
    presets: [],
    deviceProfile: null,
    devicePath: "",
    power: true,
    onboarded: false,
    updateFolder: "",
    updateSource: "github",
    syncFps: 30,
    startWithWindows: true,
    resumeScreenSync: false
  },
  device: { connected: false, name: "", serialNumber: "" }
};

let toastTimer;
let settingsQueue = {};
let settingsTimer;
let settingsFlushPromise = null;
let wizardStep = 0;
let detectedDevices = [];
let deviceConnecting = false;
let connectingDevicePath = "";
let selectedLedIndices = null;
let screenSyncSession = null;
const screenSyncLifecycle = window.ullScreenSyncLifecycle.createScreenSyncLifecycle();
let screenSyncGeneration = 0;
let autoSyncAttempted = false;
let screenSyncError = "";
let updateCheckInProgress = false;
let updateState = { phase: "idle", percent: null, transferred: 0, total: 0 };

const $ = (selector) => document.querySelector(selector);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function stripLayoutSignature(layout) {
  return JSON.stringify([layout.ledCount, layout.indices]);
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

function updateRangeFill(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const percent = max > min ? ((Number(input.value) - min) / (max - min)) * 100 : 0;
  input.style.setProperty("--fill", `${clamp(percent, 0, 100)}%`);
}

function updateRangeFills() {
  document.querySelectorAll('input[type="range"]').forEach(updateRangeFill);
}

function positionTabIndicator(animate = true) {
  const indicator = $(".tab-indicator");
  const active = $(".tabs .tab.active");
  if (!indicator || !active || !active.offsetWidth) return;
  indicator.style.transition = animate ? "" : "none";
  indicator.style.width = `${active.offsetWidth}px`;
  indicator.style.transform = `translateX(${active.offsetLeft}px)`;
  if (!animate) {
    void indicator.offsetWidth;
    indicator.style.transition = "";
  }
}

function calibratedColor(color, gains = [100, 100, 100]) {
  const channels = color.slice(1).match(/../g).map((part, index) =>
    clamp(Math.round(Number.parseInt(part, 16) * gains[index] / 100), 0, 255)
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("visible"), 2600);
}

function queueSettings(changes, immediate = false) {
  Object.assign(state.settings, changes);
  Object.assign(settingsQueue, changes);
  updatePreview();
  clearTimeout(settingsTimer);
  if (immediate) {
    settingsTimer = null;
    void flushSettingsQueue();
    return;
  }
  settingsTimer = setTimeout(() => {
    settingsTimer = null;
    void flushSettingsQueue();
  }, 16);
}

async function flushSettingsQueue() {
  if (settingsFlushPromise) return settingsFlushPromise;
  settingsFlushPromise = (async () => {
    while (Object.keys(settingsQueue).length) {
      const pending = settingsQueue;
      settingsQueue = {};
      try {
        const result = await window.ull.updateSettings(pending);
        state.settings = result.settings;
        Object.assign(state.settings, settingsQueue);
        state.device = result;
        renderConnection();
        updatePreview();
        if (SCENES_ENABLED && Object.hasOwn(pending, "presets")) renderScenes();
        if (SCENES_ENABLED && Object.hasOwn(pending, "palette")) renderPalette();
      } catch (error) {
        settingsQueue = { ...pending, ...settingsQueue };
        console.error("Could not save ULLeds settings:", error);
        toast(`Could not save settings: ${error.message}`);
        break;
      }
    }
  })();
  try {
    await settingsFlushPromise;
  } finally {
    settingsFlushPromise = null;
  }
}

function renderConnection() {
  const indicator = $("#device-status");
  const label = $("#device-label");
  const profile = state.device.profile || state.settings.deviceProfile;

  indicator.classList.toggle("connected", state.device.connected);
  indicator.classList.toggle("has-error", Boolean(state.device.error));

  label.textContent = state.device.connected
    ? deviceLabel(state.device.name, "LED controller connected")
    : state.device.error || "No LED controller connected";
  label.title = label.textContent;
  renderDeviceSelector();

  $("#settings-device").textContent = state.device.connected
    ? `${deviceLabel(state.device.name)}${state.device.serialNumber ? ` · ${state.device.serialNumber}` : ""}`
    : (state.device.error || "Not connected");

  renderProfile(profile);
}

function renderDeviceSelector() {
  const select = $("#controller-select");
  if (!select) return;
  const currentPath = connectingDevicePath || state.device.devicePath || state.settings.devicePath || "";
  const options = detectedDevices.map((device, index) => {
    const identifiers = `${Number(device.vendorId).toString(16).padStart(4, "0")}:${Number(device.productId).toString(16).padStart(4, "0")}`;
    const detail = device.serialNumber
      ? `${device.serialNumber}${device.interface == null ? "" : ` · interface ${device.interface}`}`
      : `${identifiers}${device.interface == null ? ` · controller ${index + 1}` : ` · interface ${device.interface}`}`;
    return { value: device.path, label: `${deviceLabel(device.name)} · ${detail}` };
  });
  if (options.length === 0) {
    select.replaceChildren(new Option("No compatible controller found", ""));
    select.disabled = true;
    return;
  }
  select.replaceChildren(...options.map(({ value, label }) => new Option(label, value)));
  select.disabled = deviceConnecting;
  select.value = options.some((option) => option.value === currentPath)
    ? currentPath
    : state.device.connected && options.some((option) => option.value === state.device.devicePath)
      ? state.device.devicePath
      : "";
}

function renderProfile(profile) {
  const position = profile?.position || "monitor-back";
  const countSource = profile?.countSource === "saved profile"
    ? "saved setup"
    : state.device.connected
      ? "detected"
      : "last saved";
  $("#settings-count").textContent = profile?.ledCount
    ? `${profile.ledCount} LEDs · ${countSource}`
    : "Not detected";
  $("#settings-order").textContent = profile?.colorOrder || "Not configured";
  $("#settings-layout").textContent = profile?.edgeCount
    ? `${profile.edgeCount} sides · ${position.replaceAll("-", " ")}`
    : "Not configured";
}

function makePixels(container, indices, edge) {
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
    const selected = selectedLedIndices?.has(index) || false;
    const color = calibratedColor(
      screenSyncSession?.colors?.[index] ||
        state.settings.ledColors?.[index] || state.settings.color,
      state.settings.channelGains
    );
    const label = `Select LED ${index + 1}, ${edge} side${selected ? ", selected" : ""}`;

    if (pixel.dataset.color !== color) {
      pixel.style.backgroundColor = color;
      pixel.dataset.color = color;
    }
    if (pixel.getAttribute("aria-label") !== label) pixel.setAttribute("aria-label", label);
    if (pixel.getAttribute("aria-pressed") !== String(selected)) {
      pixel.setAttribute("aria-pressed", String(selected));
    }
    pixel.classList.toggle("selected", selected);
  }
}

function selectedColor() {
  if (!selectedLedIndices?.size) return state.settings.color;
  const first = selectedLedIndices.values().next().value;
  return state.settings.ledColors?.[first] || state.settings.color;
}

function applyColor(color, all = false) {
  if (screenSyncSession) stopScreenSync("", true);
  if (all || selectedLedIndices === null) {
    queueSettings({ color, ledColors: {} });
    return;
  }
  if (selectedLedIndices.size === 0) return toast("Select at least one LED first.");
  queueSettings(window.ullLedSelection.colorChanges(
    state.settings.color,
    state.settings.ledColors,
    selectedLedIndices,
    color
  ));
}

function updatePreview() {
  const settings = state.settings;
  const channelGainIds = ["rgb-red", "rgb-green", "rgb-blue"];
  const channelGainOutputIds = ["rgb-red-value", "rgb-green-value", "rgb-blue-value"];
  channelGainIds.forEach((id, index) => {
    $(`#${id}`).value = settings.channelGains[index];
    $(`#${channelGainOutputIds[index]}`).textContent = `${settings.channelGains[index]}%`;
  });
  const profile = state.device.profile || settings.deviceProfile;
  const count = Number.isInteger(profile?.ledCount) ? clamp(profile.ledCount, 1, 253) : 0;
  const edgeCount = clamp(Number(profile?.edgeCount) || 3, 1, 4);
  const layout = count
    ? window.ullStripLayout.allocateEdgeIndices(count, edgeCount, profile?.installationMethod ?? 0)
    : { counts: {}, indices: {} };

  if (selectedLedIndices && count) {
    selectedLedIndices = new Set([...selectedLedIndices].filter((index) => index < count));
  }

  const position = profile?.position || "monitor-back";
  const positionLabels = {
    "monitor-back": "Behind your monitor",
    "monitor-front": "Around your screen",
    top: "Above your screen",
    desk: "On your desk"
  };

  ["top", "left", "right", "bottom"].forEach((edge) => {
    const indices = layout.indices[edge] || [];
    const container = $(`#led-${edge}`);
    makePixels(container, indices, edge);
    container.classList.toggle("hidden", indices.length === 0);
    container.classList.toggle(
      "selected",
      indices.length > 0 && selectedLedIndices?.size === indices.length &&
        indices.every((index) => selectedLedIndices.has(index))
    );
  });

  $("#monitor").dataset.position = position;
  $("#monitor").dataset.power = settings.power ? "on" : "off";
  $("#preview-title").textContent = positionLabels[position] || positionLabels["monitor-back"];
  document.documentElement.style.setProperty("--led-color", settings.color);
  document.documentElement.style.setProperty("--led-opacity", settings.power ? String(settings.brightness / 100) : "0");
  $("#preview-led-count").textContent = count
    ? `${count} LEDs ${profile?.countSource === "saved profile"
      ? "from saved setup"
      : state.device.connected ? "detected" : "saved"}`
    : "Waiting for controller";

  if (selectedLedIndices === null) {
    $("#selection-label").textContent = "All LEDs";
  } else if (selectedLedIndices.size === 0) {
    $("#selection-label").textContent = "No LEDs selected";
  } else if (selectedLedIndices.size === 1) {
    const index = selectedLedIndices.values().next().value;
    const edge = Object.entries(layout.indices).find(([, indices]) => indices.includes(index))?.[0];
    $("#selection-label").textContent = `LED ${index + 1}${edge ? ` · ${edge[0].toUpperCase()}${edge.slice(1)}` : ""}`;
  } else {
    $("#selection-label").textContent = `${selectedLedIndices.size} LEDs selected`;
  }

  const color = selectedColor();
  $("#color-picker").value = color;
  $("#hex-color").value = color;
  $("#brightness").value = settings.brightness;
  $("#brightness-value").textContent = `${settings.brightness}%`;
  $("#speed").value = settings.speed;
  $("#speed-value").textContent = `${settings.speed}%`;
  $("#effect").value = settings.effect;
  const syncFps = clamp(Number(settings.syncFps) || 30, 5, 60);
  $("#sync-fps-range").value = syncFps;
  if (document.activeElement !== $("#sync-fps-number")) $("#sync-fps-number").value = syncFps;
  $("#sync-fps-value").textContent = `${syncFps} FPS`;
  $("#speed-control").classList.toggle("hidden", settings.effect === "steady");
  $("#power-toggle").setAttribute("aria-checked", String(settings.power));
  $("#power-toggle").setAttribute("aria-label", `LED power: ${settings.power ? "on" : "off"}`);
  $("#power-state").textContent = settings.power ? "On" : "Off";
  const syncPending = screenSyncLifecycle.isStarting || (
    settings.resumeScreenSync && autoSyncAttempted && !screenSyncSession && !screenSyncError
  );
  $("#screen-sync-toggle").textContent = screenSyncLifecycle.isStopping
    ? "Stopping…"
    : screenSyncSession || screenSyncLifecycle.isStarting
      ? "Stop"
      : syncPending ? "Starting…" : "Start";
  $("#screen-sync-toggle").disabled = screenSyncLifecycle.isStopping;
  $("#screen-sync-toggle").classList.toggle("syncing", Boolean(screenSyncSession || syncPending));
  $("#screen-sync-description").textContent = screenSyncSession
    ? "Matching the primary display"
    : syncPending
      ? "Resuming display capture…"
    : screenSyncError || (settings.resumeScreenSync
      ? "Will resume automatically when ULLeds starts"
      : "Match LEDs to your display");

  if (screenSyncSession) {
    const signature = stripLayoutSignature(layout);
    if (screenSyncSession.layoutSignature !== signature) {
      screenSyncSession.layout = layout;
      screenSyncSession.layoutSignature = signature;
      screenSyncSession.colors = null;
    }
    screenSyncSession.pixelElements = [...document.querySelectorAll(".led-pixel")];
  }

  updateRangeFills();
}

function renderScenes() {
  const root = $("#scene-grid");
  root.replaceChildren();
  const scenes = [...DEFAULT_SCENES, ...state.settings.presets];

  if (!scenes.length) {
    const empty = document.createElement("p");
    empty.textContent = "Save a color to create your first scene.";
    empty.style.color = "var(--muted)";
    root.append(empty);
    return;
  }

  scenes.forEach((scene, index) => {
    const card = document.createElement("div");
    card.className = "scene-card";

    const button = document.createElement("button");
    button.className = "scene-card-apply";
    button.type = "button";
    button.setAttribute("aria-label", `Apply ${scene.name} scene`);

    const color = document.createElement("span");
    color.className = "scene-card-color";
    color.style.backgroundColor = scene.color;

    const name = document.createElement("span");
    name.className = "scene-card-name";
    name.textContent = scene.name;

    button.append(color, name);
    button.addEventListener("click", () => applyColor(scene.color, true));
    card.append(button);

    if (index >= DEFAULT_SCENES.length) {
      const remove = document.createElement("button");
      remove.className = "scene-card-remove";
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove ${scene.name}`);
      remove.addEventListener("click", (event) => {
        event.stopPropagation();
        const presets = state.settings.presets.filter((_, presetIndex) => presetIndex !== index - DEFAULT_SCENES.length);
        queueSettings({ presets }, true);
      });
      card.append(remove);
    }

    root.append(card);
  });
}

function renderPalette() {
  const root = $("#palette-swatches");
  root.replaceChildren();

  state.settings.palette.forEach((color, index) => {
    const input = document.createElement("input");
    input.type = "color";
    input.className = "palette-color";
    input.value = color;
    input.setAttribute("aria-label", `Palette color ${index + 1}`);
    input.addEventListener("input", () => {
      const palette = [...state.settings.palette];
      palette[index] = input.value;
      queueSettings({ palette });
    });
    root.append(input);
  });
}

function render() {
  $("#app-version").textContent = state.version || "—";
  renderUpdates();
  $("#start-with-windows").checked = state.settings.startWithWindows;
  $("#resume-screen-sync").checked = state.settings.resumeScreenSync;
  renderConnection();
  updatePreview();
  if (SCENES_ENABLED) {
    renderScenes();
    renderPalette();
  }
}

function selectPreviewPosition(event) {
  const pixel = event.target.closest(".led-pixel");
  const edge = pixel?.closest(".led-edge") || event.target.closest(".led-edge");
  if (!edge) return;

  if (pixel) {
    const index = Number(pixel.dataset.ledIndex);
    selectedLedIndices = window.ullLedSelection.selectLed(
      selectedLedIndices,
      index,
      event.ctrlKey || event.metaKey
    );
  } else {
    const profile = state.device.profile || state.settings.deviceProfile;
    const count = Number(profile?.ledCount);
    if (!Number.isInteger(count)) return;
    const layout = window.ullStripLayout.allocateEdgeIndices(
      count,
      Number(profile?.edgeCount) || 3,
      profile?.installationMethod ?? 0
    );
    selectedLedIndices = new Set(layout.indices[edge.dataset.edge] || []);
  }
  updatePreview();
}

function stopScreenSync(message = "", clearResumePreference = false) {
  const pending = screenSyncLifecycle.stop(() => {
    screenSyncGeneration += 1;
    const session = screenSyncSession;
    screenSyncSession = null;
    screenSyncError = "";
    if (session) {
      cancelAnimationFrame(session.frame);
      if (session.videoFrame && typeof session.video.cancelVideoFrameCallback === "function") {
        session.video.cancelVideoFrameCallback(session.videoFrame);
      }
      session.stream.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
    }
  }, async () => {
    try {
      await window.ull.stopScreenSync();
    } catch (error) {
      toast(`Could not stop screen sync: ${error.message}`);
    }
  });
  updatePreview();
  if (message) toast(message);
  return pending.then(() => {
    if (clearResumePreference && state.settings.resumeScreenSync) {
      queueSettings({ resumeScreenSync: false }, true);
    }
    updatePreview();
  }, (error) => {
    updatePreview();
    toast(`Could not stop screen sync cleanly: ${error.message}`);
  });
}

function startScreenSync(options = {}) {
  const pending = screenSyncLifecycle.start(() => runScreenSyncStart(options));
  updatePreview();
  return pending.catch((error) => {
    toast(`Could not start screen sync: ${error.message}`);
  }).finally(updatePreview);
}

async function runScreenSyncStart({ automatic = false } = {}) {
  const generation = ++screenSyncGeneration;
  if (!state.device.connected) return toast("Connect the LED controller before starting screen sync.");
  if (!navigator.mediaDevices?.getUserMedia) {
    return toast("Screen sharing is not available in this app environment.");
  }

  const profile = state.device.profile || state.settings.deviceProfile;
  const ledCount = Number(profile?.ledCount);
  if (!Number.isInteger(ledCount)) return toast("The controller has not reported its LED count.");

  const edgeCount = clamp(Number(profile?.edgeCount) || 3, 1, 4);
  const layout = window.ullStripLayout.allocateEdgeIndices(
    ledCount,
    edgeCount,
    profile?.installationMethod ?? 0
  );

  let stream;
  let hardwareSyncStarted = false;
  updatePreview();

  try {
    const capture = window.ull.screenSyncSource().then(({ id }) =>
      navigator.mediaDevices.getUserMedia(
        window.ullScreenSync.createDesktopCaptureConstraints(id, state.settings.syncFps)
      )
    );
    if (!state.settings.power) {
      const result = await window.ull.updateSettings({ power: true });
      state.settings = result.settings;
      state.device = result;
      render();
    }
    stream = await capture;
    if (generation !== screenSyncGeneration) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
    if (generation !== screenSyncGeneration) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    if (!stream.getVideoTracks().length) throw new Error("The display capture did not provide a video track.");
    if (stream.getAudioTracks().length) {
      throw new Error("Screen Sync received an audio track; audio input is not supported.");
    }
    if (!video.videoWidth || !video.videoHeight) {
      throw new Error("The shared display has no available video dimensions.");
    }

    const scale = Math.min(1, 320 / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Could not start screen color sampling.");

    await window.ull.startScreenSync();
    hardwareSyncStarted = true;
    if (generation !== screenSyncGeneration) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    const savedSettings = await window.ull.updateSettings({ resumeScreenSync: true });
    if (generation !== screenSyncGeneration) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    state.settings = savedSettings.settings;
    state.device = savedSettings;

    const session = {
      stream,
      video,
      context,
      frame: 0,
      videoFrame: 0,
      lastSample: 0,
      colors: null,
      layout,
      layoutSignature: stripLayoutSignature(layout)
    };
    screenSyncSession = session;
    screenSyncError = "";
    const sendLatestFrame = window.ullScreenSync.createLatestFrameSender({
      send: (colors) => window.ull.sendScreenSyncColors(colors),
      isActive: () => screenSyncSession === session,
      getColors: () => session.colors,
      onError: (error) => stopScreenSync(`Screen sync stopped: ${error.message}`)
    });

    stream.getVideoTracks()[0].onended = () => {
      if (screenSyncSession === session) stopScreenSync("Screen sharing ended.");
    };

    const sampleFrame = (now) => {
      if (screenSyncSession !== session) return;
      if (typeof video.requestVideoFrameCallback === "function") {
        session.videoFrame = video.requestVideoFrameCallback(sampleFrame);
      } else {
        session.frame = requestAnimationFrame(sampleFrame);
      }
      const sampleInterval = 1000 / clamp(Number(state.settings.syncFps) || 30, 5, 60);
      if (now - session.lastSample < sampleInterval || video.readyState < 2) return;
      session.lastSample = now;
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const sampledColors = window.ullScreenSync.sampleStripColors(
          pixels,
          canvas.width,
          canvas.height,
          session.layout
        );
        session.colors = sampledColors;

        session.pixelElements.forEach((pixel) => {
          const color = session.colors[Number(pixel.dataset.ledIndex)];
          if (pixel.dataset.color !== color) {
            pixel.style.backgroundColor = color;
            pixel.dataset.color = color;
          }
        });

        void sendLatestFrame();
      } catch (error) {
        stopScreenSync(`Screen sync stopped: ${error.message}`);
      }
    };

    session.frame = requestAnimationFrame(sampleFrame);
    updatePreview();
  } catch (error) {
    const sessionOwnsStream = screenSyncSession?.stream === stream;
    if (!sessionOwnsStream) {
      stream?.getTracks().forEach((track) => track.stop());
    }
    if (!sessionOwnsStream && (hardwareSyncStarted || automatic) && !screenSyncLifecycle.isStopping) {
      try {
        await window.ull.stopScreenSync();
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
    if (automatic) screenSyncError = message;
    updatePreview();
    toast(message);
  } finally {
    updatePreview();
  }
}

function applyDeviceState(device) {
  state.device = device;
  const profile = device.connected && device.profile;
  if (!device.connected && screenSyncSession) stopScreenSync("Controller disconnected.");
  if (profile?.ledCount) {
    const hadProfile = Boolean(state.settings.deviceProfile);
    state.settings.deviceProfile = profile;
    state.settings.ledCount = profile.ledCount;
    state.settings.devicePath = device.devicePath;
    if (!hadProfile && profile.color) state.settings.color = profile.color;
  }
}

async function scanDevices() {
  $("#device-label").textContent = "Scanning for the controller…";
  try {
    const result = await window.ull.scanDevices();
    detectedDevices = result.devices || [];
    applyDeviceState(result);
    render();
    if (!state.settings.onboarded && $("#setup-dialog").open && wizardStep === 0) {
      setWizardStep(0);
    }
    if (!state.device.connected && !result.error) {
      toast(detectedDevices.length ? "Controller found but not connected." : "No supported USB controller found.");
    }
  } catch (error) {
    state.device = { connected: false, error: error.message };
    renderConnection();
    toast(`Scan failed: ${error.message}`);
  }
}

async function connectSelectedDevice(devicePath) {
  if (!devicePath || deviceConnecting) return;
  deviceConnecting = true;
  connectingDevicePath = devicePath;
  renderDeviceSelector();
  try {
    const device = await window.ull.connectDevice(devicePath);
    applyDeviceState(device);
    render();
    if (!device.connected) {
      toast(device.error || "Could not connect to that controller.");
    } else {
      toast(`Connected to ${deviceLabel(device.name)}.`);
    }
  } catch (error) {
    toast(`Could not connect to the selected controller: ${error.message}`);
  } finally {
    deviceConnecting = false;
    connectingDevicePath = "";
    renderDeviceSelector();
  }
}

function switchView(name) {
  if (name === "scenes" && !SCENES_ENABLED) return;
  document.querySelectorAll(".tab").forEach((item) => {
    const active = item.dataset.view === name;
    item.classList.toggle("active", active);
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });
  document.querySelectorAll(".view").forEach((panel) => {
    panel.classList.toggle("hidden", panel.id !== `view-${name}`);
  });
  window.scrollTo({ top: 0 });
  positionTabIndicator(true);
}

function renderUpdates() {
  const source = state.settings.updateSource === "local" ? "local" : "github";
  const localSelected = source === "local";
  document.querySelectorAll('input[name="update-source"]').forEach((input) => {
    input.checked = input.value === source;
  });
  $("#update-folder-label").textContent = state.settings.updateFolder || "No folder selected";
  $("#local-update-controls").classList.toggle("hidden", !localSelected);
  $("#github-update-note").classList.toggle("hidden", localSelected);
  $("#check-updates").disabled = !localSelected || !state.settings.updateFolder || updateCheckInProgress;
}

function selectUpdateSource(source) {
  if (!["github", "local"].includes(source)) throw new TypeError("Unsupported update source.");
  queueSettings({ updateSource: source }, true);
  renderUpdates();
  if (source === "github") {
    showUpdateMessage("GitHub Releases updates are coming soon. Choose a local folder to update now.");
  } else if (state.settings.updateFolder) {
    showUpdateMessage(`Local update folder: ${state.settings.updateFolder}`);
  } else {
    showUpdateMessage("Choose the folder containing the ULLeds update package.");
  }
}

function showUpdateMessage(message, error = false, readyToInstall = false) {
  const root = $("#update-message");
  root.classList.remove("hidden", "error");
  root.classList.toggle("error", error);
  $("#update-status-text").textContent = message;

  const progress = $("#update-progress");
  const fill = $("#update-progress-fill");
  const detail = $("#update-progress-detail");
  const isActive = updateState.phase === "checking" ||
    updateState.phase === "downloading" ||
    updateState.phase === "installing";
  progress.classList.toggle("hidden", !isActive);
  detail.classList.toggle("hidden", !isActive);
  progress.classList.toggle("indeterminate", isActive && updateState.percent === null);
  if (isActive && Number.isFinite(updateState.percent)) {
    const percent = clamp(updateState.percent, 0, 100);
    fill.style.width = `${percent}%`;
    progress.setAttribute("aria-valuenow", String(Math.round(percent)));
  } else {
    fill.style.width = isActive ? "35%" : "0";
    progress.removeAttribute("aria-valuenow");
  }
  detail.textContent = updateState.phase === "checking"
    ? "Connecting to the selected update folder…"
    : updateState.phase === "installing"
      ? "ULLeds will reopen automatically. Please wait; do not launch it manually."
    : isActive
      ? formatUpdateProgress(updateState)
      : "";

  const actions = $("#update-actions");
  actions.replaceChildren();
  if (readyToInstall) {
    const button = document.createElement("button");
    button.className = "primary-btn";
    button.type = "button";
    button.textContent = "Restart and update";
    button.addEventListener("click", installUpdate);
    actions.append(button);
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const amount = bytes / (1024 ** unitIndex);
  return `${amount.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatUpdateProgress({ percent, transferred, total }) {
  const amount = `${formatBytes(transferred)}${total > 0 ? ` of ${formatBytes(total)}` : " downloaded"}`;
  return Number.isFinite(percent) ? `${amount} · ${Math.round(percent)}%` : amount;
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
  if (state.settings.updateSource !== "local") {
    showUpdateMessage("GitHub Releases updates are coming soon. Choose a local folder to update now.");
    return;
  }
  if (!state.settings.updateFolder) {
    showUpdateMessage("Choose the folder containing the ULLeds update package.");
    return;
  }
  if (updateCheckInProgress) return;
  updateCheckInProgress = true;
  const checkButton = $("#check-updates");
  checkButton.disabled = true;
  checkButton.textContent = "Checking…";
  updateState = { phase: "checking", percent: null, transferred: 0, total: 0 };
  showUpdateMessage("Checking the local update folder…");
  try {
    const result = await window.ull.checkUpdates();
    if (result.available) {
      if (result.downloaded || updateState.phase === "ready") {
        updateState = { phase: "ready", percent: null, transferred: 0, total: 0 };
        showUpdateMessage(`ULLeds ${result.version} is ready. Your saved settings will be kept.`, false, true);
      } else {
        if (updateState.phase !== "downloading") {
          updateState = { phase: "downloading", percent: null, transferred: 0, total: 0 };
        }
        showUpdateMessage(`Downloading ULLeds ${result.version}…`);
      }
    } else if (result.upToDate) {
      updateState = { phase: "idle", percent: null, transferred: 0, total: 0 };
      showUpdateMessage(`ULLeds ${result.version} is up to date.`);
    } else {
      updateState = { phase: "error", percent: null, transferred: 0, total: 0 };
      showUpdateMessage(result.error || "No update is available.", Boolean(result.error));
    }
  } catch (error) {
    updateState = { phase: "error", percent: null, transferred: 0, total: 0 };
    showUpdateMessage(`Update check failed: ${error.message}`, true);
  } finally {
    updateCheckInProgress = false;
    checkButton.disabled = false;
    checkButton.textContent = "Check for updates";
    renderUpdates();
  }
}

async function installUpdate() {
  updateState = { phase: "installing", percent: null, transferred: 0, total: 0 };
  showUpdateMessage("Installing the update and restarting ULLeds…");
  const button = $("#update-actions").querySelector("button");
  if (button) button.disabled = true;
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  try {
    const result = await window.ull.installUpdate();
    if (result.installing) showUpdateMessage(`Restarting to update ULLeds to ${result.version}…`);
    else {
      updateState = { phase: "error", percent: null, transferred: 0, total: 0 };
      showUpdateMessage(result.error || "No update is available.", Boolean(result.error));
    }
  } catch (error) {
    updateState = { phase: "error", percent: null, transferred: 0, total: 0 };
    showUpdateMessage(`Could not install the update: ${error.message}`, true);
  }
}

function setWizardStep(step) {
  wizardStep = clamp(step, 0, 2);
  document.querySelectorAll(".wizard-step").forEach((item, index) => {
    item.classList.toggle("active", index <= wizardStep);
  });
  $("#wizard-back").classList.toggle("hidden", wizardStep === 0);

  const content = $("#wizard-content");
  content.replaceChildren();

  if (wizardStep === 0) {
    const current = state.device.profile || state.settings.deviceProfile || {};
    $("#wizard-title").textContent = current.matchedBy === "device path"
      ? "The strip profile was found"
      : "Set up your strip profile";
    $("#wizard-copy").textContent = current.matchedBy === "device path"
      ? "ULLeds matched your controller to its saved strip layout. The LED count is read directly from the controller."
      : "ULLeds reads the LED count directly from your controller. Set the physical layout and color order here.";

    const fields = document.createElement("div");
    fields.className = "wizard-fields";

    const count = document.createElement("div");
    count.className = "wizard-count";
    const countLabel = document.createElement("span");
    countLabel.textContent = "LED count";
    count.append(countLabel);
    const detectedCount = state.device.connected ? state.device.profile?.ledCount : null;
    const countValue = document.createElement("strong");
    countValue.textContent = Number.isInteger(detectedCount)
      ? `${detectedCount} LEDs detected`
      : "Connect controller to detect";
    count.append(countValue);
    fields.append(count);

    const addField = (labelText, control) => {
      const field = document.createElement("label");
      field.className = "wizard-field";
      field.append(document.createTextNode(labelText), control);
      fields.append(field);
    };

    const edgeCount = document.createElement("select");
    edgeCount.dataset.setting = "edgeCount";
    [1, 2, 3, 4].forEach((value) => {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = `${value} ${value === 1 ? "side" : "sides"}`;
      edgeCount.append(option);
    });
    edgeCount.value = String(current.edgeCount || 3);
    addField("Lit sides", edgeCount);

    const installationMethod = document.createElement("select");
    installationMethod.dataset.setting = "installationMethod";
    [
      ["0", "Bottom left → over top → bottom right"],
      ["1", "Bottom right → over top → bottom left"]
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      installationMethod.append(option);
    });
    installationMethod.value = String(current.installationMethod ?? 0);
    addField("Strip start and direction", installationMethod);

    const colorOrder = document.createElement("select");
    colorOrder.dataset.setting = "colorOrder";
    ["RGB", "GRB", "RBG", "GBR", "BRG", "BGR"].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      colorOrder.append(option);
    });
    colorOrder.value = current.colorOrder || "RGB";
    addField("LED color order", colorOrder);

    const position = document.createElement("select");
    position.dataset.setting = "position";
    [
      ["monitor-back", "Behind the monitor"],
      ["monitor-front", "Around the screen"],
      ["top", "Above the screen"],
      ["desk", "On the desk"]
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      position.append(option);
    });
    position.value = current.position || "monitor-back";
    addField("Strip position", position);

    const hint = document.createElement("p");
    hint.className = "wizard-hint";
    hint.textContent = current.matchedBy
      ? `Imported from your saved ${deviceLabel(current.name)} setup.`
      : "These physical details are not part of the controller's USB data.";
    fields.append(hint);

    content.append(fields);
    $("#wizard-next").textContent = "Save profile";
  } else if (wizardStep === 1) {
    $("#wizard-title").textContent = "Connect your LED controller";
    $("#wizard-copy").textContent = "Connect the USB controller, then scan. ULLeds will apply your current settings when it connects.";

    const status = document.createElement("div");
    status.className = "wizard-device";
    status.textContent = state.device.connected
      ? `${deviceLabel(state.device.name)} is connected and ready.`
      : state.device.error || "No controller connected yet.";
    content.append(status);

    const scan = document.createElement("button");
    scan.className = "secondary-btn";
    scan.type = "button";
    scan.textContent = "Scan now";
    scan.addEventListener("click", async () => {
      await scanDevices();
      setWizardStep(1);
    });
    content.append(scan);

    $("#wizard-next").textContent = "Finish setup";
  } else {
    $("#wizard-title").textContent = "You're ready to make it yours";
    $("#wizard-copy").textContent = state.device.connected
      ? "Your controller is connected. Pick a color, save a scene, or try a moving effect."
      : "You can connect your controller later. Your choices are saved on this PC.";

    $("#wizard-next").textContent = "Start using ULLeds";

    const finish = document.createElement("div");
    finish.className = "wizard-device";
    const detectedCount = state.device.connected ? state.device.profile?.ledCount : null;
    finish.textContent = `${Number.isInteger(detectedCount) ? `${detectedCount} LEDs detected` : "LED count unavailable"} · ${state.settings.brightness}% brightness`;
    content.append(finish);
  }
}

function openSetup() {
  setWizardStep(0);
  $("#setup-dialog").showModal();
}

function openResetConfirmation() {
  $("#reset-dialog").showModal();
}

async function resetAllData() {
  const button = $("#confirm-reset");
  button.disabled = true;
  button.textContent = "Resetting…";
  clearTimeout(settingsTimer);
  settingsTimer = null;
  settingsQueue = {};
  if (settingsFlushPromise) await settingsFlushPromise;
  settingsQueue = {};
  stopScreenSync();
  autoSyncAttempted = true;

  try {
    const result = await window.ull.resetData();
    state.settings = result.settings;
    state.device = result.device;
    selectedLedIndices = null;
    screenSyncError = "";
    $("#reset-dialog").close();
    render();
    openSetup();
    const resetMessage = result.removedLegacyProfiles.length
      ? "All ULLeds data and imported legacy profiles were reset."
      : "All ULLeds data was reset.";
    toast(result.device.connected
      ? resetMessage
      : `${resetMessage} The controller is not connected; scan again after setup.`);
  } catch (error) {
    toast(`Could not reset ULLeds data: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = "Delete and reset";
  }
}

function bindEvents() {
  document.querySelectorAll('[data-feature="scenes"]').forEach((element) => {
    element.classList.toggle("hidden", !SCENES_ENABLED);
  });

  document.querySelectorAll(".tab").forEach((item) => {
    item.addEventListener("click", () => switchView(item.dataset.view));
  });

  $(".tabs").addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const tabs = [...document.querySelectorAll(".tab")].filter((tab) => tab.offsetWidth > 0);
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;
    event.preventDefault();
    const next = tabs[(current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    next.focus();
    switchView(next.dataset.view);
  });

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(() => positionTabIndicator(false)).observe($(".tabs"));
  }
  window.addEventListener("resize", () => positionTabIndicator(false));
  document.fonts?.ready.then(() => positionTabIndicator(false));
  positionTabIndicator(false);

  document.addEventListener("input", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.type === "range") {
      updateRangeFill(event.target);
    }
  });
  document.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.type === "range") {
      clearTimeout(settingsTimer);
      settingsTimer = null;
      void flushSettingsQueue();
    }
  });

  $("#monitor").addEventListener("click", selectPreviewPosition);
  $("#monitor").addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.classList.contains("led-edge")) {
      event.preventDefault();
      selectPreviewPosition(event);
    }
  });

  $("#select-all").addEventListener("click", () => {
    selectedLedIndices = null;
    updatePreview();
  });

  $("#scan-device").addEventListener("click", scanDevices);
  $("#controller-select").addEventListener("change", (event) => {
    void connectSelectedDevice(event.target.value);
  });
  $("#open-setup").addEventListener("click", openSetup);
  $("#reset-all-data").addEventListener("click", openResetConfirmation);
  $("#confirm-reset").addEventListener("click", resetAllData);

  $("#power-toggle").addEventListener("click", () => {
    if (screenSyncSession || screenSyncLifecycle.isStarting) stopScreenSync("", true);
    queueSettings({ power: !state.settings.power }, true);
  });

  $("#color-picker").addEventListener("input", (event) => applyColor(event.target.value));
  $("#hex-color").addEventListener("change", (event) => {
    const value = event.target.value.trim();
    if (/^#[\da-f]{6}$/i.test(value)) applyColor(value.toLowerCase());
    else {
      event.target.value = selectedColor();
      toast("Enter a color in #RRGGBB format.");
    }
  });

  $("#brightness").addEventListener("input", (event) => {
    queueSettings({ brightness: Number(event.target.value) });
  });

  ["rgb-red", "rgb-green", "rgb-blue"].forEach((id, index) => {
    $(`#${id}`).addEventListener("input", (event) => {
      const channelGains = [...state.settings.channelGains];
      channelGains[index] = Number(event.target.value);
      queueSettings({ channelGains });
    });
  });
  $("#reset-color-tuning").addEventListener("click", () => {
    queueSettings({ channelGains: [100, 100, 100] }, true);
  });

  $("#effect").addEventListener("change", (event) => {
    queueSettings({ effect: event.target.value }, true);
  });

  $("#speed").addEventListener("input", (event) => {
    queueSettings({ speed: Number(event.target.value) });
  });

  $("#sync-fps-range").addEventListener("input", (event) => {
    queueSettings({ syncFps: Number(event.target.value) });
  });
  $("#sync-fps-number").addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (Number.isInteger(value) && value >= 5 && value <= 60) {
      queueSettings({ syncFps: value });
    }
  });
  $("#sync-fps-number").addEventListener("change", (event) => {
    const value = Number(event.target.value);
    if (!Number.isInteger(value) || value < 5 || value > 60) {
      event.target.value = state.settings.syncFps;
      toast("Screen Sync FPS must be from 5 to 60.");
    }
  });

  $("#screen-sync-toggle").addEventListener("click", () => {
    if (screenSyncSession || screenSyncLifecycle.isStarting) stopScreenSync("", true);
    else startScreenSync();
  });

  $("#start-with-windows").addEventListener("change", (event) => {
    queueSettings({ startWithWindows: event.target.checked }, true);
  });
  $("#resume-screen-sync").addEventListener("change", (event) => {
    queueSettings({ resumeScreenSync: event.target.checked }, true);
    if (!event.target.checked && screenSyncSession) stopScreenSync();
  });

  if (SCENES_ENABLED) {
    $("#save-scene").addEventListener("click", () => {
      if (state.settings.presets.length >= 30) return toast("You can save up to 30 scenes.");
      const name = window.prompt("Name this scene");
      if (!name || !name.trim()) return;
      const presets = [...state.settings.presets, { name: name.trim().slice(0, 36), color: state.settings.color }];
      queueSettings({ presets }, true);
      toast("Scene saved.");
    });

    $("#add-palette-color").addEventListener("click", () => {
      if (state.settings.palette.length >= 8) return toast("A palette can have up to eight colors.");
      queueSettings({ palette: [...state.settings.palette, state.settings.color] }, true);
    });
  }

  document.querySelectorAll('input[name="update-source"]').forEach((input) => {
    input.addEventListener("change", () => selectUpdateSource(input.value));
  });
  $("#choose-update-folder").addEventListener("click", chooseUpdateFolder);
  $("#check-updates").addEventListener("click", checkUpdates);

  $("#wizard-back").addEventListener("click", () => setWizardStep(wizardStep - 1));
  $("#wizard-next").addEventListener("click", async () => {
    try {
      if (wizardStep === 0) {
        await scanDevices();
        const detectedCount = state.device.connected ? state.device.profile?.ledCount : null;
        if (!Number.isInteger(detectedCount)) {
          return toast("Connect the controller so ULLeds can detect the LED count.");
        }
        const profile = {
          name: deviceLabel(state.device.profile?.name || state.settings.deviceProfile?.name),
          ledCount: detectedCount,
          edgeCount: Number($('[data-setting="edgeCount"]').value),
          installationMethod: Number($('[data-setting="installationMethod"]').value),
          colorOrder: $('[data-setting="colorOrder"]').value,
          position: $('[data-setting="position"]').value,
          matchedBy: "manual",
          color: state.settings.color
        };
        const saved = await window.ull.updateSettings({ deviceProfile: profile });
        state.settings = saved.settings;
        state.device = saved;
        render();
        setWizardStep(1);
      } else if (wizardStep === 1) {
        setWizardStep(2);
      } else {
        await window.ull.updateSettings({ onboarded: true });
        state.settings.onboarded = true;
        $("#setup-dialog").close();
        render();
      }
    } catch (error) {
      toast(`Setup could not be saved: ${error.message}`);
    }
  });

  window.ull.onDeviceStatus((device) => {
    applyDeviceState(device);
    render();
    if (!device.connected) autoSyncAttempted = false;
    else maybeResumeScreenSync();
  });

  window.ull.onUpdateProgress((progress) => {
    updateState = {
      phase: "downloading",
      percent: Number.isFinite(progress.percent) ? progress.percent : null,
      transferred: Number.isFinite(progress.transferred) ? progress.transferred : 0,
      total: Number.isFinite(progress.total) ? progress.total : 0
    };
    showUpdateMessage("Downloading update…");
  });

  window.ull.onUpdateDownloaded(({ version }) => {
    updateState = { phase: "ready", percent: null, transferred: 0, total: 0 };
    showUpdateMessage(`ULLeds ${version} is ready. Your saved settings will be kept.`, false, true);
  });

  window.ull.onUpdateError(({ message }) => {
    updateState = { phase: "error", percent: null, transferred: 0, total: 0 };
    showUpdateMessage(`Update failed: ${message}`, true);
  });

  window.ull.onDeviceScanRequest(scanDevices);
  window.ull.onSetupRequest(openSetup);
  window.ull.onUpdateFolderRequest(() => {
    switchView("updates");
    selectUpdateSource("local");
    chooseUpdateFolder();
  });
  window.ull.onUpdateCheckRequest(() => {
    switchView("updates");
    checkUpdates();
  });

  window.addEventListener("beforeunload", () => {
    clearTimeout(settingsTimer);
    const pending = settingsQueue;
    settingsQueue = {};
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

async function start() {
  bindEvents();
  try {
    state = await window.ull.initialState();
    render();
    if (!state.settings.onboarded) openSetup();
    void scanDevices().then(maybeResumeScreenSync).catch((error) => {
      console.error("Could not finish ULLeds startup:", error);
      toast(`Could not finish starting ULLeds: ${error.message}`);
    });
  } catch (error) {
    toast(`ULLeds could not load: ${error.message}`);
  }
}

function maybeResumeScreenSync() {
  if (autoSyncAttempted || !state.settings.resumeScreenSync || !state.device.connected) return;
  autoSyncAttempted = true;
  updatePreview();
  void startScreenSync({ automatic: true });
}

start();