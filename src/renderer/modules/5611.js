module.exports = (e, t, n) => {
  var r = n(4014),
    o = n(2907),
    i = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    a = /^\w*$/;
  e.exports = function (e, t) {
    if (r(e)) return !1;
    var n = typeof e;
    return (
      !("number" != n && "symbol" != n && "boolean" != n && null != e && !o(e)) ||
      a.test(e) ||
      !i.test(e) ||
      (null != t && e in Object(t))
    );
  };
};
