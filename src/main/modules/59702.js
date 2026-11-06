module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.formatLimitDefinition = void 0));
  const n = r(33435),
    i = r(94040),
    o = i.operators,
    s = {
      formatMaximum: { okStr: "<=", ok: o.LTE, fail: o.GT },
      formatMinimum: { okStr: ">=", ok: o.GTE, fail: o.LT },
      formatExclusiveMaximum: { okStr: "<", ok: o.LT, fail: o.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: o.GT, fail: o.LTE },
    },
    a = {
      message: ({ keyword: e, schemaCode: t }) => i.str`should be ${s[e].okStr} ${t}`,
      params: ({ keyword: e, schemaCode: t }) => i._`{comparison: ${s[e].okStr}, limit: ${t}}`,
    };
  ((t.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(e) {
      const { gen: t, data: r, schemaCode: o, keyword: a, it: c } = e,
        { opts: l, self: u } = c;
      if (!l.validateFormats) return;
      const p = new n.KeywordCxt(c, u.RULES.all.format.definition, "format");
      function d(e) {
        return i._`${e}.compare(${r}, ${o}) ${s[a].fail} 0`;
      }
      p.$data
        ? (function () {
            const r = t.scopeValue("formats", { ref: u.formats, code: l.code.formats }),
              n = t.const("fmt", i._`${r}[${p.schemaCode}]`);
            e.fail$data(
              i.or(
                i._`typeof ${n} != "object"`,
                i._`${n} instanceof RegExp`,
                i._`typeof ${n}.compare != "function"`,
                d(n),
              ),
            );
          })()
        : (function () {
            const r = p.schema,
              n = u.formats[r];
            if (!n || !0 === n) return;
            if ("object" != typeof n || n instanceof RegExp || "function" != typeof n.compare)
              throw new Error(`"${a}": format "${r}" does not define "compare" function`);
            const o = t.scopeValue("formats", {
              key: r,
              ref: n,
              code: l.code.formats ? i._`${l.code.formats}${i.getProperty(r)}` : void 0,
            });
            e.fail$data(d(o));
          })();
    },
    dependencies: ["format"],
  }),
    (t.default = (e) => (e.addKeyword(t.formatLimitDefinition), e)));
};
