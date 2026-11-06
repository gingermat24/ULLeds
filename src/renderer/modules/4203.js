module.exports = (e, t, n) => {
  var r = n(5758),
    o = n(7936);
  e.exports = function (e, t) {
    for (var n = 0, i = (t = r(t, e)).length; null != e && n < i;) e = e[o(t[n++])];
    return n && n == i ? e : void 0;
  };
};
