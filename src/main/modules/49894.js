module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.validateKeywordUsage = t.validSchemaType = t.funcKeywordCode = t.macroKeywordCode = void 0));
  const n = r(94040),
    i = r(51178),
    o = r(44496),
    s = r(70407);
  function a(e) {
    const { gen: t, data: r, it: i } = e;
    t.if(i.parentData, () => t.assign(r, n._`${i.parentData}[${i.parentDataProperty}]`));
  }
  function c(e, t, r) {
    if (void 0 === r) throw new Error(`keyword "${t}" failed to compile`);
    return e.scopeValue(
      "keyword",
      "function" == typeof r ? { ref: r } : { ref: r, code: (0, n.stringify)(r) },
    );
  }
  ((t.macroKeywordCode = function (e, t) {
    const { gen: r, keyword: i, schema: o, parentSchema: s, it: a } = e,
      l = t.macro.call(a.self, o, s, a),
      u = c(r, i, l);
    !1 !== a.opts.validateSchema && a.self.validateSchema(l, !0);
    const p = r.name("valid");
    (e.subschema(
      {
        schema: l,
        schemaPath: n.nil,
        errSchemaPath: `${a.errSchemaPath}/${i}`,
        topSchemaRef: u,
        compositeRule: !0,
      },
      p,
    ),
      e.pass(p, () => e.error(!0)));
  }),
    (t.funcKeywordCode = function (e, t) {
      var r;
      const { gen: l, keyword: u, schema: p, parentSchema: d, $data: f, it: h } = e;
      !(function ({ schemaEnv: e }, t) {
        if (t.async && !e.$async) throw new Error("async keyword in sync schema");
      })(h, t);
      const m = !f && t.compile ? t.compile.call(h.self, p, d, h) : t.validate,
        g = c(l, u, m),
        v = l.let("valid");
      function y(r = t.async ? n._`await ` : n.nil) {
        const s = h.opts.passContext ? i.default.this : i.default.self,
          a = !(("compile" in t && !f) || !1 === t.schema);
        l.assign(v, n._`${r}${(0, o.callValidateCode)(e, g, s, a)}`, t.modifying);
      }
      function w(e) {
        var r;
        l.if((0, n.not)(null !== (r = t.valid) && void 0 !== r ? r : v), e);
      }
      (e.block$data(v, function () {
        if (!1 === t.errors) (y(), t.modifying && a(e), w(() => e.error()));
        else {
          const r = t.async
            ? (function () {
                const e = l.let("ruleErrs", null);
                return (
                  l.try(
                    () => y(n._`await `),
                    (t) =>
                      l.assign(v, !1).if(
                        n._`${t} instanceof ${h.ValidationError}`,
                        () => l.assign(e, n._`${t}.errors`),
                        () => l.throw(t),
                      ),
                  ),
                  e
                );
              })()
            : (function () {
                const e = n._`${g}.errors`;
                return (l.assign(e, null), y(n.nil), e);
              })();
          (t.modifying && a(e),
            w(() =>
              (function (e, t) {
                const { gen: r } = e;
                r.if(
                  n._`Array.isArray(${t})`,
                  () => {
                    (r
                      .assign(
                        i.default.vErrors,
                        n._`${i.default.vErrors} === null ? ${t} : ${i.default.vErrors}.concat(${t})`,
                      )
                      .assign(i.default.errors, n._`${i.default.vErrors}.length`),
                      (0, s.extendErrors)(e));
                  },
                  () => e.error(),
                );
              })(e, r),
            ));
        }
      }),
        e.ok(null !== (r = t.valid) && void 0 !== r ? r : v));
    }),
    (t.validSchemaType = function (e, t, r = !1) {
      return (
        !t.length ||
        t.some((t) =>
          "array" === t
            ? Array.isArray(e)
            : "object" === t
              ? e && "object" == typeof e && !Array.isArray(e)
              : typeof e == t || (r && void 0 === e),
        )
      );
    }),
    (t.validateKeywordUsage = function ({ schema: e, opts: t, self: r, errSchemaPath: n }, i, o) {
      if (Array.isArray(i.keyword) ? !i.keyword.includes(o) : i.keyword !== o)
        throw new Error("ajv implementation error");
      const s = i.dependencies;
      if (null == s ? void 0 : s.some((t) => !Object.prototype.hasOwnProperty.call(e, t)))
        throw new Error(`parent schema must have dependencies of ${o}: ${s.join(",")}`);
      if (i.validateSchema && !i.validateSchema(e[o])) {
        const e =
          `keyword "${o}" value is invalid at path "${n}": ` +
          r.errorsText(i.validateSchema.errors);
        if ("log" !== t.validateSchema) throw new Error(e);
        r.logger.error(e);
      }
    }));
};
