"use strict";

function createSpotifySyncColors(pixels, ledCount) {
  if (!(pixels instanceof Uint8ClampedArray) || pixels.length < 4 || pixels.length % 4 !== 0 ||
      !Number.isInteger(ledCount) || ledCount < 1 || ledCount > 253) {
    throw new TypeError("Spotify cover-art pixels and LED count are invalid.");
  }

  const histogram = new Map();
  for (let offset = 0; offset < pixels.length; offset += 4) {
    if (pixels[offset + 3] < 128) continue;
    const red = pixels[offset];
    const green = pixels[offset + 1];
    const blue = pixels[offset + 2];
    const key = `${red >> 4}:${green >> 4}:${blue >> 4}`;
    const bucket = histogram.get(key) || { count: 0, red: 0, green: 0, blue: 0 };
    bucket.count += 1;
    bucket.red += red;
    bucket.green += green;
    bucket.blue += blue;
    histogram.set(key, bucket);
  }

  const palette = [...histogram.values()]
    .sort((left, right) => right.count - left.count)
    .reduce((colors, bucket) => {
      if (colors.length >= 5) return colors;
      const color = [
        Math.round(bucket.red / bucket.count),
        Math.round(bucket.green / bucket.count),
        Math.round(bucket.blue / bucket.count)
      ];
      const distinct = colors.every(({ rgb }) =>
        rgb.reduce((distance, channel, index) => distance + (channel - color[index]) ** 2, 0) >= 28 ** 2
      );
      if (distinct) colors.push({ count: bucket.count, rgb: color });
      return colors;
    }, []);

  if (palette.length === 0) throw new TypeError("Spotify cover art has no opaque pixels.");
  const totalWeight = palette.reduce((sum, color) => sum + color.count, 0);
  return Array.from({ length: ledCount }, (_, index) => {
    const target = ((index + 0.5) / ledCount) * totalWeight;
    let accumulated = 0;
    const { rgb } = palette.find(({ count }) => {
      accumulated += count;
      return target < accumulated;
    }) || palette[palette.length - 1];
    return `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  });
}

const spotifySync = Object.freeze({ createSpotifySyncColors });
if (typeof module !== "undefined" && module.exports) module.exports = spotifySync;
else globalThis.ullSpotifySync = spotifySync;
