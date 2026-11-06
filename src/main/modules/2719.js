module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.assignDefaults = void 0));
  const n = r(94040),
    i = r(45564);
  function o(e, t, r) {
    const { gen: o, compositeRule: s, data: a, opts: c } = e;
    if (void 0 === r) return;
    const l = n._`${a}${(0, n.getProperty)(t)}`;
    if (s) return void (0, i.checkStrictMode)(e, `default is ignored for: ${l}`);
    let u = n._`${l} === undefined`;
    ("empty" === c.useDefaults && (u = n._`${u} || ${l} === null || ${l} === ""`),
      o.if(u, n._`${l} = ${(0, n.stringify)(r)}`));
  }
  t.assignDefaults = function (e, t) {
    const { properties: r, items: n } = e.schema;
    if ("object" === t && r) for (const t in r) o(e, t, r[t].default);
    else "array" === t && Array.isArray(n) && n.forEach((t, r) => o(e, r, t.default));
  };
};
