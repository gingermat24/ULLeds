module.exports = (e) => {
  "use strict";
  const t = (e, t) => {
    for (const r of Reflect.ownKeys(t))
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    return e;
  };
  ((e.exports = t), (e.exports.default = t));
};
