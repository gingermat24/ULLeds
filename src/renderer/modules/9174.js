module.exports = (e, t, n) => {
  var r = n(4722),
    o = n(626),
    i = n(2322);
  e.exports = function (e, t) {
    var n = this.__data__;
    if (n instanceof r) {
      var a = n.__data__;
      if (!o || a.length < 199) return (a.push([e, t]), (this.size = ++n.size), this);
      n = this.__data__ = new i(a);
    }
    return (n.set(e, t), (this.size = n.size), this);
  };
};
