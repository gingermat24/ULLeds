module.exports = (e, t, n) => {
  var r = n(2322);
  function o(e, t) {
    if ("function" != typeof e || (null != t && "function" != typeof t))
      throw new TypeError("Expected a function");
    var n = function () {
      var r = arguments,
        o = t ? t.apply(this, r) : r[0],
        i = n.cache;
      if (i.has(o)) return i.get(o);
      var a = e.apply(this, r);
      return ((n.cache = i.set(o, a) || i), a);
    };
    return ((n.cache = new (o.Cache || r)()), n);
  }
  ((o.Cache = r), (e.exports = o));
};
