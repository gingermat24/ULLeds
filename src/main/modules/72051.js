module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(32512),
    i = r(13556),
    o = r(15288),
    s = r(25324),
    a = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      error: {
        message: ({ params: { len: e } }) => n.str`must NOT have more than ${e} items`,
        params: ({ params: { len: e } }) => n._`{limit: ${e}}`,
      },
      code(e) {
        const { schema: t, parentSchema: r, it: n } = e,
          { prefixItems: a } = r;
        ((n.items = !0),
          (0, i.alwaysValidSchema)(n, t) ||
            (a ? (0, s.validateAdditionalItems)(e, a) : e.ok((0, o.validateArray)(e))));
      },
    };
  t.default = a;
};
