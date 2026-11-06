module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(94040),
    i = r(45564),
    o = r(10323),
    s = {
      keyword: "enum",
      schemaType: "array",
      $data: !0,
      error: {
        message: "must be equal to one of the allowed values",
        params: ({ schemaCode: e }) => n._`{allowedValues: ${e}}`,
      },
      code(e) {
        const { gen: t, data: r, $data: s, schema: a, schemaCode: c, it: l } = e;
        if (!s && 0 === a.length) throw new Error("enum must have non-empty array");
        const u = a.length >= l.opts.loopEnum;
        let p;
        const d = () => (null != p ? p : (p = (0, i.useFunc)(t, o.default)));
        let f;
        if (u || s)
          ((f = t.let("valid")),
            e.block$data(f, function () {
              (t.assign(f, !1),
                t.forOf("v", c, (e) =>
                  t.if(n._`${d()}(${r}, ${e})`, () => t.assign(f, !0).break()),
                ));
            }));
        else {
          if (!Array.isArray(a)) throw new Error("ajv implementation error");
          const e = t.const("vSchema", c);
          f = (0, n.or)(
            ...a.map((t, i) =>
              (function (e, t) {
                const i = a[t];
                return "object" == typeof i && null !== i
                  ? n._`${d()}(${r}, ${e}[${t}])`
                  : n._`${r} === ${i}`;
              })(e, i),
            ),
          );
        }
        e.pass(f);
      },
    };
  t.default = s;
};
