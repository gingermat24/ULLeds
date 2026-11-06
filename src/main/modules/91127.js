module.exports = (e, t, r) => {
  "use strict";
  const n = r(6158),
    i = r(16928),
    o = r(25233).mkdirsSync,
    s = r(79846).utimesMillisSync,
    a = r(65927);
  function c(e, t, r, o) {
    const s = (o.dereference ? n.statSync : n.lstatSync)(t);
    if (s.isDirectory())
      return (function (e, t, r, i, o) {
        return t
          ? p(r, i, o)
          : (function (e, t, r, i) {
              return (n.mkdirSync(r), p(t, r, i), u(r, e));
            })(e.mode, r, i, o);
      })(s, e, t, r, o);
    if (s.isFile() || s.isCharacterDevice() || s.isBlockDevice())
      return (function (e, t, r, i, o) {
        return t
          ? (function (e, t, r, i) {
              if (i.overwrite) return (n.unlinkSync(r), l(e, t, r, i));
              if (i.errorOnExist) throw new Error(`'${r}' already exists`);
            })(e, r, i, o)
          : l(e, r, i, o);
      })(s, e, t, r, o);
    if (s.isSymbolicLink())
      return (function (e, t, r, o) {
        let s = n.readlinkSync(t);
        if ((o.dereference && (s = i.resolve(process.cwd(), s)), e)) {
          let e;
          try {
            e = n.readlinkSync(r);
          } catch (e) {
            if ("EINVAL" === e.code || "UNKNOWN" === e.code) return n.symlinkSync(s, r);
            throw e;
          }
          if ((o.dereference && (e = i.resolve(process.cwd(), e)), a.isSrcSubdir(s, e)))
            throw new Error(`Cannot copy '${s}' to a subdirectory of itself, '${e}'.`);
          if (n.statSync(r).isDirectory() && a.isSrcSubdir(e, s))
            throw new Error(`Cannot overwrite '${e}' with '${s}'.`);
          return (function (e, t) {
            return (n.unlinkSync(t), n.symlinkSync(e, t));
          })(s, r);
        }
        return n.symlinkSync(s, r);
      })(e, t, r, o);
    if (s.isSocket()) throw new Error(`Cannot copy a socket file: ${t}`);
    if (s.isFIFO()) throw new Error(`Cannot copy a FIFO pipe: ${t}`);
    throw new Error(`Unknown file: ${t}`);
  }
  function l(e, t, r, i) {
    return (
      n.copyFileSync(t, r),
      i.preserveTimestamps &&
        (function (e, t, r) {
          ((function (e) {
            return !(128 & e);
          })(e) &&
            (function (e, t) {
              u(e, 128 | t);
            })(r, e),
            (function (e, t) {
              const r = n.statSync(e);
              s(t, r.atime, r.mtime);
            })(t, r));
        })(e.mode, t, r),
      u(r, e.mode)
    );
  }
  function u(e, t) {
    return n.chmodSync(e, t);
  }
  function p(e, t, r) {
    n.readdirSync(e).forEach((n) =>
      (function (e, t, r, n) {
        const o = i.join(t, e),
          s = i.join(r, e),
          { destStat: l } = a.checkPathsSync(o, s, "copy", n);
        return (function (e, t, r, n) {
          if (!n.filter || n.filter(t, r)) return c(e, t, r, n);
        })(l, o, s, n);
      })(n, e, t, r),
    );
  }
  e.exports = function (e, t, r) {
    ("function" == typeof r && (r = { filter: r }),
      ((r = r || {}).clobber = !("clobber" in r) || !!r.clobber),
      (r.overwrite = "overwrite" in r ? !!r.overwrite : r.clobber),
      r.preserveTimestamps &&
        "ia32" === process.arch &&
        process.emitWarning(
          "Using the preserveTimestamps option in 32-bit node is not recommended;\n\n\tsee https://github.com/jprichardson/node-fs-extra/issues/269",
          "Warning",
          "fs-extra-WARN0002",
        ));
    const { srcStat: s, destStat: l } = a.checkPathsSync(e, t, "copy", r);
    return (
      a.checkParentPathsSync(e, s, t, "copy"),
      (function (e, t, r, s) {
        if (s.filter && !s.filter(t, r)) return;
        const a = i.dirname(r);
        return (n.existsSync(a) || o(a), c(e, t, r, s));
      })(l, e, t, r)
    );
  };
};
