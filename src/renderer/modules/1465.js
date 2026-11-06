module.exports = (e, t, n) => {
  var r = n(6388),
    o = n(6342),
    i = n(6709),
    a = n(1190),
    s = n(7870),
    l = n(4014),
    d = n(3541),
    c = n(5218),
    A = "[object Arguments]",
    u = "[object Array]",
    p = "[object Object]",
    f = Object.prototype.hasOwnProperty;
  e.exports = function (e, t, n, m, b, h) {
    var g = l(e),
      C = l(t),
      v = g ? u : s(e),
      y = C ? u : s(t),
      x = (v = v == A ? p : v) == p,
      w = (y = y == A ? p : y) == p,
      k = v == y;
    if (k && d(e)) {
      if (!d(t)) return !1;
      ((g = !0), (x = !1));
    }
    if (k && !x)
      return (h || (h = new r()), g || c(e) ? o(e, t, n, m, b, h) : i(e, t, v, n, m, b, h));
    if (!(1 & n)) {
      var B = x && f.call(e, "__wrapped__"),
        $ = w && f.call(t, "__wrapped__");
      if (B || $) {
        var E = B ? e.value() : e,
          _ = $ ? t.value() : t;
        return (h || (h = new r()), b(E, _, n, m, h));
      }
    }
    return !!k && (h || (h = new r()), a(e, t, n, m, b, h));
  };
};
