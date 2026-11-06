module.exports = (e, t, n) => {
  var r = n(4745);
  e.exports = function (e, t) {
    return function (n, o) {
      if (null == n) return n;
      if (!r(n)) return e(n, o);
      for (
        var i = n.length, a = t ? i : -1, s = Object(n);
        (t ? a-- : ++a < i) && !1 !== o(s[a], a, s);
      );
      return n;
    };
  };
};
