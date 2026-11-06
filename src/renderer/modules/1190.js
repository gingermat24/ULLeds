module.exports = (e, t, n) => {
  var r = n(4049),
    o = Object.prototype.hasOwnProperty;
  e.exports = function (e, t, n, i, a, s) {
    var l = 1 & n,
      d = r(e),
      c = d.length;
    if (c != r(t).length && !l) return !1;
    for (var A = c; A--;) {
      var u = d[A];
      if (!(l ? u in t : o.call(t, u))) return !1;
    }
    var p = s.get(e),
      f = s.get(t);
    if (p && f) return p == t && f == e;
    var m = !0;
    (s.set(e, t), s.set(t, e));
    for (var b = l; ++A < c;) {
      var h = e[(u = d[A])],
        g = t[u];
      if (i) var C = l ? i(g, h, u, t, e, s) : i(h, g, u, e, t, s);
      if (!(void 0 === C ? h === g || a(h, g, n, i, s) : C)) {
        m = !1;
        break;
      }
      b || (b = "constructor" == u);
    }
    if (m && !b) {
      var v = e.constructor,
        y = t.constructor;
      v == y ||
        !("constructor" in e) ||
        !("constructor" in t) ||
        ("function" == typeof v && v instanceof v && "function" == typeof y && y instanceof y) ||
        (m = !1);
    }
    return (s.delete(e), s.delete(t), m);
  };
};
