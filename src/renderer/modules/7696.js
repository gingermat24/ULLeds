module.exports = (e, t, n) => {
  var r = n(1643),
    o = n(6616),
    i = n(2107),
    a = Function.prototype,
    s = Object.prototype,
    l = a.toString,
    d = s.hasOwnProperty,
    c = l.call(Object);
  e.exports = function (e) {
    if (!i(e) || "[object Object]" != r(e)) return !1;
    var t = o(e);
    if (null === t) return !0;
    var n = d.call(t, "constructor") && t.constructor;
    return "function" == typeof n && n instanceof n && l.call(n) == c;
  };
};
