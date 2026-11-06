module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(94040),
    i = r(45564),
    o = {
      keyword: "propertyNames",
      type: "object",
      schemaType: ["object", "boolean"],
      error: {
        message: "property name must be valid",
        params: ({ params: e }) => n._`{propertyName: ${e.propertyName}}`,
      },
      code(e) {
        const { gen: t, schema: r, data: o, it: s } = e;
        if ((0, i.alwaysValidSchema)(s, r)) return;
        const a = t.name("valid");
        (t.forIn("key", o, (r) => {
          (e.setParams({ propertyName: r }),
            e.subschema(
              {
                keyword: "propertyNames",
                data: r,
                dataTypes: ["string"],
                propertyName: r,
                compositeRule: !0,
              },
              a,
            ),
            t.if((0, n.not)(a), () => {
              (e.error(!0), s.allErrors || t.break());
            }));
        }),
          e.ok(a));
      },
    };
  t.default = o;
};
