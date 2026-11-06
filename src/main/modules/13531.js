module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(15288),
    i = r(32512),
    o = {
      keyword: "pattern",
      type: "string",
      schemaType: "string",
      $data: !0,
      error: {
        message: ({ schemaCode: e }) => i.str`must match pattern "${e}"`,
        params: ({ schemaCode: e }) => i._`{pattern: ${e}}`,
      },
      code(e) {
        const { data: t, $data: r, schema: o, schemaCode: s, it: a } = e,
          c = a.opts.unicodeRegExp ? "u" : "",
          l = r ? i._`(new RegExp(${s}, ${c}))` : (0, n.usePattern)(e, o);
        e.fail$data(i._`!${l}.test(${t})`);
      },
    };
  t.default = o;
};
