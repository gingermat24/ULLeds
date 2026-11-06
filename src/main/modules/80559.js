module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.extendErrors =
      t.resetErrorsCount =
      t.reportExtraError =
      t.reportError =
      t.keyword$DataError =
      t.keywordError =
        void 0));
  const n = r(32512),
    i = r(13556),
    o = r(11986);
  function s(e, t) {
    const r = e.const("err", t);
    (e.if(
      n._`${o.default.vErrors} === null`,
      () => e.assign(o.default.vErrors, n._`[${r}]`),
      n._`${o.default.vErrors}.push(${r})`,
    ),
      e.code(n._`${o.default.errors}++`));
  }
  function a(e, t) {
    const { gen: r, validateName: i, schemaEnv: o } = e;
    o.$async
      ? r.throw(n._`new ${e.ValidationError}(${t})`)
      : (r.assign(n._`${i}.errors`, t), r.return(!1));
  }
  ((t.keywordError = { message: ({ keyword: e }) => n.str`must pass "${e}" keyword validation` }),
    (t.keyword$DataError = {
      message: ({ keyword: e, schemaType: t }) =>
        t ? n.str`"${e}" keyword must be ${t} ($data)` : n.str`"${e}" keyword is invalid ($data)`,
    }),
    (t.reportError = function (e, r = t.keywordError, i, o) {
      const { it: c } = e,
        { gen: u, compositeRule: p, allErrors: d } = c,
        f = l(e, r, i);
      (null != o ? o : p || d) ? s(u, f) : a(c, n._`[${f}]`);
    }),
    (t.reportExtraError = function (e, r = t.keywordError, n) {
      const { it: i } = e,
        { gen: c, compositeRule: u, allErrors: p } = i;
      (s(c, l(e, r, n)), u || p || a(i, o.default.vErrors));
    }),
    (t.resetErrorsCount = function (e, t) {
      (e.assign(o.default.errors, t),
        e.if(n._`${o.default.vErrors} !== null`, () =>
          e.if(
            t,
            () => e.assign(n._`${o.default.vErrors}.length`, t),
            () => e.assign(o.default.vErrors, null),
          ),
        ));
    }),
    (t.extendErrors = function ({
      gen: e,
      keyword: t,
      schemaValue: r,
      data: i,
      errsCount: s,
      it: a,
    }) {
      if (void 0 === s) throw new Error("ajv implementation error");
      const c = e.name("err");
      e.forRange("i", s, o.default.errors, (s) => {
        (e.const(c, n._`${o.default.vErrors}[${s}]`),
          e.if(n._`${c}.instancePath === undefined`, () =>
            e.assign(n._`${c}.instancePath`, (0, n.strConcat)(o.default.instancePath, a.errorPath)),
          ),
          e.assign(n._`${c}.schemaPath`, n.str`${a.errSchemaPath}/${t}`),
          a.opts.verbose && (e.assign(n._`${c}.schema`, r), e.assign(n._`${c}.data`, i)));
      });
    }));
  const c = {
    keyword: new n.Name("keyword"),
    schemaPath: new n.Name("schemaPath"),
    params: new n.Name("params"),
    propertyName: new n.Name("propertyName"),
    message: new n.Name("message"),
    schema: new n.Name("schema"),
    parentSchema: new n.Name("parentSchema"),
  };
  function l(e, t, r) {
    const { createErrors: i } = e.it;
    return !1 === i
      ? n._`{}`
      : (function (e, t, r = {}) {
          const { gen: i, it: s } = e,
            a = [u(s, r), p(e, r)];
          return (
            (function (e, { params: t, message: r }, i) {
              const { keyword: s, data: a, schemaValue: l, it: u } = e,
                { opts: p, propertyName: d, topSchemaRef: f, schemaPath: h } = u;
              (i.push([c.keyword, s], [c.params, "function" == typeof t ? t(e) : t || n._`{}`]),
                p.messages && i.push([c.message, "function" == typeof r ? r(e) : r]),
                p.verbose &&
                  i.push([c.schema, l], [c.parentSchema, n._`${f}${h}`], [o.default.data, a]),
                d && i.push([c.propertyName, d]));
            })(e, t, a),
            i.object(...a)
          );
        })(e, t, r);
  }
  function u({ errorPath: e }, { instancePath: t }) {
    const r = t ? n.str`${e}${(0, i.getErrorPath)(t, i.Type.Str)}` : e;
    return [o.default.instancePath, (0, n.strConcat)(o.default.instancePath, r)];
  }
  function p({ keyword: e, it: { errSchemaPath: t } }, { schemaPath: r, parentSchema: o }) {
    let s = o ? t : n.str`${t}/${e}`;
    return (r && (s = n.str`${s}${(0, i.getErrorPath)(r, i.Type.Str)}`), [c.schemaPath, s]);
  }
};
