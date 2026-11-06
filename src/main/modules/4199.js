module.exports = (e, t, r) => {
  "use strict";
  const n = r(6158),
    i = r(16928),
    o = r(4660).copy,
    s = r(5741).remove,
    a = r(25233).mkdirp,
    c = r(50065).pathExists,
    l = r(65927);
  function u(e, t, r, n, i) {
    return n
      ? p(e, t, r, i)
      : r
        ? s(t, (n) => (n ? i(n) : p(e, t, r, i)))
        : void c(t, (n, o) =>
            n ? i(n) : o ? i(new Error("dest already exists.")) : p(e, t, r, i),
          );
  }
  function p(e, t, r, i) {
    n.rename(e, t, (n) =>
      n
        ? "EXDEV" !== n.code
          ? i(n)
          : (function (e, t, r, n) {
              o(e, t, { overwrite: r, errorOnExist: !0 }, (t) => (t ? n(t) : s(e, n)));
            })(e, t, r, i)
        : i(),
    );
  }
  e.exports = function (e, t, r, n) {
    "function" == typeof r && ((n = r), (r = {}));
    const o = (r = r || {}).overwrite || r.clobber || !1;
    l.checkPaths(e, t, "move", r, (r, s) => {
      if (r) return n(r);
      const { srcStat: c, isChangingCase: p = !1 } = s;
      l.checkParentPaths(e, c, t, "move", (r) =>
        r
          ? n(r)
          : (function (e) {
                const t = i.dirname(e);
                return i.parse(t).root === t;
              })(t)
            ? u(e, t, o, p, n)
            : void a(i.dirname(t), (r) => (r ? n(r) : u(e, t, o, p, n))),
      );
    });
  };
};
