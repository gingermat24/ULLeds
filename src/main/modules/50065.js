module.exports = (e, t, r) => {
  "use strict";
  const n = r(21503).fromPromise,
    i = r(67634);
  e.exports = {
    pathExists: n(function (e) {
      return i
        .access(e)
        .then(() => !0)
        .catch(() => !1);
    }),
    pathExistsSync: i.existsSync,
  };
};
