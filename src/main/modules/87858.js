module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(94040),
    i = r(45564),
    o = {
      keyword: "contains",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      trackErrors: !0,
      error: {
        message: ({ params: { min: e, max: t } }) =>
          void 0 === t
            ? n.str`must contain at least ${e} valid item(s)`
            : n.str`must contain at least ${e} and no more than ${t} valid item(s)`,
        params: ({ params: { min: e, max: t } }) =>
          void 0 === t ? n._`{minContains: ${e}}` : n._`{minContains: ${e}, maxContains: ${t}}`,
      },
      code(e) {
        const { gen: t, schema: r, parentSchema: o, data: s, it: a } = e;
        let c, l;
        const { minContains: u, maxContains: p } = o;
        a.opts.next ? ((c = void 0 === u ? 1 : u), (l = p)) : (c = 1);
        const d = t.const("len", n._`${s}.length`);
        if ((e.setParams({ min: c, max: l }), void 0 === l && 0 === c))
          return void (0, i.checkStrictMode)(
            a,
            '"minContains" == 0 without "maxContains": "contains" keyword ignored',
          );
        if (void 0 !== l && c > l)
          return (
            (0, i.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'),
            void e.fail()
          );
        if ((0, i.alwaysValidSchema)(a, r)) {
          let t = n._`${d} >= ${c}`;
          return (void 0 !== l && (t = n._`${t} && ${d} <= ${l}`), void e.pass(t));
        }
        a.items = !0;
        const f = t.name("valid");
        function h() {
          const e = t.name("_valid"),
            r = t.let("count", 0);
          m(e, () =>
            t.if(e, () =>
              (function (e) {
                (t.code(n._`${e}++`),
                  void 0 === l
                    ? t.if(n._`${e} >= ${c}`, () => t.assign(f, !0).break())
                    : (t.if(n._`${e} > ${l}`, () => t.assign(f, !1).break()),
                      1 === c ? t.assign(f, !0) : t.if(n._`${e} >= ${c}`, () => t.assign(f, !0))));
              })(r),
            ),
          );
        }
        function m(r, n) {
          t.forRange("i", 0, d, (t) => {
            (e.subschema(
              { keyword: "contains", dataProp: t, dataPropType: i.Type.Num, compositeRule: !0 },
              r,
            ),
              n());
          });
        }
        (void 0 === l && 1 === c
          ? m(f, () => t.if(f, () => t.break()))
          : 0 === c
            ? (t.let(f, !0), void 0 !== l && t.if(n._`${s}.length > 0`, h))
            : (t.let(f, !1), h()),
          e.result(f, () => e.reset()));
      },
    };
  t.default = o;
};
