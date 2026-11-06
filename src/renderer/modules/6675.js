module.exports = (e, t, n) => {
  var r = n(5758),
    o = n(4155),
    i = n(4014),
    a = n(4088),
    s = n(1107),
    l = n(7936);
  e.exports = function (e, t, n) {
    for (var d = -1, c = (t = r(t, e)).length, A = !1; ++d < c;) {
      var u = l(t[d]);
      if (!(A = null != e && n(e, u))) break;
      e = e[u];
    }
    return A || ++d != c
      ? A
      : !!(c = null == e ? 0 : e.length) && s(c) && a(u, c) && (i(e) || o(e));
  };
};
