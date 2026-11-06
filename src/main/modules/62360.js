module.exports = (e, t, r) => {
  "use strict";
  const n = r(56514);
  e.exports = (e, t = {}) => {
    if ("function" != typeof e)
      throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
    const { wait: r = 0, before: i = !1, after: o = !0 } = t;
    if (!i && !o)
      throw new Error("Both `before` and `after` are false, function wouldn't be called.");
    let s, a;
    const c = function (...t) {
      const n = this,
        c = i && !s;
      return (
        clearTimeout(s),
        (s = setTimeout(() => {
          ((s = void 0), o && (a = e.apply(n, t)));
        }, r)),
        c && (a = e.apply(n, t)),
        a
      );
    };
    return (
      n(c, e),
      (c.cancel = () => {
        s && (clearTimeout(s), (s = void 0));
      }),
      c
    );
  };
};
