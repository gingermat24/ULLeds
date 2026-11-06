module.exports = (e, t, r) => {
  "use strict";
  const n = r(21503).fromCallback,
    i = r(16928),
    o = r(67634),
    s = r(25233),
    a = s.mkdirs,
    c = s.mkdirsSync,
    l = r(28753),
    u = l.symlinkPaths,
    p = l.symlinkPathsSync,
    d = r(95269),
    f = d.symlinkType,
    h = d.symlinkTypeSync,
    m = r(50065).pathExists,
    { areIdentical: g } = r(65927);
  function v(e, t, r, n) {
    u(e, t, (s, c) => {
      if (s) return n(s);
      ((e = c.toDst),
        f(c.toCwd, r, (r, s) => {
          if (r) return n(r);
          const c = i.dirname(t);
          m(c, (r, i) =>
            r
              ? n(r)
              : i
                ? o.symlink(e, t, s, n)
                : void a(c, (r) => {
                    if (r) return n(r);
                    o.symlink(e, t, s, n);
                  }),
          );
        }));
    });
  }
  e.exports = {
    createSymlink: n(function (e, t, r, n) {
      ((n = "function" == typeof r ? r : n),
        (r = "function" != typeof r && r),
        o.lstat(t, (i, s) => {
          !i && s.isSymbolicLink()
            ? Promise.all([o.stat(e), o.stat(t)]).then(([i, o]) => {
                if (g(i, o)) return n(null);
                v(e, t, r, n);
              })
            : v(e, t, r, n);
        }));
    }),
    createSymlinkSync: function (e, t, r) {
      let n;
      try {
        n = o.lstatSync(t);
      } catch {}
      if (n && n.isSymbolicLink()) {
        const r = o.statSync(e),
          n = o.statSync(t);
        if (g(r, n)) return;
      }
      const s = p(e, t);
      ((e = s.toDst), (r = h(s.toCwd, r)));
      const a = i.dirname(t);
      return (o.existsSync(a) || c(a), o.symlinkSync(e, t, r));
    },
  };
};
