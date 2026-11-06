module.exports = (e, t, n) => {
  var r = n(2340),
    o = n(137),
    i = n(3144);
  e.exports = function (e, t, n, a, s, l) {
    var d = 1 & n,
      c = e.length,
      A = t.length;
    if (c != A && !(d && A > c)) return !1;
    var u = l.get(e),
      p = l.get(t);
    if (u && p) return u == t && p == e;
    var f = -1,
      m = !0,
      b = 2 & n ? new r() : void 0;
    for (l.set(e, t), l.set(t, e); ++f < c;) {
      var h = e[f],
        g = t[f];
      if (a) var C = d ? a(g, h, f, t, e, l) : a(h, g, f, e, t, l);
      if (void 0 !== C) {
        if (C) continue;
        m = !1;
        break;
      }
      if (b) {
        if (
          !o(t, function (e, t) {
            if (!i(b, t) && (h === e || s(h, e, n, a, l))) return b.push(t);
          })
        ) {
          m = !1;
          break;
        }
      } else if (h !== g && !s(h, g, n, a, l)) {
        m = !1;
        break;
      }
    }
    return (l.delete(e), l.delete(t), m);
  };
};
