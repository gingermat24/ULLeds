module.exports = (e) => {
  "use strict";
  e.exports = function (e) {
    return Object.assign(r, {
      format: "{h}:{i}:{s}.{ms}{scope} › {text}",
      formatDataFn: ({
        data: t = [],
        date: n = new Date(),
        format: i = r.format,
        logId: o = e.logId,
        scope: s = e.scopeName,
        ...a
      }) =>
        "function" == typeof i
          ? i({ ...a, data: t, date: n, logId: o, scope: s })
          : ("string" != typeof i ||
              (t.unshift(i),
              "string" == typeof t[1] &&
                t[1].match(/%[1cdfiOos]/) &&
                (t = [`${t[0]} ${t[1]}`, ...t.slice(2)]),
              (t[0] = t[0]
                .replace(/\{(\w+)}/g, (e, t) => {
                  switch (t) {
                    case "level":
                      return a.level;
                    case "logId":
                      return o;
                    case "scope":
                      return s ? ` (${s})` : "";
                    case "text":
                      return "";
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
                    case "iso":
                      return n.toISOString();
                    default:
                      return a.variables?.[t] || e;
                  }
                })
                .trim())),
            t),
      writeFn({ message: { level: e, data: r } }) {
        const n = t[e] || t.info;
        setTimeout(() => n(...r));
      },
    });
    function r(e) {
      r.writeFn({ message: { ...e, data: r.formatDataFn(e) } });
    }
  };
  const t = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    verbose: console.info,
    debug: console.debug,
    silly: console.debug,
    log: console.log,
  };
};
