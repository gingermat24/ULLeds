module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.resolveSchema =
      t.getCompilingSchema =
      t.resolveRef =
      t.compileSchema =
      t.SchemaEnv =
        void 0));
  const n = r(94040),
    i = r(25665),
    o = r(51178),
    s = r(54206),
    a = r(45564),
    c = r(26357);
  class l {
    constructor(e) {
      var t;
      let r;
      ((this.refs = {}),
        (this.dynamicAnchors = {}),
        "object" == typeof e.schema && (r = e.schema),
        (this.schema = e.schema),
        (this.schemaId = e.schemaId),
        (this.root = e.root || this),
        (this.baseId =
          null !== (t = e.baseId) && void 0 !== t
            ? t
            : (0, s.normalizeId)(null == r ? void 0 : r[e.schemaId || "$id"])),
        (this.schemaPath = e.schemaPath),
        (this.localRefs = e.localRefs),
        (this.meta = e.meta),
        (this.$async = null == r ? void 0 : r.$async),
        (this.refs = {}));
    }
  }
  function u(e) {
    const t = d.call(this, e);
    if (t) return t;
    const r = (0, s.getFullPath)(this.opts.uriResolver, e.root.baseId),
      { es5: a, lines: l } = this.opts.code,
      { ownProperties: u } = this.opts,
      p = new n.CodeGen(this.scope, { es5: a, lines: l, ownProperties: u });
    let f;
    e.$async &&
      (f = p.scopeValue("Error", {
        ref: i.default,
        code: n._`require("ajv/dist/runtime/validation_error").default`,
      }));
    const h = p.scopeName("validate");
    e.validateName = h;
    const m = {
      gen: p,
      allErrors: this.opts.allErrors,
      data: o.default.data,
      parentData: o.default.parentData,
      parentDataProperty: o.default.parentDataProperty,
      dataNames: [o.default.data],
      dataPathArr: [n.nil],
      dataLevel: 0,
      dataTypes: [],
      definedProperties: new Set(),
      topSchemaRef: p.scopeValue(
        "schema",
        !0 === this.opts.code.source
          ? { ref: e.schema, code: (0, n.stringify)(e.schema) }
          : { ref: e.schema },
      ),
      validateName: h,
      ValidationError: f,
      schema: e.schema,
      schemaEnv: e,
      rootId: r,
      baseId: e.baseId || r,
      schemaPath: n.nil,
      errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: n._`""`,
      opts: this.opts,
      self: this,
    };
    let g;
    try {
      (this._compilations.add(e),
        (0, c.validateFunctionCode)(m),
        p.optimize(this.opts.code.optimize));
      const t = p.toString();
      ((g = `${p.scopeRefs(o.default.scope)}return ${t}`),
        this.opts.code.process && (g = this.opts.code.process(g, e)));
      const r = new Function(`${o.default.self}`, `${o.default.scope}`, g)(this, this.scope.get());
      if (
        (this.scope.value(h, { ref: r }),
        (r.errors = null),
        (r.schema = e.schema),
        (r.schemaEnv = e),
        e.$async && (r.$async = !0),
        !0 === this.opts.code.source &&
          (r.source = { validateName: h, validateCode: t, scopeValues: p._values }),
        this.opts.unevaluated)
      ) {
        const { props: e, items: t } = m;
        ((r.evaluated = {
          props: e instanceof n.Name ? void 0 : e,
          items: t instanceof n.Name ? void 0 : t,
          dynamicProps: e instanceof n.Name,
          dynamicItems: t instanceof n.Name,
        }),
          r.source && (r.source.evaluated = (0, n.stringify)(r.evaluated)));
      }
      return ((e.validate = r), e);
    } catch (t) {
      throw (
        delete e.validate,
        delete e.validateName,
        g && this.logger.error("Error compiling schema, function code:", g),
        t
      );
    } finally {
      this._compilations.delete(e);
    }
  }
  function p(e) {
    return (0, s.inlineRef)(e.schema, this.opts.inlineRefs)
      ? e.schema
      : e.validate
        ? e
        : u.call(this, e);
  }
  function d(e) {
    for (const n of this._compilations)
      if (((r = e), (t = n).schema === r.schema && t.root === r.root && t.baseId === r.baseId))
        return n;
    var t, r;
  }
  function f(e, t) {
    let r;
    for (; "string" == typeof (r = this.refs[t]);) t = r;
    return r || this.schemas[t] || h.call(this, e, t);
  }
  function h(e, t) {
    const r = this.opts.uriResolver.parse(t),
      n = (0, s._getFullPath)(this.opts.uriResolver, r);
    let i = (0, s.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
    if (Object.keys(e.schema).length > 0 && n === i) return g.call(this, r, e);
    const o = (0, s.normalizeId)(n),
      a = this.refs[o] || this.schemas[o];
    if ("string" == typeof a) {
      const t = h.call(this, e, a);
      if ("object" != typeof (null == t ? void 0 : t.schema)) return;
      return g.call(this, r, t);
    }
    if ("object" == typeof (null == a ? void 0 : a.schema)) {
      if ((a.validate || u.call(this, a), o === (0, s.normalizeId)(t))) {
        const { schema: t } = a,
          { schemaId: r } = this.opts,
          n = t[r];
        return (
          n && (i = (0, s.resolveUrl)(this.opts.uriResolver, i, n)),
          new l({ schema: t, schemaId: r, root: e, baseId: i })
        );
      }
      return g.call(this, r, a);
    }
  }
  ((t.SchemaEnv = l),
    (t.compileSchema = u),
    (t.resolveRef = function (e, t, r) {
      var n;
      r = (0, s.resolveUrl)(this.opts.uriResolver, t, r);
      const i = e.refs[r];
      if (i) return i;
      let o = f.call(this, e, r);
      if (void 0 === o) {
        const i = null === (n = e.localRefs) || void 0 === n ? void 0 : n[r],
          { schemaId: s } = this.opts;
        i && (o = new l({ schema: i, schemaId: s, root: e, baseId: t }));
      }
      return void 0 !== o ? (e.refs[r] = p.call(this, o)) : void 0;
    }),
    (t.getCompilingSchema = d),
    (t.resolveSchema = h));
  const m = new Set(["properties", "patternProperties", "enum", "dependencies", "definitions"]);
  function g(e, { baseId: t, schema: r, root: n }) {
    var i;
    if ("/" !== (null === (i = e.fragment) || void 0 === i ? void 0 : i[0])) return;
    for (const n of e.fragment.slice(1).split("/")) {
      if ("boolean" == typeof r) return;
      const e = r[(0, a.unescapeFragment)(n)];
      if (void 0 === e) return;
      const i = "object" == typeof (r = e) && r[this.opts.schemaId];
      !m.has(n) && i && (t = (0, s.resolveUrl)(this.opts.uriResolver, t, i));
    }
    let o;
    if ("boolean" != typeof r && r.$ref && !(0, a.schemaHasRulesButRef)(r, this.RULES)) {
      const e = (0, s.resolveUrl)(this.opts.uriResolver, t, r.$ref);
      o = h.call(this, n, e);
    }
    const { schemaId: c } = this.opts;
    return (
      (o = o || new l({ schema: r, schemaId: c, root: n, baseId: t })),
      o.schema !== o.root.schema ? o : void 0
    );
  }
};
