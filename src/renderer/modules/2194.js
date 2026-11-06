module.exports = (e) => {
  "use strict";
  e.exports = function (e) {
    return Object.assign(n, {
      format: "{h}:{i}:{s}.{ms}{scope} › {text}",
      formatDataFn: ({
        data: t = [],
        date: r = new Date(),
        format: o = n.format,
        logId: i = e.logId,
        scope: a = e.scopeName,
        ...s
      }) =>
        "function" == typeof o
          ? o({ ...s, data: t, date: r, logId: i, scope: a })
          : ("string" != typeof o ||
              (t.unshift(o),
              "string" == typeof t[1] &&
                t[1].match(/%[1cdfiOos]/) &&
                (t = [`${t[0]} ${t[1]}`, ...t.slice(2)]),
              (t[0] = t[0]
                .replace(/\{(\w+)}/g, (e, t) => {
                  switch (t) {
                    case "level":
                      return s.level;
                    case "logId":
                      return i;
                    case "scope":
                      return a ? ` (${a})` : "";
                    case "text":
                      return "";
                    case "y":
                      return r.getFullYear().toString(10);
                    case "m":
                      return (r.getMonth() + 1).toString(10).padStart(2, "0");
                    case "d":
                      return r.getDate().toString(10).padStart(2, "0");
                    case "h":
                      return r.getHours().toString(10).padStart(2, "0");
                    case "i":
                      return r.getMinutes().toString(10).padStart(2, "0");
                    case "s":
                      return r.getSeconds().toString(10).padStart(2, "0");
                    case "ms":
                      return r.getMilliseconds().toString(10).padStart(3, "0");
                    case "iso":
                      return r.toISOString();
                    default:
                      return s.variables?.[t] || e;
                  }
                })
                .trim())),
            t),
      writeFn({ message: { level: e, data: n } }) {
        const r = t[e] || t.info;
        setTimeout(() => r(...n));
      },
    });
    function n(e) {
      n.writeFn({ message: { ...e, data: n.formatDataFn(e) } });
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
