module.exports = (e, t, r) => {
  "use strict";
  const { transform: n } = r(27929);
  function i(e) {
    const t = Math.abs(e);
    return `${e > 0 ? "-" : "+"}${Math.floor(t / 60)
      .toString()
      .padStart(2, "0")}:${(t % 60).toString().padStart(2, "0")}`;
  }
  function o({ data: e, logger: t, message: r }) {
    const { defaultLabel: n, labelLength: i } = t?.scope || {},
      o = e[0];
    let s,
      a = r.scope;
    return (
      a || (a = n),
      (s =
        "" === a
          ? i > 0
            ? "".padEnd(i + 3)
            : ""
          : "string" == typeof a
            ? ` (${a})`.padEnd(i + 3)
            : ""),
      (e[0] = o.replace("{scope}", s)),
      e
    );
  }
  function s({ data: e, message: t }) {
    let r = e[0];
    if ("string" != typeof r) return e;
    r = r.replace("{level}]", `${t.level}]`.padEnd(6, " "));
    const n = t.date || new Date();
    return (
      (e[0] = r
        .replace(/\{(\w+)}/g, (e, r) => {
          switch (r) {
            case "level":
              return t.level || "info";
            case "logId":
              return t.logId;
            case "y":
              return n.getFullYear().toString(10);
            case "m":
              return (n.getMonth() + 1).toString(10).padStart(2, "0");
            case "d":
              return n.getDate().toString(10).padStart(2, "0");
            case "h":
              return n.getHours().toString(10).padStart(2, "0");
            case "i":
              return n.getMinutes().toString(10).padStart(2, "0");
            case "s":
              return n.getSeconds().toString(10).padStart(2, "0");
            case "ms":
              return n.getMilliseconds().toString(10).padStart(3, "0");
            case "z":
              return i(n.getTimezoneOffset());
            case "iso":
              return n.toISOString();
            default:
              return t.variables?.[r] || e;
          }
        })
        .trim()),
      e
    );
  }
  function a({ data: e }) {
    const t = e[0];
    if ("string" != typeof t) return e;
    if (t.lastIndexOf("{text}") === t.length - 6)
      return ((e[0] = t.replace(/\s?{text}/, "")), "" === e[0] && e.shift(), e);
    const r = t.split("{text}");
    let n = [];
    return (
      "" !== r[0] && n.push(r[0]),
      (n = n.concat(e.slice(1))),
      "" !== r[1] && n.push(r[1]),
      n
    );
  }
  e.exports = {
    concatFirstStringElements: function ({ data: e }) {
      return "string" != typeof e[0] || "string" != typeof e[1] || e[0].match(/%[1cdfiOos]/)
        ? e
        : [`${e[0]} ${e[1]}`, ...e.slice(2)];
    },
    formatScope: o,
    formatText: a,
    formatVariables: s,
    timeZoneFromOffset: i,
    format({ message: e, logger: t, transport: r, data: i = e?.data }) {
      switch (typeof r.format) {
        case "string":
          return n({
            message: e,
            logger: t,
            transforms: [s, o, a],
            transport: r,
            initialData: [r.format, ...i],
          });
        case "function":
          return r.format({
            data: i,
            level: e?.level || "info",
            logger: t,
            message: e,
            transport: r,
          });
        default:
          return i;
      }
    },
  };
};
