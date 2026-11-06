module.exports = (e) => {
  "use strict";
  function t(e) {
    return null == e;
  }
  ((e.exports.isNothing = t),
    (e.exports.isObject = function (e) {
      return "object" == typeof e && null !== e;
    }),
    (e.exports.toArray = function (e) {
      return Array.isArray(e) ? e : t(e) ? [] : [e];
    }),
    (e.exports.repeat = function (e, t) {
      var r,
        n = "";
      for (r = 0; r < t; r += 1) n += e;
      return n;
    }),
    (e.exports.isNegativeZero = function (e) {
      return 0 === e && Number.NEGATIVE_INFINITY === 1 / e;
    }),
    (e.exports.extend = function (e, t) {
      var r, n, i, o;
      if (t) for (r = 0, n = (o = Object.keys(t)).length; r < n; r += 1) e[(i = o[r])] = t[i];
      return e;
    }));
};
