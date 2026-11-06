module.exports = (e, t, r) => {
  var n = r(74244),
    i = r(31415),
    o = r(31717);
  function s(e, t) {
    return e < t ? -1 : e > t ? 1 : 0;
  }
  ((e.exports = function (e, t, r, s) {
    var a = i(e, r);
    return (
      n(e, t, a, function r(i, o) {
        i
          ? s(i, o)
          : (a.index++, a.index < (a.keyedList || e).length ? n(e, t, a, r) : s(null, a.results));
      }),
      o.bind(a, s)
    );
  }),
    (e.exports.ascending = s),
    (e.exports.descending = function (e, t) {
      return -1 * s(e, t);
    }));
};
