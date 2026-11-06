module.exports = (e) => {
  "use strict";
  e.exports = function (e) {
    return Object.assign(n, {
      depth: 5,
      serializeFn: (e, { depth: i = 5, seen: o = new WeakSet() } = {}) =>
        o.has(e)
          ? "[Circular]"
          : i < 1
            ? r(e)
              ? e
              : Array.isArray(e)
                ? "[Array]"
                : `[${typeof e}]`
            : ["function", "symbol"].includes(typeof e)
              ? e.toString()
              : r(e)
                ? e
                : t.has(e.constructor)
                  ? `[${e.constructor.name}]`
                  : Array.isArray(e)
                    ? e.map((e) => n.serializeFn(e, { depth: i - 1, seen: o }))
                    : e instanceof Date
                      ? e.toISOString()
                      : e instanceof Error
                        ? e.stack
                        : e instanceof Map
                          ? new Map(
                              Array.from(e).map(([e, t]) => [
                                n.serializeFn(e, { depth: i - 1, seen: o }),
                                n.serializeFn(t, { depth: i - 1, seen: o }),
                              ]),
                            )
                          : e instanceof Set
                            ? new Set(
                                Array.from(e).map((e) =>
                                  n.serializeFn(e, { depth: i - 1, seen: o }),
                                ),
                              )
                            : (o.add(e),
                              Object.fromEntries(
                                Object.entries(e).map(([e, t]) => [
                                  e,
                                  n.serializeFn(t, { depth: i - 1, seen: o }),
                                ]),
                              )),
    });
    function n(t) {
      if (window.__electronLog)
        try {
          __electronLog.sendToMain(n.serializeFn(t, { depth: n.depth }));
        } catch (r) {
          e.transports.console({
            data: ["electronLog.transports.ipc", r, "data:", t.data],
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
  function r(e) {
    return Object(e) !== e;
  }
};
