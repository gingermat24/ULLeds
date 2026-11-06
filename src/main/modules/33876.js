module.exports = (e, t, r) => {
  "use strict";
  const { maxDepth: n, toJSON: i } = r(31326),
    { transform: o } = r(27929);
  e.exports = function (e, { externalApi: t }) {
    return (
      Object.assign(r, {
        depth: 3,
        eventId: "__ELECTRON_LOG_IPC__",
        level: !!e.isDev && "silly",
        transforms: [i, n],
      }),
      t?.isElectron() ? r : void 0
    );
    function r(n) {
      "renderer" !== n?.variables?.processType &&
        t?.sendIpc(r.eventId, { ...n, data: o({ logger: e, message: n, transport: r }) });
    }
  };
};
