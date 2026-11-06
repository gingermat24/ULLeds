module.exports = (e, t, r) => {
  var n = r(49140),
    i = process.cwd,
    o = null,
    s = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function () {
    return (o || (o = i.call(process)), o);
  };
  try {
    process.cwd();
  } catch (e) {}
  if ("function" == typeof process.chdir) {
    var a = process.chdir;
    ((process.chdir = function (e) {
      ((o = null), a.call(process, e));
    }),
      Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, a));
  }
  e.exports = function (e) {
    function t(t) {
      return t
        ? function (r, n, i) {
            return t.call(e, r, n, function (e) {
              (l(e) && (e = null), i && i.apply(this, arguments));
            });
          }
        : t;
    }
    function r(t) {
      return t
        ? function (r, n) {
            try {
              return t.call(e, r, n);
            } catch (e) {
              if (!l(e)) throw e;
            }
          }
        : t;
    }
    function i(t) {
      return t
        ? function (r, n, i, o) {
            return t.call(e, r, n, i, function (e) {
              (l(e) && (e = null), o && o.apply(this, arguments));
            });
          }
        : t;
    }
    function o(t) {
      return t
        ? function (r, n, i) {
            try {
              return t.call(e, r, n, i);
            } catch (e) {
              if (!l(e)) throw e;
            }
          }
        : t;
    }
    function a(t) {
      return t
        ? function (r, n, i) {
            function o(e, t) {
              (t && (t.uid < 0 && (t.uid += 4294967296), t.gid < 0 && (t.gid += 4294967296)),
                i && i.apply(this, arguments));
            }
            return (
              "function" == typeof n && ((i = n), (n = null)),
              n ? t.call(e, r, n, o) : t.call(e, r, o)
            );
          }
        : t;
    }
    function c(t) {
      return t
        ? function (r, n) {
            var i = n ? t.call(e, r, n) : t.call(e, r);
            return (
              i && (i.uid < 0 && (i.uid += 4294967296), i.gid < 0 && (i.gid += 4294967296)),
              i
            );
          }
        : t;
    }
    function l(e) {
      return (
        !e ||
        "ENOSYS" === e.code ||
        !((process.getuid && 0 === process.getuid()) || ("EINVAL" !== e.code && "EPERM" !== e.code))
      );
    }
    var u;
    (n.hasOwnProperty("O_SYMLINK") &&
      process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) &&
      (function (e) {
        ((e.lchmod = function (t, r, i) {
          e.open(t, n.O_WRONLY | n.O_SYMLINK, r, function (t, n) {
            t
              ? i && i(t)
              : e.fchmod(n, r, function (t) {
                  e.close(n, function (e) {
                    i && i(t || e);
                  });
                });
          });
        }),
          (e.lchmodSync = function (t, r) {
            var i,
              o = e.openSync(t, n.O_WRONLY | n.O_SYMLINK, r),
              s = !0;
            try {
              ((i = e.fchmodSync(o, r)), (s = !1));
            } finally {
              if (s)
                try {
                  e.closeSync(o);
                } catch (e) {}
              else e.closeSync(o);
            }
            return i;
          }));
      })(e),
      e.lutimes ||
        (function (e) {
          n.hasOwnProperty("O_SYMLINK") && e.futimes
            ? ((e.lutimes = function (t, r, i, o) {
                e.open(t, n.O_SYMLINK, function (t, n) {
                  t
                    ? o && o(t)
                    : e.futimes(n, r, i, function (t) {
                        e.close(n, function (e) {
                          o && o(t || e);
                        });
                      });
                });
              }),
              (e.lutimesSync = function (t, r, i) {
                var o,
                  s = e.openSync(t, n.O_SYMLINK),
                  a = !0;
                try {
                  ((o = e.futimesSync(s, r, i)), (a = !1));
                } finally {
                  if (a)
                    try {
                      e.closeSync(s);
                    } catch (e) {}
                  else e.closeSync(s);
                }
                return o;
              }))
            : e.futimes &&
              ((e.lutimes = function (e, t, r, n) {
                n && process.nextTick(n);
              }),
              (e.lutimesSync = function () {}));
        })(e),
      (e.chown = i(e.chown)),
      (e.fchown = i(e.fchown)),
      (e.lchown = i(e.lchown)),
      (e.chmod = t(e.chmod)),
      (e.fchmod = t(e.fchmod)),
      (e.lchmod = t(e.lchmod)),
      (e.chownSync = o(e.chownSync)),
      (e.fchownSync = o(e.fchownSync)),
      (e.lchownSync = o(e.lchownSync)),
      (e.chmodSync = r(e.chmodSync)),
      (e.fchmodSync = r(e.fchmodSync)),
      (e.lchmodSync = r(e.lchmodSync)),
      (e.stat = a(e.stat)),
      (e.fstat = a(e.fstat)),
      (e.lstat = a(e.lstat)),
      (e.statSync = c(e.statSync)),
      (e.fstatSync = c(e.fstatSync)),
      (e.lstatSync = c(e.lstatSync)),
      e.chmod &&
        !e.lchmod &&
        ((e.lchmod = function (e, t, r) {
          r && process.nextTick(r);
        }),
        (e.lchmodSync = function () {})),
      e.chown &&
        !e.lchown &&
        ((e.lchown = function (e, t, r, n) {
          n && process.nextTick(n);
        }),
        (e.lchownSync = function () {})),
      "win32" === s &&
        (e.rename =
          "function" != typeof e.rename
            ? e.rename
            : (function (t) {
                function r(r, n, i) {
                  var o = Date.now(),
                    s = 0;
                  t(r, n, function a(c) {
                    if (
                      c &&
                      ("EACCES" === c.code || "EPERM" === c.code || "EBUSY" === c.code) &&
                      Date.now() - o < 6e4
                    )
                      return (
                        setTimeout(function () {
                          e.stat(n, function (e, o) {
                            e && "ENOENT" === e.code ? t(r, n, a) : i(c);
                          });
                        }, s),
                        void (s < 100 && (s += 10))
                      );
                    i && i(c);
                  });
                }
                return (Object.setPrototypeOf && Object.setPrototypeOf(r, t), r);
              })(e.rename)),
      (e.read =
        "function" != typeof e.read
          ? e.read
          : (function (t) {
              function r(r, n, i, o, s, a) {
                var c;
                if (a && "function" == typeof a) {
                  var l = 0;
                  c = function (u, p, d) {
                    if (u && "EAGAIN" === u.code && l < 10)
                      return (l++, t.call(e, r, n, i, o, s, c));
                    a.apply(this, arguments);
                  };
                }
                return t.call(e, r, n, i, o, s, c);
              }
              return (Object.setPrototypeOf && Object.setPrototypeOf(r, t), r);
            })(e.read)),
      (e.readSync =
        "function" != typeof e.readSync
          ? e.readSync
          : ((u = e.readSync),
            function (t, r, n, i, o) {
              for (var s = 0; ;)
                try {
                  return u.call(e, t, r, n, i, o);
                } catch (e) {
                  if ("EAGAIN" === e.code && s < 10) {
                    s++;
                    continue;
                  }
                  throw e;
                }
            })));
  };
};
