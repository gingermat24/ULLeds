module.exports = (e, t, r) => {
  "use strict";
  const n = r(6158),
    i = r(16928),
    o = r(42613),
    s = "win32" === process.platform;
  function a(e) {
    (["unlink", "chmod", "stat", "lstat", "rmdir", "readdir"].forEach((t) => {
      ((e[t] = e[t] || n[t]), (e[(t += "Sync")] = e[t] || n[t]));
    }),
      (e.maxBusyTries = e.maxBusyTries || 3));
  }
  function c(e, t, r) {
    let n = 0;
    ("function" == typeof t && ((r = t), (t = {})),
      o(e, "rimraf: missing path"),
      o.strictEqual(typeof e, "string", "rimraf: path should be a string"),
      o.strictEqual(typeof r, "function", "rimraf: callback function required"),
      o(t, "rimraf: invalid options argument provided"),
      o.strictEqual(typeof t, "object", "rimraf: options should be object"),
      a(t),
      l(e, t, function i(o) {
        if (o) {
          if (
            ("EBUSY" === o.code || "ENOTEMPTY" === o.code || "EPERM" === o.code) &&
            n < t.maxBusyTries
          )
            return (n++, setTimeout(() => l(e, t, i), 100 * n));
          "ENOENT" === o.code && (o = null);
        }
        r(o);
      }));
  }
  function l(e, t, r) {
    (o(e),
      o(t),
      o("function" == typeof r),
      t.lstat(e, (n, i) =>
        n && "ENOENT" === n.code
          ? r(null)
          : n && "EPERM" === n.code && s
            ? u(e, t, n, r)
            : i && i.isDirectory()
              ? d(e, t, n, r)
              : void t.unlink(e, (n) => {
                  if (n) {
                    if ("ENOENT" === n.code) return r(null);
                    if ("EPERM" === n.code) return s ? u(e, t, n, r) : d(e, t, n, r);
                    if ("EISDIR" === n.code) return d(e, t, n, r);
                  }
                  return r(n);
                }),
      ));
  }
  function u(e, t, r, n) {
    (o(e),
      o(t),
      o("function" == typeof n),
      t.chmod(e, 438, (i) => {
        i
          ? n("ENOENT" === i.code ? null : r)
          : t.stat(e, (i, o) => {
              i
                ? n("ENOENT" === i.code ? null : r)
                : o.isDirectory()
                  ? d(e, t, r, n)
                  : t.unlink(e, n);
            });
      }));
  }
  function p(e, t, r) {
    let n;
    (o(e), o(t));
    try {
      t.chmodSync(e, 438);
    } catch (e) {
      if ("ENOENT" === e.code) return;
      throw r;
    }
    try {
      n = t.statSync(e);
    } catch (e) {
      if ("ENOENT" === e.code) return;
      throw r;
    }
    n.isDirectory() ? h(e, t, r) : t.unlinkSync(e);
  }
  function d(e, t, r, n) {
    (o(e),
      o(t),
      o("function" == typeof n),
      t.rmdir(e, (s) => {
        !s || ("ENOTEMPTY" !== s.code && "EEXIST" !== s.code && "EPERM" !== s.code)
          ? s && "ENOTDIR" === s.code
            ? n(r)
            : n(s)
          : (function (e, t, r) {
              (o(e),
                o(t),
                o("function" == typeof r),
                t.readdir(e, (n, o) => {
                  if (n) return r(n);
                  let s,
                    a = o.length;
                  if (0 === a) return t.rmdir(e, r);
                  o.forEach((n) => {
                    c(i.join(e, n), t, (n) => {
                      if (!s) return n ? r((s = n)) : void (0 == --a && t.rmdir(e, r));
                    });
                  });
                }));
            })(e, t, n);
      }));
  }
  function f(e, t) {
    let r;
    (a((t = t || {})),
      o(e, "rimraf: missing path"),
      o.strictEqual(typeof e, "string", "rimraf: path should be a string"),
      o(t, "rimraf: missing options"),
      o.strictEqual(typeof t, "object", "rimraf: options should be object"));
    try {
      r = t.lstatSync(e);
    } catch (r) {
      if ("ENOENT" === r.code) return;
      "EPERM" === r.code && s && p(e, t, r);
    }
    try {
      r && r.isDirectory() ? h(e, t, null) : t.unlinkSync(e);
    } catch (r) {
      if ("ENOENT" === r.code) return;
      if ("EPERM" === r.code) return s ? p(e, t, r) : h(e, t, r);
      if ("EISDIR" !== r.code) throw r;
      h(e, t, r);
    }
  }
  function h(e, t, r) {
    (o(e), o(t));
    try {
      t.rmdirSync(e);
    } catch (n) {
      if ("ENOTDIR" === n.code) throw r;
      if ("ENOTEMPTY" === n.code || "EEXIST" === n.code || "EPERM" === n.code)
        !(function (e, t) {
          if ((o(e), o(t), t.readdirSync(e).forEach((r) => f(i.join(e, r), t)), !s))
            return t.rmdirSync(e, t);
          {
            const r = Date.now();
            do {
              try {
                return t.rmdirSync(e, t);
              } catch {}
            } while (Date.now() - r < 500);
          }
        })(e, t);
      else if ("ENOENT" !== n.code) throw n;
    }
  }
  ((e.exports = c), (c.sync = f));
};
