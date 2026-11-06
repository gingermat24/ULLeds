module.exports = (e, t, r) => {
  "use strict";
  const n = r(6158),
    i = r(21503).fromCallback,
    o = r(21608);
  e.exports = {
    remove: i(function (e, t) {
      if (n.rm) return n.rm(e, { recursive: !0, force: !0 }, t);
      o(e, t);
    }),
    removeSync: function (e) {
      if (n.rmSync) return n.rmSync(e, { recursive: !0, force: !0 });
      o.sync(e);
    },
  };
};
