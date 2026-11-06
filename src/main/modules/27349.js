module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.getAppCacheDir = function () {
      const e = (0, i.homedir)();
      let t;
      return (
        (t =
          "win32" === process.platform
            ? process.env.LOCALAPPDATA || n.join(e, "AppData", "Local")
            : "darwin" === process.platform
              ? n.join(e, "Library", "Caches")
              : process.env.XDG_CACHE_HOME || n.join(e, ".cache")),
        t
      );
    }));
  const n = r(16928),
    i = r(70857);
};
