module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(13556),
    i = {
      keyword: "allOf",
      schemaType: "array",
      code(e) {
        const { gen: t, schema: r, it: i } = e;
        if (!Array.isArray(r)) throw new Error("ajv implementation error");
        const o = t.name("valid");
        r.forEach((t, r) => {
          if ((0, n.alwaysValidSchema)(i, t)) return;
          const s = e.subschema({ keyword: "allOf", schemaProp: r }, o);
          (e.ok(o), e.mergeEvaluated(s));
        });
      },
    };
  t.default = i;
};
