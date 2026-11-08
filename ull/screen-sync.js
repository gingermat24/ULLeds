"use strict";

const MAX_CAPTURE_DIMENSION = 1280;

function createDesktopCaptureConstraints(sourceId, maxFrameRate) {
  if (typeof sourceId !== "string" || sourceId.length === 0 ||
      !Number.isFinite(maxFrameRate) || maxFrameRate < 1) {
    throw new TypeError("Screen capture source and frame rate are invalid.");
  }
  return {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: sourceId,
        maxFrameRate,
        maxWidth: MAX_CAPTURE_DIMENSION,
        maxHeight: MAX_CAPTURE_DIMENSION
      }
    }
  };
}

function detectLetterboxAspectRatio(pixels, width, height) {
  if (!pixels || !Number.isInteger(width) || width < 32 ||
      !Number.isInteger(height) || height < 32 ||
      pixels.length !== width * height * 4) {
    throw new TypeError("Screen image dimensions are invalid.");
  }
  const isDarkUniformRow = (y) => {
    let darkest = 255;
    let brightest = 0;
    let darkSamples = 0;
    const sampleCount = 24;
    for (let sample = 0; sample < sampleCount; sample += 1) {
      const x = Math.round((sample + 0.5) / sampleCount * (width - 1));
      const offset = (y * width + x) * 4;
      if (pixels[offset + 3] < 128) return false;
      const luminance = Math.round(
        pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722
      );
      darkest = Math.min(darkest, luminance);
      brightest = Math.max(brightest, luminance);
      if (luminance <= 24) darkSamples += 1;
    }
    return darkSamples >= sampleCount * 0.95 && brightest - darkest <= 24;
  };
  const maxBarRows = Math.floor(height * 0.18);
  let topRows = 0;
  let bottomRows = 0;
  while (topRows < maxBarRows && isDarkUniformRow(topRows)) topRows += 1;
  while (bottomRows < maxBarRows && isDarkUniformRow(height - bottomRows - 1)) bottomRows += 1;
  const minimumBarRows = Math.max(2, Math.ceil(height * 0.02));
  if (topRows < minimumBarRows || bottomRows < minimumBarRows ||
      Math.abs(topRows - bottomRows) > Math.max(2, Math.round(height * 0.015)) ||
      isDarkUniformRow(topRows) || isDarkUniformRow(height - bottomRows - 1)) {
    return null;
  }
  const aspectRatio = width / (height - topRows - bottomRows);
  if (aspectRatio < 1.78 || aspectRatio > 2.6) return null;
  return Math.round(aspectRatio * 100) / 100;
}

function createLetterboxStability({
  stableDuration = 1000,
  disappearanceDuration = 1500,
  ratioTolerance = 0.05
} = {}) {
  if (![stableDuration, disappearanceDuration, ratioTolerance].every(Number.isFinite) ||
      stableDuration < 0 || disappearanceDuration < 0 || ratioTolerance <= 0) {
    throw new TypeError("Letterbox detection stability settings are invalid.");
  }
  let candidateRatio = null;
  let candidateSince = 0;
  let lastReportedRatio = null;
  let missingSince = null;
  let missingStable = false;
  return Object.freeze({
    update(ratio, now) {
      if ((ratio !== null && (!Number.isFinite(ratio) || ratio < 1.78 || ratio > 2.6)) ||
          !Number.isFinite(now)) {
        throw new TypeError("Letterbox aspect ratio or timestamp is invalid.");
      }
      if (ratio === null) {
        candidateRatio = null;
        candidateSince = 0;
        if (missingSince === null) missingSince = now;
        if (now - missingSince >= disappearanceDuration && lastReportedRatio !== null) {
          lastReportedRatio = null;
          missingStable = true;
        }
        return null;
      }
      missingSince = null;
      missingStable = false;
      if (candidateRatio === null || Math.abs(candidateRatio - ratio) > ratioTolerance) {
        candidateRatio = ratio;
        candidateSince = now;
        return null;
      }
      if (now - candidateSince < stableDuration ||
          (lastReportedRatio !== null &&
            Math.abs(lastReportedRatio - candidateRatio) <= ratioTolerance)) {
        return null;
      }
      lastReportedRatio = candidateRatio;
      return candidateRatio;
    },
    isMissingStable() {
      return missingStable;
    },
    reset() {
      candidateRatio = null;
      candidateSince = 0;
      lastReportedRatio = null;
      missingSince = null;
      missingStable = false;
    }
  });
}

