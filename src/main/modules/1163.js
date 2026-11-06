module.exports = (e, t, r) => {
  "use strict";
  const n = r(45751),
    i = new WeakMap(),
    o = (e, t = {}) => {
      if ("function" != typeof e) throw new TypeError("Expected a function");
      let r,
        o = 0;
      const s = e.displayName || e.name || "<anonymous>",
        a = function (...n) {
          if ((i.set(a, ++o), 1 === o)) ((r = e.apply(this, n)), (e = null));
          else if (!0 === t.throw) throw new Error(`Function \`${s}\` can only be called once`);
          return r;
        };
      return (n(a, e), i.set(a, o), a);
    };
  ((e.exports = o),
    (e.exports.default = o),
    (e.exports.callCount = (e) => {
      if (!i.has(e))
        throw new Error(
          `The given function \`${e.name}\` is not wrapped by the \`onetime\` package`,
        );
      return i.get(e);
    }));
};
