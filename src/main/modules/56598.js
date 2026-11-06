module.exports = (e, t, r) => {
  "use strict";
  const n = r(58611),
    i = r(65692),
    { transform: o } = r(27929),
    { removeStyles: s } = r(62e3),
    { toJSON: a, maxDepth: c } = r(31326);
  e.exports = function (e) {
    return Object.assign(t, {
      client: { name: "electron-application" },
      depth: 6,
      level: !1,
      requestOptions: {},
      transforms: [s, a, c],
      makeBodyFn: ({ message: e }) =>
        JSON.stringify({
          client: t.client,
          data: e.data,
          date: e.date.getTime(),
          level: e.level,
          scope: e.scope,
          variables: e.variables,
        }),
      processErrorFn({ error: r }) {
        e.processMessage(
          { data: [`electron-log: can't POST ${t.url}`, r], level: "warn" },
          { transports: ["console", "file"] },
        );
      },
      sendRequestFn({ serverUrl: e, requestOptions: t, body: r }) {
        const o = (e.startsWith("https:") ? i : n).request(e, {
          method: "POST",
          ...t,
          headers: { "Content-Type": "application/json", "Content-Length": r.length, ...t.headers },
        });
        return (o.write(r), o.end(), o);
      },
    });
    function t(r) {
      if (!t.url) return;
      const n = t.makeBodyFn({
          logger: e,
          message: { ...r, data: o({ logger: e, message: r, transport: t }) },
          transport: t,
        }),
        i = t.sendRequestFn({
          serverUrl: t.url,
          requestOptions: t.requestOptions,
          body: Buffer.from(n, "utf8"),
        });
      i.on("error", (n) =>
        t.processErrorFn({ error: n, logger: e, message: r, request: i, transport: t }),
      );
    }
  };
};
