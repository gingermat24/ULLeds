module.exports = (e, t, n) => {
  "use strict";
  const r = n(1218),
    o = n(1967),
    i = n(2194),
    a = n(3353);
  ((e.exports = (function () {
    const e = new r({
      allowUnknownLevel: !0,
      errorHandler: new o(),
      initializeFn: () => {},
      logId: "default",
      transportFactories: { console: i, ipc: a },
      variables: { processType: "renderer" },
    });
    return (
      e.errorHandler.setOptions({
        logFn({ error: t, errorName: n, showDialog: r }) {
          (e.transports.console({ data: [n, t].filter(Boolean), level: "error" }),
            e.transports.ipc({
              cmd: "errorHandler",
              error: {
                cause: t?.cause,
                code: t?.code,
                name: t?.name,
                message: t?.message,
                stack: t?.stack,
              },
              errorName: n,
              logId: e.logId,
              showDialog: r,
            }));
        },
      }),
      "object" == typeof window &&
        window.addEventListener("message", (e) => {
          const { cmd: t, logId: n, ...o } = e.data || {},
            i = r.getInstance({ logId: n });
          "message" === t && i.processMessage(o, { transports: ["console"] });
        }),
      new Proxy(e, {
        get: (t, n) => (void 0 !== t[n] ? t[n] : (...t) => e.logData(t, { level: n })),
      })
    );
  })()),
    (e.exports.Logger = r),
    (e.exports.default = e.exports));
};
