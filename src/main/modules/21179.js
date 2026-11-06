module.exports = (e, t, r) => {
  "use strict";
  (r.r(t),
    r.d(t, {
      assertMacOS: () => m,
      assertMacOSVersion: () => f,
      assertMacOSVersionGreaterThanOrEqualTo: () => h,
      isMacOS: () => s,
      isMacOSVersion: () => p,
      isMacOSVersionGreaterThanOrEqualTo: () => d,
      macOSVersion: () => u,
    }));
  const n = require("node:process"),
    i = require("node:fs");
  var o = r(85610);
  const s = "darwin" === n.platform;
  let a;
  const c = (e) => {
      const { length: t } = e.split(".");
      return 1 === t ? `${e}.0.0` : 2 === t ? `${e}.0` : e;
    },
    l = (e) => {
      const t = /<key>ProductVersion<\/key>\s*<string>([\d.]+)<\/string>/.exec(e);
      if (t) return t[1].replace("10.16", "11");
    };
  function u() {
    if (s) {
      if (!a) {
        const e = i.readFileSync("/System/Library/CoreServices/SystemVersion.plist", "utf8"),
          t = l(e);
        if (!t) return;
        a = c(t);
      }
      return a;
    }
  }
  function p(e) {
    return !!s && ((e = e.replace("10.16", "11")), o.satisfies(u(), c(e)));
  }
  function d(e) {
    return !!s && ((e = e.replace("10.16", "11")), o.gte(u(), c(e)));
  }
  function f(e) {
    if (!p((e = e.replace("10.16", "11")))) throw new Error(`Requires macOS ${e}`);
  }
  function h(e) {
    if (!d((e = e.replace("10.16", "11")))) throw new Error(`Requires macOS ${e} or later`);
  }
  function m() {
    if (!s) throw new Error("Requires macOS");
  }
};
