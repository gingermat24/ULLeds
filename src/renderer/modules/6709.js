module.exports = (e, t, n) => {
  var r = n(6106),
    o = n(6559),
    i = n(6693),
    a = n(6342),
    s = n(9902),
    l = n(8972),
    d = r ? r.prototype : void 0,
    c = d ? d.valueOf : void 0;
  e.exports = function (e, t, n, r, d, A, u) {
    switch (n) {
      case "[object DataView]":
        if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset) return !1;
        ((e = e.buffer), (t = t.buffer));
      case "[object ArrayBuffer]":
        return !(e.byteLength != t.byteLength || !A(new o(e), new o(t)));
      case "[object Boolean]":
      case "[object Date]":
      case "[object Number]":
        return i(+e, +t);
      case "[object Error]":
        return e.name == t.name && e.message == t.message;
      case "[object RegExp]":
      case "[object String]":
        return e == t + "";
      case "[object Map]":
        var p = s;
      case "[object Set]":
        var f = 1 & r;
        if ((p || (p = l), e.size != t.size && !f)) return !1;
        var m = u.get(e);
        if (m) return m == t;
        ((r |= 2), u.set(e, t));
        var b = a(p(e), p(t), r, d, A, u);
        return (u.delete(e), b);
      case "[object Symbol]":
        if (c) return c.call(e) == c.call(t);
    }
    return !1;
  };
};
