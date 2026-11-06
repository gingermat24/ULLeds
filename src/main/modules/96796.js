module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.extendSubschemaMode = t.extendSubschemaData = t.getSubschema = void 0));
  const n = r(32512),
    i = r(13556);
  ((t.getSubschema = function (
    e,
    { keyword: t, schemaProp: r, schema: o, schemaPath: s, errSchemaPath: a, topSchemaRef: c },
  ) {
    if (void 0 !== t && void 0 !== o)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (void 0 !== t) {
      const o = e.schema[t];
      return void 0 === r
        ? {
            schema: o,
            schemaPath: n._`${e.schemaPath}${(0, n.getProperty)(t)}`,
            errSchemaPath: `${e.errSchemaPath}/${t}`,
          }
        : {
            schema: o[r],
            schemaPath: n._`${e.schemaPath}${(0, n.getProperty)(t)}${(0, n.getProperty)(r)}`,
            errSchemaPath: `${e.errSchemaPath}/${t}/${(0, i.escapeFragment)(r)}`,
          };
    }
    if (void 0 !== o) {
      if (void 0 === s || void 0 === a || void 0 === c)
        throw new Error(
          '"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"',
        );
      return { schema: o, schemaPath: s, topSchemaRef: c, errSchemaPath: a };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }),
    (t.extendSubschemaData = function (
      e,
      t,
      { dataProp: r, dataPropType: o, data: s, dataTypes: a, propertyName: c },
    ) {
      if (void 0 !== s && void 0 !== r)
        throw new Error('both "data" and "dataProp" passed, only one allowed');
      const { gen: l } = t;
      if (void 0 !== r) {
        const { errorPath: s, dataPathArr: a, opts: c } = t;
        (u(l.let("data", n._`${t.data}${(0, n.getProperty)(r)}`, !0)),
          (e.errorPath = n.str`${s}${(0, i.getErrorPath)(r, o, c.jsPropertySyntax)}`),
          (e.parentDataProperty = n._`${r}`),
          (e.dataPathArr = [...a, e.parentDataProperty]));
      }
      function u(r) {
        ((e.data = r),
          (e.dataLevel = t.dataLevel + 1),
          (e.dataTypes = []),
          (t.definedProperties = new Set()),
          (e.parentData = t.data),
          (e.dataNames = [...t.dataNames, r]));
      }
      (void 0 !== s &&
        (u(s instanceof n.Name ? s : l.let("data", s, !0)), void 0 !== c && (e.propertyName = c)),
        a && (e.dataTypes = a));
    }),
    (t.extendSubschemaMode = function (
      e,
      { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: i, allErrors: o },
    ) {
      (void 0 !== n && (e.compositeRule = n),
        void 0 !== i && (e.createErrors = i),
        void 0 !== o && (e.allErrors = o),
        (e.jtdDiscriminator = t),
        (e.jtdMetadata = r));
    }));
};
