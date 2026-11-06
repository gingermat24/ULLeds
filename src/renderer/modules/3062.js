module.exports = (e, t, n) => {
  var r = n(8642),
    o = n(9687),
    i = n(5736);
  e.exports = function (e) {
    var t = o(e);
    return 1 == t.length && t[0][2]
      ? i(t[0][0], t[0][1])
      : function (n) {
          return n === e || r(n, e, t);
        };
  };
};
