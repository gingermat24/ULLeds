module.exports = (e, t, r) => {
  "use strict";
  const n = r(79896);
  ((e.exports = (e) =>
    new Promise((t) => {
      n.access(e, (e) => {
        t(!e);
      });
    })),
    (e.exports.sync = (e) => {
      try {
        return (n.accessSync(e), !0);
      } catch (e) {
        return !1;
      }
    }));
};
