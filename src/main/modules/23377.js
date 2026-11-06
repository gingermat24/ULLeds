module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(13556),
    i = {
      keyword: ["then", "else"],
      schemaType: ["object", "boolean"],
      code({ keyword: e, parentSchema: t, it: r }) {
        void 0 === t.if && (0, n.checkStrictMode)(r, `"${e}" without "if" is ignored`);
      },
    };
  t.default = i;
};
