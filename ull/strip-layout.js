"use strict";

const EDGE_WEIGHTS = Object.freeze({ top: 1, left: 0.5625, right: 0.5625, bottom: 1 });

function allocateEdgeIndices(ledCount, edgeCount, installationMethod = 0) {
  if (!Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253) {
    throw new RangeError("LED count must be between 1 and 253.");
  }
  if (!Number.isInteger(edgeCount) || edgeCount < 1 || edgeCount > 4) {
    throw new RangeError("Edge count must be between 1 and 4.");
  }
  if (installationMethod !== 0 && installationMethod !== 1) {
    throw new RangeError("Installation method must be 0 or 1.");
  }

  const visualEdges = edgeCount === 1
    ? ["top"]
    : edgeCount === 2
      ? ["top", "left"]
      : edgeCount === 3
        ? ["top", "left", "right"]
        : ["top", "left", "right", "bottom"];
  const physicalOrder = installationMethod === 0
    ? ["left", "top", "right", "bottom"]
    : ["right", "top", "left", "bottom"];
  const activeEdges = physicalOrder.filter((edge) => visualEdges.includes(edge));
  const totalWeight = activeEdges.reduce((sum, edge) => sum + EDGE_WEIGHTS[edge], 0);
  const allocations = activeEdges.map((edge, order) => {
    const exact = ledCount * EDGE_WEIGHTS[edge] / totalWeight;
    const count = Math.floor(exact);
    return { edge, count, remainder: exact - count, order };
  });
  let remaining = ledCount - allocations.reduce((sum, allocation) => sum + allocation.count, 0);
  [...allocations].sort((a, b) => b.remainder - a.remainder || a.order - b.order)
    .slice(0, remaining)
    .forEach(({ edge }) => {
      allocations.find((allocation) => allocation.edge === edge).count += 1;
    });

  const counts = Object.fromEntries(allocations.map(({ edge, count }) => [edge, count]));
  const indices = {};
  let nextIndex = 0;
  for (const edge of activeEdges) {
    const range = Array.from({ length: counts[edge] }, (_, offset) => nextIndex + offset);
    nextIndex += counts[edge];
    const reverse = installationMethod === 0
      ? edge === "left" || edge === "bottom"
      : edge === "right" || edge === "top";
    indices[edge] = reverse ? range.reverse() : range;
  }
  return { ledCount, edgeCount, counts, indices };
}

const stripLayout = Object.freeze({ allocateEdgeIndices });
if (typeof module !== "undefined" && module.exports) module.exports = stripLayout;
else globalThis.ullStripLayout = stripLayout;
