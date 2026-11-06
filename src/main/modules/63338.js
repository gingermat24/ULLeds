module.exports = (e, t, r) => {
  "use strict";
  const n = r(91218),
    i = r(74345),
    o = r(80691),
    s = r(58603),
    a = r(37713),
    c = r(33876),
    l = r(56598);
  e.exports = function ({ dependencies: e, initializeFn: t }) {
    const r = new n({
      dependencies: e,
      errorHandler: new i(),
      eventLogger: new o(),
      initializeFn: t,
      isDev: e.externalApi?.isDev(),
      logId: "default",
      transportFactories: { console: s, file: a, ipc: c, remote: l },
      variables: { processType: "main" },
    });
    return (
      (r.default = r),
      (r.Logger = n),
      (r.processInternalErrorFn = (e) => {
        r.transports.console.writeFn({
          message: { data: ["Unhandled electron-log error", e], level: "error" },
        });
      }),
      r
    );
  };
};
