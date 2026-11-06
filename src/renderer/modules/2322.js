module.exports = (e, t, n) => {
  var r = n(3889),
    o = n(4761),
    i = n(4688),
    a = n(804),
    s = n(1396);
  function l(e) {
    var t = -1,
      n = null == e ? 0 : e.length;
    for (this.clear(); ++t < n;) {
      var r = e[t];
      this.set(r[0], r[1]);
    }
  }
  ((l.prototype.clear = r),
    (l.prototype.delete = o),
    (l.prototype.get = i),
    (l.prototype.has = a),
    (l.prototype.set = s),
    (e.exports = l));
};
