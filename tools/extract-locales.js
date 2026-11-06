/**
 * Extracts the embedded i18n dictionary from the recovered renderer bundle
 * into editable JSON files under src/renderer/locales/.
 *
 * The original code stores the whole dictionary as a JSON string passed to
 * JSON.parse(...), so we locate that literal and decode it.
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "src", "renderer", "runtime.js");
const code = fs.readFileSync(file, "utf8");

const marker = 'JSON.parse(';
let index = 0;
let dict = null;
while ((index = code.indexOf(marker, index)) !== -1) {
  let i = index + marker.length;
  while (/\s/.test(code[i])) i++;
  const quote = code[i];
  if (quote !== "'" && quote !== '"') {
    index = i;
    continue;
  }
  let j = i + 1;
  while (j < code.length) {
    if (code[j] === "\\") j += 2;
    else if (code[j] === quote) break;
    else j++;
  }
  let raw = code.slice(i + 1, j);
  if (quote === "'") raw = raw.replace(/\\'/g, "'");
  if (raw.startsWith('{"zh-cn"')) {
    dict = JSON.parse(raw);
    break;
  }
  index = j;
}

if (!dict) throw new Error("locale dictionary not found");

const outDir = path.join(__dirname, "..", "src", "renderer", "locales");
fs.mkdirSync(outDir, { recursive: true });

let total = 0;
for (const [locale, entries] of Object.entries(dict)) {
  const count = Object.keys(entries).length;
  total += count;
  fs.writeFileSync(
    path.join(outDir, locale + ".json"),
    JSON.stringify(entries, null, 2) + "\n"
  );
  console.log(locale, count, "strings");
}
console.log("total", total);
