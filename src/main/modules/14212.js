module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(32512),
    i = {
      keyword: ["maxItems", "minItems"],
      type: "array",
      schemaType: "number",
      $data: !0,
      error: {
        message({ keyword: e, schemaCode: t }) {
          const r = "maxItems" === e ? "more" : "fewer";
          return n.str`must NOT have ${r} than ${t} items`;
        },
        params: ({ schemaCode: e }) => n._`{limit: ${e}}`,
      },
      code(e) {
        const { keyword: t, data: r, schemaCode: i } = e,
          o = "maxItems" === t ? n.operators.GT : n.operators.LT;
        e.fail$data(n._`${r}.length ${o} ${i}`);
      },
    };
  t.default = i;
};
