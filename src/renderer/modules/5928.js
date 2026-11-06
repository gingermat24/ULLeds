module.exports = (e, t, n) => {
  var r = n(7860),
    o = n(2522),
    i = n(1418),
    a = Object.prototype.hasOwnProperty;
  e.exports = function (e) {
    if (!r(e)) return i(e);
    var t = o(e),
      n = [];
    for (var s in e) ("constructor" != s || (!t && a.call(e, s))) && n.push(s);
    return n;
  };
};
