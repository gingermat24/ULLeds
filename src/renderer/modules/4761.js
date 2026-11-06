module.exports = (e, t, n) => {
  var r = n(5124);
  e.exports = function (e) {
    var t = r(this, e).delete(e);
    return ((this.size -= t ? 1 : 0), t);
  };
};
