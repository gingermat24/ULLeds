module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.validateUnion =
      t.validateArray =
      t.usePattern =
      t.callValidateCode =
      t.schemaProperties =
      t.allSchemaProperties =
      t.noPropertyInData =
      t.propertyInData =
      t.isOwnProperty =
      t.hasPropFunc =
      t.reportMissingProp =
      t.checkMissingProp =
      t.checkReportMissingProp =
        void 0));
  const n = r(32512),
    i = r(13556),
    o = r(11986),
    s = r(13556);
  function a(e) {
    return e.scopeValue("func", {
      ref: Object.prototype.hasOwnProperty,
      code: n._`Object.prototype.hasOwnProperty`,
    });
  }
  function c(e, t, r) {
    return n._`${a(e)}.call(${t}, ${r})`;
  }
  function l(e, t, r, i) {
    const o = n._`${t}${(0, n.getProperty)(r)} === undefined`;
    return i ? (0, n.or)(o, (0, n.not)(c(e, t, r))) : o;
  }
  function u(e) {
    return e ? Object.keys(e).filter((e) => "__proto__" !== e) : [];
  }
  ((t.checkReportMissingProp = function (e, t) {
    const { gen: r, data: i, it: o } = e;
    r.if(l(r, i, t, o.opts.ownProperties), () => {
      (e.setParams({ missingProperty: n._`${t}` }, !0), e.error());
    });
  }),
    (t.checkMissingProp = function ({ gen: e, data: t, it: { opts: r } }, i, o) {
      return (0, n.or)(...i.map((i) => (0, n.and)(l(e, t, i, r.ownProperties), n._`${o} = ${i}`)));
    }),
    (t.reportMissingProp = function (e, t) {
      (e.setParams({ missingProperty: t }, !0), e.error());
    }),
    (t.hasPropFunc = a),
    (t.isOwnProperty = c),
    (t.propertyInData = function (e, t, r, i) {
      const o = n._`${t}${(0, n.getProperty)(r)} !== undefined`;
      return i ? n._`${o} && ${c(e, t, r)}` : o;
    }),
    (t.noPropertyInData = l),
    (t.allSchemaProperties = u),
    (t.schemaProperties = function (e, t) {
      return u(t).filter((r) => !(0, i.alwaysValidSchema)(e, t[r]));
    }),
    (t.callValidateCode = function (
      {
        schemaCode: e,
        data: t,
        it: { gen: r, topSchemaRef: i, schemaPath: s, errorPath: a },
        it: c,
      },
      l,
      u,
      p,
    ) {
      const d = p ? n._`${e}, ${t}, ${i}${s}` : t,
        f = [
          [o.default.instancePath, (0, n.strConcat)(o.default.instancePath, a)],
          [o.default.parentData, c.parentData],
          [o.default.parentDataProperty, c.parentDataProperty],
          [o.default.rootData, o.default.rootData],
        ];
      c.opts.dynamicRef && f.push([o.default.dynamicAnchors, o.default.dynamicAnchors]);
      const h = n._`${d}, ${r.object(...f)}`;
      return u !== n.nil ? n._`${l}.call(${u}, ${h})` : n._`${l}(${h})`;
    }));
  const p = n._`new RegExp`;
  ((t.usePattern = function ({ gen: e, it: { opts: t } }, r) {
    const i = t.unicodeRegExp ? "u" : "",
      { regExp: o } = t.code,
      a = o(r, i);
    return e.scopeValue("pattern", {
      key: a.toString(),
      ref: a,
      code: n._`${"new RegExp" === o.code ? p : (0, s.useFunc)(e, o)}(${r}, ${i})`,
    });
  }),
    (t.validateArray = function (e) {
      const { gen: t, data: r, keyword: o, it: s } = e,
        a = t.name("valid");
      if (s.allErrors) {
        const e = t.let("valid", !0);
        return (c(() => t.assign(e, !1)), e);
      }
      return (t.var(a, !0), c(() => t.break()), a);
      function c(s) {
        const c = t.const("len", n._`${r}.length`);
        t.forRange("i", 0, c, (r) => {
          (e.subschema({ keyword: o, dataProp: r, dataPropType: i.Type.Num }, a),
            t.if((0, n.not)(a), s));
        });
      }
    }),
    (t.validateUnion = function (e) {
      const { gen: t, schema: r, keyword: o, it: s } = e;
      if (!Array.isArray(r)) throw new Error("ajv implementation error");
      if (r.some((e) => (0, i.alwaysValidSchema)(s, e)) && !s.opts.unevaluated) return;
      const a = t.let("valid", !1),
        c = t.name("_valid");
      (t.block(() =>
        r.forEach((r, i) => {
          const s = e.subschema({ keyword: o, schemaProp: i, compositeRule: !0 }, c);
          (t.assign(a, n._`${a} || ${c}`), e.mergeValidEvaluated(s, c) || t.if((0, n.not)(a)));
        }),
      ),
        e.result(
          a,
          () => e.reset(),
          () => e.error(!0),
        ));
    }));
};
