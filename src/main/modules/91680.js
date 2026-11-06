module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(4969),
    i = r(94040),
    o = r(45564),
    s = r(10323),
    a = {
      keyword: "uniqueItems",
      type: "array",
      schemaType: "boolean",
      $data: !0,
      error: {
        message: ({ params: { i: e, j: t } }) =>
          i.str`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
        params: ({ params: { i: e, j: t } }) => i._`{i: ${e}, j: ${t}}`,
      },
      code(e) {
        const { gen: t, data: r, $data: a, schema: c, parentSchema: l, schemaCode: u, it: p } = e;
        if (!a && !c) return;
        const d = t.let("valid"),
          f = l.items ? (0, n.getSchemaTypes)(l.items) : [];
        function h(o, s) {
          const a = t.name("item"),
            c = (0, n.checkDataTypes)(f, a, p.opts.strictNumbers, n.DataType.Wrong),
            l = t.const("indices", i._`{}`);
          t.for(i._`;${o}--;`, () => {
            (t.let(a, i._`${r}[${o}]`),
              t.if(c, i._`continue`),
              f.length > 1 && t.if(i._`typeof ${a} == "string"`, i._`${a} += "_"`),
              t
                .if(i._`typeof ${l}[${a}] == "number"`, () => {
                  (t.assign(s, i._`${l}[${a}]`), e.error(), t.assign(d, !1).break());
                })
                .code(i._`${l}[${a}] = ${o}`));
          });
        }
        function m(n, a) {
          const c = (0, o.useFunc)(t, s.default),
            l = t.name("outer");
          t.label(l).for(i._`;${n}--;`, () =>
            t.for(i._`${a} = ${n}; ${a}--;`, () =>
              t.if(i._`${c}(${r}[${n}], ${r}[${a}])`, () => {
                (e.error(), t.assign(d, !1).break(l));
              }),
            ),
          );
        }
        (e.block$data(
          d,
          function () {
            const n = t.let("i", i._`${r}.length`),
              o = t.let("j");
            (e.setParams({ i: n, j: o }),
              t.assign(d, !0),
              t.if(i._`${n} > 1`, () =>
                (f.length > 0 && !f.some((e) => "object" === e || "array" === e) ? h : m)(n, o),
              ));
          },
          i._`${u} === false`,
        ),
          e.ok(d));
      },
    };
  t.default = a;
};
