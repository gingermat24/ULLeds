"use strict";

const {
  buildColorFrames,
  buildDeviceInfoRequest,
  buildHidReports,
  buildScreenSyncFrame,
  parseDeviceLedCount
} = require("./protocol");
const { createHidOutputQueue } = require("./hid-output");

function createPcSyncHidDevice({
  openHidDevice,
  onTiming = () => {},
  onWriteStatus = () => {},
  ledCountTimeoutMs = 1200
} = {}) {
  if (typeof openHidDevice !== "function" || typeof onTiming !== "function" ||
      typeof onWriteStatus !== "function" || !Number.isFinite(ledCountTimeoutMs) ||
      ledCountTimeoutMs <= 0) {
    throw new TypeError("PC SYNC HID device dependencies are invalid.");
  }

  let device = null;
  let deviceErrorListener = null;
  let commandId = 1;
  const outputQueue = createHidOutputQueue(onTiming);

  function nextMessageId() {
    commandId = commandId >= 255 ? 1 : commandId + 1;
    return commandId;
  }

  function notifyWriteStatus(command, status) {
    try {
      onWriteStatus({ command, status });
    } catch (error) {
      console.error("Could not record LED frame write status:", error);
    }
  }

  async function open(devicePath, onError = () => {}) {
    if (device || typeof devicePath !== "string" || devicePath.length === 0 ||
        typeof onError !== "function") {
      throw new TypeError("A disconnected LED device and valid HID path are required.");
    }
    const openedDevice = await openHidDevice(devicePath);
    deviceErrorListener = (error) => onError(error);
    device = openedDevice;
    device.on("error", deviceErrorListener);
  }

  async function readLedCount() {
    if (!device) throw new Error("The LED controller is not connected.");
    const currentDevice = device;
    const messageId = nextMessageId();
    const request = buildHidReports(buildDeviceInfoRequest(messageId))[0];

    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error, ledCount) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        currentDevice.removeListener("data", onData);
        currentDevice.removeListener("error", onError);
        if (error) reject(error);
        else resolve(ledCount);
      };
      const onData = (response) => {
        if (!Buffer.isBuffer(response)) return;
        const offset = response[0] === 0 && response[1] === 82 && response[2] === 66 ? 1 : 0;
        if (response[offset] !== 82 || response[offset + 1] !== 66 ||
            response[offset + 4] !== 130) return;
        try {
          finish(null, parseDeviceLedCount(response));
        } catch (error) {
          finish(error);
        }
      };
      const onError = (error) => finish(error);
      const timeout = setTimeout(() => {
        finish(new Error("The controller did not report its LED count."));
      }, ledCountTimeoutMs);
      currentDevice.on("data", onData);
      currentDevice.on("error", onError);
      try {
        Promise.resolve(currentDevice.write([...request])).catch((error) => finish(error));
      } catch (error) {
        finish(error);
      }
    });
  }

  async function writeFrame(colors, {
    frameType = "lighting",
    brightness = 100,
    power = true,
    effectBrightness = 1,
    colorOrder = "RGB",
    channelGains = [100, 100, 100]
  } = {}) {
    if (!device) throw new Error("The LED controller is not connected.");
    if (!["lighting", "realtime"].includes(frameType)) {
      throw new TypeError("LED frame type must be lighting or realtime.");
    }

    const currentDevice = device;
    const messageId = nextMessageId();
    const command = frameType === "realtime" ? "SC" : "RB";
    const packets = frameType === "realtime"
      ? [buildScreenSyncFrame(colors, brightness, power, colorOrder, messageId, channelGains)]
      : buildColorFrames(
        colors,
        brightness,
        power,
        effectBrightness,
        colorOrder,
        messageId,
        channelGains
      );
    if (frameType === "lighting") {
      commandId = ((messageId - 1 + packets.length) % 255) + 1;
    }

    notifyWriteStatus(command, "queued");
    try {
      const result = await outputQueue.enqueue(
        currentDevice,
        packets.flatMap(buildHidReports),
        () => device === currentDevice,
        command
      );
      notifyWriteStatus(command, result.written ? "written" : "superseded");
      return result;
    } catch (error) {
      notifyWriteStatus(command, "failed");
      throw error;
    }
  }

  async function close() {
    const closingDevice = device;
    if (!closingDevice) return;
    device = null;
    if (deviceErrorListener) closingDevice.removeListener("error", deviceErrorListener);
    deviceErrorListener = null;
    await closingDevice.close();
  }

  return Object.freeze({
    get isConnected() {
      return device !== null;
    },
    open,
    readLedCount,
    writeFrame,
    close
  });
}

module.exports = { createPcSyncHidDevice };
