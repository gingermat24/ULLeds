module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.retryifySync = t.retryifyAsync = void 0));
  const n = r(4002);
  ((t.retryifyAsync = (e, t) =>
    function (r) {
      return function i() {
        return n.default.schedule().then((n) =>
          e.apply(void 0, arguments).then(
            (e) => (n(), e),
            (e) => {
              if ((n(), Date.now() >= r)) throw e;
              if (t(e)) {
                const e = Math.round(100 + 400 * Math.random());
                return new Promise((t) => setTimeout(t, e)).then(() => i.apply(void 0, arguments));
              }
              throw e;
            },
          ),
        );
      };
    }),
    (t.retryifySync = (e, t) =>
      function (r) {
        return function n() {
          try {
            return e.apply(void 0, arguments);
          } catch (e) {
            if (Date.now() > r) throw e;
            if (t(e)) return n.apply(void 0, arguments);
            throw e;
          }
        };
      }));
};
