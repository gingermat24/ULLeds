module.exports = (e, t, n) => {
  var r = n(2482),
    o = n(4745);
  e.exports = function (e, t) {
    var n = -1,
      i = o(e) ? Array(e.length) : [];
    return (
      r(e, function (e, r, o) {
        i[++n] = t(e, r, o);
      }),
      i
    );
  };
};
