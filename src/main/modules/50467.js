module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.validateTuple = void 0));
  const n = r(32512),
    i = r(13556),
    o = r(15288),
    s = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "array", "boolean"],
      before: "uniqueItems",
      code(e) {
        const { schema: t, it: r } = e;
        if (Array.isArray(t)) return a(e, "additionalItems", t);
        ((r.items = !0), (0, i.alwaysValidSchema)(r, t) || e.ok((0, o.validateArray)(e)));
      },
    };
  function a(e, t, r = e.schema) {
    const { gen: o, parentSchema: s, data: a, keyword: c, it: l } = e;
    (!(function (e) {
      const { opts: n, errSchemaPath: o } = l,
        s = r.length,
        a = s === e.minItems && (s === e.maxItems || !1 === e[t]);
      if (n.strictTuples && !a) {
        const e = `"${c}" is ${s}-tuple, but minItems or maxItems/${t} are not specified or different at path "${o}"`;
        (0, i.checkStrictMode)(l, e, n.strictTuples);
      }
    })(s),
      l.opts.unevaluated &&
        r.length &&
        !0 !== l.items &&
        (l.items = i.mergeEvaluated.items(o, r.length, l.items)));
    const u = o.name("valid"),
      p = o.const("len", n._`${a}.length`);
    r.forEach((t, r) => {
      (0, i.alwaysValidSchema)(l, t) ||
        (o.if(n._`${p} > ${r}`, () => e.subschema({ keyword: c, schemaProp: r, dataProp: r }, u)),
        e.ok(u));
    });
  }
  ((t.validateTuple = a), (t.default = s));
};
