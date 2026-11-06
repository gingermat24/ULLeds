module.exports = (e) => {
  e.exports = function (e) {
    return function (t, n, r) {
      for (var o = -1, i = Object(t), a = r(t), s = a.length; s--;) {
        var l = a[e ? s : ++o];
        if (!1 === n(i[l], l, i)) break;
      }
      return t;
    };
  };
};
