"use strict";

const VENDOR_ID = 0x1a86;
const PRODUCT_ID = 0xfe07;
const MAX_LEDS = 253;
const MAX_SECTIONS_PER_PACKET = 49;
const REPORT_PAYLOAD_SIZE = 64;

function isSupportedController(device) {
  return device?.vendorId === VENDOR_ID && device?.productId === PRODUCT_ID;
}

function buildDeviceInfoRequest(messageId = 2) {
  if (!Number.isInteger(messageId) || messageId < 1 || messageId > 255) {
    throw new RangeError("Message ID must be between 1 and 255.");
  }
  const packet = Buffer.from([82, 66, 6, messageId, 130, 0]);
  packet[5] = packet.subarray(0, 5).reduce((sum, value) => (sum + value) & 0xff, 0);
  return packet;
}

function parseDeviceLedCount(response, messageId) {
  if (!Buffer.isBuffer(response) || response.length < 12 ||
      response[0] !== 82 || response[1] !== 66 ||
      response[2] < 12 || response[2] > response.length ||
      response[3] !== messageId || response[4] !== 130) {
    throw new TypeError("The controller returned an invalid device-info response.");
  }
  const ledCount = response[11];
  if (!Number.isInteger(ledCount) || ledCount < 1 || ledCount > MAX_LEDS) {
    throw new RangeError("The controller did not report a valid LED count.");
  }
  return ledCount;
}

function validateColorOrder(colorOrder) {
  if (typeof colorOrder !== "string" || !/^[RGB]{3}$/.test(colorOrder) ||
      new Set(colorOrder).size !== 3) {
    throw new TypeError("Color order must contain R, G, and B exactly once.");
  }
}

function parseColor(color) {
  if (typeof color !== "string" || !/^#[\da-f]{6}$/i.test(color)) {
    throw new TypeError("Color must be a six-digit hex value.");
  }
  const [red, green, blue] = color.slice(1).match(/../g).map((part) => Number.parseInt(part, 16));
  return { R: red, G: green, B: blue };
}

function buildColorSections(colors, brightness = 100, power = true, effectBrightness = 1, colorOrder = "RGB") {
  if (!Array.isArray(colors) || colors.length < 1 || colors.length > MAX_LEDS) {
    throw new RangeError(`Color data must contain 1 to ${MAX_LEDS} LEDs.`);
  }
  if (!Number.isFinite(brightness) || brightness < 0 || brightness > 100 ||
      !Number.isFinite(effectBrightness) || effectBrightness < 0 || effectBrightness > 1) {
    throw new RangeError("Brightness must be within its supported range.");
  }
  if (typeof power !== "boolean") throw new TypeError("Power must be on or off.");
  validateColorOrder(colorOrder);

  const factor = power ? brightness / 100 * effectBrightness : 0;
  const orderedColors = colors.map((color) => {
    const rgb = parseColor(color);
    return colorOrder.split("").map((channel) => Math.round(rgb[channel] * factor));
  });
  const sections = [];
  let start = 1;
  let current = orderedColors[0];
  for (let index = 1; index <= orderedColors.length; index += 1) {
    const next = orderedColors[index];
    if (next && next.every((value, channel) => value === current[channel])) continue;
    sections.push([start, ...current, index]);
    start = index + 1;
    current = next;
  }

  if (colors.length < 254) {
    const last = sections.at(-1);
    if (last[1] === 0 && last[2] === 0 && last[3] === 0) last[4] = 254;
    else sections.push([colors.length + 1, 0, 0, 0, 254]);
  }
  return sections;
}

function validateSections(sections) {
  if (!Array.isArray(sections) || sections.length < 1) {
    throw new TypeError("At least one LED section is required.");
  }
  for (const section of sections) {
    if (!Array.isArray(section) || section.length !== 5 ||
        !section.every(Number.isInteger) ||
        section[0] < 1 || section[0] > 254 ||
        section[4] < section[0] || section[4] > 254 ||
        section.slice(1, 4).some((channel) => channel < 0 || channel > 255)) {
      throw new TypeError("LED sections must contain valid start, RGB, and end values.");
    }
  }
}

