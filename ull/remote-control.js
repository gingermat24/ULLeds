"use strict";

const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");
const { createHash, randomBytes, randomInt, timingSafeEqual } = require("node:crypto");
const QRCode = require("qrcode");

const MAX_BODY_BYTES = 16 * 1024;
const SESSION_MS = 365 * 24 * 60 * 60 * 1000;
// Keep existing iPhone Home Screen URLs valid after ULLeds restarts.
const REMOTE_PORT = 49514;
const PIN_FAILURE_LIMIT = 5;
const PIN_LOCK_MS = 5 * 60 * 1000;
const REMOTE_SETTINGS = new Set([
  "color",
  "brightness",
  "channelGains",
  "effect",
  "speed",
  "palette",
  "ledColors",
  "power",
  "syncFps",
  "spotifySensitivity",
  "syncContentMode",
  "syncAutoDetect"
]);
const STATIC_FILES = new Map([
  ["/", ["remote.html", "text/html; charset=utf-8"]],
  ["/remote.css", ["remote.css", "text/css; charset=utf-8"]],
  ["/remote.js", ["remote.js", "text/javascript; charset=utf-8"]]
]);

function ipv4Number(address) {
  const parts = address.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) {
    return null;
  }
  return parts.reduce((value, part) => (value * 256 + Number(part)) >>> 0, 0);
}

function isPrivateIPv4(address) {
  const value = ipv4Number(address);
  if (value === null) return false;
  const first = value >>> 24;
  const second = (value >>> 16) & 255;
  return first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168);
}

function getPrivateNetworkInterfaces(networkInterfaces = os.networkInterfaces()) {
  const interfaces = [];
  for (const [name, addresses] of Object.entries(networkInterfaces)) {
    for (const entry of addresses || []) {
      const family = entry.family;
      if ((family === "IPv4" || family === 4) && !entry.internal &&
          isPrivateIPv4(entry.address) && ipv4Number(entry.netmask) !== null) {
        interfaces.push({
          name,
          address: entry.address,
          netmask: entry.netmask,
          cidr: entry.cidr || `${entry.address}/${entry.netmask}`
        });
      }
    }
  }
  return interfaces;
}

function normalizeRemoteAddress(address) {
  if (typeof address !== "string") return "";
  return address.startsWith("::ffff:") ? address.slice(7) : address;
}

function isSameSubnet(clientAddress, network) {
  const client = ipv4Number(normalizeRemoteAddress(clientAddress));
  const local = ipv4Number(network.address);
  const mask = ipv4Number(network.netmask);
  return client !== null && local !== null && mask !== null &&
    (client & mask) === (local & mask);
}

