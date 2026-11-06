module.exports = (e, t, r) => {
  "use strict";
  const n = r(6158),
    i = r(16928),
    o = r(4660).copySync,
    s = r(5741).removeSync,
    a = r(25233).mkdirpSync,
    c = r(65927);
  function l(e, t, r) {
    try {
      n.renameSync(e, t);
    } catch (n) {
      if ("EXDEV" !== n.code) throw n;
      return (function (e, t, r) {
        return (o(e, t, { overwrite: r, errorOnExist: !0 }), s(e));
      })(e, t, r);
    }
  }
  e.exports = function (e, t, r) {
    const o = (r = r || {}).overwrite || r.clobber || !1,
      { srcStat: u, isChangingCase: p = !1 } = c.checkPathsSync(e, t, "move", r);
    return (
      c.checkParentPathsSync(e, u, t, "move"),
      (function (e) {
        const t = i.dirname(e);
        return i.parse(t).root === t;
      })(t) || a(i.dirname(t)),
      (function (e, t, r, i) {
        if (i) return l(e, t, r);
        if (r) return (s(t), l(e, t, r));
        if (n.existsSync(t)) throw new Error("dest already exists.");
        return l(e, t, r);
      })(e, t, o, p)
    );
  };
};
