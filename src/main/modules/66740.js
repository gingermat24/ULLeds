module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(15288),
    i = r(32512),
    o = r(13556),
    s = r(13556),
    a = {
      keyword: "patternProperties",
      type: "object",
      schemaType: "object",
      code(e) {
        const { gen: t, schema: r, data: a, parentSchema: c, it: l } = e,
          { opts: u } = l,
          p = (0, n.allSchemaProperties)(r),
          d = p.filter((e) => (0, o.alwaysValidSchema)(l, r[e]));
        if (0 === p.length || (d.length === p.length && (!l.opts.unevaluated || !0 === l.props)))
          return;
        const f = u.strictSchema && !u.allowMatchingProperties && c.properties,
          h = t.name("valid");
        !0 === l.props ||
          l.props instanceof i.Name ||
          (l.props = (0, s.evaluatedPropsToName)(t, l.props));
        const { props: m } = l;
        function g(e) {
          for (const t in f)
            new RegExp(e).test(t) &&
              (0, o.checkStrictMode)(
                l,
                `property ${t} matches pattern ${e} (use allowMatchingProperties)`,
              );
        }
        function v(r) {
          t.forIn("key", a, (o) => {
            t.if(i._`${(0, n.usePattern)(e, r)}.test(${o})`, () => {
              const n = d.includes(r);
              (n ||
                e.subschema(
                  {
                    keyword: "patternProperties",
                    schemaProp: r,
                    dataProp: o,
                    dataPropType: s.Type.Str,
                  },
                  h,
                ),
                l.opts.unevaluated && !0 !== m
                  ? t.assign(i._`${m}[${o}]`, !0)
                  : n || l.allErrors || t.if((0, i.not)(h), () => t.break()));
            });
          });
        }
        !(function () {
          for (const e of p) (f && g(e), l.allErrors ? v(e) : (t.var(h, !0), v(e), t.if(h)));
        })();
      },
    };
  t.default = a;
};
