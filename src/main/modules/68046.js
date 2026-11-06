module.exports = (e, t) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.newError = function (e, t) {
      const r = new Error(e);
      return ((r.code = t), r);
    }));
};
