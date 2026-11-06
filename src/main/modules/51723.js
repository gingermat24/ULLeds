module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(44496),
    i = r(94040),
    o = r(51178),
    s = r(45564),
    a = {
      keyword: "additionalProperties",
      type: ["object"],
      schemaType: ["boolean", "object"],
      allowUndefined: !0,
      trackErrors: !0,
      error: {
        message: "must NOT have additional properties",
        params: ({ params: e }) => i._`{additionalProperty: ${e.additionalProperty}}`,
      },
      code(e) {
        const { gen: t, schema: r, parentSchema: a, data: c, errsCount: l, it: u } = e;
        if (!l) throw new Error("ajv implementation error");
        const { allErrors: p, opts: d } = u;
        if (((u.props = !0), "all" !== d.removeAdditional && (0, s.alwaysValidSchema)(u, r)))
          return;
        const f = (0, n.allSchemaProperties)(a.properties),
          h = (0, n.allSchemaProperties)(a.patternProperties);
        function m(e) {
          t.code(i._`delete ${c}[${e}]`);
        }
        function g(n) {
          if ("all" === d.removeAdditional || (d.removeAdditional && !1 === r)) m(n);
          else {
            if (!1 === r)
              return (e.setParams({ additionalProperty: n }), e.error(), void (p || t.break()));
            if ("object" == typeof r && !(0, s.alwaysValidSchema)(u, r)) {
              const r = t.name("valid");
              "failing" === d.removeAdditional
                ? (v(n, r, !1),
                  t.if((0, i.not)(r), () => {
                    (e.reset(), m(n));
                  }))
                : (v(n, r), p || t.if((0, i.not)(r), () => t.break()));
            }
          }
        }
        function v(t, r, n) {
          const i = { keyword: "additionalProperties", dataProp: t, dataPropType: s.Type.Str };
          (!1 === n && Object.assign(i, { compositeRule: !0, createErrors: !1, allErrors: !1 }),
            e.subschema(i, r));
        }
        (t.forIn("key", c, (r) => {
          f.length || h.length
            ? t.if(
                (function (r) {
                  let o;
                  if (f.length > 8) {
                    const e = (0, s.schemaRefOrVal)(u, a.properties, "properties");
                    o = (0, n.isOwnProperty)(t, e, r);
                  } else o = f.length ? (0, i.or)(...f.map((e) => i._`${r} === ${e}`)) : i.nil;
                  return (
                    h.length &&
                      (o = (0, i.or)(
                        o,
                        ...h.map((t) => i._`${(0, n.usePattern)(e, t)}.test(${r})`),
                      )),
                    (0, i.not)(o)
                  );
                })(r),
                () => g(r),
              )
            : g(r);
        }),
          e.ok(i._`${l} === ${o.default.errors}`));
      },
    };
  t.default = a;
};
