module.exports = (e, t, n) => {
  var r = n(6388),
    o = n(5096),
    i = n(7334),
    a = n(5282),
    s = n(6773),
    l = n(6243),
    d = n(3242),
    c = n(1730),
    A = n(4469),
    u = n(4049),
    p = n(1818),
    f = n(7870),
    m = n(1006),
    b = n(5712),
    h = n(1524),
    g = n(4014),
    C = n(3541),
    v = n(809),
    y = n(7860),
    x = n(6463),
    w = n(6355),
    k = n(9104),
    B = "[object Arguments]",
    $ = "[object Function]",
    E = "[object Object]",
    _ = {};
  ((_[B] =
    _["[object Array]"] =
    _["[object ArrayBuffer]"] =
    _["[object DataView]"] =
    _["[object Boolean]"] =
    _["[object Date]"] =
    _["[object Float32Array]"] =
    _["[object Float64Array]"] =
    _["[object Int8Array]"] =
    _["[object Int16Array]"] =
    _["[object Int32Array]"] =
    _["[object Map]"] =
    _["[object Number]"] =
    _[E] =
    _["[object RegExp]"] =
    _["[object Set]"] =
    _["[object String]"] =
    _["[object Symbol]"] =
    _["[object Uint8Array]"] =
    _["[object Uint8ClampedArray]"] =
    _["[object Uint16Array]"] =
    _["[object Uint32Array]"] =
      !0),
    (_["[object Error]"] = _[$] = _["[object WeakMap]"] = !1),
    (e.exports = function e(t, n, S, O, I, R) {
      var P,
        D = 1 & n,
        q = 2 & n,
        z = 4 & n;
      if ((S && (P = I ? S(t, O, I, R) : S(t)), void 0 !== P)) return P;
      if (!y(t)) return t;
      var M = g(t);
      if (M) {
        if (((P = m(t)), !D)) return d(t, P);
      } else {
        var J = f(t),
          F = J == $ || "[object GeneratorFunction]" == J;
        if (C(t)) return l(t, D);
        if (J == E || J == B || (F && !I)) {
          if (((P = q || F ? {} : h(t)), !D)) return q ? A(t, s(P, t)) : c(t, a(P, t));
        } else {
          if (!_[J]) return I ? t : {};
          P = b(t, J, D);
        }
      }
      R || (R = new r());
      var N = R.get(t);
      if (N) return N;
      (R.set(t, P),
        x(t)
          ? t.forEach(function (r) {
              P.add(e(r, n, S, r, t, R));
            })
          : v(t) &&
            t.forEach(function (r, o) {
              P.set(o, e(r, n, S, o, t, R));
            }));
      var L = M ? void 0 : (z ? (q ? p : u) : q ? k : w)(t);
      return (
        o(L || t, function (r, o) {
          (L && (r = t[(o = r)]), i(P, o, e(r, n, S, o, t, R)));
        }),
        P
      );
    }));
};
