module.exports = (e, t, n) => {
  var r = n(6106),
    o = n(6959),
    i = n(4014),
    a = n(2907),
    s = r ? r.prototype : void 0,
    l = s ? s.toString : void 0;
  e.exports = function e(t) {
    if ("string" == typeof t) return t;
    if (i(t)) return o(t, e) + "";
    if (a(t)) return l ? l.call(t) : "";
    var n = t + "";
    return "0" == n && 1 / t == -1 / 0 ? "-0" : n;
  };
};
