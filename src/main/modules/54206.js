module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.getSchemaRefs =
      t.resolveUrl =
      t.normalizeId =
      t._getFullPath =
      t.getFullPath =
      t.inlineRef =
        void 0));
  const n = r(45564),
    i = r(16208),
    o = r(76555),
    s = new Set([
      "type",
      "format",
      "pattern",
      "maxLength",
      "minLength",
      "maxProperties",
      "minProperties",
      "maxItems",
      "minItems",
      "maximum",
      "minimum",
      "uniqueItems",
      "multipleOf",
      "required",
      "enum",
      "const",
    ]);
  t.inlineRef = function (e, t = !0) {
    return "boolean" == typeof e || (!0 === t ? !c(e) : !!t && l(e) <= t);
  };
  const a = new Set(["$ref", "$recursiveRef", "$recursiveAnchor", "$dynamicRef", "$dynamicAnchor"]);
  function c(e) {
    for (const t in e) {
      if (a.has(t)) return !0;
      const r = e[t];
      if (Array.isArray(r) && r.some(c)) return !0;
      if ("object" == typeof r && c(r)) return !0;
    }
    return !1;
  }
  function l(e) {
    let t = 0;
    for (const r in e) {
      if ("$ref" === r) return 1 / 0;
      if (
        (t++,
        !s.has(r) &&
          ("object" == typeof e[r] && (0, n.eachItem)(e[r], (e) => (t += l(e))), t === 1 / 0))
      )
        return 1 / 0;
    }
    return t;
  }
  function u(e, t = "", r) {
    !1 !== r && (t = f(t));
    const n = e.parse(t);
    return p(e, n);
  }
  function p(e, t) {
    return e.serialize(t).split("#")[0] + "#";
  }
  ((t.getFullPath = u), (t._getFullPath = p));
  const d = /#\/?$/;
  function f(e) {
    return e ? e.replace(d, "") : "";
  }
  ((t.normalizeId = f),
    (t.resolveUrl = function (e, t, r) {
      return ((r = f(r)), e.resolve(t, r));
    }));
  const h = /^[a-z_][-a-z0-9._]*$/i;
  t.getSchemaRefs = function (e, t) {
    if ("boolean" == typeof e) return {};
    const { schemaId: r, uriResolver: n } = this.opts,
      s = f(e[r] || t),
      a = { "": s },
      c = u(n, s, !1),
      l = {},
      p = new Set();
    return (
      o(e, { allKeys: !0 }, (e, t, n, i) => {
        if (void 0 === i) return;
        const o = c + t;
        let s = a[i];
        function u(t) {
          const r = this.opts.uriResolver.resolve;
          if (((t = f(s ? r(s, t) : t)), p.has(t))) throw m(t);
          p.add(t);
          let n = this.refs[t];
          return (
            "string" == typeof n && (n = this.refs[n]),
            "object" == typeof n
              ? d(e, n.schema, t)
              : t !== f(o) && ("#" === t[0] ? (d(e, l[t], t), (l[t] = e)) : (this.refs[t] = o)),
            t
          );
        }
        function g(e) {
          if ("string" == typeof e) {
            if (!h.test(e)) throw new Error(`invalid anchor "${e}"`);
            u.call(this, `#${e}`);
          }
        }
        ("string" == typeof e[r] && (s = u.call(this, e[r])),
          g.call(this, e.$anchor),
          g.call(this, e.$dynamicAnchor),
          (a[t] = s));
      }),
      l
    );
    function d(e, t, r) {
      if (void 0 !== t && !i(e, t)) throw m(r);
    }
    function m(e) {
      return new Error(`reference "${e}" resolves to more than one schema`);
    }
  };
};
