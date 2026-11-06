module.exports = (e, t, r) => {
  "use strict";
  const { concatFirstStringElements: n, format: i } = r(1638),
    { maxDepth: o, toJSON: s } = r(31326),
    { applyAnsiStyles: a, removeStyles: c } = r(62e3),
    { transform: l } = r(27929),
    u = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      verbose: console.info,
      debug: console.debug,
      silly: console.debug,
      log: console.log,
    };
  e.exports = d;
  const p = `%c{h}:{i}:{s}.{ms}{scope}%c ${"win32" === process.platform ? ">" : "›"} {text}`;
  function d(e) {
    return Object.assign(
      function t(r) {
        const n = l({ logger: e, message: r, transport: t });
        t.writeFn({ message: { ...r, data: n } });
      },
      {
        format: p,
        level: "silly",
        transforms: [f, i, h, n, o, s],
        useStyles: process.env.FORCE_STYLES,
        writeFn({ message: e }) {
          (u[e.level] || u.info)(...e.data);
        },
      },
    );
  }
  function f({ data: e, message: t, transport: r }) {
    return r.format !== p ? e : [`color:${m(t.level)}`, "color:unset", ...e];
  }
  function h(e) {
    const { message: t, transport: r } = e;
    return (
      (function (e, t) {
        if ("boolean" == typeof e) return e;
        const r = "error" === t || "warn" === t ? process.stderr : process.stdout;
        return r && r.isTTY;
      })(r.useStyles, t.level)
        ? a
        : c
    )(e);
  }
  function m(e) {
    const t = { error: "red", warn: "yellow", info: "cyan", default: "unset" };
    return t[e] || t.default;
  }
  Object.assign(d, { DEFAULT_FORMAT: p });
};
