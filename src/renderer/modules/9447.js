module.exports = (e, t, n) => {
  var r = n(1465),
    o = n(2107);
  e.exports = function e(t, n, i, a, s) {
    return (
      t === n ||
      (null == t || null == n || (!o(t) && !o(n)) ? t != t && n != n : r(t, n, i, a, e, s))
    );
  };
};
