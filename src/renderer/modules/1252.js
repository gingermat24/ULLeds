module.exports = (e, t, n) => {
  var r = n(5113),
    o = Object.prototype.hasOwnProperty;
  e.exports = function (e) {
    var t = this.__data__;
    return r ? void 0 !== t[e] : o.call(t, e);
  };
};
