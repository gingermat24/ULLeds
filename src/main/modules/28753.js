module.exports = (e, t, r) => {
  "use strict";
  const n = r(16928),
    i = r(6158),
    o = r(50065).pathExists;
  e.exports = {
    symlinkPaths: function (e, t, r) {
      if (n.isAbsolute(e))
        return i.lstat(e, (t) =>
          t
            ? ((t.message = t.message.replace("lstat", "ensureSymlink")), r(t))
            : r(null, { toCwd: e, toDst: e }),
        );
      {
        const s = n.dirname(t),
          a = n.join(s, e);
        return o(a, (t, o) =>
          t
            ? r(t)
            : o
              ? r(null, { toCwd: a, toDst: e })
              : i.lstat(e, (t) =>
                  t
                    ? ((t.message = t.message.replace("lstat", "ensureSymlink")), r(t))
                    : r(null, { toCwd: e, toDst: n.relative(s, e) }),
                ),
        );
      }
    },
    symlinkPathsSync: function (e, t) {
      let r;
      if (n.isAbsolute(e)) {
        if (((r = i.existsSync(e)), !r)) throw new Error("absolute srcpath does not exist");
        return { toCwd: e, toDst: e };
      }
      {
        const o = n.dirname(t),
          s = n.join(o, e);
        if (((r = i.existsSync(s)), r)) return { toCwd: s, toDst: e };
        if (((r = i.existsSync(e)), !r)) throw new Error("relative srcpath does not exist");
        return { toCwd: e, toDst: n.relative(o, e) };
      }
    },
  };
};
