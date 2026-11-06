module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.validateSchemaDeps = t.validatePropertyDeps = t.error = void 0));
  const n = r(32512),
    i = r(13556),
    o = r(15288);
  t.error = {
    message: ({ params: { property: e, depsCount: t, deps: r } }) => {
      const i = 1 === t ? "property" : "properties";
      return n.str`must have ${i} ${r} when property ${e} is present`;
    },
    params: ({
      params: { property: e, depsCount: t, deps: r, missingProperty: i },
    }) => n._`{property: ${e},
    missingProperty: ${i},
    depsCount: ${t},
    deps: ${r}}`,
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: t.error,
    code(e) {
      const [t, r] = (function ({ schema: e }) {
        const t = {},
          r = {};
        for (const n in e) "__proto__" !== n && ((Array.isArray(e[n]) ? t : r)[n] = e[n]);
        return [t, r];
      })(e);
      (a(e, t), c(e, r));
    },
  };
  function a(e, t = e.schema) {
    const { gen: r, data: i, it: s } = e;
    if (0 === Object.keys(t).length) return;
    const a = r.let("missing");
    for (const c in t) {
      const l = t[c];
      if (0 === l.length) continue;
      const u = (0, o.propertyInData)(r, i, c, s.opts.ownProperties);
      (e.setParams({ property: c, depsCount: l.length, deps: l.join(", ") }),
        s.allErrors
          ? r.if(u, () => {
              for (const t of l) (0, o.checkReportMissingProp)(e, t);
            })
          : (r.if(n._`${u} && (${(0, o.checkMissingProp)(e, l, a)})`),
            (0, o.reportMissingProp)(e, a),
            r.else()));
    }
  }
  function c(e, t = e.schema) {
    const { gen: r, data: n, keyword: s, it: a } = e,
      c = r.name("valid");
    for (const l in t)
      (0, i.alwaysValidSchema)(a, t[l]) ||
        (r.if(
          (0, o.propertyInData)(r, n, l, a.opts.ownProperties),
          () => {
            const t = e.subschema({ keyword: s, schemaProp: l }, c);
            e.mergeValidEvaluated(t, c);
          },
          () => r.var(c, !0),
        ),
        e.ok(c));
  }
  ((t.validatePropertyDeps = a), (t.validateSchemaDeps = c), (t.default = s));
};
