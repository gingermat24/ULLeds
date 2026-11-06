module.exports = (e, t, r) => {
  e = r.nmd(e);
  var n = "__lodash_hash_undefined__",
    i = 9007199254740991,
    o = "[object Arguments]",
    s = "[object Boolean]",
    a = "[object Date]",
    c = "[object Function]",
    l = "[object GeneratorFunction]",
    u = "[object Map]",
    p = "[object Number]",
    d = "[object Object]",
    f = "[object Promise]",
    h = "[object RegExp]",
    m = "[object Set]",
    g = "[object String]",
    v = "[object Symbol]",
    y = "[object WeakMap]",
    w = "[object ArrayBuffer]",
    b = "[object DataView]",
    x = "[object Float32Array]",
    E = "[object Float64Array]",
    _ = "[object Int8Array]",
    S = "[object Int16Array]",
    I = "[object Int32Array]",
    $ = "[object Uint8Array]",
    O = "[object Uint8ClampedArray]",
    R = "[object Uint16Array]",
    P = "[object Uint32Array]",
    A = /\w*$/,
    T = /^\[object .+?Constructor\]$/,
    k = /^(?:0|[1-9]\d*)$/,
    N = {};
  ((N[o] =
    N["[object Array]"] =
    N[w] =
    N[b] =
    N[s] =
    N[a] =
    N[x] =
    N[E] =
    N[_] =
    N[S] =
    N[I] =
    N[u] =
    N[p] =
    N[d] =
    N[h] =
    N[m] =
    N[g] =
    N[v] =
    N[$] =
    N[O] =
    N[R] =
    N[P] =
      !0),
    (N["[object Error]"] = N[c] = N[y] = !1));
  var C = "object" == typeof global && global && global.Object === Object && global,
    L = "object" == typeof self && self && self.Object === Object && self,
    D = C || L || Function("return this")(),
    j = t && !t.nodeType && t,
    U = j && e && !e.nodeType && e,
    M = U && U.exports === j;
  function F(e, t) {
    return (e.set(t[0], t[1]), e);
  }
  function z(e, t) {
    return (e.add(t), e);
  }
  function B(e, t, r, n) {
    var i = -1,
      o = e ? e.length : 0;
    for (n && o && (r = e[++i]); ++i < o;) r = t(r, e[i], i, e);
    return r;
  }
  function q(e) {
    var t = !1;
    if (null != e && "function" != typeof e.toString)
      try {
        t = !!(e + "");
      } catch (e) {}
    return t;
  }
  function V(e) {
    var t = -1,
      r = Array(e.size);
    return (
      e.forEach(function (e, n) {
        r[++t] = [n, e];
      }),
      r
    );
  }
  function G(e, t) {
    return function (r) {
      return e(t(r));
    };
  }
  function H(e) {
    var t = -1,
      r = Array(e.size);
    return (
      e.forEach(function (e) {
        r[++t] = e;
      }),
      r
    );
  }
  var W,
    K = Array.prototype,
    X = Function.prototype,
    Y = Object.prototype,
    J = D["__core-js_shared__"],
    Q = (W = /[^.]+$/.exec((J && J.keys && J.keys.IE_PROTO) || "")) ? "Symbol(src)_1." + W : "",
    Z = X.toString,
    ee = Y.hasOwnProperty,
    te = Y.toString,
    re = RegExp(
      "^" +
        Z.call(ee)
          .replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")
          .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") +
        "$",
    ),
    ne = M ? D.Buffer : void 0,
    ie = D.Symbol,
    oe = D.Uint8Array,
    se = G(Object.getPrototypeOf, Object),
    ae = Object.create,
    ce = Y.propertyIsEnumerable,
    le = K.splice,
    ue = Object.getOwnPropertySymbols,
    pe = ne ? ne.isBuffer : void 0,
    de = G(Object.keys, Object),
    fe = De(D, "DataView"),
    he = De(D, "Map"),
    me = De(D, "Promise"),
    ge = De(D, "Set"),
    ve = De(D, "WeakMap"),
    ye = De(Object, "create"),
    we = ze(fe),
    be = ze(he),
    xe = ze(me),
    Ee = ze(ge),
    _e = ze(ve),
    Se = ie ? ie.prototype : void 0,
    Ie = Se ? Se.valueOf : void 0;
  function $e(e) {
    var t = -1,
      r = e ? e.length : 0;
    for (this.clear(); ++t < r;) {
      var n = e[t];
      this.set(n[0], n[1]);
    }
  }
  function Oe(e) {
    var t = -1,
      r = e ? e.length : 0;
    for (this.clear(); ++t < r;) {
      var n = e[t];
      this.set(n[0], n[1]);
    }
  }
  function Re(e) {
    var t = -1,
      r = e ? e.length : 0;
    for (this.clear(); ++t < r;) {
      var n = e[t];
      this.set(n[0], n[1]);
    }
  }
  function Pe(e) {
    this.__data__ = new Oe(e);
  }
  function Ae(e, t, r) {
    var n = e[t];
    (ee.call(e, t) && Be(n, r) && (void 0 !== r || t in e)) || (e[t] = r);
  }
  function Te(e, t) {
    for (var r = e.length; r--;) if (Be(e[r][0], t)) return r;
    return -1;
  }
  function ke(e, t, r, n, i, f, y) {
    var T;
    if ((n && (T = f ? n(e, i, f, y) : n(e)), void 0 !== T)) return T;
    if (!We(e)) return e;
    var k = qe(e);
    if (k) {
      if (
        ((T = (function (e) {
          var t = e.length,
            r = e.constructor(t);
          return (
            t &&
              "string" == typeof e[0] &&
              ee.call(e, "index") &&
              ((r.index = e.index), (r.input = e.input)),
            r
          );
        })(e)),
        !t)
      )
        return (function (e, t) {
          var r = -1,
            n = e.length;
          for (t || (t = Array(n)); ++r < n;) t[r] = e[r];
          return t;
        })(e, T);
    } else {
      var C = Ue(e),
        L = C == c || C == l;
      if (Ge(e))
        return (function (e, t) {
          if (t) return e.slice();
          var r = new e.constructor(e.length);
          return (e.copy(r), r);
        })(e, t);
      if (C == d || C == o || (L && !f)) {
        if (q(e)) return f ? e : {};
        if (
          ((T = (function (e) {
            return "function" != typeof e.constructor || Fe(e) ? {} : We((t = se(e))) ? ae(t) : {};
            var t;
          })(L ? {} : e)),
          !t)
        )
          return (function (e, t) {
            return Ce(e, je(e), t);
          })(
            e,
            (function (e, t) {
              return e && Ce(t, Ke(t), e);
            })(T, e),
          );
      } else {
        if (!N[C]) return f ? e : {};
        T = (function (e, t, r, n) {
          var i,
            o = e.constructor;
          switch (t) {
            case w:
              return Ne(e);
            case s:
            case a:
              return new o(+e);
            case b:
              return (function (e, t) {
                var r = t ? Ne(e.buffer) : e.buffer;
                return new e.constructor(r, e.byteOffset, e.byteLength);
              })(e, n);
            case x:
            case E:
            case _:
            case S:
            case I:
            case $:
            case O:
            case R:
            case P:
              return (function (e, t) {
                var r = t ? Ne(e.buffer) : e.buffer;
                return new e.constructor(r, e.byteOffset, e.length);
              })(e, n);
            case u:
              return (function (e, t, r) {
                return B(t ? r(V(e), !0) : V(e), F, new e.constructor());
              })(e, n, r);
            case p:
            case g:
              return new o(e);
            case h:
              return (function (e) {
                var t = new e.constructor(e.source, A.exec(e));
                return ((t.lastIndex = e.lastIndex), t);
              })(e);
            case m:
              return (function (e, t, r) {
                return B(t ? r(H(e), !0) : H(e), z, new e.constructor());
              })(e, n, r);
            case v:
              return ((i = e), Ie ? Object(Ie.call(i)) : {});
          }
        })(e, C, ke, t);
      }
    }
    y || (y = new Pe());
    var D = y.get(e);
    if (D) return D;
    if ((y.set(e, T), !k))
      var j = r
        ? (function (e) {
            return (function (e, t, r) {
              var n = t(e);
              return qe(e)
                ? n
                : (function (e, t) {
                    for (var r = -1, n = t.length, i = e.length; ++r < n;) e[i + r] = t[r];
                    return e;
                  })(n, r(e));
            })(e, Ke, je);
          })(e)
        : Ke(e);
    return (
      (function (e, t) {
        for (var r = -1, n = e ? e.length : 0; ++r < n && !1 !== t(e[r], r););
      })(j || e, function (i, o) {
        (j && (i = e[(o = i)]), Ae(T, o, ke(i, t, r, n, o, e, y)));
      }),
      T
    );
  }
  function Ne(e) {
    var t = new e.constructor(e.byteLength);
    return (new oe(t).set(new oe(e)), t);
  }
  function Ce(e, t, r, n) {
    r || (r = {});
    for (var i = -1, o = t.length; ++i < o;) {
      var s = t[i],
        a = n ? n(r[s], e[s], s, r, e) : void 0;
      Ae(r, s, void 0 === a ? e[s] : a);
    }
    return r;
  }
  function Le(e, t) {
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
  function De(e, t) {
    var r = (function (e, t) {
      return null == e ? void 0 : e[t];
    })(e, t);
    return (function (e) {
      return !(!We(e) || ((t = e), Q && Q in t)) && (He(e) || q(e) ? re : T).test(ze(e));
      var t;
    })(r)
      ? r
      : void 0;
  }
  (($e.prototype.clear = function () {
    this.__data__ = ye ? ye(null) : {};
  }),
    ($e.prototype.delete = function (e) {
      return this.has(e) && delete this.__data__[e];
    }),
    ($e.prototype.get = function (e) {
      var t = this.__data__;
      if (ye) {
        var r = t[e];
        return r === n ? void 0 : r;
      }
      return ee.call(t, e) ? t[e] : void 0;
    }),
    ($e.prototype.has = function (e) {
      var t = this.__data__;
      return ye ? void 0 !== t[e] : ee.call(t, e);
    }),
    ($e.prototype.set = function (e, t) {
      return ((this.__data__[e] = ye && void 0 === t ? n : t), this);
    }),
    (Oe.prototype.clear = function () {
      this.__data__ = [];
    }),
    (Oe.prototype.delete = function (e) {
      var t = this.__data__,
        r = Te(t, e);
      return !(r < 0 || (r == t.length - 1 ? t.pop() : le.call(t, r, 1), 0));
    }),
    (Oe.prototype.get = function (e) {
      var t = this.__data__,
        r = Te(t, e);
      return r < 0 ? void 0 : t[r][1];
    }),
    (Oe.prototype.has = function (e) {
      return Te(this.__data__, e) > -1;
    }),
    (Oe.prototype.set = function (e, t) {
      var r = this.__data__,
        n = Te(r, e);
      return (n < 0 ? r.push([e, t]) : (r[n][1] = t), this);
    }),
    (Re.prototype.clear = function () {
      this.__data__ = { hash: new $e(), map: new (he || Oe)(), string: new $e() };
    }),
    (Re.prototype.delete = function (e) {
      return Le(this, e).delete(e);
    }),
    (Re.prototype.get = function (e) {
      return Le(this, e).get(e);
    }),
    (Re.prototype.has = function (e) {
      return Le(this, e).has(e);
    }),
    (Re.prototype.set = function (e, t) {
      return (Le(this, e).set(e, t), this);
    }),
    (Pe.prototype.clear = function () {
      this.__data__ = new Oe();
    }),
    (Pe.prototype.delete = function (e) {
      return this.__data__.delete(e);
    }),
    (Pe.prototype.get = function (e) {
      return this.__data__.get(e);
    }),
    (Pe.prototype.has = function (e) {
      return this.__data__.has(e);
    }),
    (Pe.prototype.set = function (e, t) {
      var r = this.__data__;
      if (r instanceof Oe) {
        var n = r.__data__;
        if (!he || n.length < 199) return (n.push([e, t]), this);
        r = this.__data__ = new Re(n);
      }
      return (r.set(e, t), this);
    }));
  var je = ue
      ? G(ue, Object)
      : function () {
          return [];
        },
    Ue = function (e) {
      return te.call(e);
    };
  function Me(e, t) {
    return (
      !!(t = null == t ? i : t) &&
      ("number" == typeof e || k.test(e)) &&
      e > -1 &&
      e % 1 == 0 &&
      e < t
    );
  }
  function Fe(e) {
    var t = e && e.constructor;
    return e === (("function" == typeof t && t.prototype) || Y);
  }
  function ze(e) {
    if (null != e) {
      try {
        return Z.call(e);
      } catch (e) {}
      try {
        return e + "";
      } catch (e) {}
    }
    return "";
  }
  function Be(e, t) {
    return e === t || (e != e && t != t);
  }
  ((fe && Ue(new fe(new ArrayBuffer(1))) != b) ||
    (he && Ue(new he()) != u) ||
    (me && Ue(me.resolve()) != f) ||
    (ge && Ue(new ge()) != m) ||
    (ve && Ue(new ve()) != y)) &&
    (Ue = function (e) {
      var t = te.call(e),
        r = t == d ? e.constructor : void 0,
        n = r ? ze(r) : void 0;
      if (n)
        switch (n) {
          case we:
            return b;
          case be:
            return u;
          case xe:
            return f;
          case Ee:
            return m;
          case _e:
            return y;
        }
      return t;
    });
  var qe = Array.isArray;
  function Ve(e) {
    return (
      null != e &&
      (function (e) {
        return "number" == typeof e && e > -1 && e % 1 == 0 && e <= i;
      })(e.length) &&
      !He(e)
    );
  }
  var Ge =
    pe ||
    function () {
      return !1;
    };
  function He(e) {
    var t = We(e) ? te.call(e) : "";
    return t == c || t == l;
  }
  function We(e) {
    var t = typeof e;
    return !!e && ("object" == t || "function" == t);
  }
  function Ke(e) {
    return Ve(e)
      ? (function (e, t) {
          var r =
              qe(e) ||
              (function (e) {
                return (
                  (function (e) {
                    return (
                      (function (e) {
                        return !!e && "object" == typeof e;
                      })(e) && Ve(e)
                    );
                  })(e) &&
                  ee.call(e, "callee") &&
                  (!ce.call(e, "callee") || te.call(e) == o)
                );
              })(e)
                ? (function (e, t) {
                    for (var r = -1, n = Array(e); ++r < e;) n[r] = t(r);
                    return n;
                  })(e.length, String)
                : [],
            n = r.length,
            i = !!n;
          for (var s in e)
            (!t && !ee.call(e, s)) || (i && ("length" == s || Me(s, n))) || r.push(s);
          return r;
        })(e)
      : (function (e) {
          if (!Fe(e)) return de(e);
          var t = [];
          for (var r in Object(e)) ee.call(e, r) && "constructor" != r && t.push(r);
          return t;
        })(e);
  }
  e.exports = function (e) {
    return ke(e, !0, !0);
  };
};
