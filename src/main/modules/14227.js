module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(94040),
    i = {
      keyword: ["maxProperties", "minProperties"],
      type: "object",
      schemaType: "number",
      $data: !0,
      error: {
        message({ keyword: e, schemaCode: t }) {
          const r = "maxProperties" === e ? "more" : "fewer";
          return n.str`must NOT have ${r} than ${t} properties`;
        },
        params: ({ schemaCode: e }) => n._`{limit: ${e}}`,
      },
      code(e) {
        const { keyword: t, data: r, schemaCode: i } = e,
          o = "maxProperties" === t ? n.operators.GT : n.operators.LT;
        e.fail$data(n._`Object.keys(${r}).length ${o} ${i}`);
      },
    };
  t.default = i;
};
