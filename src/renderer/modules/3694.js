module.exports = (e, t, n) => {
  var r = n(3062),
    o = n(4303),
    i = n(6269),
    a = n(4014),
    s = n(6138);
  e.exports = function (e) {
    return "function" == typeof e
      ? e
      : null == e
        ? i
        : "object" == typeof e
          ? a(e)
            ? o(e[0], e[1])
            : r(e)
          : s(e);
  };
};
