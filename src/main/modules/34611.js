module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.attemptifySync = t.attemptifyAsync = void 0));
  const n = r(22420);
  ((t.attemptifyAsync = (e, t = n.NOOP) =>
    function () {
      return e.apply(void 0, arguments).catch(t);
    }),
    (t.attemptifySync = (e, t = n.NOOP) =>
      function () {
        try {
          return e.apply(void 0, arguments);
        } catch (e) {
          return t(e);
        }
      }));
};
