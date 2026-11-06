module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(32512),
    i = r(13556),
    o = r(19259),
    s = {
      keyword: "const",
      $data: !0,
      error: {
        message: "must be equal to constant",
        params: ({ schemaCode: e }) => n._`{allowedValue: ${e}}`,
      },
      code(e) {
        const { gen: t, data: r, $data: s, schemaCode: a, schema: c } = e;
        s || (c && "object" == typeof c)
          ? e.fail$data(n._`!${(0, i.useFunc)(t, o.default)}(${r}, ${a})`)
          : e.fail(n._`${c} !== ${r}`);
      },
    };
  t.default = s;
};
