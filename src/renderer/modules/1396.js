module.exports = (e, t, n) => {
  var r = n(5124);
  e.exports = function (e, t) {
    var n = r(this, e),
      o = n.size;
    return (n.set(e, t), (this.size += n.size == o ? 0 : 1), this);
  };
};
