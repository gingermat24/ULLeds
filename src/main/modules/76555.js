module.exports = (e) => {
  "use strict";
  var t = (e.exports = function (e, t, n) {
    ("function" == typeof t && ((n = t), (t = {})),
      r(
        t,
        "function" == typeof (n = t.cb || n) ? n : n.pre || function () {},
        n.post || function () {},
        e,
        "",
        e,
      ));
  });
  function r(e, n, i, o, s, a, c, l, u, p) {
    if (o && "object" == typeof o && !Array.isArray(o)) {
      for (var d in (n(o, s, a, c, l, u, p), o)) {
        var f = o[d];
        if (Array.isArray(f)) {
          if (d in t.arrayKeywords)
            for (var h = 0; h < f.length; h++)
              r(e, n, i, f[h], s + "/" + d + "/" + h, a, s, d, o, h);
        } else if (d in t.propsKeywords) {
          if (f && "object" == typeof f)
            for (var m in f)
              r(
                e,
                n,
                i,
                f[m],
                s + "/" + d + "/" + m.replace(/~/g, "~0").replace(/\//g, "~1"),
                a,
                s,
                d,
                o,
                m,
              );
        } else
          (d in t.keywords || (e.allKeys && !(d in t.skipKeywords))) &&
            r(e, n, i, f, s + "/" + d, a, s, d, o);
      }
      i(o, s, a, c, l, u, p);
    }
  }
  ((t.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0,
  }),
    (t.arrayKeywords = { items: !0, allOf: !0, anyOf: !0, oneOf: !0 }),
    (t.propsKeywords = {
      $defs: !0,
      definitions: !0,
      properties: !0,
      patternProperties: !0,
      dependencies: !0,
    }),
    (t.skipKeywords = {
      default: !0,
      enum: !0,
      const: !0,
      required: !0,
      maximum: !0,
      minimum: !0,
      exclusiveMaximum: !0,
      exclusiveMinimum: !0,
      multipleOf: !0,
      maxLength: !0,
      minLength: !0,
      pattern: !0,
      format: !0,
      maxItems: !0,
      minItems: !0,
      uniqueItems: !0,
      maxProperties: !0,
      minProperties: !0,
    }));
};
