module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.callRef = t.getValidate = void 0));
  const n = r(24086),
    i = r(15288),
    o = r(32512),
    s = r(11986),
    a = r(95242),
    c = r(13556),
    l = {
      keyword: "$ref",
      schemaType: "string",
      code(e) {
        const { gen: t, schema: r, it: i } = e,
          { baseId: s, schemaEnv: c, validateName: l, opts: d, self: f } = i,
          { root: h } = c;
        if (("#" === r || "#/" === r) && s === h.baseId)
          return (function () {
            if (c === h) return p(e, l, c, c.$async);
            const r = t.scopeValue("root", { ref: h });
            return p(e, o._`${r}.validate`, h, h.$async);
          })();
        const m = a.resolveRef.call(f, h, s, r);
        if (void 0 === m) throw new n.default(i.opts.uriResolver, s, r);
        return m instanceof a.SchemaEnv
          ? (function (t) {
              const r = u(e, t);
              p(e, r, t, t.$async);
            })(m)
          : (function (n) {
              const i = t.scopeValue(
                  "schema",
                  !0 === d.code.source ? { ref: n, code: (0, o.stringify)(n) } : { ref: n },
                ),
                s = t.name("valid"),
                a = e.subschema(
                  {
                    schema: n,
                    dataTypes: [],
                    schemaPath: o.nil,
                    topSchemaRef: i,
                    errSchemaPath: r,
                  },
                  s,
                );
              (e.mergeEvaluated(a), e.ok(s));
            })(m);
      },
    };
  function u(e, t) {
    const { gen: r } = e;
    return t.validate
      ? r.scopeValue("validate", { ref: t.validate })
      : o._`${r.scopeValue("wrapper", { ref: t })}.validate`;
  }
  function p(e, t, r, n) {
    const { gen: a, it: l } = e,
      { allErrors: u, schemaEnv: p, opts: d } = l,
      f = d.passContext ? s.default.this : o.nil;
    function h(e) {
      const t = o._`${e}.errors`;
      (a.assign(
        s.default.vErrors,
        o._`${s.default.vErrors} === null ? ${t} : ${s.default.vErrors}.concat(${t})`,
      ),
        a.assign(s.default.errors, o._`${s.default.vErrors}.length`));
    }
    function m(e) {
      var t;
      if (!l.opts.unevaluated) return;
      const n =
        null === (t = null == r ? void 0 : r.validate) || void 0 === t ? void 0 : t.evaluated;
      if (!0 !== l.props)
        if (n && !n.dynamicProps)
          void 0 !== n.props && (l.props = c.mergeEvaluated.props(a, n.props, l.props));
        else {
          const t = a.var("props", o._`${e}.evaluated.props`);
          l.props = c.mergeEvaluated.props(a, t, l.props, o.Name);
        }
      if (!0 !== l.items)
        if (n && !n.dynamicItems)
          void 0 !== n.items && (l.items = c.mergeEvaluated.items(a, n.items, l.items));
        else {
          const t = a.var("items", o._`${e}.evaluated.items`);
          l.items = c.mergeEvaluated.items(a, t, l.items, o.Name);
        }
    }
    n
      ? (function () {
          if (!p.$async) throw new Error("async schema referenced by sync schema");
          const r = a.let("valid");
          (a.try(
            () => {
              (a.code(o._`await ${(0, i.callValidateCode)(e, t, f)}`), m(t), u || a.assign(r, !0));
            },
            (e) => {
              (a.if(o._`!(${e} instanceof ${l.ValidationError})`, () => a.throw(e)),
                h(e),
                u || a.assign(r, !1));
            },
          ),
            e.ok(r));
        })()
      : e.result(
          (0, i.callValidateCode)(e, t, f),
          () => m(t),
          () => h(t),
        );
  }
  ((t.getValidate = u), (t.callRef = p), (t.default = l));
};
