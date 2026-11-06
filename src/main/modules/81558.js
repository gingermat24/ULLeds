module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(32512),
    i = r(13556),
    o = r(83770),
    s = {
      keyword: ["maxLength", "minLength"],
      type: "string",
      schemaType: "number",
      $data: !0,
      error: {
        message({ keyword: e, schemaCode: t }) {
          const r = "maxLength" === e ? "more" : "fewer";
          return n.str`must NOT have ${r} than ${t} characters`;
        },
        params: ({ schemaCode: e }) => n._`{limit: ${e}}`,
      },
      code(e) {
        const { keyword: t, data: r, schemaCode: s, it: a } = e,
          c = "maxLength" === t ? n.operators.GT : n.operators.LT,
          l =
            !1 === a.opts.unicode
              ? n._`${r}.length`
              : n._`${(0, i.useFunc)(e.gen, o.default)}(${r})`;
        e.fail$data(n._`${l} ${c} ${s}`);
      },
    };
  t.default = s;
};
