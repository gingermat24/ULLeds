module.exports = (e, t, n) => {
  var r = n(7334),
    o = n(7433);
  e.exports = function (e, t, n, i) {
    var a = !n;
    n || (n = {});
    for (var s = -1, l = t.length; ++s < l;) {
      var d = t[s],
        c = i ? i(n[d], e[d], d, n, e) : void 0;
      (void 0 === c && (c = e[d]), a ? o(n, d, c) : r(n, d, c));
    }
    return n;
  };
};
