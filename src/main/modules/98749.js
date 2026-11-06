module.exports = (e, t, r) => {
  "use strict";
  const n = r(21503).fromCallback,
    i = r(6158),
    o = r(16928),
    s = r(25233),
    a = r(50065).pathExists;
  e.exports = {
    outputFile: n(function (e, t, r, n) {
      "function" == typeof r && ((n = r), (r = "utf8"));
      const c = o.dirname(e);
      a(c, (o, a) =>
        o
          ? n(o)
          : a
            ? i.writeFile(e, t, r, n)
            : void s.mkdirs(c, (o) => {
                if (o) return n(o);
                i.writeFile(e, t, r, n);
              }),
      );
    }),
    outputFileSync: function (e, ...t) {
      const r = o.dirname(e);
      if (i.existsSync(r)) return i.writeFileSync(e, ...t);
      (s.mkdirsSync(r), i.writeFileSync(e, ...t));
    },
  };
};
