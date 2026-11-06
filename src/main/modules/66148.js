module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.validateAdditionalItems = void 0));
  const n = r(94040),
    i = r(45564),
    o = {
      keyword: "additionalItems",
      type: "array",
      schemaType: ["boolean", "object"],
      before: "uniqueItems",
      error: {
        message: ({ params: { len: e } }) => n.str`must NOT have more than ${e} items`,
        params: ({ params: { len: e } }) => n._`{limit: ${e}}`,
      },
      code(e) {
        const { parentSchema: t, it: r } = e,
          { items: n } = t;
        Array.isArray(n)
          ? s(e, n)
          : (0, i.checkStrictMode)(
              r,
              '"additionalItems" is ignored when "items" is not an array of schemas',
            );
      },
    };
  function s(e, t) {
    const { gen: r, schema: o, data: s, keyword: a, it: c } = e;
    c.items = !0;
    const l = r.const("len", n._`${s}.length`);
    if (!1 === o) (e.setParams({ len: t.length }), e.pass(n._`${l} <= ${t.length}`));
    else if ("object" == typeof o && !(0, i.alwaysValidSchema)(c, o)) {
      const o = r.var("valid", n._`${l} <= ${t.length}`);
      (r.if((0, n.not)(o), () =>
        (function (o) {
          r.forRange("i", t.length, l, (t) => {
            (e.subschema({ keyword: a, dataProp: t, dataPropType: i.Type.Num }, o),
              c.allErrors || r.if((0, n.not)(o), () => r.break()));
          });
        })(o),
      ),
        e.ok(o));
    }
  }
  ((t.validateAdditionalItems = s), (t.default = o));
};
