module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(32512),
    i = {
      keyword: "multipleOf",
      type: "number",
      schemaType: "number",
      $data: !0,
      error: {
        message: ({ schemaCode: e }) => n.str`must be multiple of ${e}`,
        params: ({ schemaCode: e }) => n._`{multipleOf: ${e}}`,
      },
      code(e) {
        const { gen: t, data: r, schemaCode: i, it: o } = e,
          s = o.opts.multipleOfPrecision,
          a = t.let("res"),
          c = s ? n._`Math.abs(Math.round(${a}) - ${a}) > 1e-${s}` : n._`${a} !== parseInt(${a})`;
        e.fail$data(n._`(${i} === 0 || (${a} = ${r}/${i}, ${c}))`);
      },
    };
  t.default = i;
};
