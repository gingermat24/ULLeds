module.exports = (e, t, r) => {
  "use strict";
  const n = r(67634),
    i = r(16928),
    o = r(39023);
  function s(e, t, r) {
    const i = r.dereference ? (e) => n.stat(e, { bigint: !0 }) : (e) => n.lstat(e, { bigint: !0 });
    return Promise.all([
      i(e),
      i(t).catch((e) => {
        if ("ENOENT" === e.code) return null;
        throw e;
      }),
    ]).then(([e, t]) => ({ srcStat: e, destStat: t }));
  }
  function a(e, t) {
    return t.ino && t.dev && t.ino === e.ino && t.dev === e.dev;
  }
  function c(e, t) {
    const r = i
        .resolve(e)
        .split(i.sep)
        .filter((e) => e),
      n = i
        .resolve(t)
        .split(i.sep)
        .filter((e) => e);
    return r.reduce((e, t, r) => e && n[r] === t, !0);
  }
  function l(e, t, r) {
    return `Cannot ${r} '${e}' to a subdirectory of itself, '${t}'.`;
  }
  e.exports = {
    checkPaths: function (e, t, r, n, u) {
      o.callbackify(s)(e, t, n, (n, o) => {
        if (n) return u(n);
        const { srcStat: s, destStat: p } = o;
        if (p) {
          if (a(s, p)) {
            const n = i.basename(e),
              o = i.basename(t);
            return "move" === r && n !== o && n.toLowerCase() === o.toLowerCase()
              ? u(null, { srcStat: s, destStat: p, isChangingCase: !0 })
              : u(new Error("Source and destination must not be the same."));
          }
          if (s.isDirectory() && !p.isDirectory())
            return u(new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`));
          if (!s.isDirectory() && p.isDirectory())
            return u(new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`));
        }
        return s.isDirectory() && c(e, t)
          ? u(new Error(l(e, t, r)))
          : u(null, { srcStat: s, destStat: p });
      });
    },
    checkPathsSync: function (e, t, r, o) {
      const { srcStat: s, destStat: u } = (function (e, t, r) {
        let i;
        const o = r.dereference
            ? (e) => n.statSync(e, { bigint: !0 })
            : (e) => n.lstatSync(e, { bigint: !0 }),
          s = o(e);
        try {
          i = o(t);
        } catch (e) {
          if ("ENOENT" === e.code) return { srcStat: s, destStat: null };
          throw e;
        }
        return { srcStat: s, destStat: i };
      })(e, t, o);
      if (u) {
        if (a(s, u)) {
          const n = i.basename(e),
            o = i.basename(t);
          if ("move" === r && n !== o && n.toLowerCase() === o.toLowerCase())
            return { srcStat: s, destStat: u, isChangingCase: !0 };
          throw new Error("Source and destination must not be the same.");
        }
        if (s.isDirectory() && !u.isDirectory())
          throw new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`);
        if (!s.isDirectory() && u.isDirectory())
          throw new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`);
      }
      if (s.isDirectory() && c(e, t)) throw new Error(l(e, t, r));
      return { srcStat: s, destStat: u };
    },
    checkParentPaths: function e(t, r, o, s, c) {
      const u = i.resolve(i.dirname(t)),
        p = i.resolve(i.dirname(o));
      if (p === u || p === i.parse(p).root) return c();
      n.stat(p, { bigint: !0 }, (n, i) =>
        n
          ? "ENOENT" === n.code
            ? c()
            : c(n)
          : a(r, i)
            ? c(new Error(l(t, o, s)))
            : e(t, r, p, s, c),
      );
    },
    checkParentPathsSync: function e(t, r, o, s) {
      const c = i.resolve(i.dirname(t)),
        u = i.resolve(i.dirname(o));
      if (u === c || u === i.parse(u).root) return;
      let p;
      try {
        p = n.statSync(u, { bigint: !0 });
      } catch (e) {
        if ("ENOENT" === e.code) return;
        throw e;
      }
      if (a(r, p)) throw new Error(l(t, o, s));
      return e(t, r, u, s);
    },
    isSrcSubdir: c,
    areIdentical: a,
  };
};
