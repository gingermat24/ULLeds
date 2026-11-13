"use strict";

/**
 * ULLeds – strip layout helpers
 *
 * Responsibilities:
 * 1. Normalize which monitor edges are active
 * 2. Allocate LED indices to those edges according to
 *    – physical installation direction (clockwise / counter-clockwise)
 *    – aspect-ratio-aware weighting (or exact manual counts)
 */

const EDGE_NAMES = Object.freeze(["top", "right", "bottom", "left"]);

/**
 * Turn a legacy edge-count number or an array of edge names into a
 * clean, ordered list of active edges. Returns null on invalid input.
 *
 * @param {number|string[]|null|undefined} selection
 * @returns {string[]|null}
 */
function normalizeActiveEdges(selection) {
  if (Array.isArray(selection)) {
    const unique = [...new Set(selection)];
    if (unique.length === 0) return null;
    if (!unique.every((edge) => EDGE_NAMES.includes(edge))) return null;
    // Preserve canonical order: top → right → bottom → left
    return EDGE_NAMES.filter((edge) => unique.includes(edge));
  }

  const count = Number(selection);
  const legacy = {
    1: ["top"],
    2: ["top", "left"],
    3: ["top", "left", "right"],
    4: ["top", "left", "right", "bottom"]
  };
  return legacy[count] || null;
}

/**
 * Allocate LED indices around the monitor.
 *
 * Physical winding (installationMethod):
 *   0 = LED 1 starts at bottom-left, runs up the left side → across top → down right → (optionally) across bottom
 *   1 = LED 1 starts at bottom-right, runs up the right side → across top → down left → (optionally) across bottom
 *
 * @param {number} ledCount          Total LEDs (1–253)
 * @param {number|string[]} selection Active edges (legacy count or array)
 * @param {0|1} [installationMethod=0]
 * @param {object} [options]
 * @param {number} [options.aspectRatio=16/9]
 * @param {Record<string,number>} [options.edgeCounts]  Exact counts (must sum to ledCount)
 * @returns {{
 *   ledCount: number,
 *   edgeCount: number,
 *   activeEdges: string[],
 *   counts: Record<string,number>,
 *   indices: Record<string,number[]>
 * }}
 */
function allocateEdgeIndices(ledCount, selection, installationMethod = 0, options = {}) {
  if (!Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253) {
    throw new RangeError("LED count must be an integer between 1 and 253.");
  }

  const activeEdges = normalizeActiveEdges(selection);
  if (!activeEdges) {
    throw new RangeError("Select one or more valid monitor edges.");
  }

  if (installationMethod !== 0 && installationMethod !== 1) {
    throw new RangeError("Installation method must be 0 (from left) or 1 (from right).");
  }

  const aspectRatio =
    Number.isFinite(options.aspectRatio) && options.aspectRatio > 0
      ? options.aspectRatio
      : 16 / 9;

  // Physical order of the continuous strip
  const physicalOrder =
    installationMethod === 0
      ? ["left", "top", "right", "bottom"]   // clockwise from bottom-left
      : ["right", "top", "left", "bottom"];  // counter-clockwise from bottom-right

  const orderedEdges = physicalOrder.filter((edge) => activeEdges.includes(edge));

  // ---- Count allocation -------------------------------------------------
  let counts;

  if (options.edgeCounts) {
    // Manual mode – caller supplies exact numbers
    const supplied = options.edgeCounts;
    const valid =
      supplied &&
      typeof supplied === "object" &&
      !Array.isArray(supplied) &&
      orderedEdges.every(
        (edge) => Number.isInteger(supplied[edge]) && supplied[edge] >= 1
      ) &&
      Object.keys(supplied).every((edge) => orderedEdges.includes(edge)) &&
      Object.values(supplied).reduce((sum, n) => sum + n, 0) === ledCount;

    if (!valid) {
      throw new RangeError(
        "Manual edge counts must assign every LED to a selected edge and sum to the total LED count."
      );
    }
    counts = Object.fromEntries(orderedEdges.map((edge) => [edge, supplied[edge]]));
  } else {
    // Automatic – weight by physical length
    // Horizontal edges get weight ≈ aspectRatio, vertical edges get weight 1
    const weights = Object.fromEntries(
      orderedEdges.map((edge) => [
        edge,
        edge === "top" || edge === "bottom" ? aspectRatio : 1
      ])
    );

    const totalWeight = orderedEdges.reduce((sum, edge) => sum + weights[edge], 0);

    // Largest-remainder method (Hamilton method)
    const allocations = orderedEdges.map((edge) => {
      const exact = (ledCount * weights[edge]) / totalWeight;
      return {
        edge,
        floor: Math.floor(exact),
        remainder: exact - Math.floor(exact)
      };
    });

    let remaining = ledCount - allocations.reduce((sum, a) => sum + a.floor, 0);

    // Give the leftover LEDs to the edges with the largest fractional parts
    allocations
      .sort((a, b) => b.remainder - a.remainder || a.edge.localeCompare(b.edge))
      .forEach((a) => {
        if (remaining > 0) {
          a.floor += 1;
          remaining -= 1;
        }
      });

    counts = Object.fromEntries(allocations.map((a) => [a.edge, a.floor]));
  }

  // ---- Index assignment -------------------------------------------------
  // Direction of each edge when following the physical strip
  // (true = reverse the natural left-to-right / top-to-bottom order)
  const shouldReverse = (edge) => {
    if (installationMethod === 0) {
      // From left: left side runs bottom→top, bottom runs right→left
      return edge === "left" || edge === "bottom";
    }
    // From right: right side runs bottom→top, top runs right→left
    return edge === "right" || edge === "top";
  };

  const indices = {};
  let next = 0;

  for (const edge of orderedEdges) {
    const range = Array.from({ length: counts[edge] }, (_, i) => next + i);
    next += counts[edge];
    indices[edge] = shouldReverse(edge) ? range.reverse() : range;
  }

  return {
    ledCount,
    edgeCount: orderedEdges.length,
    activeEdges: orderedEdges,
    counts,
    indices
  };
}

const stripLayout = Object.freeze({
  allocateEdgeIndices,
  normalizeActiveEdges,
  EDGE_NAMES
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = stripLayout;
} else {
  globalThis.ullStripLayout = stripLayout;
}