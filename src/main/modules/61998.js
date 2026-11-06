module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(32512),
    i = {
      keyword: "format",
      type: ["number", "string"],
      schemaType: "string",
      $data: !0,
      error: {
        message: ({ schemaCode: e }) => n.str`must match format "${e}"`,
        params: ({ schemaCode: e }) => n._`{format: ${e}}`,
      },
      code(e, t) {
        const { gen: r, data: i, $data: o, schema: s, schemaCode: a, it: c } = e,
          { opts: l, errSchemaPath: u, schemaEnv: p, self: d } = c;
        l.validateFormats &&
          (o
            ? (function () {
                const o = r.scopeValue("formats", { ref: d.formats, code: l.code.formats }),
                  s = r.const("fDef", n._`${o}[${a}]`),
                  c = r.let("fType"),
                  u = r.let("format");
                (r.if(
                  n._`typeof ${s} == "object" && !(${s} instanceof RegExp)`,
                  () => r.assign(c, n._`${s}.type || "string"`).assign(u, n._`${s}.validate`),
                  () => r.assign(c, n._`"string"`).assign(u, s),
                ),
                  e.fail$data(
                    (0, n.or)(
                      !1 === l.strictSchema ? n.nil : n._`${a} && !${u}`,
                      (function () {
                        const e = p.$async
                            ? n._`(${s}.async ? await ${u}(${i}) : ${u}(${i}))`
                            : n._`${u}(${i})`,
                          r = n._`(typeof ${u} == "function" ? ${e} : ${u}.test(${i}))`;
                        return n._`${u} && ${u} !== true && ${c} === ${t} && !${r}`;
                      })(),
                    ),
                  ));
              })()
            : (function () {
                const o = d.formats[s];
                if (!o)
                  return void (function () {
                    if (!1 !== l.strictSchema) throw new Error(e());
                    function e() {
                      return `unknown format "${s}" ignored in schema at path "${u}"`;
                    }
                    d.logger.warn(e());
                  })();
                if (!0 === o) return;
                const [a, c, f] = (function (e) {
                  const t =
                      e instanceof RegExp
                        ? (0, n.regexpCode)(e)
                        : l.code.formats
                          ? n._`${l.code.formats}${(0, n.getProperty)(s)}`
                          : void 0,
                    i = r.scopeValue("formats", { key: s, ref: e, code: t });
                  return "object" != typeof e || e instanceof RegExp
                    ? ["string", e, i]
                    : [e.type || "string", e.validate, n._`${i}.validate`];
                })(o);
                a === t &&
                  e.pass(
                    (function () {
                      if ("object" == typeof o && !(o instanceof RegExp) && o.async) {
                        if (!p.$async) throw new Error("async format in sync schema");
                        return n._`await ${f}(${i})`;
                      }
                      return "function" == typeof c ? n._`${f}(${i})` : n._`${f}.test(${i})`;
                    })(),
                  );
              })());
      },
    };
  t.default = i;
};
