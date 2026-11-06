module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(15288),
    i = r(32512),
    o = r(13556),
    s = {
      keyword: "required",
      type: "object",
      schemaType: "array",
      $data: !0,
      error: {
        message: ({ params: { missingProperty: e } }) => i.str`must have required property '${e}'`,
        params: ({ params: { missingProperty: e } }) => i._`{missingProperty: ${e}}`,
      },
      code(e) {
        const { gen: t, schema: r, schemaCode: s, data: a, $data: c, it: l } = e,
          { opts: u } = l;
        if (!c && 0 === r.length) return;
        const p = r.length >= u.loopRequired;
        if (
          (l.allErrors
            ? (function () {
                if (p || c) e.block$data(i.nil, d);
                else for (const t of r) (0, n.checkReportMissingProp)(e, t);
              })()
            : (function () {
                const o = t.let("missing");
                if (p || c) {
                  const r = t.let("valid", !0);
                  (e.block$data(r, () =>
                    (function (r, o) {
                      (e.setParams({ missingProperty: r }),
                        t.forOf(
                          r,
                          s,
                          () => {
                            (t.assign(o, (0, n.propertyInData)(t, a, r, u.ownProperties)),
                              t.if((0, i.not)(o), () => {
                                (e.error(), t.break());
                              }));
                          },
                          i.nil,
                        ));
                    })(o, r),
                  ),
                    e.ok(r));
                } else
                  (t.if((0, n.checkMissingProp)(e, r, o)),
                    (0, n.reportMissingProp)(e, o),
                    t.else());
              })(),
          u.strictRequired)
        ) {
          const t = e.parentSchema.properties,
            { definedProperties: n } = e.it;
          for (const e of r)
            if (void 0 === (null == t ? void 0 : t[e]) && !n.has(e)) {
              const t = `required property "${e}" is not defined at "${l.schemaEnv.baseId + l.errSchemaPath}" (strictRequired)`;
              (0, o.checkStrictMode)(l, t, l.opts.strictRequired);
            }
        }
        function d() {
          t.forOf("prop", s, (r) => {
            (e.setParams({ missingProperty: r }),
              t.if((0, n.noPropertyInData)(t, a, r, u.ownProperties), () => e.error()));
          });
        }
      },
    };
  t.default = s;
};
