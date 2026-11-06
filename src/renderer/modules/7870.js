module.exports = (e, t, n) => {
  var r = n(4439),
    o = n(626),
    i = n(3389),
    a = n(1336),
    s = n(7646),
    l = n(1643),
    d = n(9978),
    c = "[object Map]",
    A = "[object Promise]",
    u = "[object Set]",
    p = "[object WeakMap]",
    f = "[object DataView]",
    m = d(r),
    b = d(o),
    h = d(i),
    g = d(a),
    C = d(s),
    v = l;
  (((r && v(new r(new ArrayBuffer(1))) != f) ||
    (o && v(new o()) != c) ||
    (i && v(i.resolve()) != A) ||
    (a && v(new a()) != u) ||
    (s && v(new s()) != p)) &&
    (v = function (e) {
      var t = l(e),
        n = "[object Object]" == t ? e.constructor : void 0,
        r = n ? d(n) : "";
      if (r)
        switch (r) {
          case m:
            return f;
          case b:
            return c;
          case h:
            return A;
          case g:
            return u;
          case C:
            return p;
        }
      return t;
    }),
    (e.exports = v));
};
