module.exports = (e) => {
  e.exports = function (e, t) {
    for (var n = -1, r = t.length, o = e.length; ++n < r;) e[o + n] = t[n];
    return e;
  };
};
