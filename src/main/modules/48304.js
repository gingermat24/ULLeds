module.exports = (e, t, r) => {
  "use strict";
  var n = r(92701),
    i = r(40951);
  function o(e, t) {
    var r = [];
    return (
      e[t].forEach(function (e) {
        var t = r.length;
        (r.forEach(function (r, n) {
          r.tag === e.tag && r.kind === e.kind && r.multi === e.multi && (t = n);
        }),
          (r[t] = e));
      }),
      r
    );
  }
  function s(e) {
    return this.extend(e);
  }
  ((s.prototype.extend = function (e) {
    var t = [],
      r = [];
    if (e instanceof i) r.push(e);
    else if (Array.isArray(e)) r = r.concat(e);
    else {
      if (!e || (!Array.isArray(e.implicit) && !Array.isArray(e.explicit)))
        throw new n(
          "Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })",
        );
      (e.implicit && (t = t.concat(e.implicit)), e.explicit && (r = r.concat(e.explicit)));
    }
    (t.forEach(function (e) {
      if (!(e instanceof i))
        throw new n(
          "Specified list of YAML types (or a single Type object) contains a non-Type object.",
        );
      if (e.loadKind && "scalar" !== e.loadKind)
        throw new n(
          "There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.",
        );
      if (e.multi)
        throw new n(
          "There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.",
        );
    }),
      r.forEach(function (e) {
        if (!(e instanceof i))
          throw new n(
            "Specified list of YAML types (or a single Type object) contains a non-Type object.",
          );
      }));
    var a = Object.create(s.prototype);
    return (
      (a.implicit = (this.implicit || []).concat(t)),
      (a.explicit = (this.explicit || []).concat(r)),
      (a.compiledImplicit = o(a, "implicit")),
      (a.compiledExplicit = o(a, "explicit")),
      (a.compiledTypeMap = (function () {
        var e,
          t,
          r = {
            scalar: {},
            sequence: {},
            mapping: {},
            fallback: {},
            multi: { scalar: [], sequence: [], mapping: [], fallback: [] },
          };
        function n(e) {
          e.multi
            ? (r.multi[e.kind].push(e), r.multi.fallback.push(e))
            : (r[e.kind][e.tag] = r.fallback[e.tag] = e);
        }
        for (e = 0, t = arguments.length; e < t; e += 1) arguments[e].forEach(n);
        return r;
      })(a.compiledImplicit, a.compiledExplicit)),
      a
    );
  }),
    (e.exports = s));
};
