module.exports = (e, t, r) => {
  "use strict";
  r.d(t, { P0: () => i, Uy: () => c, hO: () => n });
  const n =
      /^[v^~<>=]*?(\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+))?(?:-([\da-z\-]+(?:\.[\da-z\-]+)*))?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i,
    i = (e) => {
      if ("string" != typeof e) throw new TypeError("Invalid argument expected string");
      const t = e.match(n);
      if (!t) throw new Error(`Invalid argument not valid semver ('${e}' received)`);
      return (t.shift(), t);
    },
    o = (e) => "*" === e || "x" === e || "X" === e,
    s = (e) => {
      const t = parseInt(e, 10);
      return isNaN(t) ? e : t;
    },
    a = (e, t) => {
      if (o(e) || o(t)) return 0;
      const [r, n] = ((e, t) => (typeof e != typeof t ? [String(e), String(t)] : [e, t]))(
        s(e),
        s(t),
      );
      return r > n ? 1 : r < n ? -1 : 0;
    },
    c = (e, t) => {
      for (let r = 0; r < Math.max(e.length, t.length); r++) {
        const n = a(e[r] || "0", t[r] || "0");
        if (0 !== n) return n;
      }
      return 0;
    };
};
