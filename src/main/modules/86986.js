module.exports = (e, t, r) => {
  "use strict";
  const n = r(79896),
    i = r(70857),
    o = r(16928),
    s = r(99683);
  e.exports = {
    initialize({
      externalApi: e,
      getSessions: t,
      includeFutureSession: a,
      logger: c,
      preload: l = !0,
      spyRendererConsole: u = !1,
    }) {
      e.onAppReady(() => {
        try {
          (l &&
            (function ({
              externalApi: e,
              getSessions: t,
              includeFutureSession: a,
              preloadOption: c,
            }) {
              let l = "string" == typeof c ? c : void 0;
              try {
                l = r.ab + "electron-log-preload.js";
              } catch {}
              if (!l || !n.existsSync(l)) {
                l = o.join(e.getAppUserDataPath() || i.tmpdir(), "electron-log-preload.js");
                const t = `\n      try {\n        (${s.toString()})(require('electron'));\n      } catch(e) {\n        console.error(e);\n      }\n    `;
                n.writeFileSync(r.ab + "electron-log-preload.js", t, "utf8");
              }
              e.setPreloadFileForSessions({
                filePath: r.ab + "electron-log-preload.js",
                includeFutureSession: a,
                getSessions: t,
              });
            })({ externalApi: e, getSessions: t, includeFutureSession: a, preloadOption: l }),
            u &&
              (function ({ externalApi: e, logger: t }) {
                const r = ["verbose", "info", "warning", "error"];
                e.onEveryWebContentsEvent("console-message", (e, n, i) => {
                  t.processMessage({
                    data: [i],
                    level: r[n],
                    variables: { processType: "renderer" },
                  });
                });
              })({ externalApi: e, logger: c }));
        } catch (e) {
          c.warn(e);
        }
      });
    },
  };
};