function buildSectionPacket(sections, messageId = 2) {
  validateSections(sections);
  if (!Number.isInteger(messageId) || messageId < 1 || messageId > 255) {
    throw new RangeError("Message ID must be between 1 and 255.");
  }
  if (sections.length > MAX_SECTIONS_PER_PACKET) {
    throw new RangeError(`A packet can contain at most ${MAX_SECTIONS_PER_PACKET} LED sections.`);
  }

  const length = 6 + sections.length * 5;
  const packet = Buffer.alloc(length);
  packet.write("RB", 0, 2, "ascii");
  packet.writeUInt8(length, 2);
  packet.writeUInt8(messageId, 3);
  packet.writeUInt8(134, 4);
  sections.forEach((section, index) => {
    section.forEach((value, offset) => packet.writeUInt8(value, 5 + index * 5 + offset));
  });
  packet[length - 1] = packet.subarray(0, length - 1)
    .reduce((sum, value) => (sum + value) & 0xff, 0);
  return packet;
}

function buildSectionPackets(sections, firstMessageId = 2) {
  validateSections(sections);
  if (!Number.isInteger(firstMessageId) || firstMessageId < 1 || firstMessageId > 255) {
    throw new RangeError("Message ID must be between 1 and 255.");
  }
  const packets = [];
  for (let index = 0; index < sections.length; index += MAX_SECTIONS_PER_PACKET) {
    const messageId = ((firstMessageId - 1 + packets.length) % 255) + 1;
    packets.push(buildSectionPacket(sections.slice(index, index + MAX_SECTIONS_PER_PACKET), messageId));
  }
  return packets;
}

function buildScreenSyncFrame(colors, brightness = 100, power = true, colorOrder = "RGB", messageId = 2) {
  if (!Number.isInteger(messageId) || messageId < 1 || messageId > 255) {
    throw new RangeError("Message ID must be between 1 and 255.");
  }
  const sections = buildColorSections(colors, brightness, power, 1, colorOrder)
    .filter(([start]) => start <= colors.length);
  const lastSection = sections.at(-1);
  lastSection[4] = colors.length;

  const length = 7 + sections.length * 5;
  const packet = Buffer.alloc(length);
  packet.write("SC", 0, 2, "ascii");
  packet.writeUInt16BE(length, 2);
  packet.writeUInt8(messageId, 4);
  packet.writeUInt8(128, 5);
  sections.forEach((section, index) => {
    section.forEach((value, offset) => packet.writeUInt8(value, 6 + index * 5 + offset));
  });
  packet[length - 1] = packet.subarray(0, length - 1)
    .reduce((sum, value) => (sum + value) & 0xff, 0);
  return packet;
}

function buildHidReports(packet) {
  if (!(Buffer.isBuffer(packet) || packet instanceof Uint8Array) || packet.length < 1) {
    throw new TypeError("A non-empty controller packet is required.");
  }
  const reports = [];
  for (let offset = 0; offset < packet.length; offset += REPORT_PAYLOAD_SIZE) {
    const chunk = packet.subarray(offset, Math.min(offset + REPORT_PAYLOAD_SIZE, packet.length));
    const report = Buffer.alloc(chunk.length + 1);
    chunk.copy(report, 1);
    reports.push(report);
  }
  return reports;
}

function buildColorFrames(colors, brightness = 100, power = true, effectBrightness = 1, colorOrder = "RGB", firstMessageId = 2) {
  return buildSectionPackets(
    buildColorSections(colors, brightness, power, effectBrightness, colorOrder),
    firstMessageId
  );
}

function buildFrame(color, ledCount, brightness = 100, power = true, effectBrightness = 1, colorOrder = "RGB", ledColors = {}, firstMessageId = 2) {
  if (!Number.isInteger(ledCount) || ledCount < 1 || ledCount > MAX_LEDS) {
    throw new RangeError(`LED count must be between 1 and ${MAX_LEDS}.`);
  }
  parseColor(color);
  const colors = Array.from({ length: ledCount }, (_, index) => ledColors[index] || color);
  return buildColorFrames(colors, brightness, power, effectBrightness, colorOrder, firstMessageId);
}

module.exports = {
  buildColorFrames,
  buildColorSections,
  buildDeviceInfoRequest,
  buildFrame,
  buildHidReports,
  buildScreenSyncFrame,
  parseDeviceLedCount,
  buildSectionPacket,
  buildSectionPackets,
  isSupportedController
};
