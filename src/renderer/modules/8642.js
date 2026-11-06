module.exports = (e, t, n) => {
  var r = n(6388),
    o = n(9447);
  e.exports = function (e, t, n, i) {
    var a = n.length,
      s = a,
      l = !i;
    if (null == e) return !s;
    for (e = Object(e); a--;) {
      var d = n[a];
      if (l && d[2] ? d[1] !== e[d[0]] : !(d[0] in e)) return !1;
    }
    for (; ++a < s;) {
      var c = (d = n[a])[0],
        A = e[c],
        u = d[1];
      if (l && d[2]) {
        if (void 0 === A && !(c in e)) return !1;
      } else {
        var p = new r();
        if (i) var f = i(A, u, c, e, t, p);
        if (!(void 0 === f ? o(u, A, 3, i, p) : f)) return !1;
      }
    }
    return !0;
  };
};
