module.exports = (e, t, n) => {
  var r = n(8923),
    o = n(6355);
  e.exports = function (e) {
    for (var t = o(e), n = t.length; n--;) {
      var i = t[n],
        a = e[i];
      t[n] = [i, a, r(a)];
    }
    return t;
  };
};
