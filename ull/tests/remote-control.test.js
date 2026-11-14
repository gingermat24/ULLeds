"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const net = require("node:net");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const {
  createRemoteControlService,
  getPrivateNetworkInterfaces,
  isPrivateIPv4,
  isSameSubnet
} = require("../remote-control");

const loopback = [{
  name: "Loopback",
  address: "127.0.0.1",
  netmask: "255.0.0.0",
  cidr: "127.0.0.1/8"
}];

function createService(overrides = {}) {
  return createRemoteControlService({
    getState: async () => ({ settings: { brightness: 50 }, device: { connected: false } }),
    updateSettings: async () => {},
    applyScene: async () => {},
    manageScene: async () => {},
    setSyncMode: async () => {},
    networkInterfaces: () => loopback,
    port: 0,
    ...overrides
  });
}

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function post(baseUrl, route, body, { cookie, origin = baseUrl } = {}) {
  return fetch(`${baseUrl}${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: JSON.stringify(body)
  });
}

function postWithHost(baseUrl, route, body, headers = {}) {
  const url = new URL(baseUrl);
  return new Promise((resolve, reject) => {
    const request = http.request({
      hostname: url.hostname,
      port: url.port,
      path: route,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: baseUrl,
        ...headers
      }
    }, (response) => {
      response.resume();
      response.on("end", () => resolve(response.statusCode));
    });
    request.on("error", reject);
    request.end(JSON.stringify(body));
  });
}

test("private-network discovery excludes public and non-IPv4 interfaces", () => {
  assert.equal(isPrivateIPv4("10.2.3.4"), true);
  assert.equal(isPrivateIPv4("172.31.0.1"), true);
  assert.equal(isPrivateIPv4("192.168.1.4"), true);
  assert.equal(isPrivateIPv4("172.32.0.1"), false);
  assert.equal(isPrivateIPv4("8.8.8.8"), false);
  assert.equal(isPrivateIPv4("::1"), false);
  assert.equal(isSameSubnet("::ffff:192.168.1.20", {
    address: "192.168.1.10",
    netmask: "255.255.255.0"
  }), true);

  const found = getPrivateNetworkInterfaces({
    Ethernet: [
      { address: "192.168.1.10", netmask: "255.255.255.0", family: "IPv4", internal: false },
      { address: "8.8.8.8", netmask: "255.255.255.0", family: "IPv4", internal: false },
      { address: "127.0.0.1", netmask: "255.0.0.0", family: "IPv4", internal: true }
    ],
    Tunnel: [{ address: "fd00::1", netmask: "ffff::", family: "IPv6", internal: false }]
  });
  assert.deepEqual(found.map(({ name, address }) => ({ name, address })), [
    { name: "Ethernet", address: "192.168.1.10" }
  ]);
});

test("pairing grants a same-origin session and rejects unpaired state reads", async (t) => {
  const service = createService();
  t.after(() => service.stop());
  const status = await service.start("127.0.0.1");

  const unpaired = await fetch(`${status.url}/api/state`);
  assert.equal(unpaired.status, 401);

  const paired = await post(status.url, "/api/pair", { pin: status.pin });
  assert.equal(paired.status, 200);
  assert.deepEqual(await paired.json(), { paired: true });
  const cookie = paired.headers.get("set-cookie").split(";")[0];

  const state = await fetch(`${status.url}/api/state`, { headers: { Cookie: cookie } });
  assert.equal(state.status, 200);
  assert.deepEqual(await state.json(), {
    settings: { brightness: 50 },
    device: { connected: false }
  });

  const wrongOrigin = await post(status.url, "/api/unpair", {}, { cookie, origin: "http://example.com" });
  assert.equal(wrongOrigin.status, 403);
  const wrongHost = await postWithHost(status.url, "/api/unpair", {}, {
    Cookie: cookie,
    Host: "example.com"
  });
  assert.equal(wrongHost, 403);
});

test("paired phone sessions and the home-screen URL survive a server restart", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "ulleds-remote-"));
  const options = {
    port: await getAvailablePort(),
    sessionStorePath: path.join(directory, "sessions.json")
  };
  let service = createService(options);
  t.after(async () => {
    await service.stop();
    await fs.rm(directory, { recursive: true, force: true });
  });

  const first = await service.start("127.0.0.1");
  const paired = await post(first.url, "/api/pair", { pin: first.pin });
  const cookie = paired.headers.get("set-cookie").split(";")[0];
  const token = cookie.match(/ulleds_remote=([^;]+)/)[1];
  const savedSessions = await fs.readFile(options.sessionStorePath, "utf8");
  assert.doesNotMatch(savedSessions, new RegExp(token));

  await service.stop();
  service = createService(options);
  const restarted = await service.start("127.0.0.1");
  assert.equal(restarted.url, first.url);
  const state = await fetch(`${restarted.url}/api/state`, { headers: { Cookie: cookie } });
  assert.equal(state.status, 200);

  const unpaired = await post(restarted.url, "/api/unpair", {}, { cookie });
  assert.equal(unpaired.status, 200);
  const revoked = await fetch(`${restarted.url}/api/state`, { headers: { Cookie: cookie } });
  assert.equal(revoked.status, 401);

  const pairedAgain = await post(restarted.url, "/api/pair", { pin: restarted.pin });
  const secondCookie = pairedAgain.headers.get("set-cookie").split(";")[0];
  await service.stop({ revokeSessions: true });
  service = createService(options);
  const disabled = await service.start("127.0.0.1");
  const revokedAfterDisable = await fetch(`${disabled.url}/api/state`, {
    headers: { Cookie: secondCookie }
  });
  assert.equal(revokedAfterDisable.status, 401);
});

test("paired phone requests cannot change settings outside the allowlist", async (t) => {
  const updates = [];
  const service = createService({
    updateSettings: async (input) => updates.push(input),
    setSyncMode: async () => { throw new Error("sync failed"); }
  });
  t.after(() => service.stop());
  const status = await service.start("127.0.0.1");
  const paired = await post(status.url, "/api/pair", { pin: status.pin });
  const cookie = paired.headers.get("set-cookie").split(";")[0];

  const accepted = await post(status.url, "/api/settings", { brightness: 80 }, { cookie });
  assert.equal(accepted.status, 200);
  assert.deepEqual(updates, [{ brightness: 80 }]);

  const rejected = await post(status.url, "/api/settings", {
    devicePath: "arbitrary",
    startWithWindows: false
  }, { cookie });
  assert.equal(rejected.status, 400);
  assert.deepEqual(updates, [{ brightness: 80 }]);

  const oversized = await post(status.url, "/api/settings", {
    color: "#ffffff",
    padding: "x".repeat(17 * 1024)
  }, { cookie });
  assert.equal(oversized.status, 413);

  const sync = await post(status.url, "/api/sync", { mode: "screen" }, { cookie });
  assert.equal(sync.status, 409);
});

test("repeated incorrect PINs are rate limited", async (t) => {
  const service = createService();
  t.after(() => service.stop());
  const status = await service.start("127.0.0.1");
  let response;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    response = await post(status.url, "/api/pair", { pin: "000000" });
  }
  assert.equal(response.status, 401);
  response = await post(status.url, "/api/pair", { pin: "000000" });
  assert.equal(response.status, 429);
});

test("startup can reuse the selected network adapter after its private IP changes", async (t) => {
  let interfaces = loopback;
  const service = createService({ networkInterfaces: () => interfaces });
  t.after(() => service.stop());

  await service.start("127.0.0.1", "Loopback");
  await service.stop();
  interfaces = [{ ...loopback[0], address: "127.0.0.2", cidr: "127.0.0.2/8" }];

  const status = await service.start("127.0.0.1", "Loopback");
  assert.equal(status.address, "127.0.0.2");
});
