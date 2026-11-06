module.exports = (e, t, n) => {
  var r = n(2907);
  e.exports = function (e) {
    if ("string" == typeof e || r(e)) return e;
    var t = e + "";
    return "0" == t && 1 / e == -1 / 0 ? "-0" : t;
  };
};
