module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.MissingRefError =
      t.ValidationError =
      t.CodeGen =
      t.Name =
      t.nil =
      t.stringify =
      t.str =
      t._ =
      t.KeywordCxt =
      t.Ajv =
        void 0));
  const n = r(68793),
    i = r(59441),
    o = r(50706),
    s = r(89049),
    a = ["/properties"],
    c = "http://json-schema.org/draft-07/schema";
  class l extends n.default {
    _addVocabularies() {
      (super._addVocabularies(),
        i.default.forEach((e) => this.addVocabulary(e)),
        this.opts.discriminator && this.addKeyword(o.default));
    }
    _addDefaultMetaSchema() {
      if ((super._addDefaultMetaSchema(), !this.opts.meta)) return;
      const e = this.opts.$data ? this.$dataMetaSchema(s, a) : s;
      (this.addMetaSchema(e, c, !1), (this.refs["http://json-schema.org/schema"] = c));
    }
    defaultMeta() {
      return (this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(c) ? c : void 0));
    }
  }
  ((t.Ajv = l),
    (e.exports = t = l),
    (e.exports.Ajv = l),
    Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.default = l));
  var u = r(57613);
  Object.defineProperty(t, "KeywordCxt", {
    enumerable: !0,
    get: function () {
      return u.KeywordCxt;
    },
  });
  var p = r(32512);
  (Object.defineProperty(t, "_", {
    enumerable: !0,
    get: function () {
      return p._;
    },
  }),
    Object.defineProperty(t, "str", {
      enumerable: !0,
      get: function () {
        return p.str;
      },
    }),
    Object.defineProperty(t, "stringify", {
      enumerable: !0,
      get: function () {
        return p.stringify;
      },
    }),
    Object.defineProperty(t, "nil", {
      enumerable: !0,
      get: function () {
        return p.nil;
      },
    }),
    Object.defineProperty(t, "Name", {
      enumerable: !0,
      get: function () {
        return p.Name;
      },
    }),
    Object.defineProperty(t, "CodeGen", {
      enumerable: !0,
      get: function () {
        return p.CodeGen;
      },
    }));
  var d = r(21721);
  Object.defineProperty(t, "ValidationError", {
    enumerable: !0,
    get: function () {
      return d.default;
    },
  });
  var f = r(24086);
  Object.defineProperty(t, "MissingRefError", {
    enumerable: !0,
    get: function () {
      return f.default;
    },
  });
};
