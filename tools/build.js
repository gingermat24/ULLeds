/**
 * Rebuilds the Electron bundle from the recovered source in ./src.
 *
 * The original app was bundled with webpack. Each recovered file in the
 * src/<process>/modules folders is an ES5 function with the signature:
 *     (module, exports, __webpack_require__) => { ... }
 * This script reassembles them into the exact same bundle shape that the
 * webpack runtime expects, so the app runs unchanged.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "build", ".webpack");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function moduleIds(dir) {
  return fs
    .readdirSync(path.join(SRC, dir, "modules"))
    .filter((f) => f.endsWith(".js"))
    .map((f) => f.slice(0, -3))
    .sort((a, b) => Number(a) - Number(b));
}

function moduleSource(dir, id) {
  const raw = read(path.join(SRC, dir, "modules", id + ".js"));
  return raw.replace(/^module\.exports\s*=\s*/, "").replace(/[\s;]+$/, "");
}

/* ------------------------------- main ---------------------------------- */

function buildMain() {
  const outDir = path.join(OUT, "main");
  fs.mkdirSync(outDir, { recursive: true });

  let runtime = read(path.join(SRC, "main", "runtime.js"));
  if (!runtime.includes("__MODULE_REGISTRY__")) {
    throw new Error("main runtime is missing the __MODULE_REGISTRY__ marker");
  }

  // The main process runs in Node, so it can load the modules lazily by id.
  runtime = runtime.replace(
    "__MODULE_REGISTRY__",
    'require("../../../src/main/registry")'
  );
  fs.writeFileSync(path.join(outDir, "index.js"), runtime);

  // Worker entry points are plain CommonJS files loaded by worker_threads.
  const workersSrc = path.join(SRC, "main", "workers");
  if (fs.existsSync(workersSrc)) {
    fs.cpSync(workersSrc, outDir, { recursive: true });
  }

  const nativeSrc = path.join(SRC, "main", "native_modules");
  if (fs.existsSync(nativeSrc)) {
    fs.cpSync(nativeSrc, path.join(outDir, "native_modules"), { recursive: true });
  }
  console.log("main  ->", path.relative(ROOT, path.join(outDir, "index.js")));
}

/* ------------------------------ renderer -------------------------------- */

function buildRenderer() {
  const outDir = path.join(OUT, "renderer", "main_window");
  fs.mkdirSync(outDir, { recursive: true });

  const ids = moduleIds("renderer");
  const entries = ids.map(
    (id) => `  ${JSON.stringify(id)}: ${moduleSource("renderer", id)}`
  );

  let runtime = read(path.join(SRC, "renderer", "runtime.js"));
  if (!runtime.includes("__MODULE_REGISTRY__")) {
    throw new Error("renderer runtime is missing the __MODULE_REGISTRY__ marker");
  }
  runtime = runtime.replace("__MODULE_REGISTRY__", "{\n" + entries.join(",\n") + "\n}");
  fs.writeFileSync(path.join(outDir, "index.js"), runtime);

  fs.copyFileSync(
    path.join(SRC, "renderer", "index.html"),
    path.join(outDir, "index.html")
  );
  const preload = path.join(SRC, "preload", "preload.js");
  if (fs.existsSync(preload)) {
    fs.copyFileSync(preload, path.join(outDir, "preload.js"));
  }
  const css = path.join(SRC, "renderer", "main_window.css");
  if (fs.existsSync(css)) {
    fs.copyFileSync(css, path.join(OUT, "renderer", "main_window.css"));
  }
  const staticDir = path.join(SRC, "renderer", "static");
  if (fs.existsSync(staticDir)) {
    fs.cpSync(staticDir, path.join(OUT, "renderer", "static"), { recursive: true });
  }

  console.log(`renderer -> ${path.relative(ROOT, path.join(outDir, "index.js"))} (${ids.length} modules)`);
}

buildMain();
buildRenderer();
