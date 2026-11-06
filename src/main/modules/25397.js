module.exports = (e, t, r) => {
  "use strict";
  const n = r(79896),
    i = r(16928);
  function o(...e) {
    if (e[0])
      try {
        const t = (function (e, t) {
          let r = t;
          for (;;) {
            const t = i.parse(r),
              o = t.root,
              s = t.dir;
            if (n.existsSync(i.join(r, e))) return i.resolve(i.join(r, e));
            if (r === o) return null;
            r = s;
          }
        })("package.json", i.join(...e));
        if (!t) return;
        const r = JSON.parse(n.readFileSync(t, "utf8")),
          o = r?.productName || r?.name;
        if (!o || "electron" === o.toLowerCase()) return;
        return o ? { name: o, version: r?.version } : void 0;
      } catch (e) {
        return;
      }
  }
  e.exports = {
    findAndReadPackageJson: function () {
      return (
        o(
          (function () {
            try {
              return require.main?.filename;
            } catch {
              return;
            }
          })(),
        ) ||
        o(
          (function () {
            const e = process.argv.filter((e) => 0 === e.indexOf("--user-data-dir="));
            return 0 === e.length || "string" != typeof e[0]
              ? null
              : e[0].replace("--user-data-dir=", "");
          })(),
        ) ||
        o(process.resourcesPath, "app.asar") ||
        o(process.resourcesPath, "app") ||
        o(process.cwd()) || { name: void 0, version: void 0 }
      );
    },
    tryReadJsonAt: o,
  };
};
