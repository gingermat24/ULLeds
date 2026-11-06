module.exports = (e, t, r) => {
  var n = r(68674);
  e.exports = function (e) {
    var t = !1;
    return (
      n(function () {
        t = !0;
      }),
      function (r, i) {
        t
          ? e(r, i)
          : n(function () {
              e(r, i);
            });
      }
    );
  };
};
