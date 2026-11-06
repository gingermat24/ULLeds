module.exports = (e, t, n) => {
  var r = n(2322),
    o = n(2061),
    i = n(9582);
  function a(e) {
    var t = -1,
      n = null == e ? 0 : e.length;
    for (this.__data__ = new r(); ++t < n;) this.add(e[t]);
  }
  ((a.prototype.add = a.prototype.push = o), (a.prototype.has = i), (e.exports = a));
};
