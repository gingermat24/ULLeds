module.exports = (e, t, n) => {
  var r = n(9447),
    o = n(8611),
    i = n(3348),
    a = n(5611),
    s = n(8923),
    l = n(5736),
    d = n(7936);
  e.exports = function (e, t) {
    return a(e) && s(t)
      ? l(d(e), t)
      : function (n) {
          var a = o(n, e);
          return void 0 === a && a === t ? i(n, e) : r(t, a, 3);
        };
  };
};
