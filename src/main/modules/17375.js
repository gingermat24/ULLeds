module.exports = (e, t, r) => {
  "use strict";
  const n = r(6158),
    i = r(16928),
    o = r(25233).mkdirs,
    s = r(50065).pathExists,
    a = r(79846).utimesMillis,
    c = r(65927);
  function l(e, t, r, n, a) {
    const c = i.dirname(r);
    s(c, (i, s) =>
      i ? a(i) : s ? p(e, t, r, n, a) : void o(c, (i) => (i ? a(i) : p(e, t, r, n, a))),
    );
  }
  function u(e, t, r, n, i, o) {
    Promise.resolve(i.filter(r, n)).then(
      (s) => (s ? e(t, r, n, i, o) : o()),
      (e) => o(e),
    );
  }
  function p(e, t, r, o, s) {
    (o.dereference ? n.stat : n.lstat)(t, (a, l) =>
      a
        ? s(a)
        : l.isDirectory()
          ? (function (e, t, r, i, o, s) {
              return t
                ? m(r, i, o, s)
                : (function (e, t, r, i, o) {
                    n.mkdir(r, (n) => {
                      if (n) return o(n);
                      m(t, r, i, (t) => (t ? o(t) : h(r, e, o)));
                    });
                  })(e.mode, r, i, o, s);
            })(l, e, t, r, o, s)
          : l.isFile() || l.isCharacterDevice() || l.isBlockDevice()
            ? (function (e, t, r, i, o, s) {
                return t
                  ? (function (e, t, r, i, o) {
                      if (!i.overwrite)
                        return i.errorOnExist ? o(new Error(`'${r}' already exists`)) : o();
                      n.unlink(r, (n) => (n ? o(n) : d(e, t, r, i, o)));
                    })(e, r, i, o, s)
                  : d(e, r, i, o, s);
              })(l, e, t, r, o, s)
            : l.isSymbolicLink()
              ? (function (e, t, r, o, s) {
                  n.readlink(t, (t, a) =>
                    t
                      ? s(t)
                      : (o.dereference && (a = i.resolve(process.cwd(), a)),
                        e
                          ? void n.readlink(r, (t, l) =>
                              t
                                ? "EINVAL" === t.code || "UNKNOWN" === t.code
                                  ? n.symlink(a, r, s)
                                  : s(t)
                                : (o.dereference && (l = i.resolve(process.cwd(), l)),
                                  c.isSrcSubdir(a, l)
                                    ? s(
                                        new Error(
                                          `Cannot copy '${a}' to a subdirectory of itself, '${l}'.`,
                                        ),
                                      )
                                    : e.isDirectory() && c.isSrcSubdir(l, a)
                                      ? s(new Error(`Cannot overwrite '${l}' with '${a}'.`))
                                      : (function (e, t, r) {
                                          n.unlink(t, (i) => (i ? r(i) : n.symlink(e, t, r)));
                                        })(a, r, s)),
                            )
                          : n.symlink(a, r, s)),
                  );
                })(e, t, r, o, s)
              : l.isSocket()
                ? s(new Error(`Cannot copy a socket file: ${t}`))
                : l.isFIFO()
                  ? s(new Error(`Cannot copy a FIFO pipe: ${t}`))
                  : s(new Error(`Unknown file: ${t}`)),
    );
  }
  function d(e, t, r, i, o) {
    n.copyFile(t, r, (n) =>
      n
        ? o(n)
        : i.preserveTimestamps
          ? (function (e, t, r, n) {
              return (function (e) {
                return !(128 & e);
              })(e)
                ? (function (e, t, r) {
                    return h(e, 128 | t, r);
                  })(r, e, (i) => (i ? n(i) : f(e, t, r, n)))
                : f(e, t, r, n);
            })(e.mode, t, r, o)
          : h(r, e.mode, o),
    );
  }
  function f(e, t, r, i) {
    !(function (e, t, r) {
      n.stat(e, (e, n) => (e ? r(e) : a(t, n.atime, n.mtime, r)));
    })(t, r, (t) => (t ? i(t) : h(r, e, i)));
  }
  function h(e, t, r) {
    return n.chmod(e, t, r);
  }
  function m(e, t, r, i) {
    n.readdir(e, (n, o) => (n ? i(n) : g(o, e, t, r, i)));
  }
  function g(e, t, r, n, o) {
    const s = e.pop();
    return s
      ? (function (e, t, r, n, o, s) {
          const a = i.join(r, t),
            l = i.join(n, t);
          c.checkPaths(a, l, "copy", o, (t, i) => {
            if (t) return s(t);
            const { destStat: c } = i;
            !(function (e, t, r, n, i) {
              n.filter ? u(p, e, t, r, n, i) : p(e, t, r, n, i);
            })(c, a, l, o, (t) => (t ? s(t) : g(e, r, n, o, s)));
          });
        })(e, s, t, r, n, o)
      : o();
  }
  e.exports = function (e, t, r, n) {
    ("function" != typeof r || n
      ? "function" == typeof r && (r = { filter: r })
      : ((n = r), (r = {})),
      (n = n || function () {}),
      ((r = r || {}).clobber = !("clobber" in r) || !!r.clobber),
      (r.overwrite = "overwrite" in r ? !!r.overwrite : r.clobber),
      r.preserveTimestamps &&
        "ia32" === process.arch &&
        process.emitWarning(
          "Using the preserveTimestamps option in 32-bit node is not recommended;\n\n\tsee https://github.com/jprichardson/node-fs-extra/issues/269",
          "Warning",
          "fs-extra-WARN0001",
        ),
      c.checkPaths(e, t, "copy", r, (i, o) => {
        if (i) return n(i);
        const { srcStat: s, destStat: a } = o;
        c.checkParentPaths(e, s, t, "copy", (i) =>
          i ? n(i) : r.filter ? u(l, a, e, t, r, n) : l(a, e, t, r, n),
        );
      }));
  };
};
