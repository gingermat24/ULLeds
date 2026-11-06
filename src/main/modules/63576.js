module.exports = (e, t, r) => {
  "use strict";
  const n = r(91218),
    i = r(1967),
    o = r(82194),
    s = r(23353);
  ((e.exports = (function () {
    const e = new n({
      allowUnknownLevel: !0,
      errorHandler: new i(),
      initializeFn: () => {},
      logId: "default",
      transportFactories: { console: o, ipc: s },
      variables: { processType: "renderer" },
    });
    return (
      e.errorHandler.setOptions({
        logFn({ error: t, errorName: r, showDialog: n }) {
          (e.transports.console({ data: [r, t].filter(Boolean), level: "error" }),
            e.transports.ipc({
              cmd: "errorHandler",
              error: {
                cause: t?.cause,
                code: t?.code,
                name: t?.name,
                message: t?.message,
                stack: t?.stack,
              },
              errorName: r,
              logId: e.logId,
              showDialog: n,
            }));
        },
      }),
      "object" == typeof window &&
        window.addEventListener("message", (e) => {
          const { cmd: t, logId: r, ...i } = e.data || {},
            o = n.getInstance({ logId: r });
          "message" === t && o.processMessage(i, { transports: ["console"] });
        }),
      new Proxy(e, {
        get: (t, r) => (void 0 !== t[r] ? t[r] : (...t) => e.logData(t, { level: r })),
      })
    );
  })()),
    (e.exports.Logger = n),
    (e.exports.default = e.exports));
};
