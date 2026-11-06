module.exports = (e, t, n) => {
  var r = n(1217),
    o = n(4155),
    i = n(4014),
    a = n(3541),
    s = n(4088),
    l = n(5218),
    d = Object.prototype.hasOwnProperty;
  e.exports = function (e, t) {
    var n = i(e),
      c = !n && o(e),
      A = !n && !c && a(e),
      u = !n && !c && !A && l(e),
      p = n || c || A || u,
      f = p ? r(e.length, String) : [],
      m = f.length;
    for (var b in e)
      (!t && !d.call(e, b)) ||
        (p &&
          ("length" == b ||
            (A && ("offset" == b || "parent" == b)) ||
            (u && ("buffer" == b || "byteLength" == b || "byteOffset" == b)) ||
            s(b, m))) ||
        f.push(b);
    return f;
  };
};
