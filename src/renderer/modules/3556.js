module.exports = (e, t, n) => {
  var r = n(6834);
  e.exports = function (e, t) {
    var n = this.__data__,
      o = r(n, e);
    return (o < 0 ? (++this.size, n.push([e, t])) : (n[o][1] = t), this);
  };
};
