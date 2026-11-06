module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.boolOrEmptySchema = t.topBoolOrEmptySchema = void 0));
  const n = r(70407),
    i = r(94040),
    o = r(51178),
    s = { message: "boolean schema is false" };
  function a(e, t) {
    const { gen: r, data: i } = e,
      o = {
        gen: r,
        keyword: "false schema",
        data: i,
        schema: !1,
        schemaCode: !1,
        schemaValue: !1,
        params: {},
        it: e,
      };
    (0, n.reportError)(o, s, void 0, t);
  }
  ((t.topBoolOrEmptySchema = function (e) {
    const { gen: t, schema: r, validateName: n } = e;
    !1 === r
      ? a(e, !1)
      : "object" == typeof r && !0 === r.$async
        ? t.return(o.default.data)
        : (t.assign(i._`${n}.errors`, null), t.return(!0));
  }),
    (t.boolOrEmptySchema = function (e, t) {
      const { gen: r, schema: n } = e;
      !1 === n ? (r.var(t, !1), a(e)) : r.var(t, !0);
    }));
};
