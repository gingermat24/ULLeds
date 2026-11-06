module.exports = (e) => {
  "use strict";
  e.exports = function (e) {
    return Object.assign(r, {
      depth: 5,
      serializeFn: (e, { depth: o = 5, seen: i = new WeakSet() } = {}) =>
        i.has(e)
          ? "[Circular]"
          : o < 1
            ? n(e)
              ? e
              : Array.isArray(e)
                ? "[Array]"
                : `[${typeof e}]`
            : ["function", "symbol"].includes(typeof e)
              ? e.toString()
              : n(e)
                ? e
                : t.has(e.constructor)
                  ? `[${e.constructor.name}]`
                  : Array.isArray(e)
                    ? e.map((e) => r.serializeFn(e, { depth: o - 1, seen: i }))
                    : e instanceof Date
                      ? e.toISOString()
                      : e instanceof Error
                        ? e.stack
                        : e instanceof Map
                          ? new Map(
                              Array.from(e).map(([e, t]) => [
                                r.serializeFn(e, { depth: o - 1, seen: i }),
                                r.serializeFn(t, { depth: o - 1, seen: i }),
                              ]),
                            )
                          : e instanceof Set
                            ? new Set(
                                Array.from(e).map((e) =>
                                  r.serializeFn(e, { depth: o - 1, seen: i }),
                                ),
                              )
                            : (i.add(e),
                              Object.fromEntries(
                                Object.entries(e).map(([e, t]) => [
                                  e,
                                  r.serializeFn(t, { depth: o - 1, seen: i }),
                                ]),
                              )),
    });
    function r(t) {
      if (window.__electronLog)
        try {
          __electronLog.sendToMain(r.serializeFn(t, { depth: r.depth }));
        } catch (n) {
          e.transports.console({
            data: ["electronLog.transports.ipc", n, "data:", t.data],
            level: "error",
          });
        }
      else
        e.processMessage(
          { data: ["electron-log: logger isn't initialized in the main process"], level: "error" },
          { transports: ["console"] },
        );
    }
  };
  const t = new Set([Promise, WeakMap, WeakSet]);
  function n(e) {
    return Object(e) !== e;
  }
};
