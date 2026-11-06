module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.getData = t.KeywordCxt = t.validateFunctionCode = void 0));
  const n = r(89926),
    i = r(4969),
    o = r(79848),
    s = r(4969),
    a = r(2719),
    c = r(49894),
    l = r(80756),
    u = r(94040),
    p = r(51178),
    d = r(54206),
    f = r(45564),
    h = r(70407);
  function m({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: i }, o) {
    i.code.es5
      ? e.func(t, u._`${p.default.data}, ${p.default.valCxt}`, n.$async, () => {
          (e.code(u._`"use strict"; ${g(r, i)}`),
            (function (e, t) {
              e.if(
                p.default.valCxt,
                () => {
                  (e.var(
                    p.default.instancePath,
                    u._`${p.default.valCxt}.${p.default.instancePath}`,
                  ),
                    e.var(p.default.parentData, u._`${p.default.valCxt}.${p.default.parentData}`),
                    e.var(
                      p.default.parentDataProperty,
                      u._`${p.default.valCxt}.${p.default.parentDataProperty}`,
                    ),
                    e.var(p.default.rootData, u._`${p.default.valCxt}.${p.default.rootData}`),
                    t.dynamicRef &&
                      e.var(
                        p.default.dynamicAnchors,
                        u._`${p.default.valCxt}.${p.default.dynamicAnchors}`,
                      ));
                },
                () => {
                  (e.var(p.default.instancePath, u._`""`),
                    e.var(p.default.parentData, u._`undefined`),
                    e.var(p.default.parentDataProperty, u._`undefined`),
                    e.var(p.default.rootData, p.default.data),
                    t.dynamicRef && e.var(p.default.dynamicAnchors, u._`{}`));
                },
              );
            })(e, i),
            e.code(o));
        })
      : e.func(
          t,
          u._`${p.default.data}, ${(function (e) {
            return u._`{${p.default.instancePath}="", ${p.default.parentData}, ${p.default.parentDataProperty}, ${p.default.rootData}=${p.default.data}${e.dynamicRef ? u._`, ${p.default.dynamicAnchors}={}` : u.nil}}={}`;
          })(i)}`,
          n.$async,
          () => e.code(g(r, i)).code(o),
        );
  }
  function g(e, t) {
    const r = "object" == typeof e && e[t.schemaId];
    return r && (t.code.source || t.code.process) ? u._`/*# sourceURL=${r} */` : u.nil;
  }
  function v({ schema: e, self: t }) {
    if ("boolean" == typeof e) return !e;
    for (const r in e) if (t.RULES.all[r]) return !0;
    return !1;
  }
  function y(e) {
    return "boolean" != typeof e.schema;
  }
  function w(e) {
    ((0, f.checkUnknownRules)(e),
      (function (e) {
        const { schema: t, errSchemaPath: r, opts: n, self: i } = e;
        t.$ref &&
          n.ignoreKeywordsWithRef &&
          (0, f.schemaHasRulesButRef)(t, i.RULES) &&
          i.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
      })(e));
  }
  function b(e, t) {
    if (e.opts.jtd) return E(e, [], !1, t);
    const r = (0, i.getSchemaTypes)(e.schema);
    E(e, r, !(0, i.coerceAndCheckDataType)(e, r), t);
  }
  function x({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: i }) {
    const o = r.$comment;
    if (!0 === i.$comment) e.code(u._`${p.default.self}.logger.log(${o})`);
    else if ("function" == typeof i.$comment) {
      const r = u.str`${n}/$comment`,
        i = e.scopeValue("root", { ref: t.root });
      e.code(u._`${p.default.self}.opts.$comment(${o}, ${r}, ${i}.schema)`);
    }
  }
  function E(e, t, r, n) {
    const { gen: i, schema: a, data: c, allErrors: l, opts: d, self: h } = e,
      { RULES: m } = h;
    function g(f) {
      (0, o.shouldUseGroup)(a, f) &&
        (f.type
          ? (i.if((0, s.checkDataType)(f.type, c, d.strictNumbers)),
            _(e, f),
            1 === t.length && t[0] === f.type && r && (i.else(), (0, s.reportTypeError)(e)),
            i.endIf())
          : _(e, f),
        l || i.if(u._`${p.default.errors} === ${n || 0}`));
    }
    !a.$ref || (!d.ignoreKeywordsWithRef && (0, f.schemaHasRulesButRef)(a, m))
      ? (d.jtd ||
          (function (e, t) {
            !e.schemaEnv.meta &&
              e.opts.strictTypes &&
              ((function (e, t) {
                t.length &&
                  (e.dataTypes.length
                    ? (t.forEach((t) => {
                        S(e.dataTypes, t) ||
                          I(e, `type "${t}" not allowed by context "${e.dataTypes.join(",")}"`);
                      }),
                      (function (e, t) {
                        const r = [];
                        for (const n of e.dataTypes)
                          S(t, n)
                            ? r.push(n)
                            : t.includes("integer") && "number" === n && r.push("integer");
                        e.dataTypes = r;
                      })(e, t))
                    : (e.dataTypes = t));
              })(e, t),
              e.opts.allowUnionTypes ||
                (function (e, t) {
                  t.length > 1 &&
                    (2 !== t.length || !t.includes("null")) &&
                    I(e, "use allowUnionTypes to allow union type keyword");
                })(e, t),
              (function (e, t) {
                const r = e.self.RULES.all;
                for (const n in r) {
                  const i = r[n];
                  if ("object" == typeof i && (0, o.shouldUseRule)(e.schema, i)) {
                    const { type: r } = i.definition;
                    r.length &&
                      !r.some((e) => {
                        return (
                          (n = e),
                          (r = t).includes(n) || ("number" === n && r.includes("integer"))
                        );
                        var r, n;
                      }) &&
                      I(e, `missing type "${r.join(",")}" for keyword "${n}"`);
                  }
                }
              })(e, e.dataTypes));
          })(e, t),
        i.block(() => {
          for (const e of m.rules) g(e);
          g(m.post);
        }))
      : i.block(() => O(e, "$ref", m.all.$ref.definition));
  }
  function _(e, t) {
    const {
      gen: r,
      schema: n,
      opts: { useDefaults: i },
    } = e;
    (i && (0, a.assignDefaults)(e, t.type),
      r.block(() => {
        for (const r of t.rules)
          (0, o.shouldUseRule)(n, r) && O(e, r.keyword, r.definition, t.type);
      }));
  }
  function S(e, t) {
    return e.includes(t) || ("integer" === t && e.includes("number"));
  }
  function I(e, t) {
    ((t += ` at "${e.schemaEnv.baseId + e.errSchemaPath}" (strictTypes)`),
      (0, f.checkStrictMode)(e, t, e.opts.strictTypes));
  }
  t.validateFunctionCode = function (e) {
    y(e) && (w(e), v(e))
      ? (function (e) {
          const { schema: t, opts: r, gen: n } = e;
          m(e, () => {
            (r.$comment && t.$comment && x(e),
              (function (e) {
                const { schema: t, opts: r } = e;
                void 0 !== t.default &&
                  r.useDefaults &&
                  r.strictSchema &&
                  (0, f.checkStrictMode)(e, "default is ignored in the schema root");
              })(e),
              n.let(p.default.vErrors, null),
              n.let(p.default.errors, 0),
              r.unevaluated &&
                (function (e) {
                  const { gen: t, validateName: r } = e;
                  ((e.evaluated = t.const("evaluated", u._`${r}.evaluated`)),
                    t.if(u._`${e.evaluated}.dynamicProps`, () =>
                      t.assign(u._`${e.evaluated}.props`, u._`undefined`),
                    ),
                    t.if(u._`${e.evaluated}.dynamicItems`, () =>
                      t.assign(u._`${e.evaluated}.items`, u._`undefined`),
                    ));
                })(e),
              b(e),
              (function (e) {
                const { gen: t, schemaEnv: r, validateName: n, ValidationError: i, opts: o } = e;
                r.$async
                  ? t.if(
                      u._`${p.default.errors} === 0`,
                      () => t.return(p.default.data),
                      () => t.throw(u._`new ${i}(${p.default.vErrors})`),
                    )
                  : (t.assign(u._`${n}.errors`, p.default.vErrors),
                    o.unevaluated &&
                      (function ({ gen: e, evaluated: t, props: r, items: n }) {
                        (r instanceof u.Name && e.assign(u._`${t}.props`, r),
                          n instanceof u.Name && e.assign(u._`${t}.items`, n));
                      })(e),
                    t.return(u._`${p.default.errors} === 0`));
              })(e));
          });
        })(e)
      : m(e, () => (0, n.topBoolOrEmptySchema)(e));
  };
  class $ {
    constructor(e, t, r) {
      if (
        ((0, c.validateKeywordUsage)(e, t, r),
        (this.gen = e.gen),
        (this.allErrors = e.allErrors),
        (this.keyword = r),
        (this.data = e.data),
        (this.schema = e.schema[r]),
        (this.$data = t.$data && e.opts.$data && this.schema && this.schema.$data),
        (this.schemaValue = (0, f.schemaRefOrVal)(e, this.schema, r, this.$data)),
        (this.schemaType = t.schemaType),
        (this.parentSchema = e.schema),
        (this.params = {}),
        (this.it = e),
        (this.def = t),
        this.$data)
      )
        this.schemaCode = e.gen.const("vSchema", A(this.$data, e));
      else if (
        ((this.schemaCode = this.schemaValue),
        !(0, c.validSchemaType)(this.schema, t.schemaType, t.allowUndefined))
      )
        throw new Error(`${r} value must be ${JSON.stringify(t.schemaType)}`);
      ("code" in t ? t.trackErrors : !1 !== t.errors) &&
        (this.errsCount = e.gen.const("_errs", p.default.errors));
    }
    result(e, t, r) {
      this.failResult((0, u.not)(e), t, r);
    }
    failResult(e, t, r) {
      (this.gen.if(e),
        r ? r() : this.error(),
        t
          ? (this.gen.else(), t(), this.allErrors && this.gen.endIf())
          : this.allErrors
            ? this.gen.endIf()
            : this.gen.else());
    }
    pass(e, t) {
      this.failResult((0, u.not)(e), void 0, t);
    }
    fail(e) {
      if (void 0 === e) return (this.error(), void (this.allErrors || this.gen.if(!1)));
      (this.gen.if(e), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else());
    }
    fail$data(e) {
      if (!this.$data) return this.fail(e);
      const { schemaCode: t } = this;
      this.fail(u._`${t} !== undefined && (${(0, u.or)(this.invalid$data(), e)})`);
    }
    error(e, t, r) {
      if (t) return (this.setParams(t), this._error(e, r), void this.setParams({}));
      this._error(e, r);
    }
    _error(e, t) {
      (e ? h.reportExtraError : h.reportError)(this, this.def.error, t);
    }
    $dataError() {
      (0, h.reportError)(this, this.def.$dataError || h.keyword$DataError);
    }
    reset() {
      if (void 0 === this.errsCount) throw new Error('add "trackErrors" to keyword definition');
      (0, h.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(e) {
      this.allErrors || this.gen.if(e);
    }
    setParams(e, t) {
      t ? Object.assign(this.params, e) : (this.params = e);
    }
    block$data(e, t, r = u.nil) {
      this.gen.block(() => {
        (this.check$data(e, r), t());
      });
    }
    check$data(e = u.nil, t = u.nil) {
      if (!this.$data) return;
      const { gen: r, schemaCode: n, schemaType: i, def: o } = this;
      (r.if((0, u.or)(u._`${n} === undefined`, t)),
        e !== u.nil && r.assign(e, !0),
        (i.length || o.validateSchema) &&
          (r.elseIf(this.invalid$data()), this.$dataError(), e !== u.nil && r.assign(e, !1)),
        r.else());
    }
    invalid$data() {
      const { gen: e, schemaCode: t, schemaType: r, def: n, it: i } = this;
      return (0, u.or)(
        (function () {
          if (r.length) {
            if (!(t instanceof u.Name)) throw new Error("ajv implementation error");
            const e = Array.isArray(r) ? r : [r];
            return u._`${(0, s.checkDataTypes)(e, t, i.opts.strictNumbers, s.DataType.Wrong)}`;
          }
          return u.nil;
        })(),
        (function () {
          if (n.validateSchema) {
            const r = e.scopeValue("validate$data", { ref: n.validateSchema });
            return u._`!${r}(${t})`;
          }
          return u.nil;
        })(),
      );
    }
    subschema(e, t) {
      const r = (0, l.getSubschema)(this.it, e);
      ((0, l.extendSubschemaData)(r, this.it, e), (0, l.extendSubschemaMode)(r, e));
      const i = { ...this.it, ...r, items: void 0, props: void 0 };
      return (
        (function (e, t) {
          y(e) && (w(e), v(e))
            ? (function (e, t) {
                const { schema: r, gen: n, opts: i } = e;
                (i.$comment && r.$comment && x(e),
                  (function (e) {
                    const t = e.schema[e.opts.schemaId];
                    t && (e.baseId = (0, d.resolveUrl)(e.opts.uriResolver, e.baseId, t));
                  })(e),
                  (function (e) {
                    if (e.schema.$async && !e.schemaEnv.$async)
                      throw new Error("async schema in sync schema");
                  })(e));
                const o = n.const("_errs", p.default.errors);
                (b(e, o), n.var(t, u._`${o} === ${p.default.errors}`));
              })(e, t)
            : (0, n.boolOrEmptySchema)(e, t);
        })(i, t),
        i
      );
    }
    mergeEvaluated(e, t) {
      const { it: r, gen: n } = this;
      r.opts.unevaluated &&
        (!0 !== r.props &&
          void 0 !== e.props &&
          (r.props = f.mergeEvaluated.props(n, e.props, r.props, t)),
        !0 !== r.items &&
          void 0 !== e.items &&
          (r.items = f.mergeEvaluated.items(n, e.items, r.items, t)));
    }
    mergeValidEvaluated(e, t) {
      const { it: r, gen: n } = this;
      if (r.opts.unevaluated && (!0 !== r.props || !0 !== r.items))
        return (n.if(t, () => this.mergeEvaluated(e, u.Name)), !0);
    }
  }
  function O(e, t, r, n) {
    const i = new $(e, r, t);
    "code" in r
      ? r.code(i, n)
      : i.$data && r.validate
        ? (0, c.funcKeywordCode)(i, r)
        : "macro" in r
          ? (0, c.macroKeywordCode)(i, r)
          : (r.compile || r.validate) && (0, c.funcKeywordCode)(i, r);
  }
  t.KeywordCxt = $;
  const R = /^\/(?:[^~]|~0|~1)*$/,
    P = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function A(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
    let i, o;
    if ("" === e) return p.default.rootData;
    if ("/" === e[0]) {
      if (!R.test(e)) throw new Error(`Invalid JSON-pointer: ${e}`);
      ((i = e), (o = p.default.rootData));
    } else {
      const s = P.exec(e);
      if (!s) throw new Error(`Invalid JSON-pointer: ${e}`);
      const a = +s[1];
      if (((i = s[2]), "#" === i)) {
        if (a >= t) throw new Error(c("property/index", a));
        return n[t - a];
      }
      if (a > t) throw new Error(c("data", a));
      if (((o = r[t - a]), !i)) return o;
    }
    let s = o;
    const a = i.split("/");
    for (const e of a)
      e &&
        ((o = u._`${o}${(0, u.getProperty)((0, f.unescapeJsonPointer)(e))}`),
        (s = u._`${s} && ${o}`));
    return s;
    function c(e, r) {
      return `Cannot access ${e} ${r} levels up, current level is ${t}`;
    }
  }
  t.getData = A;
};
