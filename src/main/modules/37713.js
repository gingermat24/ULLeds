module.exports = (e, t, r) => {
  "use strict";
  const n = r(79896),
    i = r(70857),
    o = r(16928),
    s = r(58792),
    { transform: a } = r(27929),
    { removeStyles: c } = r(62e3),
    { format: l, concatFirstStringElements: u } = r(1638),
    { toString: p } = r(31326);
  e.exports = function (e, { registry: t = d, externalApi: r } = {}) {
    let s;
    return (
      t.listenerCount("error") < 1 &&
        t.on("error", (e, t) => {
          g(`Can't write to ${t}`, e);
        }),
      Object.assign(h, {
        fileName: f(e.variables.processType),
        format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}",
        getFile: v,
        inspectOptions: { depth: 5 },
        level: "silly",
        maxSize: 1048576,
        readAllLogs: function ({ fileFilter: e = (e) => e.endsWith(".log") } = {}) {
          m();
          const t = o.dirname(h.resolvePathFn(s));
          return n.existsSync(t)
            ? n
                .readdirSync(t)
                .map((e) => o.join(t, e))
                .filter(e)
                .map((e) => {
                  try {
                    return { path: e, lines: n.readFileSync(e, "utf8").split(i.EOL) };
                  } catch {
                    return null;
                  }
                })
                .filter(Boolean)
            : [];
        },
        sync: !0,
        transforms: [c, l, u, p],
        writeOptions: { flag: "a", mode: 438, encoding: "utf8" },
        archiveLogFn(e) {
          const t = e.toString(),
            r = o.parse(t);
          try {
            n.renameSync(t, o.join(r.dir, `${r.name}.old${r.ext}`));
          } catch (t) {
            g("Could not rotate log", t);
            const r = Math.round(h.maxSize / 4);
            e.crop(Math.min(r, 262144));
          }
        },
        resolvePathFn: (e) => o.join(e.libraryDefaultDir, e.fileName),
        setAppName(t) {
          e.dependencies.externalApi.setAppName(t);
        },
      })
    );
    function h(t) {
      const r = v(t);
      h.maxSize > 0 && r.size > h.maxSize && (h.archiveLogFn(r), r.reset());
      const n = a({ logger: e, message: t, transport: h });
      r.writeLine(n);
    }
    function m() {
      s ||
        ((s = Object.create(Object.prototype, {
          ...Object.getOwnPropertyDescriptors(r.getPathVariables()),
          fileName: { get: () => h.fileName, enumerable: !0 },
        })),
        "function" == typeof h.archiveLog &&
          ((h.archiveLogFn = h.archiveLog),
          g("archiveLog is deprecated. Use archiveLogFn instead")),
        "function" == typeof h.resolvePath &&
          ((h.resolvePathFn = h.resolvePath),
          g("resolvePath is deprecated. Use resolvePathFn instead")));
    }
    function g(t, r = null, n = "error") {
      const i = [`electron-log.transports.file: ${t}`];
      (r && i.push(r), e.transports.console({ data: i, date: new Date(), level: n }));
    }
    function v(e) {
      m();
      const r = h.resolvePathFn(s, e);
      return t.provide({ filePath: r, writeAsync: !h.sync, writeOptions: h.writeOptions });
    }
  };
  const d = new s();
  function f(e = process.type) {
    switch (e) {
      case "renderer":
        return "renderer.log";
      case "worker":
        return "worker.log";
      default:
        return "main.log";
    }
  }
};
