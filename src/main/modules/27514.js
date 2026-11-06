module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(45564),
    i = {
      keyword: "not",
      schemaType: ["object", "boolean"],
      trackErrors: !0,
      code(e) {
        const { gen: t, schema: r, it: i } = e;
        if ((0, n.alwaysValidSchema)(i, r)) return void e.fail();
        const o = t.name("valid");
        (e.subschema({ keyword: "not", compositeRule: !0, createErrors: !1, allErrors: !1 }, o),
          e.failResult(
            o,
            () => e.reset(),
            () => e.error(),
          ));
      },
      error: { message: "must NOT be valid" },
    };
  t.default = i;
};
