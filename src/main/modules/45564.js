module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.checkStrictMode =
      t.getErrorPath =
      t.Type =
      t.useFunc =
      t.setEvaluated =
      t.evaluatedPropsToName =
      t.mergeEvaluated =
      t.eachItem =
      t.unescapeJsonPointer =
      t.escapeJsonPointer =
      t.escapeFragment =
      t.unescapeFragment =
      t.schemaRefOrVal =
      t.schemaHasRulesButRef =
      t.schemaHasRules =
      t.checkUnknownRules =
      t.alwaysValidSchema =
      t.toHash =
        void 0));
  const n = r(94040),
    i = r(92139);
  function o(e, t = e.schema) {
    const { opts: r, self: n } = e;
    if (!r.strictSchema) return;
    if ("boolean" == typeof t) return;
    const i = n.RULES.keywords;
    for (const r in t) i[r] || h(e, `unknown keyword: "${r}"`);
  }
  function s(e, t) {
    if ("boolean" == typeof e) return !e;
    for (const r in e) if (t[r]) return !0;
    return !1;
  }
  function a(e) {
    return "number" == typeof e ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  function c(e) {
    return e.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  function l({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: i }) {
    return (o, s, a, c) => {
      const l =
        void 0 === a
          ? s
          : a instanceof n.Name
            ? (s instanceof n.Name ? e(o, s, a) : t(o, s, a), a)
            : s instanceof n.Name
              ? (t(o, a, s), s)
              : r(s, a);
      return c !== n.Name || l instanceof n.Name ? l : i(o, l);
    };
  }
  function u(e, t) {
    if (!0 === t) return e.var("props", !0);
    const r = e.var("props", n._`{}`);
    return (void 0 !== t && p(e, r, t), r);
  }
  function p(e, t, r) {
    Object.keys(r).forEach((r) => e.assign(n._`${t}${(0, n.getProperty)(r)}`, !0));
  }
  ((t.toHash = function (e) {
    const t = {};
    for (const r of e) t[r] = !0;
    return t;
  }),
    (t.alwaysValidSchema = function (e, t) {
      return "boolean" == typeof t
        ? t
        : 0 === Object.keys(t).length || (o(e, t), !s(t, e.self.RULES.all));
    }),
    (t.checkUnknownRules = o),
    (t.schemaHasRules = s),
    (t.schemaHasRulesButRef = function (e, t) {
      if ("boolean" == typeof e) return !e;
      for (const r in e) if ("$ref" !== r && t.all[r]) return !0;
      return !1;
    }),
    (t.schemaRefOrVal = function ({ topSchemaRef: e, schemaPath: t }, r, i, o) {
      if (!o) {
        if ("number" == typeof r || "boolean" == typeof r) return r;
        if ("string" == typeof r) return n._`${r}`;
      }
      return n._`${e}${t}${(0, n.getProperty)(i)}`;
    }),
    (t.unescapeFragment = function (e) {
      return c(decodeURIComponent(e));
    }),
    (t.escapeFragment = function (e) {
      return encodeURIComponent(a(e));
    }),
    (t.escapeJsonPointer = a),
    (t.unescapeJsonPointer = c),
    (t.eachItem = function (e, t) {
      if (Array.isArray(e)) for (const r of e) t(r);
      else t(e);
    }),
    (t.mergeEvaluated = {
      props: l({
        mergeNames: (e, t, r) =>
          e.if(n._`${r} !== true && ${t} !== undefined`, () => {
            e.if(
              n._`${t} === true`,
              () => e.assign(r, !0),
              () => e.assign(r, n._`${r} || {}`).code(n._`Object.assign(${r}, ${t})`),
            );
          }),
        mergeToName: (e, t, r) =>
          e.if(n._`${r} !== true`, () => {
            !0 === t ? e.assign(r, !0) : (e.assign(r, n._`${r} || {}`), p(e, r, t));
          }),
        mergeValues: (e, t) => !0 === e || { ...e, ...t },
        resultToName: u,
      }),
      items: l({
        mergeNames: (e, t, r) =>
          e.if(n._`${r} !== true && ${t} !== undefined`, () =>
            e.assign(r, n._`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`),
          ),
        mergeToName: (e, t, r) =>
          e.if(n._`${r} !== true`, () => e.assign(r, !0 === t || n._`${r} > ${t} ? ${r} : ${t}`)),
        mergeValues: (e, t) => !0 === e || Math.max(e, t),
        resultToName: (e, t) => e.var("items", t),
      }),
    }),
    (t.evaluatedPropsToName = u),
    (t.setEvaluated = p));
  const d = {};
  var f;
  function h(e, t, r = e.opts.strictSchema) {
    if (r) {
      if (((t = `strict mode: ${t}`), !0 === r)) throw new Error(t);
      e.self.logger.warn(t);
    }
  }
  ((t.useFunc = function (e, t) {
    return e.scopeValue("func", { ref: t, code: d[t.code] || (d[t.code] = new i._Code(t.code)) });
  }),
    (function (e) {
      ((e[(e.Num = 0)] = "Num"), (e[(e.Str = 1)] = "Str"));
    })(f || (t.Type = f = {})),
    (t.getErrorPath = function (e, t, r) {
      if (e instanceof n.Name) {
        const i = t === f.Num;
        return r
          ? i
            ? n._`"[" + ${e} + "]"`
            : n._`"['" + ${e} + "']"`
          : i
            ? n._`"/" + ${e}`
            : n._`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
      }
      return r ? (0, n.getProperty)(e).toString() : "/" + a(e);
    }),
    (t.checkStrictMode = h));
};
