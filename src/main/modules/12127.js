module.exports = (e, t, r) => {
  "use strict";
  const n = r(21503).fromCallback,
    i = r(16928),
    o = r(6158),
    s = r(25233),
    a = r(50065).pathExists,
    { areIdentical: c } = r(65927);
  e.exports = {
    createLink: n(function (e, t, r) {
      function n(e, t) {
        o.link(e, t, (e) => {
          if (e) return r(e);
          r(null);
        });
      }
      o.lstat(t, (l, u) => {
        o.lstat(e, (o, l) => {
          if (o) return ((o.message = o.message.replace("lstat", "ensureLink")), r(o));
          if (u && c(l, u)) return r(null);
          const p = i.dirname(t);
          a(p, (i, o) =>
            i
              ? r(i)
              : o
                ? n(e, t)
                : void s.mkdirs(p, (i) => {
                    if (i) return r(i);
                    n(e, t);
                  }),
          );
        });
      });
    }),
    createLinkSync: function (e, t) {
      let r;
      try {
        r = o.lstatSync(t);
      } catch {}
      try {
        const t = o.lstatSync(e);
        if (r && c(t, r)) return;
      } catch (e) {
        throw ((e.message = e.message.replace("lstat", "ensureLink")), e);
      }
      const n = i.dirname(t);
      return (o.existsSync(n) || s.mkdirsSync(n), o.linkSync(e, t));
    },
  };
};
