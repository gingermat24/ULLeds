"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const INSTALLER_PATTERN = /^(?:ULLeds|DX-Light)-Setup-\d+\.\d+\.\d+-x64\.exe(?:\.blockmap)?$/;

async function createLocalUpdateServer(folder) {
  const root = path.resolve(folder);
  const metadataPath = path.join(root, "latest.yml");
  let metadata;
  try {
    metadata = JSON.parse(await fs.promises.readFile(metadataPath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read latest.yml for differential updates: ${error.message}`);
  }
  if (!metadata || !/^\d+\.\d+\.\d+$/.test(metadata.version) ||
      !Array.isArray(metadata.files) || metadata.files.length === 0) {
    throw new TypeError("The update folder has invalid differential-update metadata.");
  }
  const allowedFiles = new Set(["latest.yml"]);
  for (const file of metadata.files) {
    const name = typeof file?.url === "string" ? file.url : "";
    if (!INSTALLER_PATTERN.test(name) || name.endsWith(".blockmap")) {
      throw new TypeError("The update metadata contains an invalid installer filename.");
    }
    allowedFiles.add(name);
    allowedFiles.add(`${name}.blockmap`);
  }

  const server = http.createServer(async (request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    let name;
    try {
      name = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname.slice(1));
    } catch {
      response.writeHead(400).end();
      return;
    }
    if (!name) name = "latest.yml";
    if (path.basename(name) !== name ||
        (!allowedFiles.has(name) && !INSTALLER_PATTERN.test(name))) {
      response.writeHead(404).end();
      return;
    }
    const file = path.join(root, name);
    let stat;
    try {
      stat = await fs.promises.stat(file);
      if (!stat.isFile()) throw new Error("Not a file");
    } catch {
      response.writeHead(404).end();
      return;
    }

    const headers = {
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
      "Content-Type": name === "latest.yml" ? "application/yaml" : "application/octet-stream"
    };
    let start = 0;
    let end = stat.size - 1;
    const range = request.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) {
        response.writeHead(416, { "Content-Range": `bytes */${stat.size}` }).end();
        return;
      }
      if (match[1]) {
        start = Number(match[1]);
        if (match[2]) end = Number(match[2]);
      } else {
        const suffixLength = Number(match[2]);
        start = Math.max(0, stat.size - suffixLength);
      }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) ||
          start < 0 || start >= stat.size || end < start) {
        response.writeHead(416, { "Content-Range": `bytes */${stat.size}` }).end();
        return;
      }
      end = Math.min(end, stat.size - 1);
      headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
    }
    headers["Content-Length"] = end - start + 1;
    response.writeHead(range ? 206 : 200, headers);
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    fs.createReadStream(file, { start, end }).pipe(response);
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Could not start the local update server.");
  }
  return {
    url: `http://127.0.0.1:${address.port}/`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    })
  };
}

module.exports = { createLocalUpdateServer };
