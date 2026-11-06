module.exports = (e, t, r) => {
  var n,
    i,
    o = r(79896),
    s = r(17783),
    a = r(57036),
    c = r(90734),
    l = r(39023);
  function u(e, t) {
    Object.defineProperty(e, n, {
      get: function () {
        return t;
      },
    });
  }
  "function" == typeof Symbol && "function" == typeof Symbol.for
    ? ((n = Symbol.for("graceful-fs.queue")), (i = Symbol.for("graceful-fs.previous")))
    : ((n = "___graceful-fs.queue"), (i = "___graceful-fs.previous"));
  var p,
    d = function () {};
  if (
    (l.debuglog
      ? (d = l.debuglog("gfs4"))
      : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") &&
        (d = function () {
          var e = l.format.apply(l, arguments);
          ((e = "GFS4: " + e.split(/\n/).join("\nGFS4: ")), console.error(e));
        }),
    !o[n])
  ) {
    var f = global[n] || [];
    (u(o, f),
      (o.close = (function (e) {
        function t(t, r) {
          return e.call(o, t, function (e) {
            (e || g(), "function" == typeof r && r.apply(this, arguments));
          });
        }
        return (Object.defineProperty(t, i, { value: e }), t);
      })(o.close)),
      (o.closeSync = (function (e) {
        function t(t) {
          (e.apply(o, arguments), g());
        }
        return (Object.defineProperty(t, i, { value: e }), t);
      })(o.closeSync)),
      /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") &&
        process.on("exit", function () {
          (d(o[n]), r(42613).equal(o[n].length, 0));
        }));
  }
  function h(e) {
    (s(e),
      (e.gracefulify = h),
      (e.createReadStream = function (t, r) {
        return new e.ReadStream(t, r);
      }),
      (e.createWriteStream = function (t, r) {
        return new e.WriteStream(t, r);
      }));
    var t = e.readFile;
    e.readFile = function (e, r, n) {
      return (
        "function" == typeof r && ((n = r), (r = null)),
        (function e(r, n, i, o) {
          return t(r, n, function (t) {
            !t || ("EMFILE" !== t.code && "ENFILE" !== t.code)
              ? "function" == typeof i && i.apply(this, arguments)
              : m([e, [r, n, i], t, o || Date.now(), Date.now()]);
          });
        })(e, r, n)
      );
    };
    var r = e.writeFile;
    e.writeFile = function (e, t, n, i) {
      return (
        "function" == typeof n && ((i = n), (n = null)),
        (function e(t, n, i, o, s) {
          return r(t, n, i, function (r) {
            !r || ("EMFILE" !== r.code && "ENFILE" !== r.code)
              ? "function" == typeof o && o.apply(this, arguments)
              : m([e, [t, n, i, o], r, s || Date.now(), Date.now()]);
          });
        })(e, t, n, i)
      );
    };
    var n = e.appendFile;
    n &&
      (e.appendFile = function (e, t, r, i) {
        return (
          "function" == typeof r && ((i = r), (r = null)),
          (function e(t, r, i, o, s) {
            return n(t, r, i, function (n) {
              !n || ("EMFILE" !== n.code && "ENFILE" !== n.code)
                ? "function" == typeof o && o.apply(this, arguments)
                : m([e, [t, r, i, o], n, s || Date.now(), Date.now()]);
            });
          })(e, t, r, i)
        );
      });
    var i = e.copyFile;
    i &&
      (e.copyFile = function (e, t, r, n) {
        return (
          "function" == typeof r && ((n = r), (r = 0)),
          (function e(t, r, n, o, s) {
            return i(t, r, n, function (i) {
              !i || ("EMFILE" !== i.code && "ENFILE" !== i.code)
                ? "function" == typeof o && o.apply(this, arguments)
                : m([e, [t, r, n, o], i, s || Date.now(), Date.now()]);
            });
          })(e, t, r, n)
        );
      });
    var o = e.readdir;
    e.readdir = function (e, t, r) {
      "function" == typeof t && ((r = t), (t = null));
      var n = c.test(process.version)
        ? function (e, t, r, n) {
            return o(e, i(e, t, r, n));
          }
        : function (e, t, r, n) {
            return o(e, t, i(e, t, r, n));
          };
      return n(e, t, r);
      function i(e, t, r, i) {
        return function (o, s) {
          !o || ("EMFILE" !== o.code && "ENFILE" !== o.code)
            ? (s && s.sort && s.sort(), "function" == typeof r && r.call(this, o, s))
            : m([n, [e, t, r], o, i || Date.now(), Date.now()]);
        };
      }
    };
    var c = /^v[0-5]\./;
    if ("v0.8" === process.version.substr(0, 4)) {
      var l = a(e);
      ((g = l.ReadStream), (v = l.WriteStream));
    }
    var u = e.ReadStream;
    u &&
      ((g.prototype = Object.create(u.prototype)),
      (g.prototype.open = function () {
        var e = this;
        w(e.path, e.flags, e.mode, function (t, r) {
          t
            ? (e.autoClose && e.destroy(), e.emit("error", t))
            : ((e.fd = r), e.emit("open", r), e.read());
        });
      }));
    var p = e.WriteStream;
    (p &&
      ((v.prototype = Object.create(p.prototype)),
      (v.prototype.open = function () {
        var e = this;
        w(e.path, e.flags, e.mode, function (t, r) {
          t ? (e.destroy(), e.emit("error", t)) : ((e.fd = r), e.emit("open", r));
        });
      })),
      Object.defineProperty(e, "ReadStream", {
        get: function () {
          return g;
        },
        set: function (e) {
          g = e;
        },
        enumerable: !0,
        configurable: !0,
      }),
      Object.defineProperty(e, "WriteStream", {
        get: function () {
          return v;
        },
        set: function (e) {
          v = e;
        },
        enumerable: !0,
        configurable: !0,
      }));
    var d = g;
    Object.defineProperty(e, "FileReadStream", {
      get: function () {
        return d;
      },
      set: function (e) {
        d = e;
      },
      enumerable: !0,
      configurable: !0,
    });
    var f = v;
    function g(e, t) {
      return this instanceof g
        ? (u.apply(this, arguments), this)
        : g.apply(Object.create(g.prototype), arguments);
    }
    function v(e, t) {
      return this instanceof v
        ? (p.apply(this, arguments), this)
        : v.apply(Object.create(v.prototype), arguments);
    }
    Object.defineProperty(e, "FileWriteStream", {
      get: function () {
        return f;
      },
      set: function (e) {
        f = e;
      },
      enumerable: !0,
      configurable: !0,
    });
    var y = e.open;
    function w(e, t, r, n) {
      return (
        "function" == typeof r && ((n = r), (r = null)),
        (function e(t, r, n, i, o) {
          return y(t, r, n, function (s, a) {
            !s || ("EMFILE" !== s.code && "ENFILE" !== s.code)
              ? "function" == typeof i && i.apply(this, arguments)
              : m([e, [t, r, n, i], s, o || Date.now(), Date.now()]);
          });
        })(e, t, r, n)
      );
    }
    return ((e.open = w), e);
  }
  function m(e) {
    (d("ENQUEUE", e[0].name, e[1]), o[n].push(e), v());
  }
  function g() {
    for (var e = Date.now(), t = 0; t < o[n].length; ++t)
      o[n][t].length > 2 && ((o[n][t][3] = e), (o[n][t][4] = e));
    v();
  }
  function v() {
    if ((clearTimeout(p), (p = void 0), 0 !== o[n].length)) {
      var e = o[n].shift(),
        t = e[0],
        r = e[1],
        i = e[2],
        s = e[3],
        a = e[4];
      if (void 0 === s) (d("RETRY", t.name, r), t.apply(null, r));
      else if (Date.now() - s >= 6e4) {
        d("TIMEOUT", t.name, r);
        var c = r.pop();
        "function" == typeof c && c.call(null, i);
      } else {
        var l = Date.now() - a,
          u = Math.max(a - s, 1);
        l >= Math.min(1.2 * u, 100)
          ? (d("RETRY", t.name, r), t.apply(null, r.concat([s])))
          : o[n].push(e);
      }
      void 0 === p && (p = setTimeout(v, 0));
    }
  }
  (global[n] || u(global, o[n]),
    (e.exports = h(c(o))),
    process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH &&
      !o.__patched &&
      ((e.exports = h(o)), (o.__patched = !0)));
};
