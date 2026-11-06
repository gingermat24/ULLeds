module.exports = (e, t, n) => {
  var r = n(1643),
    o = n(4014),
    i = n(2107);
  e.exports = function (e) {
    return "string" == typeof e || (!o(e) && i(e) && "[object String]" == r(e));
  };
};
