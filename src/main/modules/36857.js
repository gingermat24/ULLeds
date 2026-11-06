module.exports = (e, t, r) => {
  "use strict";
  const n = r(16928),
    i = r(1304);
  ((e.exports = (e, t = {}) => {
    const r = n.resolve(t.cwd || ""),
      { root: o } = n.parse(r),
      s = [].concat(e);
    return new Promise((e) => {
      !(function t(r) {
        i(s, { cwd: r }).then((i) => {
          i ? e(n.join(r, i)) : r === o ? e(null) : t(n.dirname(r));
        });
      })(r);
    });
  }),
    (e.exports.sync = (e, t = {}) => {
      let r = n.resolve(t.cwd || "");
      const { root: o } = n.parse(r),
        s = [].concat(e);
      for (;;) {
        const e = i.sync(s, { cwd: r });
        if (e) return n.join(r, e);
        if (r === o) return null;
        r = n.dirname(r);
      }
    }));
};
