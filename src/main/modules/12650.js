module.exports = (e, t, r) => {
  "use strict";
  const n = r(84157),
    i = r(6117),
    { initialize: o } = r(86986),
    s = r(63338),
    a = new i({ electron: n }),
    c = s({ dependencies: { externalApi: a }, initializeFn: o });
  function l(e) {
    c.Logger.getInstance(e)?.processMessage(e);
  }
  ((e.exports = c),
    a.onIpc("__ELECTRON_LOG__", (e, t) => {
      t.scope && c.Logger.getInstance(t).scope(t.scope);
      const r = new Date(t.date);
      l({ ...t, date: r.getTime() ? r : new Date() });
    }),
    a.onIpcInvoke("__ELECTRON_LOG__", (e, { cmd: t = "", logId: r }) =>
      "getOptions" === t
        ? { levels: c.Logger.getInstance({ logId: r }).levels, logId: r }
        : (l({ data: [`Unknown cmd '${t}'`], level: "error" }), {}),
    ));
};
