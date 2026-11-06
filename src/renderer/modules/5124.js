module.exports = (e, t, n) => {
  var r = n(211);
  e.exports = function (e, t) {
    var n = e.__data__;
    return r(t) ? n["string" == typeof t ? "string" : "hash"] : n.map;
  };
};
