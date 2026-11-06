module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(32512),
    i = n.operators,
    o = {
      maximum: { okStr: "<=", ok: i.LTE, fail: i.GT },
      minimum: { okStr: ">=", ok: i.GTE, fail: i.LT },
      exclusiveMaximum: { okStr: "<", ok: i.LT, fail: i.GTE },
      exclusiveMinimum: { okStr: ">", ok: i.GT, fail: i.LTE },
    },
    s = {
      message: ({ keyword: e, schemaCode: t }) => n.str`must be ${o[e].okStr} ${t}`,
      params: ({ keyword: e, schemaCode: t }) => n._`{comparison: ${o[e].okStr}, limit: ${t}}`,
    },
    a = {
      keyword: Object.keys(o),
      type: "number",
      schemaType: "number",
      $data: !0,
      error: s,
      code(e) {
        const { keyword: t, data: r, schemaCode: i } = e;
        e.fail$data(n._`${r} ${o[t].fail} ${i} || isNaN(${r})`);
      },
    };
  t.default = a;
};
