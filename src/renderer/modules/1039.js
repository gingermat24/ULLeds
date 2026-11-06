module.exports = (e) => {
  e.exports = function (e, t) {
    for (var n = -1, r = null == e ? 0 : e.length, o = 0, i = []; ++n < r;) {
      var a = e[n];
      t(a, n, e) && (i[o++] = a);
    }
    return i;
  };
};
