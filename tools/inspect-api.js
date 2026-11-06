const fs = require("fs");
const main = fs.readFileSync("src/main/runtime.js", "utf8");
const preload = fs.readFileSync("src/preload/preload.js", "utf8");

const uniq = (a) => [...new Set(a)].sort();
const grab = (s, re) => uniq([...s.matchAll(re)].map((m) => m[1]));

console.log("=== main: ipcMain.handle ===");
console.log(grab(main, /\.handle\(\s*"([^"]+)"/g).join("\n"));
console.log("\n=== main: ipcMain.on ===");
console.log(grab(main, /\.on\(\s*"([^"]+)"/g).join("\n"));
console.log("\n=== preload: exposed APIs ===");
console.log(grab(preload, /exposeInMainWorld\(\s*"([^"]+)"/g).join("\n"));
console.log("\n=== preload: channels ===");
console.log(grab(preload, /(?:invoke|send|sendSync|postMessage)\(\s*"([^"]+)"/g).join("\n"));
