module.exports = (e, t, r) => {
  "use strict";
  const n = r(21503).fromCallback,
    i = r(16928),
    o = r(6158),
    s = r(25233);
  e.exports = {
    createFile: n(function (e, t) {
      function r() {
        o.writeFile(e, "", (e) => {
          if (e) return t(e);
          t();
        });
      }
      o.stat(e, (n, a) => {
        if (!n && a.isFile()) return t();
        const c = i.dirname(e);
        o.stat(c, (e, n) => {
          if (e)
            return "ENOENT" === e.code
              ? s.mkdirs(c, (e) => {
                  if (e) return t(e);
                  r();
                })
              : t(e);
          n.isDirectory()
            ? r()
            : o.readdir(c, (e) => {
                if (e) return t(e);
              });
        });
      });
    }),
    createFileSync: function (e) {
      let t;
      try {
        t = o.statSync(e);
      } catch {}
      if (t && t.isFile()) return;
      const r = i.dirname(e);
      try {
        o.statSync(r).isDirectory() || o.readdirSync(r);
      } catch (e) {
        if (!e || "ENOENT" !== e.code) throw e;
        s.mkdirsSync(r);
      }
      o.writeFileSync(e, "");
    },
  };
};
