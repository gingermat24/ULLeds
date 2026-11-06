module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(94040),
    i = r(45564),
    o = {
      keyword: "if",
      schemaType: ["object", "boolean"],
      trackErrors: !0,
      error: {
        message: ({ params: e }) => n.str`must match "${e.ifClause}" schema`,
        params: ({ params: e }) => n._`{failingKeyword: ${e.ifClause}}`,
      },
      code(e) {
        const { gen: t, parentSchema: r, it: o } = e;
        void 0 === r.then &&
          void 0 === r.else &&
          (0, i.checkStrictMode)(o, '"if" without "then" and "else" is ignored');
        const a = s(o, "then"),
          c = s(o, "else");
        if (!a && !c) return;
        const l = t.let("valid", !0),
          u = t.name("_valid");
        if (
          ((function () {
            const t = e.subschema(
              { keyword: "if", compositeRule: !0, createErrors: !1, allErrors: !1 },
              u,
            );
            e.mergeEvaluated(t);
          })(),
          e.reset(),
          a && c)
        ) {
          const r = t.let("ifClause");
          (e.setParams({ ifClause: r }), t.if(u, p("then", r), p("else", r)));
        } else a ? t.if(u, p("then")) : t.if((0, n.not)(u), p("else"));
        function p(r, i) {
          return () => {
            const o = e.subschema({ keyword: r }, u);
            (t.assign(l, u),
              e.mergeValidEvaluated(o, l),
              i ? t.assign(i, n._`${r}`) : e.setParams({ ifClause: r }));
          };
        }
        e.pass(l, () => e.error(!0));
      },
    };
  function s(e, t) {
    const r = e.schema[t];
    return void 0 !== r && !(0, i.alwaysValidSchema)(e, r);
  }
  t.default = o;
};
