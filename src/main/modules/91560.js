module.exports = (e, t, r) => {
  "use strict";
  const n = r(16928),
    i = r(70857),
    o = i.homedir(),
    s = i.tmpdir(),
    { env: a } = process,
    c = (e, t) => {
      if ("string" != typeof e) throw new TypeError("Expected string, got " + typeof e);
      return (
        (t = Object.assign({ suffix: "nodejs" }, t)).suffix && (e += `-${t.suffix}`),
        "darwin" === process.platform
          ? ((e) => {
              const t = n.join(o, "Library");
              return {
                data: n.join(t, "Application Support", e),
                config: n.join(t, "Preferences", e),
                cache: n.join(t, "Caches", e),
                log: n.join(t, "Logs", e),
                temp: n.join(s, e),
              };
            })(e)
          : "win32" === process.platform
            ? ((e) => {
                const t = a.APPDATA || n.join(o, "AppData", "Roaming"),
                  r = a.LOCALAPPDATA || n.join(o, "AppData", "Local");
                return {
                  data: n.join(r, e, "Data"),
                  config: n.join(t, e, "Config"),
                  cache: n.join(r, e, "Cache"),
                  log: n.join(r, e, "Log"),
                  temp: n.join(s, e),
                };
              })(e)
            : ((e) => {
                const t = n.basename(o);
                return {
                  data: n.join(a.XDG_DATA_HOME || n.join(o, ".local", "share"), e),
                  config: n.join(a.XDG_CONFIG_HOME || n.join(o, ".config"), e),
                  cache: n.join(a.XDG_CACHE_HOME || n.join(o, ".cache"), e),
                  log: n.join(a.XDG_STATE_HOME || n.join(o, ".local", "state"), e),
                  temp: n.join(s, t, e),
                };
              })(e)
      );
    };
  ((e.exports = c), (e.exports.default = c));
};
