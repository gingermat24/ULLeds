module.exports = (e) => {
  "use strict";
  const t = (e, t, n, i) => {
      if ("length" === n || "prototype" === n) return;
      if ("arguments" === n || "caller" === n) return;
      const o = Object.getOwnPropertyDescriptor(e, n),
        s = Object.getOwnPropertyDescriptor(t, n);
      (!r(o, s) && i) || Object.defineProperty(e, n, s);
    },
    r = function (e, t) {
      return (
        void 0 === e ||
        e.configurable ||
        (e.writable === t.writable &&
          e.enumerable === t.enumerable &&
          e.configurable === t.configurable &&
          (e.writable || e.value === t.value))
      );
    },
    n = (e, t) => `/* Wrapped ${e}*/\n${t}`,
    i = Object.getOwnPropertyDescriptor(Function.prototype, "toString"),
    o = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name");
  e.exports = (e, r, { ignoreNonConfigurable: s = !1 } = {}) => {
    const { name: a } = e;
    for (const n of Reflect.ownKeys(r)) t(e, r, n, s);
    return (
      ((e, t) => {
        const r = Object.getPrototypeOf(t);
        r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
      })(e, r),
      ((e, t, r) => {
        const s = "" === r ? "" : `with ${r.trim()}() `,
          a = n.bind(null, s, t.toString());
        (Object.defineProperty(a, "name", o),
          Object.defineProperty(e, "toString", { ...i, value: a }));
      })(e, r, a),
      e
    );
  };
};
