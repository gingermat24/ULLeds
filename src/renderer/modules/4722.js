module.exports = (e, t, n) => {
  var r = n(5873),
    o = n(8473),
    i = n(6208),
    a = n(9812),
    s = n(3556);
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
