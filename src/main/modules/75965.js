module.exports = (e, t, r) => {
  e = r.nmd(e);
  var n = "__lodash_hash_undefined__",
    i = 9007199254740991,
    o = "[object Arguments]",
    s = "[object Array]",
    a = "[object Boolean]",
    c = "[object Date]",
    l = "[object Error]",
    u = "[object Function]",
    p = "[object Map]",
    d = "[object Number]",
    f = "[object Object]",
    h = "[object Promise]",
    m = "[object RegExp]",
    g = "[object Set]",
    v = "[object String]",
    y = "[object WeakMap]",
    w = "[object ArrayBuffer]",
    b = "[object DataView]",
    x = /^\[object .+?Constructor\]$/,
    E = /^(?:0|[1-9]\d*)$/,
    _ = {};
  ((_["[object Float32Array]"] =
    _["[object Float64Array]"] =
    _["[object Int8Array]"] =
    _["[object Int16Array]"] =
    _["[object Int32Array]"] =
    _["[object Uint8Array]"] =
    _["[object Uint8ClampedArray]"] =
    _["[object Uint16Array]"] =
    _["[object Uint32Array]"] =
      !0),
    (_[o] =
      _[s] =
      _[w] =
      _[a] =
      _[b] =
      _[c] =
      _[l] =
      _[u] =
      _[p] =
      _[d] =
      _[f] =
      _[m] =
      _[g] =
      _[v] =
      _[y] =
        !1));
  var S = "object" == typeof global && global && global.Object === Object && global,
    I = "object" == typeof self && self && self.Object === Object && self,
    $ = S || I || Function("return this")(),
    O = t && !t.nodeType && t,
    R = O && e && !e.nodeType && e,
    P = R && R.exports === O,
    A = P && S.process,
    T = (function () {
      try {
        return A && A.binding && A.binding("util");
      } catch (e) {}
    })(),
    k = T && T.isTypedArray;
  function N(e, t) {
    for (var r = -1, n = null == e ? 0 : e.length; ++r < n;) if (t(e[r], r, e)) return !0;
    return !1;
  }
  function C(e) {
    var t = -1,
      r = Array(e.size);
    return (
      e.forEach(function (e, n) {
        r[++t] = [n, e];
      }),
      r
    );
  }
  function L(e) {
    var t = -1,
      r = Array(e.size);
    return (
      e.forEach(function (e) {
        r[++t] = e;
      }),
      r
    );
  }
  var D,
    j,
    U,
    M = Array.prototype,
    F = Function.prototype,
    z = Object.prototype,
    B = $["__core-js_shared__"],
    q = F.toString,
    V = z.hasOwnProperty,
    G = (D = /[^.]+$/.exec((B && B.keys && B.keys.IE_PROTO) || "")) ? "Symbol(src)_1." + D : "",
    H = z.toString,
    W = RegExp(
      "^" +
        q
          .call(V)
          .replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")
          .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") +
        "$",
    ),
    K = P ? $.Buffer : void 0,
    X = $.Symbol,
    Y = $.Uint8Array,
    J = z.propertyIsEnumerable,
    Q = M.splice,
    Z = X ? X.toStringTag : void 0,
    ee = Object.getOwnPropertySymbols,
    te = K ? K.isBuffer : void 0,
    re =
      ((j = Object.keys),
      (U = Object),
      function (e) {
        return j(U(e));
      }),
    ne = Re($, "DataView"),
    ie = Re($, "Map"),
    oe = Re($, "Promise"),
    se = Re($, "Set"),
    ae = Re($, "WeakMap"),
    ce = Re(Object, "create"),
    le = ke(ne),
    ue = ke(ie),
    pe = ke(oe),
    de = ke(se),
    fe = ke(ae),
    he = X ? X.prototype : void 0,
    me = he ? he.valueOf : void 0;
  function ge(e) {
    var t = -1,
      r = null == e ? 0 : e.length;
    for (this.clear(); ++t < r;) {
      var n = e[t];
      this.set(n[0], n[1]);
    }
  }
  function ve(e) {
    var t = -1,
      r = null == e ? 0 : e.length;
    for (this.clear(); ++t < r;) {
      var n = e[t];
      this.set(n[0], n[1]);
    }
  }
  function ye(e) {
    var t = -1,
      r = null == e ? 0 : e.length;
    for (this.clear(); ++t < r;) {
      var n = e[t];
      this.set(n[0], n[1]);
    }
  }
  function we(e) {
    var t = -1,
      r = null == e ? 0 : e.length;
    for (this.__data__ = new ye(); ++t < r;) this.add(e[t]);
  }
  function be(e) {
    var t = (this.__data__ = new ve(e));
    this.size = t.size;
  }
  function xe(e, t) {
    for (var r = e.length; r--;) if (Ne(e[r][0], t)) return r;
    return -1;
  }
  function Ee(e) {
    return null == e
      ? void 0 === e
        ? "[object Undefined]"
        : "[object Null]"
      : Z && Z in Object(e)
        ? (function (e) {
            var t = V.call(e, Z),
              r = e[Z];
            try {
              e[Z] = void 0;
              var n = !0;
            } catch (e) {}
            var i = H.call(e);
            return (n && (t ? (e[Z] = r) : delete e[Z]), i);
          })(e)
        : (function (e) {
            return H.call(e);
          })(e);
  }
  function _e(e) {
    return Fe(e) && Ee(e) == o;
  }
  function Se(e, t, r, n, i) {
    return (
      e === t ||
      (null == e || null == t || (!Fe(e) && !Fe(t))
        ? e != e && t != t
        : (function (e, t, r, n, i, u) {
            var h = Le(e),
              y = Le(t),
              x = h ? s : Ae(e),
              E = y ? s : Ae(t),
              _ = (x = x == o ? f : x) == f,
              S = (E = E == o ? f : E) == f,
              I = x == E;
            if (I && De(e)) {
              if (!De(t)) return !1;
              ((h = !0), (_ = !1));
            }
            if (I && !_)
              return (
                u || (u = new be()),
                h || ze(e)
                  ? Ie(e, t, r, n, i, u)
                  : (function (e, t, r, n, i, o, s) {
                      switch (r) {
                        case b:
                          if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset)
                            return !1;
                          ((e = e.buffer), (t = t.buffer));
                        case w:
                          return !(e.byteLength != t.byteLength || !o(new Y(e), new Y(t)));
                        case a:
                        case c:
                        case d:
                          return Ne(+e, +t);
                        case l:
                          return e.name == t.name && e.message == t.message;
                        case m:
                        case v:
                          return e == t + "";
                        case p:
                          var u = C;
                        case g:
                          var f = 1 & n;
                          if ((u || (u = L), e.size != t.size && !f)) return !1;
                          var h = s.get(e);
                          if (h) return h == t;
                          ((n |= 2), s.set(e, t));
                          var y = Ie(u(e), u(t), n, i, o, s);
                          return (s.delete(e), y);
                        case "[object Symbol]":
                          if (me) return me.call(e) == me.call(t);
                      }
                      return !1;
                    })(e, t, x, r, n, i, u)
              );
            if (!(1 & r)) {
              var $ = _ && V.call(e, "__wrapped__"),
                O = S && V.call(t, "__wrapped__");
              if ($ || O) {
                var R = $ ? e.value() : e,
                  P = O ? t.value() : t;
                return (u || (u = new be()), i(R, P, r, n, u));
              }
            }
            return (
              !!I &&
              (u || (u = new be()),
              (function (e, t, r, n, i, o) {
                var s = 1 & r,
                  a = $e(e),
                  c = a.length;
                if (c != $e(t).length && !s) return !1;
                for (var l = c; l--;) {
                  var u = a[l];
                  if (!(s ? u in t : V.call(t, u))) return !1;
                }
                var p = o.get(e);
                if (p && o.get(t)) return p == t;
                var d = !0;
                (o.set(e, t), o.set(t, e));
                for (var f = s; ++l < c;) {
                  var h = e[(u = a[l])],
                    m = t[u];
                  if (n) var g = s ? n(m, h, u, t, e, o) : n(h, m, u, e, t, o);
                  if (!(void 0 === g ? h === m || i(h, m, r, n, o) : g)) {
                    d = !1;
                    break;
                  }
                  f || (f = "constructor" == u);
                }
                if (d && !f) {
                  var v = e.constructor,
                    y = t.constructor;
                  v == y ||
                    !("constructor" in e) ||
                    !("constructor" in t) ||
                    ("function" == typeof v &&
                      v instanceof v &&
                      "function" == typeof y &&
                      y instanceof y) ||
                    (d = !1);
                }
                return (o.delete(e), o.delete(t), d);
              })(e, t, r, n, i, u))
            );
          })(e, t, r, n, Se, i))
    );
  }
  function Ie(e, t, r, n, i, o) {
    var s = 1 & r,
      a = e.length,
      c = t.length;
    if (a != c && !(s && c > a)) return !1;
    var l = o.get(e);
    if (l && o.get(t)) return l == t;
    var u = -1,
      p = !0,
      d = 2 & r ? new we() : void 0;
    for (o.set(e, t), o.set(t, e); ++u < a;) {
      var f = e[u],
        h = t[u];
      if (n) var m = s ? n(h, f, u, t, e, o) : n(f, h, u, e, t, o);
      if (void 0 !== m) {
        if (m) continue;
        p = !1;
        break;
      }
      if (d) {
        if (
          !N(t, function (e, t) {
            if (((s = t), !d.has(s) && (f === e || i(f, e, r, n, o)))) return d.push(t);
            var s;
          })
        ) {
          p = !1;
          break;
        }
      } else if (f !== h && !i(f, h, r, n, o)) {
        p = !1;
        break;
      }
    }
    return (o.delete(e), o.delete(t), p);
  }
  function $e(e) {
    return (function (e, t, r) {
      var n = t(e);
      return Le(e)
        ? n
        : (function (e, t) {
            for (var r = -1, n = t.length, i = e.length; ++r < n;) e[i + r] = t[r];
            return e;
          })(n, r(e));
    })(e, Be, Pe);
  }
  function Oe(e, t) {
    var r,
      n,
      i = e.__data__;
    return (
      "string" == (n = typeof (r = t)) || "number" == n || "symbol" == n || "boolean" == n
        ? "__proto__" !== r
        : null === r
    )
      ? i["string" == typeof t ? "string" : "hash"]
      : i.map;
  }
  function Re(e, t) {
    var r = (function (e, t) {
      return null == e ? void 0 : e[t];
    })(e, t);
    return (function (e) {
      return (
        !(
          !Me(e) ||
          (function (e) {
            return !!G && G in e;
          })(e)
        ) && (je(e) ? W : x).test(ke(e))
      );
    })(r)
      ? r
      : void 0;
  }
  ((ge.prototype.clear = function () {
    ((this.__data__ = ce ? ce(null) : {}), (this.size = 0));
  }),
    (ge.prototype.delete = function (e) {
      var t = this.has(e) && delete this.__data__[e];
      return ((this.size -= t ? 1 : 0), t);
    }),
    (ge.prototype.get = function (e) {
      var t = this.__data__;
      if (ce) {
        var r = t[e];
        return r === n ? void 0 : r;
      }
      return V.call(t, e) ? t[e] : void 0;
    }),
    (ge.prototype.has = function (e) {
      var t = this.__data__;
      return ce ? void 0 !== t[e] : V.call(t, e);
    }),
    (ge.prototype.set = function (e, t) {
      var r = this.__data__;
      return ((this.size += this.has(e) ? 0 : 1), (r[e] = ce && void 0 === t ? n : t), this);
    }),
    (ve.prototype.clear = function () {
      ((this.__data__ = []), (this.size = 0));
    }),
    (ve.prototype.delete = function (e) {
      var t = this.__data__,
        r = xe(t, e);
      return !(r < 0 || (r == t.length - 1 ? t.pop() : Q.call(t, r, 1), --this.size, 0));
    }),
    (ve.prototype.get = function (e) {
      var t = this.__data__,
        r = xe(t, e);
      return r < 0 ? void 0 : t[r][1];
    }),
    (ve.prototype.has = function (e) {
      return xe(this.__data__, e) > -1;
    }),
    (ve.prototype.set = function (e, t) {
      var r = this.__data__,
        n = xe(r, e);
      return (n < 0 ? (++this.size, r.push([e, t])) : (r[n][1] = t), this);
    }),
    (ye.prototype.clear = function () {
      ((this.size = 0),
        (this.__data__ = { hash: new ge(), map: new (ie || ve)(), string: new ge() }));
    }),
    (ye.prototype.delete = function (e) {
      var t = Oe(this, e).delete(e);
      return ((this.size -= t ? 1 : 0), t);
    }),
    (ye.prototype.get = function (e) {
      return Oe(this, e).get(e);
    }),
    (ye.prototype.has = function (e) {
      return Oe(this, e).has(e);
    }),
    (ye.prototype.set = function (e, t) {
      var r = Oe(this, e),
        n = r.size;
      return (r.set(e, t), (this.size += r.size == n ? 0 : 1), this);
    }),
    (we.prototype.add = we.prototype.push =
      function (e) {
        return (this.__data__.set(e, n), this);
      }),
    (we.prototype.has = function (e) {
      return this.__data__.has(e);
    }),
    (be.prototype.clear = function () {
      ((this.__data__ = new ve()), (this.size = 0));
    }),
    (be.prototype.delete = function (e) {
      var t = this.__data__,
        r = t.delete(e);
      return ((this.size = t.size), r);
    }),
    (be.prototype.get = function (e) {
      return this.__data__.get(e);
    }),
    (be.prototype.has = function (e) {
      return this.__data__.has(e);
    }),
    (be.prototype.set = function (e, t) {
      var r = this.__data__;
      if (r instanceof ve) {
        var n = r.__data__;
        if (!ie || n.length < 199) return (n.push([e, t]), (this.size = ++r.size), this);
        r = this.__data__ = new ye(n);
      }
      return (r.set(e, t), (this.size = r.size), this);
    }));
  var Pe = ee
      ? function (e) {
          return null == e
            ? []
            : ((e = Object(e)),
              (function (t) {
                for (var r = -1, n = null == t ? 0 : t.length, i = 0, o = []; ++r < n;) {
                  var s = t[r];
                  ((a = s), J.call(e, a) && (o[i++] = s));
                }
                var a;
                return o;
              })(ee(e)));
        }
      : function () {
          return [];
        },
    Ae = Ee;
  function Te(e, t) {
    return (
      !!(t = null == t ? i : t) &&
      ("number" == typeof e || E.test(e)) &&
      e > -1 &&
      e % 1 == 0 &&
      e < t
    );
  }
  function ke(e) {
    if (null != e) {
      try {
        return q.call(e);
      } catch (e) {}
      try {
        return e + "";
      } catch (e) {}
    }
    return "";
  }
  function Ne(e, t) {
    return e === t || (e != e && t != t);
  }
  ((ne && Ae(new ne(new ArrayBuffer(1))) != b) ||
    (ie && Ae(new ie()) != p) ||
    (oe && Ae(oe.resolve()) != h) ||
    (se && Ae(new se()) != g) ||
    (ae && Ae(new ae()) != y)) &&
    (Ae = function (e) {
      var t = Ee(e),
        r = t == f ? e.constructor : void 0,
        n = r ? ke(r) : "";
      if (n)
        switch (n) {
          case le:
            return b;
          case ue:
            return p;
          case pe:
            return h;
          case de:
            return g;
          case fe:
            return y;
        }
      return t;
    });
  var Ce = _e(
      (function () {
        return arguments;
      })(),
    )
      ? _e
      : function (e) {
          return Fe(e) && V.call(e, "callee") && !J.call(e, "callee");
        },
    Le = Array.isArray,
    De =
      te ||
      function () {
        return !1;
      };
  function je(e) {
    if (!Me(e)) return !1;
    var t = Ee(e);
    return (
      t == u ||
      "[object GeneratorFunction]" == t ||
      "[object AsyncFunction]" == t ||
      "[object Proxy]" == t
    );
  }
  function Ue(e) {
    return "number" == typeof e && e > -1 && e % 1 == 0 && e <= i;
  }
  function Me(e) {
    var t = typeof e;
    return null != e && ("object" == t || "function" == t);
  }
  function Fe(e) {
    return null != e && "object" == typeof e;
  }
  var ze = k
    ? (function (e) {
        return function (t) {
          return e(t);
        };
      })(k)
    : function (e) {
        return Fe(e) && Ue(e.length) && !!_[Ee(e)];
      };
  function Be(e) {
    return null != (t = e) && Ue(t.length) && !je(t)
      ? (function (e, t) {
          var r = Le(e),
            n = !r && Ce(e),
            i = !r && !n && De(e),
            o = !r && !n && !i && ze(e),
            s = r || n || i || o,
            a = s
              ? (function (e, t) {
                  for (var r = -1, n = Array(e); ++r < e;) n[r] = t(r);
                  return n;
                })(e.length, String)
              : [],
            c = a.length;
          for (var l in e)
            (!t && !V.call(e, l)) ||
              (s &&
                ("length" == l ||
                  (i && ("offset" == l || "parent" == l)) ||
                  (o && ("buffer" == l || "byteLength" == l || "byteOffset" == l)) ||
                  Te(l, c))) ||
              a.push(l);
          return a;
        })(e)
      : (function (e) {
          if (
            ((r = (t = e) && t.constructor), t !== (("function" == typeof r && r.prototype) || z))
          )
            return re(e);
          var t,
            r,
            n = [];
          for (var i in Object(e)) V.call(e, i) && "constructor" != i && n.push(i);
          return n;
        })(e);
    var t;
  }
  e.exports = function (e, t) {
    return Se(e, t);
  };
};
