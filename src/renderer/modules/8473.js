module.exports = (e, t, n) => {
  var r = n(6834),
    o = Array.prototype.splice;
  e.exports = function (e) {
    var t = this.__data__,
      n = r(t, e);
    return !(n < 0 || (n == t.length - 1 ? t.pop() : o.call(t, n, 1), --this.size, 0));
  };
};
