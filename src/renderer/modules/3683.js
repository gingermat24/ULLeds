module.exports = (e, t, n) => {
  var r = "__lodash_placeholder__",
    o = 1 / 0,
    i = 9007199254740991,
    a = [
      ["ary", 128],
      ["bind", 1],
      ["bindKey", 2],
      ["curry", 8],
      ["curryRight", 16],
      ["flip", 512],
      ["partial", 32],
      ["partialRight", 64],
      ["rearg", 256],
    ],
    s = /^\s+|\s+$/g,
    l = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,
    d = /\{\n\/\* \[wrapped with (.+)\] \*/,
    c = /,? & /,
    A = /^[-+]0x[0-9a-f]+$/i,
    u = /^0b[01]+$/i,
    p = /^\[object .+?Constructor\]$/,
    f = /^0o[0-7]+$/i,
    m = /^(?:0|[1-9]\d*)$/,
    b = parseInt,
    h = "object" == typeof n.g && n.g && n.g.Object === Object && n.g,
    g = "object" == typeof self && self && self.Object === Object && self,
    C = h || g || Function("return this")();
  function v(e, t, n) {
    switch (n.length) {
      case 0:
        return e.call(t);
      case 1:
        return e.call(t, n[0]);
      case 2:
        return e.call(t, n[0], n[1]);
      case 3:
        return e.call(t, n[0], n[1], n[2]);
    }
    return e.apply(t, n);
  }
  function y(e, t) {
    for (var n = -1, r = e ? e.length : 0; ++n < r && !1 !== t(e[n], n, e););
    return e;
  }
  function x(e, t) {
    for (var n = -1, r = t.length, o = e.length; ++n < r;) e[o + n] = t[n];
    return e;
  }
  function w(e) {
    return e != e;
  }
  function k(e, t) {
    for (var n = -1, o = e.length, i = 0, a = []; ++n < o;) {
      var s = e[n];
      (s !== t && s !== r) || ((e[n] = r), (a[i++] = n));
    }
    return a;
  }
  var B,
    $,
    E,
    _ = Function.prototype,
    S = Object.prototype,
    O = C["__core-js_shared__"],
    I = (B = /[^.]+$/.exec((O && O.keys && O.keys.IE_PROTO) || "")) ? "Symbol(src)_1." + B : "",
    R = _.toString,
    P = S.hasOwnProperty,
    D = S.toString,
    q = RegExp(
      "^" +
        R.call(P)
          .replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")
          .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") +
        "$",
    ),
    z = C.Symbol,
    M = Object.create,
    J = S.propertyIsEnumerable,
    F = z ? z.isConcatSpreadable : void 0,
    N = Math.max,
    L = Math.min,
    T = (($ = Q(Object, "defineProperty")), (E = Q.name) && E.length > 2 ? $ : void 0);
  function j(e, t, n, r, o) {
    var i = -1,
      a = e.length;
    for (n || (n = X), o || (o = []); ++i < a;) {
      var s = e[i];
      t > 0 && n(s) ? (t > 1 ? j(s, t - 1, n, r, o) : x(o, s)) : r || (o[o.length] = s);
    }
    return o;
  }
  function U(e, t) {
    return (
      (t = N(void 0 === t ? e.length - 1 : t, 0)),
      function () {
        for (var n = arguments, r = -1, o = N(n.length - t, 0), i = Array(o); ++r < o;)
          i[r] = n[t + r];
        r = -1;
        for (var a = Array(t + 1); ++r < t;) a[r] = n[r];
        return ((a[t] = i), v(e, this, a));
      }
    );
  }
  function G(e) {
    return function () {
      var t = arguments;
      switch (t.length) {
        case 0:
          return new e();
        case 1:
          return new e(t[0]);
        case 2:
          return new e(t[0], t[1]);
        case 3:
          return new e(t[0], t[1], t[2]);
        case 4:
          return new e(t[0], t[1], t[2], t[3]);
        case 5:
          return new e(t[0], t[1], t[2], t[3], t[4]);
        case 6:
          return new e(t[0], t[1], t[2], t[3], t[4], t[5]);
        case 7:
          return new e(t[0], t[1], t[2], t[3], t[4], t[5], t[6]);
      }
      var n,
        r = ie((n = e.prototype)) ? M(n) : {},
        o = e.apply(r, t);
      return ie(o) ? o : r;
    };
  }
  function W(e, t, n, r, o, i, a, s, l, d) {
    var c = 128 & t,
      A = 1 & t,
      u = 2 & t,
      p = 24 & t,
      f = 512 & t,
      m = u ? void 0 : G(e);
    return function b() {
      for (var h = arguments.length, g = Array(h), v = h; v--;) g[v] = arguments[v];
      if (p)
        var y = H(b),
          x = (function (e, t) {
            for (var n = e.length, r = 0; n--;) e[n] === t && r++;
            return r;
          })(g, y);
      if (
        (r &&
          (g = (function (e, t, n, r) {
            for (
              var o = -1,
                i = e.length,
                a = n.length,
                s = -1,
                l = t.length,
                d = N(i - a, 0),
                c = Array(l + d),
                A = !r;
              ++s < l;
            )
              c[s] = t[s];
            for (; ++o < a;) (A || o < i) && (c[n[o]] = e[o]);
            for (; d--;) c[s++] = e[o++];
            return c;
          })(g, r, o, p)),
        i &&
          (g = (function (e, t, n, r) {
            for (
              var o = -1,
                i = e.length,
                a = -1,
                s = n.length,
                l = -1,
                d = t.length,
                c = N(i - s, 0),
                A = Array(c + d),
                u = !r;
              ++o < c;
            )
              A[o] = e[o];
            for (var p = o; ++l < d;) A[p + l] = t[l];
            for (; ++a < s;) (u || o < i) && (A[p + n[a]] = e[o++]);
            return A;
          })(g, i, a, p)),
        (h -= x),
        p && h < d)
      ) {
        var w = k(g, y);
        return K(e, t, W, b.placeholder, n, g, w, s, l, d - h);
      }
      var B = A ? n : this,
        $ = u ? B[e] : e;
      return (
        (h = g.length),
        s
          ? (g = (function (e, t) {
              for (
                var n = e.length,
                  r = L(t.length, n),
                  o = (function (e, t) {
                    var n = -1,
                      r = e.length;
                    for (t || (t = Array(r)); ++n < r;) t[n] = e[n];
                    return t;
                  })(e);
                r--;
              ) {
                var i = t[r];
                e[r] = Z(i, n) ? o[i] : void 0;
              }
              return e;
            })(g, s))
          : f && h > 1 && g.reverse(),
        c && l < h && (g.length = l),
        this && this !== C && this instanceof b && ($ = m || G($)),
        $.apply(B, g)
      );
    };
  }
  function K(e, t, n, r, o, i, a, s, l, d) {
    var c = 8 & t;
    ((t |= c ? 32 : 64), 4 & (t &= ~(c ? 64 : 32)) || (t &= -4));
    var A = n(e, t, o, c ? i : void 0, c ? a : void 0, c ? void 0 : i, c ? void 0 : a, s, l, d);
    return ((A.placeholder = r), ee(A, e, t));
  }
  function H(e) {
    return e.placeholder;
  }
  function Q(e, t) {
    var n = (function (e, t) {
      return null == e ? void 0 : e[t];
    })(e, t);
    return (function (e) {
      if (
        !ie(e) ||
        (function (e) {
          return !!I && I in e;
        })(e)
      )
        return !1;
      var t =
        oe(e) ||
        (function (e) {
          var t = !1;
          if (null != e && "function" != typeof e.toString)
            try {
              t = !!(e + "");
            } catch (e) {}
          return t;
        })(e)
          ? q
          : p;
      return t.test(
        (function (e) {
          if (null != e) {
            try {
              return R.call(e);
            } catch (e) {}
            try {
              return e + "";
            } catch (e) {}
          }
          return "";
        })(e),
      );
    })(n)
      ? n
      : void 0;
  }
  function Y(e) {
    var t = e.match(d);
    return t ? t[1].split(c) : [];
  }
  function V(e, t) {
    var n = t.length,
      r = n - 1;
    return (
      (t[r] = (n > 1 ? "& " : "") + t[r]),
      (t = t.join(n > 2 ? ", " : " ")),
      e.replace(l, "{\n/* [wrapped with " + t + "] */\n")
    );
  }
  function X(e) {
    return (
      re(e) ||
      (function (e) {
        return (
          (function (e) {
            return (
              ae(e) &&
              (function (e) {
                return (
                  null != e &&
                  (function (e) {
                    return "number" == typeof e && e > -1 && e % 1 == 0 && e <= i;
                  })(e.length) &&
                  !oe(e)
                );
              })(e)
            );
          })(e) &&
          P.call(e, "callee") &&
          (!J.call(e, "callee") || "[object Arguments]" == D.call(e))
        );
      })(e) ||
      !!(F && e && e[F])
    );
  }
  function Z(e, t) {
    return (
      !!(t = null == t ? i : t) &&
      ("number" == typeof e || m.test(e)) &&
      e > -1 &&
      e % 1 == 0 &&
      e < t
    );
  }
  var ee = T
    ? function (e, t, n) {
        var r,
          o = t + "";
        return T(e, "toString", {
          configurable: !0,
          enumerable: !1,
          value:
            ((r = V(o, te(Y(o), n))),
            function () {
              return r;
            }),
        });
      }
    : function (e) {
        return e;
      };
  function te(e, t) {
    return (
      y(a, function (n) {
        var r = "_." + n[0];
        t & n[1] &&
          !(function (e, t) {
            return (
              !(!e || !e.length) &&
              (function (e, t) {
                if (t != t)
                  return (function (e, t) {
                    for (var n = e.length, r = -1; ++r < n;) if (t(e[r], r, e)) return r;
                    return -1;
                  })(e, w);
                for (var n = -1, r = e.length; ++n < r;) if (e[n] === t) return n;
                return -1;
              })(e, t) > -1
            );
          })(e, r) &&
          e.push(r);
      }),
      e.sort()
    );
  }
  var ne = U(function (e, t, n) {
      var r = 1;
      if (n.length) {
        var o = k(n, H(ne));
        r |= 32;
      }
      return (function (e, t, n, r, o, i, a, s) {
        var l = 2 & t;
        if (!l && "function" != typeof e) throw new TypeError("Expected a function");
        var d = r ? r.length : 0;
        if (
          (d || ((t &= -97), (r = o = void 0)),
          (a = void 0 === a ? a : N(le(a), 0)),
          (s = void 0 === s ? s : le(s)),
          (d -= o ? o.length : 0),
          64 & t)
        ) {
          var c = r,
            A = o;
          r = o = void 0;
        }
        var u = [e, t, n, r, o, c, A, i, a, s];
        if (
          ((e = u[0]),
          (t = u[1]),
          (n = u[2]),
          (r = u[3]),
          (o = u[4]),
          !(s = u[9] = null == u[9] ? (l ? 0 : e.length) : N(u[9] - d, 0)) && 24 & t && (t &= -25),
          t && 1 != t)
        )
          p =
            8 == t || 16 == t
              ? (function (e, t, n) {
                  var r = G(e);
                  return function o() {
                    for (var i = arguments.length, a = Array(i), s = i, l = H(o); s--;)
                      a[s] = arguments[s];
                    var d = i < 3 && a[0] !== l && a[i - 1] !== l ? [] : k(a, l);
                    return (i -= d.length) < n
                      ? K(e, t, W, o.placeholder, void 0, a, d, void 0, void 0, n - i)
                      : v(this && this !== C && this instanceof o ? r : e, this, a);
                  };
                })(e, t, s)
              : (32 != t && 33 != t) || o.length
                ? W.apply(void 0, u)
                : (function (e, t, n, r) {
                    var o = 1 & t,
                      i = G(e);
                    return function t() {
                      for (
                        var a = -1,
                          s = arguments.length,
                          l = -1,
                          d = r.length,
                          c = Array(d + s),
                          A = this && this !== C && this instanceof t ? i : e;
                        ++l < d;
                      )
                        c[l] = r[l];
                      for (; s--;) c[l++] = arguments[++a];
                      return v(A, o ? n : this, c);
                    };
                  })(e, t, n, r);
        else
          var p = (function (e, t, n) {
            var r = 1 & t,
              o = G(e);
            return function t() {
              return (this && this !== C && this instanceof t ? o : e).apply(
                r ? n : this,
                arguments,
              );
            };
          })(e, t, n);
        return ee(p, e, t);
      })(e, r, t, n, o);
    }),
    re = Array.isArray;
  function oe(e) {
    var t = ie(e) ? D.call(e) : "";
    return "[object Function]" == t || "[object GeneratorFunction]" == t;
  }
  function ie(e) {
    var t = typeof e;
    return !!e && ("object" == t || "function" == t);
  }
  function ae(e) {
    return !!e && "object" == typeof e;
  }
  function se(e) {
    return "symbol" == typeof e || (ae(e) && "[object Symbol]" == D.call(e));
  }
  function le(e) {
    var t = (function (e) {
        return e
          ? (e = (function (e) {
              if ("number" == typeof e) return e;
              if (se(e)) return NaN;
              if (ie(e)) {
                var t = "function" == typeof e.valueOf ? e.valueOf() : e;
                e = ie(t) ? t + "" : t;
              }
              if ("string" != typeof e) return 0 === e ? e : +e;
              e = e.replace(s, "");
              var n = u.test(e);
              return n || f.test(e) ? b(e.slice(2), n ? 2 : 8) : A.test(e) ? NaN : +e;
            })(e)) === o || e === -1 / 0
            ? 17976931348623157e292 * (e < 0 ? -1 : 1)
            : e == e
              ? e
              : 0
          : 0 === e
            ? e
            : 0;
      })(e),
      n = t % 1;
    return t == t ? (n ? t - n : t) : 0;
  }
  var de = U(function (e, t) {
    return (
      y(j(t, 1), function (t) {
        ((t = (function (e) {
          if ("string" == typeof e || se(e)) return e;
          var t = e + "";
          return "0" == t && 1 / e == -1 / 0 ? "-0" : t;
        })(t)),
          (e[t] = ne(e[t], e)));
      }),
      e
    );
  });
  ((ne.placeholder = {}), (e.exports = de));
};
