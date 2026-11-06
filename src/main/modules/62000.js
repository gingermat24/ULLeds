module.exports = (e) => {
  "use strict";
  e.exports = {
    transformStyles: i,
    applyAnsiStyles: ({ data: e }) => i(e, r, n),
    removeStyles: ({ data: e }) => i(e, () => ""),
  };
  const t = {
    unset: "[0m",
    black: "[30m",
    red: "[31m",
    green: "[32m",
    yellow: "[33m",
    blue: "[34m",
    magenta: "[35m",
    cyan: "[36m",
    white: "[37m",
  };
  function r(e) {
    const r = e.replace(/color:\s*(\w+).*/, "$1").toLowerCase();
    return t[r] || "";
  }
  function n(e) {
    return e + t.unset;
  }
  function i(e, t, r) {
    const n = {};
    return e.reduce((e, i, o, s) => {
      if (n[o]) return e;
      if ("string" == typeof i) {
        let e = o,
          a = !1;
        ((i = i.replace(/%[1cdfiOos]/g, (r) => {
          if (((e += 1), "%c" !== r)) return r;
          const o = s[e];
          return "string" == typeof o ? ((n[e] = !0), (a = !0), t(o, i)) : r;
        })),
          a && r && (i = r(i)));
      }
      return (e.push(i), e);
    }, []);
  }
};
