module.exports = (e) => {
  "use strict";
  e.exports = function (e, t, n, r, o, i, a, s) {
    if (!e) {
      var l;
      if (void 0 === t)
        l = new Error(
          "Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.",
        );
      else {
        var d = [n, r, o, i, a, s],
          c = 0;
        (l = new Error(
          t.replace(/%s/g, function () {
            return d[c++];
          }),
        )).name = "Invariant Violation";
      }
      throw ((l.framesToPop = 1), l);
    }
  };
};
