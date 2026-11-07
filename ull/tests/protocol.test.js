"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildColorFrames,
  buildColorSections,
  buildDeviceInfoRequest,
  buildFrame,
  buildHidReports,
  buildScreenSyncFrame,
  buildSectionPackets,
  parseDeviceLedCount,
  isSupportedController
} = require("../protocol");

test("the controller is matched by its USB vendor and product identifiers", () => {
  assert.equal(isSupportedController({ vendorId: 0x1a86, productId: 0xfe07 }), true);
  assert.equal(isSupportedController({ vendorId: 0x1a86, productId: 0xfe06 }), false);
});

test("the device-info request and response expose the controller's LED count", () => {
  const request = buildDeviceInfoRequest(2);
  assert.deepEqual([...request], [82, 66, 6, 2, 130, 30]);
  const response = Buffer.alloc(64);
  response.set([82, 66, 25, 2, 130, 0, 6, 3, 32, 1, 0, 75]);
  assert.equal(parseDeviceLedCount(response, 2), 75);
  assert.throws(() => parseDeviceLedCount(response, 3), /invalid device-info response/);
  const reportIdResponse = Buffer.concat([Buffer.from([0]), response]);
  assert.equal(parseDeviceLedCount(reportIdResponse, 2), 75);
  assert.equal(parseDeviceLedCount(reportIdResponse), 75);
  const responseFromAnotherHidReader = Buffer.from(response);
  responseFromAnotherHidReader[3] = 37;
  assert.equal(parseDeviceLedCount(responseFromAnotherHidReader), 75);
  assert.throws(() => parseDeviceLedCount(Buffer.from([82, 66, 12, 2, 130, 0, 0, 0, 0, 0, 0, 0]), 2), /valid LED count/);
});

test("a uniform strip is encoded as controller section packets with a checksum", () => {
  const [packet] = buildFrame("#804020", 75, 50);
  assert.deepEqual([...packet], [
    82, 66, 16, 2, 134, 1, 64, 32, 16, 75, 76, 0, 0, 0, 254, 50
  ]);
});

test("color order and brightness are applied before encoding LED ranges", () => {
  const [packet] = buildFrame("#804020", 75, 100, true, 1, "GRB");
  assert.deepEqual([...packet.subarray(5, 15)], [
    1, 64, 128, 32, 75, 76, 0, 0, 0, 254
  ]);
  assert.equal(packet[packet.length - 1], packet.subarray(0, -1)
    .reduce((sum, value) => (sum + value) & 0xff, 0));
  assert.throws(() => buildFrame("#ffffff", 75, 100, true, 1, "RRG"), /Color order/);
});

test("RGB channel calibration is applied before the configured wire order", () => {
  const sections = buildColorSections(["#804020"], 100, true, 1, "GRB", [125, 100, 75]);
  assert.deepEqual(sections, [
    [1, 64, 160, 24, 1],
    [2, 0, 0, 0, 254]
  ]);
  assert.throws(
    () => buildColorSections(["#ffffff"], 100, true, 1, "RGB", [100, 151, 100]),
    /channel gains/
  );
});

test("per-LED colors become contiguous addressable sections", () => {
  assert.deepEqual(buildColorSections(["#ff0000", "#0000ff", "#0000ff"], 100), [
    [1, 255, 0, 0, 1],
    [2, 0, 0, 255, 3],
    [4, 0, 0, 0, 254]
  ]);
  const [packet] = buildFrame("#000000", 3, 100, true, 1, "RGB", { 1: "#ffffff" });
  assert.deepEqual([...packet.subarray(5, 20)], [
    1, 0, 0, 0, 1,
    2, 255, 255, 255, 2,
    3, 0, 0, 0, 254
  ]);
});

test("screen sync uses the controller's SC command with a 16-bit length and one range per color", () => {
  const frame = buildScreenSyncFrame(["#ff0000", "#00ff00", "#0000ff"], 100, true, "RGB", 9);
  assert.equal(frame.toString("ascii", 0, 2), "SC");
  assert.equal(frame.readUInt16BE(2), frame.length);
  assert.equal(frame[4], 9);
  assert.equal(frame[5], 128);
  assert.deepEqual([...frame.subarray(6, -1)], [
    1, 255, 0, 0, 1,
    2, 0, 255, 0, 2,
    3, 0, 0, 255, 3
  ]);
  assert.equal(frame[frame.length - 1], frame.subarray(0, -1)
    .reduce((sum, value) => (sum + value) & 0xff, 0));
});

test("screen sync applies the same RGB channel calibration as static colors", () => {
  const frame = buildScreenSyncFrame(["#804020"], 100, true, "RGB", 9, [125, 100, 75]);
  assert.deepEqual([...frame.subarray(6, -1)], [1, 160, 64, 24, 1]);
});

test("power-off sends black across the configured strip and trailing range", () => {
  assert.deepEqual(buildColorSections(["#ffffff", "#ff0000"], 100, false), [
    [1, 0, 0, 0, 254]
  ]);
});

test("long section lists are packetized without overflowing the one-byte length", () => {
  const sections = Array.from({ length: 50 }, (_, index) => [
    index + 1, 1, 2, 3, index + 1
  ]);
  const packets = buildSectionPackets(sections, 255);
  assert.equal(packets.length, 2);
  assert.equal(packets[0].length, 251);
  assert.equal(packets[0][2], 251);
  assert.equal(packets[0][3], 255);
  assert.equal(packets[1].length, 11);
  assert.equal(packets[1][3], 1);
});

test("HID output reports include the report ID and split packets at 64 bytes", () => {
  const colors = Array.from({ length: 75 }, (_, index) => index % 2 ? "#112233" : "#334455");
  const [packet] = buildColorFrames(colors);
  const reports = buildHidReports(packet);
  assert.equal(reports[0].length, 65);
  assert.equal(reports[0][0], 0);
  assert.equal(reports.at(-1)[0], 0);
  assert.deepEqual(Buffer.concat(reports.map((report) => report.subarray(1))), packet);
});

test("LED count and color are validated before packet construction", () => {
  assert.throws(() => buildFrame("#ffffff", 254), RangeError);
  assert.throws(() => buildFrame("red", 75), TypeError);
});
