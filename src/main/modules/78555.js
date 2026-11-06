module.exports = (e, t, r) => {
  var n = r(74244),
    i = r(31415),
    o = r(31717);
  e.exports = function (e, t, r) {
    for (var s = i(e); s.index < (s.keyedList || e).length;)
      (n(e, t, s, function (e, t) {
        e ? r(e, t) : 0 !== Object.keys(s.jobs).length || r(null, s.results);
      }),
        s.index++);
    return o.bind(s, r);
  };
};
