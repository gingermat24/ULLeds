module.exports = (e, t) => {
  "use strict";
  ((t.fromCallback = function (e) {
    return Object.defineProperty(
      function (...t) {
        if ("function" != typeof t[t.length - 1])
          return new Promise((r, n) => {
            (t.push((e, t) => (null != e ? n(e) : r(t))), e.apply(this, t));
          });
        e.apply(this, t);
      },
      "name",
      { value: e.name },
    );
  }),
    (t.fromPromise = function (e) {
      return Object.defineProperty(
        function (...t) {
          const r = t[t.length - 1];
          if ("function" != typeof r) return e.apply(this, t);
          (t.pop(), e.apply(this, t).then((e) => r(null, e), r));
        },
        "name",
        { value: e.name },
      );
    }));
};