function sampleStripColors(pixels, width, height, layout, contentAspectRatio = null) {
  if (!pixels || !Number.isInteger(width) || width < 1 ||
      !Number.isInteger(height) || height < 1 ||
      pixels.length !== width * height * 4 ||
      !layout || !Number.isInteger(layout.ledCount) || !layout.indices ||
      (contentAspectRatio !== null &&
        (!Number.isFinite(contentAspectRatio) || contentAspectRatio <= 0))) {
    throw new TypeError("Screen image and strip layout are invalid.");
  }
  let contentLeft = 0;
  let contentTop = 0;
  let contentWidth = width;
  let contentHeight = height;
  if (contentAspectRatio !== null) {
    if (width / height > contentAspectRatio) {
      contentWidth = height * contentAspectRatio;
      contentLeft = (width - contentWidth) / 2;
    } else {
      contentHeight = width / contentAspectRatio;
      contentTop = (height - contentHeight) / 2;
    }
  }
  const colors = Array(layout.ledCount).fill("#000000");
  const samplePosition = (edge, position, count) => {
    const horizontal = edge === "top" || edge === "bottom";
    const along = Math.round((position + 0.5) / count *
      ((horizontal ? contentWidth : contentHeight) - 1));
    if (edge === "top") {
      return [
        Math.min(width - 1, Math.max(0, Math.round(contentLeft + along))),
        Math.min(height - 1, Math.max(0, Math.round(contentTop + contentHeight * 0.06)))
      ];
    }
    if (edge === "bottom") {
      return [
        Math.min(width - 1, Math.max(0, Math.round(contentLeft + along))),
        Math.min(height - 1, Math.max(0, Math.round(contentTop + contentHeight * 0.94)))
      ];
    }
    const y = Math.min(height - 1, Math.max(0, Math.round(contentTop + along)));
    if (edge === "left") {
      return [
        Math.min(width - 1, Math.max(0, Math.round(contentLeft + contentWidth * 0.06))),
        y
      ];
    }
    return [
      Math.min(width - 1, Math.max(0, Math.round(contentLeft + contentWidth * 0.94))),
      y
    ];
  };
  const sampleColor = (centerX, centerY) => {
    const samples = [];
    for (let y = Math.max(0, centerY - 1); y <= Math.min(height - 1, centerY + 1); y += 1) {
      for (let x = Math.max(0, centerX - 1); x <= Math.min(width - 1, centerX + 1); x += 1) {
        const offset = (y * width + x) * 4;
        if (pixels[offset + 3] === 0) continue;
        samples.push({
          red: pixels[offset],
          green: pixels[offset + 1],
          blue: pixels[offset + 2],
          distance: (x - centerX) ** 2 + (y - centerY) ** 2
        });
      }
    }
    if (!samples.length) return "#000000";

    const representative = samples.reduce((best, candidate) => {
      const cost = samples.reduce((sum, sample) =>
        sum +
          (candidate.red - sample.red) ** 2 +
          (candidate.green - sample.green) ** 2 +
          (candidate.blue - sample.blue) ** 2, 0);
      const bestCost = samples.reduce((sum, sample) =>
        sum +
          (best.red - sample.red) ** 2 +
          (best.green - sample.green) ** 2 +
          (best.blue - sample.blue) ** 2, 0);
      return cost < bestCost || (cost === bestCost && candidate.distance < best.distance)
        ? candidate
        : best;
    });
    return `#${[representative.red, representative.green, representative.blue]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")}`;
  };
  for (const [edge, indices] of Object.entries(layout.indices)) {
    indices.forEach((ledIndex, position) => {
      const [centerX, centerY] = samplePosition(edge, position, indices.length);
      colors[ledIndex] = sampleColor(centerX, centerY);
    });
  }
  return colors;
}

function createLatestFrameSender({ send, isActive, getColors, onError }) {
  if ([send, isActive, getColors, onError].some((value) => typeof value !== "function")) {
    throw new TypeError("Screen Sync frame sender callbacks are required.");
  }
  let sending = false;
  let lastSentSignature = "";

  return async function sendLatestFrame() {
    if (sending) return;
    sending = true;
    try {
      while (isActive()) {
        const colors = getColors();
        if (!colors) break;
        const signature = colors.join("");
        if (signature === lastSentSignature) break;
        await send(colors);
        lastSentSignature = signature;
      }
    } catch (error) {
      onError(error);
    } finally {
      sending = false;
    }
  };
}

const screenSync = Object.freeze({
  createDesktopCaptureConstraints,
  createLetterboxStability,
  detectLetterboxAspectRatio,
  createLatestFrameSender,
  sampleStripColors
});
if (typeof module !== "undefined" && module.exports) module.exports = screenSync;
else globalThis.ullScreenSync = screenSync;
