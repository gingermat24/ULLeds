module.exports = (e, t, r) => {
  "use strict";
  const n = r(92570),
    i = (e) => {
      if ((!Number.isInteger(e) && e !== 1 / 0) || !(e > 0))
        return Promise.reject(new TypeError("Expected `concurrency` to be a number from 1 and up"));
      const t = [];
      let r = 0;
      const i = () => {
          (r--, t.length > 0 && t.shift()());
        },
        o = (e, t, ...o) => {
          r++;
          const s = n(e, ...o);
          (t(s), s.then(i, i));
        },
        s = (n, ...i) =>
          new Promise((s) =>
            ((n, i, ...s) => {
              r < e ? o(n, i, ...s) : t.push(o.bind(null, n, i, ...s));
            })(n, s, ...i),
          );
      return (
        Object.defineProperties(s, {
          activeCount: { get: () => r },
          pendingCount: { get: () => t.length },
          clearQueue: {
            value: () => {
              t.length = 0;
            },
          },
        }),
        s
      );
    };
  ((e.exports = i), (e.exports.default = i));
};
