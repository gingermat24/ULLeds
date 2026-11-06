module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(26357),
    i = r(44496),
    o = r(45564),
    s = r(51723),
    a = {
      keyword: "properties",
      type: "object",
      schemaType: "object",
      code(e) {
        const { gen: t, schema: r, parentSchema: a, data: c, it: l } = e;
        "all" === l.opts.removeAdditional &&
          void 0 === a.additionalProperties &&
          s.default.code(new n.KeywordCxt(l, s.default, "additionalProperties"));
        const u = (0, i.allSchemaProperties)(r);
        for (const e of u) l.definedProperties.add(e);
        l.opts.unevaluated &&
          u.length &&
          !0 !== l.props &&
          (l.props = o.mergeEvaluated.props(t, (0, o.toHash)(u), l.props));
        const p = u.filter((e) => !(0, o.alwaysValidSchema)(l, r[e]));
        if (0 === p.length) return;
        const d = t.name("valid");
        for (const r of p)
          (f(r)
            ? h(r)
            : (t.if((0, i.propertyInData)(t, c, r, l.opts.ownProperties)),
              h(r),
              l.allErrors || t.else().var(d, !0),
              t.endIf()),
            e.it.definedProperties.add(r),
            e.ok(d));
        function f(e) {
          return l.opts.useDefaults && !l.compositeRule && void 0 !== r[e].default;
        }
        function h(t) {
          e.subschema({ keyword: "properties", schemaProp: t, dataProp: t }, d);
        }
      },
    };
  t.default = a;
};
