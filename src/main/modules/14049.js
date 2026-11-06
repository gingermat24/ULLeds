module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = void 0));
  var n = r(26357);
  Object.defineProperty(t, "KeywordCxt", {
    enumerable: !0,
    get: function () {
      return n.KeywordCxt;
    },
  });
  var i = r(94040);
  (Object.defineProperty(t, "_", {
    enumerable: !0,
    get: function () {
      return i._;
    },
  }),
    Object.defineProperty(t, "str", {
      enumerable: !0,
      get: function () {
        return i.str;
      },
    }),
    Object.defineProperty(t, "stringify", {
      enumerable: !0,
      get: function () {
        return i.stringify;
      },
    }),
    Object.defineProperty(t, "nil", {
      enumerable: !0,
      get: function () {
        return i.nil;
      },
    }),
    Object.defineProperty(t, "Name", {
      enumerable: !0,
      get: function () {
        return i.Name;
      },
    }),
    Object.defineProperty(t, "CodeGen", {
      enumerable: !0,
      get: function () {
        return i.CodeGen;
      },
    }));
  const o = r(25665),
    s = r(54254),
    a = r(24365),
    c = r(91186),
    l = r(94040),
    u = r(54206),
    p = r(4969),
    d = r(45564),
    f = r(37301),
    h = r(28441),
    m = (e, t) => new RegExp(e, t);
  m.code = "new RegExp";
  const g = ["removeAdditional", "useDefaults", "coerceTypes"],
    v = new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error",
    ]),
    y = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats:
        "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now.",
    },
    w = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.',
    };
  function b(e) {
    var t, r, n, i, o, s, a, c, l, u, p, d, f, g, v, y, w, b, x, E, _, S, I, $, O;
    const R = e.strict,
      P = null === (t = e.code) || void 0 === t ? void 0 : t.optimize,
      A = !0 === P || void 0 === P ? 1 : P || 0,
      T =
        null !== (n = null === (r = e.code) || void 0 === r ? void 0 : r.regExp) && void 0 !== n
          ? n
          : m,
      k = null !== (i = e.uriResolver) && void 0 !== i ? i : h.default;
    return {
      strictSchema:
        null === (s = null !== (o = e.strictSchema) && void 0 !== o ? o : R) || void 0 === s || s,
      strictNumbers:
        null === (c = null !== (a = e.strictNumbers) && void 0 !== a ? a : R) || void 0 === c || c,
      strictTypes:
        null !== (u = null !== (l = e.strictTypes) && void 0 !== l ? l : R) && void 0 !== u
          ? u
          : "log",
      strictTuples:
        null !== (d = null !== (p = e.strictTuples) && void 0 !== p ? p : R) && void 0 !== d
          ? d
          : "log",
      strictRequired:
        null !== (g = null !== (f = e.strictRequired) && void 0 !== f ? f : R) && void 0 !== g && g,
      code: e.code ? { ...e.code, optimize: A, regExp: T } : { optimize: A, regExp: T },
      loopRequired: null !== (v = e.loopRequired) && void 0 !== v ? v : 200,
      loopEnum: null !== (y = e.loopEnum) && void 0 !== y ? y : 200,
      meta: null === (w = e.meta) || void 0 === w || w,
      messages: null === (b = e.messages) || void 0 === b || b,
      inlineRefs: null === (x = e.inlineRefs) || void 0 === x || x,
      schemaId: null !== (E = e.schemaId) && void 0 !== E ? E : "$id",
      addUsedSchema: null === (_ = e.addUsedSchema) || void 0 === _ || _,
      validateSchema: null === (S = e.validateSchema) || void 0 === S || S,
      validateFormats: null === (I = e.validateFormats) || void 0 === I || I,
      unicodeRegExp: null === ($ = e.unicodeRegExp) || void 0 === $ || $,
      int32range: null === (O = e.int32range) || void 0 === O || O,
      uriResolver: k,
    };
  }
  class x {
    constructor(e = {}) {
      ((this.schemas = {}),
        (this.refs = {}),
        (this.formats = {}),
        (this._compilations = new Set()),
        (this._loading = {}),
        (this._cache = new Map()),
        (e = this.opts = { ...e, ...b(e) }));
      const { es5: t, lines: r } = this.opts.code;
      ((this.scope = new l.ValueScope({ scope: {}, prefixes: v, es5: t, lines: r })),
        (this.logger = (function (e) {
          if (!1 === e) return R;
          if (void 0 === e) return console;
          if (e.log && e.warn && e.error) return e;
          throw new Error("logger must implement log, warn and error methods");
        })(e.logger)));
      const n = e.validateFormats;
      ((e.validateFormats = !1),
        (this.RULES = (0, a.getRules)()),
        E.call(this, y, e, "NOT SUPPORTED"),
        E.call(this, w, e, "DEPRECATED", "warn"),
        (this._metaOpts = O.call(this)),
        e.formats && I.call(this),
        this._addVocabularies(),
        this._addDefaultMetaSchema(),
        e.keywords && $.call(this, e.keywords),
        "object" == typeof e.meta && this.addMetaSchema(e.meta),
        S.call(this),
        (e.validateFormats = n));
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: e, meta: t, schemaId: r } = this.opts;
      let n = f;
      ("id" === r && ((n = { ...f }), (n.id = n.$id), delete n.$id),
        t && e && this.addMetaSchema(n, n[r], !1));
    }
    defaultMeta() {
      const { meta: e, schemaId: t } = this.opts;
      return (this.opts.defaultMeta = "object" == typeof e ? e[t] || e : void 0);
    }
    validate(e, t) {
      let r;
      if ("string" == typeof e) {
        if (((r = this.getSchema(e)), !r)) throw new Error(`no schema with key or ref "${e}"`);
      } else r = this.compile(e);
      const n = r(t);
      return ("$async" in r || (this.errors = r.errors), n);
    }
    compile(e, t) {
      const r = this._addSchema(e, t);
      return r.validate || this._compileSchemaEnv(r);
    }
    compileAsync(e, t) {
      if ("function" != typeof this.opts.loadSchema)
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: r } = this.opts;
      return n.call(this, e, t);
      async function n(e, t) {
        await i.call(this, e.$schema);
        const r = this._addSchema(e, t);
        return r.validate || o.call(this, r);
      }
      async function i(e) {
        e && !this.getSchema(e) && (await n.call(this, { $ref: e }, !0));
      }
      async function o(e) {
        try {
          return this._compileSchemaEnv(e);
        } catch (t) {
          if (!(t instanceof s.default)) throw t;
          return (a.call(this, t), await c.call(this, t.missingSchema), o.call(this, e));
        }
      }
      function a({ missingSchema: e, missingRef: t }) {
        if (this.refs[e]) throw new Error(`AnySchema ${e} is loaded but ${t} cannot be resolved`);
      }
      async function c(e) {
        const r = await l.call(this, e);
        (this.refs[e] || (await i.call(this, r.$schema)), this.refs[e] || this.addSchema(r, e, t));
      }
      async function l(e) {
        const t = this._loading[e];
        if (t) return t;
        try {
          return await (this._loading[e] = r(e));
        } finally {
          delete this._loading[e];
        }
      }
    }
    addSchema(e, t, r, n = this.opts.validateSchema) {
      if (Array.isArray(e)) {
        for (const t of e) this.addSchema(t, void 0, r, n);
        return this;
      }
      let i;
      if ("object" == typeof e) {
        const { schemaId: t } = this.opts;
        if (((i = e[t]), void 0 !== i && "string" != typeof i))
          throw new Error(`schema ${t} must be string`);
      }
      return (
        (t = (0, u.normalizeId)(t || i)),
        this._checkUnique(t),
        (this.schemas[t] = this._addSchema(e, r, t, n, !0)),
        this
      );
    }
    addMetaSchema(e, t, r = this.opts.validateSchema) {
      return (this.addSchema(e, t, !0, r), this);
    }
    validateSchema(e, t) {
      if ("boolean" == typeof e) return !0;
      let r;
      if (((r = e.$schema), void 0 !== r && "string" != typeof r))
        throw new Error("$schema must be a string");
      if (((r = r || this.opts.defaultMeta || this.defaultMeta()), !r))
        return (this.logger.warn("meta-schema not available"), (this.errors = null), !0);
      const n = this.validate(r, e);
      if (!n && t) {
        const e = "schema is invalid: " + this.errorsText();
        if ("log" !== this.opts.validateSchema) throw new Error(e);
        this.logger.error(e);
      }
      return n;
    }
    getSchema(e) {
      let t;
      for (; "string" == typeof (t = _.call(this, e));) e = t;
      if (void 0 === t) {
        const { schemaId: r } = this.opts,
          n = new c.SchemaEnv({ schema: {}, schemaId: r });
        if (((t = c.resolveSchema.call(this, n, e)), !t)) return;
        this.refs[e] = t;
      }
      return t.validate || this._compileSchemaEnv(t);
    }
    removeSchema(e) {
      if (e instanceof RegExp)
        return (
          this._removeAllSchemas(this.schemas, e),
          this._removeAllSchemas(this.refs, e),
          this
        );
      switch (typeof e) {
        case "undefined":
          return (
            this._removeAllSchemas(this.schemas),
            this._removeAllSchemas(this.refs),
            this._cache.clear(),
            this
          );
        case "string": {
          const t = _.call(this, e);
          return (
            "object" == typeof t && this._cache.delete(t.schema),
            delete this.schemas[e],
            delete this.refs[e],
            this
          );
        }
        case "object": {
          const t = e;
          this._cache.delete(t);
          let r = e[this.opts.schemaId];
          return (
            r && ((r = (0, u.normalizeId)(r)), delete this.schemas[r], delete this.refs[r]),
            this
          );
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    addVocabulary(e) {
      for (const t of e) this.addKeyword(t);
      return this;
    }
    addKeyword(e, t) {
      let r;
      if ("string" == typeof e)
        ((r = e),
          "object" == typeof t &&
            (this.logger.warn("these parameters are deprecated, see docs for addKeyword"),
            (t.keyword = r)));
      else {
        if ("object" != typeof e || void 0 !== t) throw new Error("invalid addKeywords parameters");
        if (((r = (t = e).keyword), Array.isArray(r) && !r.length))
          throw new Error("addKeywords: keyword must be string or non-empty array");
      }
      if ((A.call(this, r, t), !t)) return ((0, d.eachItem)(r, (e) => T.call(this, e)), this);
      N.call(this, t);
      const n = {
        ...t,
        type: (0, p.getJSONTypes)(t.type),
        schemaType: (0, p.getJSONTypes)(t.schemaType),
      };
      return (
        (0, d.eachItem)(
          r,
          0 === n.type.length
            ? (e) => T.call(this, e, n)
            : (e) => n.type.forEach((t) => T.call(this, e, n, t)),
        ),
        this
      );
    }
    getKeyword(e) {
      const t = this.RULES.all[e];
      return "object" == typeof t ? t.definition : !!t;
    }
    removeKeyword(e) {
      const { RULES: t } = this;
      (delete t.keywords[e], delete t.all[e]);
      for (const r of t.rules) {
        const t = r.rules.findIndex((t) => t.keyword === e);
        t >= 0 && r.rules.splice(t, 1);
      }
      return this;
    }
    addFormat(e, t) {
      return ("string" == typeof t && (t = new RegExp(t)), (this.formats[e] = t), this);
    }
    errorsText(e = this.errors, { separator: t = ", ", dataVar: r = "data" } = {}) {
      return e && 0 !== e.length
        ? e.map((e) => `${r}${e.instancePath} ${e.message}`).reduce((e, r) => e + t + r)
        : "No errors";
    }
    $dataMetaSchema(e, t) {
      const r = this.RULES.all;
      e = JSON.parse(JSON.stringify(e));
      for (const n of t) {
        const t = n.split("/").slice(1);
        let i = e;
        for (const e of t) i = i[e];
        for (const e in r) {
          const t = r[e];
          if ("object" != typeof t) continue;
          const { $data: n } = t.definition,
            o = i[e];
          n && o && (i[e] = L(o));
        }
      }
      return e;
    }
    _removeAllSchemas(e, t) {
      for (const r in e) {
        const n = e[r];
        (t && !t.test(r)) ||
          ("string" == typeof n
            ? delete e[r]
            : n && !n.meta && (this._cache.delete(n.schema), delete e[r]));
      }
    }
    _addSchema(e, t, r, n = this.opts.validateSchema, i = this.opts.addUsedSchema) {
      let o;
      const { schemaId: s } = this.opts;
      if ("object" == typeof e) o = e[s];
      else {
        if (this.opts.jtd) throw new Error("schema must be object");
        if ("boolean" != typeof e) throw new Error("schema must be object or boolean");
      }
      let a = this._cache.get(e);
      if (void 0 !== a) return a;
      r = (0, u.normalizeId)(o || r);
      const l = u.getSchemaRefs.call(this, e, r);
      return (
        (a = new c.SchemaEnv({ schema: e, schemaId: s, meta: t, baseId: r, localRefs: l })),
        this._cache.set(a.schema, a),
        i && !r.startsWith("#") && (r && this._checkUnique(r), (this.refs[r] = a)),
        n && this.validateSchema(e, !0),
        a
      );
    }
    _checkUnique(e) {
      if (this.schemas[e] || this.refs[e])
        throw new Error(`schema with key or id "${e}" already exists`);
    }
    _compileSchemaEnv(e) {
      if ((e.meta ? this._compileMetaSchema(e) : c.compileSchema.call(this, e), !e.validate))
        throw new Error("ajv implementation error");
      return e.validate;
    }
    _compileMetaSchema(e) {
      const t = this.opts;
      this.opts = this._metaOpts;
      try {
        c.compileSchema.call(this, e);
      } finally {
        this.opts = t;
      }
    }
  }
  function E(e, t, r, n = "error") {
    for (const i in e) {
      const o = i;
      o in t && this.logger[n](`${r}: option ${i}. ${e[o]}`);
    }
  }
  function _(e) {
    return ((e = (0, u.normalizeId)(e)), this.schemas[e] || this.refs[e]);
  }
  function S() {
    const e = this.opts.schemas;
    if (e)
      if (Array.isArray(e)) this.addSchema(e);
      else for (const t in e) this.addSchema(e[t], t);
  }
  function I() {
    for (const e in this.opts.formats) {
      const t = this.opts.formats[e];
      t && this.addFormat(e, t);
    }
  }
  function $(e) {
    if (Array.isArray(e)) this.addVocabulary(e);
    else {
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const t in e) {
        const r = e[t];
        (r.keyword || (r.keyword = t), this.addKeyword(r));
      }
    }
  }
  function O() {
    const e = { ...this.opts };
    for (const t of g) delete e[t];
    return e;
  }
  ((x.ValidationError = o.default), (x.MissingRefError = s.default), (t.default = x));
  const R = { log() {}, warn() {}, error() {} },
    P = /^[a-z_$][a-z0-9_$:-]*$/i;
  function A(e, t) {
    const { RULES: r } = this;
    if (
      ((0, d.eachItem)(e, (e) => {
        if (r.keywords[e]) throw new Error(`Keyword ${e} is already defined`);
        if (!P.test(e)) throw new Error(`Keyword ${e} has invalid name`);
      }),
      t && t.$data && !("code" in t) && !("validate" in t))
    )
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function T(e, t, r) {
    var n;
    const i = null == t ? void 0 : t.post;
    if (r && i) throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: o } = this;
    let s = i ? o.post : o.rules.find(({ type: e }) => e === r);
    if ((s || ((s = { type: r, rules: [] }), o.rules.push(s)), (o.keywords[e] = !0), !t)) return;
    const a = {
      keyword: e,
      definition: {
        ...t,
        type: (0, p.getJSONTypes)(t.type),
        schemaType: (0, p.getJSONTypes)(t.schemaType),
      },
    };
    (t.before ? k.call(this, s, a, t.before) : s.rules.push(a),
      (o.all[e] = a),
      null === (n = t.implements) || void 0 === n || n.forEach((e) => this.addKeyword(e)));
  }
  function k(e, t, r) {
    const n = e.rules.findIndex((e) => e.keyword === r);
    n >= 0
      ? e.rules.splice(n, 0, t)
      : (e.rules.push(t), this.logger.warn(`rule ${r} is not defined`));
  }
  function N(e) {
    let { metaSchema: t } = e;
    void 0 !== t &&
      (e.$data && this.opts.$data && (t = L(t)), (e.validateSchema = this.compile(t, !0)));
  }
  const C = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
  };
  function L(e) {
    return { anyOf: [e, C] };
  }
};
