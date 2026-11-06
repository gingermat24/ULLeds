module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(32512),
    i = r(42831),
    o = r(95242),
    s = r(24086),
    a = r(13556),
    c = {
      keyword: "discriminator",
      type: "object",
      schemaType: "object",
      error: {
        message: ({ params: { discrError: e, tagName: t } }) =>
          e === i.DiscrError.Tag
            ? `tag "${t}" must be string`
            : `value of tag "${t}" must be in oneOf`,
        params: ({ params: { discrError: e, tag: t, tagName: r } }) =>
          n._`{error: ${e}, tag: ${r}, tagValue: ${t}}`,
      },
      code(e) {
        const { gen: t, data: r, schema: c, parentSchema: l, it: u } = e,
          { oneOf: p } = l;
        if (!u.opts.discriminator) throw new Error("discriminator: requires discriminator option");
        const d = c.propertyName;
        if ("string" != typeof d) throw new Error("discriminator: requires propertyName");
        if (c.mapping) throw new Error("discriminator: mapping is not supported");
        if (!p) throw new Error("discriminator: requires oneOf keyword");
        const f = t.let("valid", !1),
          h = t.const("tag", n._`${r}${(0, n.getProperty)(d)}`);
        function m(r) {
          const i = t.name("valid"),
            o = e.subschema({ keyword: "oneOf", schemaProp: r }, i);
          return (e.mergeEvaluated(o, n.Name), i);
        }
        (t.if(
          n._`typeof ${h} == "string"`,
          () =>
            (function () {
              const r = (function () {
                var e;
                const t = {},
                  r = i(l);
                let n = !0;
                for (let t = 0; t < p.length; t++) {
                  let l = p[t];
                  if (
                    (null == l ? void 0 : l.$ref) &&
                    !(0, a.schemaHasRulesButRef)(l, u.self.RULES)
                  ) {
                    const e = l.$ref;
                    if (
                      ((l = o.resolveRef.call(u.self, u.schemaEnv.root, u.baseId, e)),
                      l instanceof o.SchemaEnv && (l = l.schema),
                      void 0 === l)
                    )
                      throw new s.default(u.opts.uriResolver, u.baseId, e);
                  }
                  const f =
                    null === (e = null == l ? void 0 : l.properties) || void 0 === e
                      ? void 0
                      : e[d];
                  if ("object" != typeof f)
                    throw new Error(
                      `discriminator: oneOf subschemas (or referenced schemas) must have "properties/${d}"`,
                    );
                  ((n = n && (r || i(l))), c(f, t));
                }
                if (!n) throw new Error(`discriminator: "${d}" must be required`);
                return t;
                function i({ required: e }) {
                  return Array.isArray(e) && e.includes(d);
                }
                function c(e, t) {
                  if (e.const) f(e.const, t);
                  else {
                    if (!e.enum)
                      throw new Error(
                        `discriminator: "properties/${d}" must have "const" or "enum"`,
                      );
                    for (const r of e.enum) f(r, t);
                  }
                }
                function f(e, r) {
                  if ("string" != typeof e || e in t)
                    throw new Error(`discriminator: "${d}" values must be unique strings`);
                  t[e] = r;
                }
              })();
              t.if(!1);
              for (const e in r) (t.elseIf(n._`${h} === ${e}`), t.assign(f, m(r[e])));
              (t.else(),
                e.error(!1, { discrError: i.DiscrError.Mapping, tag: h, tagName: d }),
                t.endIf());
            })(),
          () => e.error(!1, { discrError: i.DiscrError.Tag, tag: h, tagName: d }),
        ),
          e.ok(f));
      },
    };
  t.default = c;
};
