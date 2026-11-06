module.exports = (e, t, n) => {
  var r = n(1643),
    o = n(2107);
  e.exports = function (e) {
    return "symbol" == typeof e || (o(e) && "[object Symbol]" == r(e));
  };
};
