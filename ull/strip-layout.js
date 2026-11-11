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

function createDefaultLedPositions(ledCount, edgeCount, installationMethod = 0) {
  const allocation = allocateEdgeIndices(ledCount, edgeCount, installationMethod);
  const positions = Array(ledCount);

  for (const [edge, indices] of Object.entries(allocation.indices)) {
    indices.forEach((ledIndex, position) => {
      const along = (position + 0.5) / indices.length * 100;
      positions[ledIndex] = edge === "top"
        ? { x: along, y: 6, edge }
        : edge === "bottom"
          ? { x: along, y: 94, edge }
          : edge === "left"
            ? { x: 6, y: along, edge }
            : { x: 94, y: along, edge };
    });
  }

  return positions;
}

function createStripLayout(ledCount, profile = {}) {
  const requestedEdgeCount = Number(profile.edgeCount);
  const edgeCount = Number.isInteger(requestedEdgeCount) &&
      requestedEdgeCount >= 1 && requestedEdgeCount <= 4
    ? requestedEdgeCount
    : 3;
  const installationMethod = profile.installationMethod === 1 ? 1 : 0;
  const fallback = allocateEdgeIndices(ledCount, edgeCount, installationMethod);
  const positions = profile.ledPositions === undefined
    ? createDefaultLedPositions(ledCount, edgeCount, installationMethod)
    : profile.ledPositions;

  if (!Array.isArray(positions) || positions.length !== ledCount ||
      positions.some((position) =>
        !position || typeof position !== "object" || Array.isArray(position) ||
        !Number.isFinite(position.x) || position.x < 0 || position.x > 100 ||
        !Number.isFinite(position.y) || position.y < 0 || position.y > 100 ||
        !["top", "left", "right", "bottom"].includes(position.edge))) {
    throw new TypeError("LED positions must match the controller's LED count.");
  }

  const indices = { top: [], left: [], right: [], bottom: [] };
  positions.forEach(({ edge }, ledIndex) => indices[edge].push(ledIndex));
  for (const [edge, edgeIndices] of Object.entries(indices)) {
    edgeIndices.sort((a, b) => {
      const horizontal = edge === "top" || edge === "bottom";
      return horizontal
        ? positions[a].x - positions[b].x
        : positions[a].y - positions[b].y;
    });
    if (!edgeIndices.length) delete indices[edge];
  }

  const counts = Object.fromEntries(
    Object.entries(indices).map(([edge, edgeIndices]) => [edge, edgeIndices.length])
  );
  return {
    ledCount,
    edgeCount: fallback.edgeCount,
    counts,
    indices,
    positions: positions.map(({ x, y, edge }) => ({ x, y, edge }))
  };
}

const stripLayout = Object.freeze({
  allocateEdgeIndices,
  createDefaultLedPositions,
  createStripLayout
});
if (typeof module !== "undefined" && module.exports) module.exports = stripLayout;
else globalThis.ullStripLayout = stripLayout;
