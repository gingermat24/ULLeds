"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
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
    ...overrides
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
