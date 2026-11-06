module.exports = (e, t, r) => {
  var n = r(54594),
    i = r(70456);
  e.exports = function (e, t, r, o) {
    var s = r.keyedList ? r.keyedList[r.index] : r.index;
    r.jobs[s] = (function (e, t, r, i) {
      return 2 == e.length ? e(r, n(i)) : e(r, t, n(i));
    })(t, s, e[s], function (e, t) {
      s in r.jobs && (delete r.jobs[s], e ? i(r) : (r.results[s] = t), o(e, r.results));
    });
  };
};