function createRemoteControlService({
  getState,
  updateSettings,
  applyScene,
  manageScene,
  setSyncMode,
  networkInterfaces = getPrivateNetworkInterfaces,
  uiDirectory = path.join(__dirname, "ui"),
  sessionStorePath = "",
  port = REMOTE_PORT
}) {
  if (typeof getState !== "function" || typeof updateSettings !== "function" ||
      typeof applyScene !== "function" || typeof manageScene !== "function" ||
      typeof setSyncMode !== "function") {
    throw new TypeError("Remote control requires state and action handlers.");
  }
  if (typeof sessionStorePath !== "string" ||
      !Number.isInteger(port) || port < 0 || port > 65535) {
    throw new TypeError("Remote control session storage or port is invalid.");
  }

  let server = null;
  let network = null;
  let baseUrl = "";
  let pin = "";
  let qrDataUrl = "";
  let sessions = new Map();
  let sessionsLoaded = false;
  const pinFailures = new Map();

  function getStatus() {
    const address = server?.address();
    return {
      running: Boolean(server?.listening),
      interfaces: networkInterfaces(),
      address: network?.address || "",
      interfaceName: network?.name || "",
      port: address && typeof address === "object" ? address.port : 0,
      url: baseUrl,
      pin,
      qrDataUrl
    };
  }

  function sessionKey(token) {
    return createHash("sha256").update(token).digest("hex");
  }

  async function saveSessions() {
    if (!sessionStorePath) return;
    const file = path.resolve(sessionStorePath);
    const temporaryFile = `${file}.${process.pid}.${randomBytes(8).toString("hex")}.tmp`;
    await fs.promises.mkdir(path.dirname(file), { recursive: true });
    await fs.promises.writeFile(temporaryFile, JSON.stringify([...sessions]), {
      encoding: "utf8",
      mode: 0o600
    });
    try {
      await fs.promises.rename(temporaryFile, file);
    } catch (error) {
      await fs.promises.rm(temporaryFile, { force: true });
      throw error;
    }
  }

  async function loadSessions() {
    if (sessionsLoaded) return;
    if (!sessionStorePath) {
      sessionsLoaded = true;
      return;
    }
    const file = path.resolve(sessionStorePath);
    let stored;
    try {
      stored = await fs.promises.readFile(file, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        sessionsLoaded = true;
        return;
      }
      throw new Error(`Could not load paired phone sessions: ${error.message}`);
    }
    let entries;
    try {
      entries = JSON.parse(stored);
    } catch (error) {
      throw new Error(`Could not read paired phone sessions: ${error.message}`);
    }
    if (!Array.isArray(entries) || entries.some((entry) =>
      !Array.isArray(entry) || entry.length !== 2 ||
      typeof entry[0] !== "string" || !/^[a-f0-9]{64}$/.test(entry[0]) ||
      !Number.isSafeInteger(entry[1]))) {
      throw new Error("The paired phone session file is invalid.");
    }
    const now = Date.now();
    const previousSessions = sessions;
    sessions = new Map(entries.filter(([, expiresAt]) => expiresAt > now));
    try {
      if (sessions.size !== entries.length) await saveSessions();
    } catch (error) {
      sessions = previousSessions;
      throw new Error(`Could not update paired phone sessions: ${error.message}`);
    }
    sessionsLoaded = true;
  }

  function sendJson(response, statusCode, data, headers = {}) {
    const body = Buffer.from(JSON.stringify(data));
    response.writeHead(statusCode, {
      "Cache-Control": "no-store",
      "Content-Length": body.length,
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...headers
    });
    response.end(body);
  }

  function sendError(response, statusCode, message) {
    sendJson(response, statusCode, { error: message });
  }

  function readJson(request) {
    return new Promise((resolve, reject) => {
      let size = 0;
      let tooLarge = false;
      const chunks = [];
      request.on("data", (chunk) => {
        if (tooLarge) return;
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
          tooLarge = true;
          chunks.length = 0;
          return;
        }
        chunks.push(chunk);
      });
      request.on("end", () => {
        if (tooLarge) {
          reject(Object.assign(new Error("Request is too large."), { statusCode: 413 }));
          return;
        }
        try {
          const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          if (!value || typeof value !== "object" || Array.isArray(value)) {
            throw new TypeError("Request body must be an object.");
          }
          resolve(value);
        } catch {
          reject(Object.assign(new Error("Request body must be valid JSON."), { statusCode: 400 }));
        }
      });
      request.on("error", reject);
      request.on("aborted", () => reject(new Error("The request was interrupted.")));
    });
  }

  function clientAddress(request) {
    return normalizeRemoteAddress(request.socket.remoteAddress || "");
  }

  function hasValidOrigin(request) {
    return request.headers.origin === baseUrl;
  }

  function sessionFor(request) {
    const cookieHeader = request.headers.cookie || "";
    const match = cookieHeader.match(/(?:^|;\s*)ulleds_remote=([a-f0-9]{64})(?:;|$)/);
    if (!match) return null;
    const key = sessionKey(match[1]);
    const expiresAt = sessions.get(key);
    if (!expiresAt || expiresAt <= Date.now()) {
      sessions.delete(key);
      return null;
    }
    return key;
  }

  function pinIsValid(input) {
    if (typeof input.pin !== "string" || !/^\d{6}$/.test(input.pin)) return false;
    const supplied = Buffer.from(input.pin);
    const expected = Buffer.from(pin);
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  }

  async function handle(request, response) {
    response.setHeader("Content-Security-Policy",
      "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("X-Content-Type-Options", "nosniff");

    if (!network || !isSameSubnet(clientAddress(request), network)) {
      sendError(response, 403, "This device is outside the selected local network.");
      return;
    }
    if (request.headers.host !== new URL(baseUrl).host) {
      sendError(response, 403, "This request was not sent to the paired ULLeds address.");
      return;
    }

    const pathname = new URL(request.url, baseUrl).pathname;
    if (request.method === "GET" && STATIC_FILES.has(pathname)) {
      const [filename, contentType] = STATIC_FILES.get(pathname);
      try {
        const content = await fs.promises.readFile(path.join(uiDirectory, filename));
        response.writeHead(200, {
          "Cache-Control": "no-store",
          "Content-Length": content.length,
          "Content-Type": contentType
        });
        response.end(content);
      } catch (error) {
        console.error("Could not read the remote control page:", error);
        sendError(response, 500, "The remote control page could not be loaded.");
      }
      return;
    }

    if (request.method === "POST") {
      if (!hasValidOrigin(request)) {
        sendError(response, 403, "This request did not come from the ULLeds remote page.");
        return;
      }
      if (request.headers["content-type"]?.split(";")[0].trim() !== "application/json") {
        sendError(response, 415, "Requests must use JSON.");
        return;
      }
    } else if (request.method !== "GET") {
      response.setHeader("Allow", "GET, POST");
      sendError(response, 405, "This request method is not supported.");
      return;
    }

    if (request.method === "POST" && pathname === "/api/pair") {
      const remote = clientAddress(request);
      const failures = pinFailures.get(remote);
      if (failures?.lockedUntil > Date.now()) {
        sendError(response, 429, "Too many incorrect PIN attempts. Try again later.");
        return;
      }
      let input;
      try {
        input = await readJson(request);
      } catch (error) {
        sendError(response, error.statusCode || 400, error.message);
        return;
      }
      if (!pinIsValid(input)) {
        const count = failures?.lockedUntil > Date.now() ? failures.count : (failures?.count || 0) + 1;
        pinFailures.set(remote, {
          count,
          lockedUntil: count >= PIN_FAILURE_LIMIT ? Date.now() + PIN_LOCK_MS : 0
        });
        sendError(response, 401, "That PIN is incorrect.");
        return;
      }
      pinFailures.delete(remote);
      const token = randomBytes(32).toString("hex");
      const key = sessionKey(token);
      sessions.set(key, Date.now() + SESSION_MS);
      try {
        await saveSessions();
      } catch (error) {
        sessions.delete(key);
        console.error("Could not save the paired phone session:", error);
        sendError(response, 500, "ULLeds could not save this pairing. Try again.");
        return;
      }
      sendJson(response, 200, { paired: true }, {
        "Set-Cookie": `ulleds_remote=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_MS / 1000)}`
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/unpair") {
      const key = sessionFor(request);
      const expiresAt = key ? sessions.get(key) : undefined;
      if (key) {
        sessions.delete(key);
        try {
          await saveSessions();
        } catch (error) {
          sessions.set(key, expiresAt);
          console.error("Could not remove the paired phone session:", error);
          sendError(response, 500, "ULLeds could not remove this pairing.");
          return;
        }
      }
      sendJson(response, 200, { paired: false }, {
        "Set-Cookie": "ulleds_remote=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
      });
      return;
    }

    if (request.method === "GET" && pathname === "/api/state") {
      if (!sessionFor(request)) {
        sendError(response, 401, "Pair this phone with ULLeds to continue.");
        return;
      }
      try {
        sendJson(response, 200, await getState());
      } catch (error) {
        console.error("Could not read remote control state:", error);
        sendError(response, 500, "ULLeds could not read the current state.");
      }
      return;
    }

    if (request.method === "POST" && pathname === "/api/settings") {
      if (!sessionFor(request)) {
        sendError(response, 401, "Pair this phone with ULLeds to continue.");
        return;
      }
      let input;
      try {
        input = await readJson(request);
        const keys = Object.keys(input);
        if (keys.length === 0 || keys.some((key) => !REMOTE_SETTINGS.has(key))) {
          throw Object.assign(new TypeError("This setting cannot be changed from the phone."), { statusCode: 400 });
        }
        const changes = Object.hasOwn(input, "color")
          ? { ...input, ledColors: {} }
          : input;
        await updateSettings(changes);
        sendJson(response, 200, { updated: true });
      } catch (error) {
        sendError(response, error.statusCode || 400, error.message || "The setting could not be updated.");
      }
      return;
    }

    if (request.method === "POST" && pathname === "/api/scenes/apply") {
      if (!sessionFor(request)) {
        sendError(response, 401, "Pair this phone with ULLeds to continue.");
        return;
      }
      try {
        const input = await readJson(request);
        if (typeof input.id !== "string" || input.id.length > 64) {
          throw new TypeError("Choose a saved lighting scene.");
        }
        await applyScene(input.id);
        sendJson(response, 200, { applied: true });
      } catch (error) {
        sendError(response, 400, error.message || "The scene could not be applied.");
      }
      return;
    }

    if (request.method === "POST" && pathname === "/api/scenes") {
      if (!sessionFor(request)) {
        sendError(response, 401, "Pair this phone with ULLeds to continue.");
        return;
      }
      try {
        const input = await readJson(request);
        if (!["save", "rename", "delete"].includes(input.action)) {
          throw new TypeError("Choose a supported scene action.");
        }
        await manageScene(input);
        sendJson(response, 200, { updated: true });
      } catch (error) {
        sendError(response, 400, error.message || "The scene could not be changed.");
      }
      return;
    }

    if (request.method === "POST" && pathname === "/api/sync") {
      if (!sessionFor(request)) {
        sendError(response, 401, "Pair this phone with ULLeds to continue.");
        return;
      }
      try {
        const input = await readJson(request);
        if (!["lighting", "screen", "spotify"].includes(input.mode)) {
          throw new TypeError("Choose lighting, Screen Sync, or Spotify Sync.");
        }
        await setSyncMode(input.mode);
        sendJson(response, 200, { requested: input.mode });
      } catch (error) {
        sendError(response, 409, error.message || "The sync mode could not be changed.");
      }
      return;
    }

    sendError(response, 404, "This remote control route does not exist.");
  }

  async function start(requestedAddress = "", requestedInterfaceName = "") {
    if (server?.listening) return getStatus();
    await loadSessions();
    const interfaces = networkInterfaces();
    network = interfaces.find((item) => item.address === requestedAddress) ||
      interfaces.find((item) => item.name === requestedInterfaceName) ||
      (!requestedAddress && !requestedInterfaceName ? interfaces[0] : null) || null;
    if (!network) {
      throw new Error("No private IPv4 network is available. Connect to a private Wi-Fi or Ethernet network and try again.");
    }
    pin = String(randomInt(100000, 1000000));
    pinFailures.clear();
    const nextServer = http.createServer((request, response) => {
      void handle(request, response).catch((error) => {
        console.error("Remote control request failed:", error);
        if (!response.headersSent) sendError(response, 500, "The request could not be completed.");
        else response.destroy();
      });
      nextServer.headersTimeout = 10000;
      nextServer.requestTimeout = 30000;
      nextServer.keepAliveTimeout = 5000;
    });
    server = nextServer;
    await new Promise((resolve, reject) => {
      const onError = (error) => {
        nextServer.removeListener("listening", onListening);
        if (server === nextServer) server = null;
        network = null;
        reject(new Error(`Could not start remote control on ${interfaces.find((item) => item.address === requestedAddress)?.name || requestedInterfaceName || "the selected network"}: ${error.message}`));
      };
      const onListening = () => {
        nextServer.removeListener("error", onError);
        resolve();
      };
      nextServer.once("error", onError);
      nextServer.once("listening", onListening);
      nextServer.listen(port, network.address);
    });
    const boundPort = nextServer.address().port;
    baseUrl = `http://${network.address}:${boundPort}`;
    try {
      qrDataUrl = await QRCode.toDataURL(baseUrl, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 240
      });
    } catch (error) {
      await stop();
      throw new Error(`Could not create the phone pairing code: ${error.message}`);
    }
    return getStatus();
  }

  async function stop({ revokeSessions = false } = {}) {
    if (revokeSessions) {
      const previousSessions = sessions;
      sessions = new Map();
      try {
        await saveSessions();
      } catch (error) {
        sessions = previousSessions;
        throw new Error(`Could not remove paired phone sessions: ${error.message}`);
      }
    }
    const currentServer = server;
    server = null;
    network = null;
    baseUrl = "";
    pin = "";
    qrDataUrl = "";
    pinFailures.clear();
    if (!currentServer?.listening) return;
    await new Promise((resolve, reject) => {
      currentServer.close((error) => error ? reject(error) : resolve());
      currentServer.closeAllConnections();
    });
  }

  return Object.freeze({ getStatus, start, stop });
}

module.exports = {
  createRemoteControlService,
  getPrivateNetworkInterfaces,
  isPrivateIPv4,
  isSameSubnet
};
