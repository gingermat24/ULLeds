module.exports = (e, t, n) => {
  var r = n(5113),
    o = Object.prototype.hasOwnProperty;
  e.exports = function (e) {
    var t = this.__data__;
    if (r) {
      var n = t[e];
      return "__lodash_hash_undefined__" === n ? void 0 : n;
    }
    return o.call(t, e) ? t[e] : void 0;
  };
};
