"use strict";

const EDGE_NAMES = Object.freeze(["top", "right", "bottom", "left"]);

function normalizeActiveEdges(selection) {
  if (Array.isArray(selection)) {
    const edges = [...new Set(selection)];
    if (edges.length > 0 && edges.every((edge) => EDGE_NAMES.includes(edge))) return edges;
    return null;
  }
  const edgeCount = Number(selection);
  const legacyLayouts = {
    1: ["top"],
    2: ["top", "left"],
    3: ["top", "left", "right"],
    4: ["top", "left", "right", "bottom"]
  };
  return legacyLayouts[edgeCount] || null;
}

function allocateEdgeIndices(ledCount, selection, installationMethod = 0, options = {}) {
  if (!Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253) {
    throw new RangeError("LED count must be between 1 and 253.");
  }
  const activeEdges = normalizeActiveEdges(selection);
  if (!activeEdges) {
    throw new RangeError("Select one or more valid monitor edges.");
  }
  if (installationMethod !== 0 && installationMethod !== 1) {
    throw new RangeError("Installation method must be 0 or 1.");
  }
  const aspectRatio = Number.isFinite(options.aspectRatio) && options.aspectRatio > 0
    ? options.aspectRatio
    : 16 / 9;

  const physicalOrder = installationMethod === 0
    ? ["left", "top", "right", "bottom"]
    : ["right", "top", "left", "bottom"];
  const orderedEdges = physicalOrder.filter((edge) => activeEdges.includes(edge));
  const suppliedCounts = options.edgeCounts;
  let counts;
  if (suppliedCounts) {
    if (!suppliedCounts || typeof suppliedCounts !== "object" || Array.isArray(suppliedCounts) ||
        orderedEdges.some((edge) => !Number.isInteger(suppliedCounts[edge]) || suppliedCounts[edge] < 1) ||
        Object.keys(suppliedCounts).some((edge) => !orderedEdges.includes(edge)) ||
        Object.values(suppliedCounts).reduce((sum, count) => sum + count, 0) !== ledCount) {
      throw new RangeError("Manual edge counts must assign every LED to a selected edge.");
    }
    counts = Object.fromEntries(orderedEdges.map((edge) => [edge, suppliedCounts[edge]]));
  } else {
    const weights = Object.fromEntries(orderedEdges.map((edge) => [
      edge,
      edge === "top" || edge === "bottom" ? aspectRatio : 1
    ]));
    const totalWeight = orderedEdges.reduce((sum, edge) => sum + weights[edge], 0);
    const allocations = orderedEdges.map((edge, order) => {
      const exact = ledCount * weights[edge] / totalWeight;
      const count = Math.floor(exact);
      return { edge, count, remainder: exact - count, order };
    });
    const remaining = ledCount - allocations.reduce((sum, allocation) => sum + allocation.count, 0);
    [...allocations].sort((a, b) => b.remainder - a.remainder || a.order - b.order)
      .slice(0, remaining)
      .forEach(({ edge }) => {
        allocations.find((allocation) => allocation.edge === edge).count += 1;
      });
    counts = Object.fromEntries(allocations.map(({ edge, count }) => [edge, count]));
  }

  const indices = {};
  let nextIndex = 0;
  for (const edge of orderedEdges) {
    const range = Array.from({ length: counts[edge] }, (_, offset) => nextIndex + offset);
    nextIndex += counts[edge];
    const reverse = installationMethod === 0
      ? edge === "left" || edge === "bottom"
      : edge === "right" || edge === "top";
    indices[edge] = reverse ? range.reverse() : range;
  }
  return { ledCount, edgeCount: orderedEdges.length, activeEdges: orderedEdges, counts, indices };
}

const stripLayout = Object.freeze({ allocateEdgeIndices, normalizeActiveEdges });
if (typeof module !== "undefined" && module.exports) module.exports = stripLayout;
else globalThis.ullStripLayout = stripLayout;
