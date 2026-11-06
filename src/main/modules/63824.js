module.exports = (e, t) => {
  "use strict";
  function r(e, t) {
    return t.rules.some((t) => n(e, t));
  }
  function n(e, t) {
    var r;
    return (
      void 0 !== e[t.keyword] ||
      (null === (r = t.definition.implements) || void 0 === r
        ? void 0
        : r.some((t) => void 0 !== e[t]))
    );
  }
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.shouldUseRule = t.shouldUseGroup = t.schemaHasRulesForType = void 0),
    (t.schemaHasRulesForType = function ({ schema: e, self: t }, n) {
      const i = t.RULES.types[n];
      return i && !0 !== i && r(e, i);
    }),
    (t.shouldUseGroup = r),
    (t.shouldUseRule = n));
};
