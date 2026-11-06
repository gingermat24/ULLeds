module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.reportTypeError =
      t.checkDataTypes =
      t.checkDataType =
      t.coerceAndCheckDataType =
      t.getJSONTypes =
      t.getSchemaTypes =
      t.DataType =
        void 0));
  const n = r(24365),
    i = r(79848),
    o = r(70407),
    s = r(94040),
    a = r(45564);
  var c;
  function l(e) {
    const t = Array.isArray(e) ? e : e ? [e] : [];
    if (t.every(n.isJSONType)) return t;
    throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
  }
  (!(function (e) {
    ((e[(e.Correct = 0)] = "Correct"), (e[(e.Wrong = 1)] = "Wrong"));
  })(c || (t.DataType = c = {})),
    (t.getSchemaTypes = function (e) {
      const t = l(e.type);
      if (t.includes("null")) {
        if (!1 === e.nullable) throw new Error("type: null contradicts nullable: false");
      } else {
        if (!t.length && void 0 !== e.nullable)
          throw new Error('"nullable" cannot be used without "type"');
        !0 === e.nullable && t.push("null");
      }
      return t;
    }),
    (t.getJSONTypes = l),
    (t.coerceAndCheckDataType = function (e, t) {
      const { gen: r, data: n, opts: o } = e,
        a = (function (e, t) {
          return t ? e.filter((e) => u.has(e) || ("array" === t && "array" === e)) : [];
        })(t, o.coerceTypes),
        l =
          t.length > 0 &&
          !(0 === a.length && 1 === t.length && (0, i.schemaHasRulesForType)(e, t[0]));
      if (l) {
        const i = d(t, n, o.strictNumbers, c.Wrong);
        r.if(i, () => {
          a.length
            ? (function (e, t, r) {
                const { gen: n, data: i, opts: o } = e,
                  a = n.let("dataType", s._`typeof ${i}`),
                  c = n.let("coerced", s._`undefined`);
                ("array" === o.coerceTypes &&
                  n.if(s._`${a} == 'object' && Array.isArray(${i}) && ${i}.length == 1`, () =>
                    n
                      .assign(i, s._`${i}[0]`)
                      .assign(a, s._`typeof ${i}`)
                      .if(d(t, i, o.strictNumbers), () => n.assign(c, i)),
                  ),
                  n.if(s._`${c} !== undefined`));
                for (const e of r)
                  (u.has(e) || ("array" === e && "array" === o.coerceTypes)) && l(e);
                function l(e) {
                  switch (e) {
                    case "string":
                      return void n
                        .elseIf(s._`${a} == "number" || ${a} == "boolean"`)
                        .assign(c, s._`"" + ${i}`)
                        .elseIf(s._`${i} === null`)
                        .assign(c, s._`""`);
                    case "number":
                      return void n
                        .elseIf(
                          s._`${a} == "boolean" || ${i} === null
              || (${a} == "string" && ${i} && ${i} == +${i})`,
                        )
                        .assign(c, s._`+${i}`);
                    case "integer":
                      return void n
                        .elseIf(
                          s._`${a} === "boolean" || ${i} === null
              || (${a} === "string" && ${i} && ${i} == +${i} && !(${i} % 1))`,
                        )
                        .assign(c, s._`+${i}`);
                    case "boolean":
                      return void n
                        .elseIf(s._`${i} === "false" || ${i} === 0 || ${i} === null`)
                        .assign(c, !1)
                        .elseIf(s._`${i} === "true" || ${i} === 1`)
                        .assign(c, !0);
                    case "null":
                      return (
                        n.elseIf(s._`${i} === "" || ${i} === 0 || ${i} === false`),
                        void n.assign(c, null)
                      );
                    case "array":
                      n.elseIf(
                        s._`${a} === "string" || ${a} === "number"
              || ${a} === "boolean" || ${i} === null`,
                      ).assign(c, s._`[${i}]`);
                  }
                }
                (n.else(),
                  h(e),
                  n.endIf(),
                  n.if(s._`${c} !== undefined`, () => {
                    (n.assign(i, c),
                      (function ({ gen: e, parentData: t, parentDataProperty: r }, n) {
                        e.if(s._`${t} !== undefined`, () => e.assign(s._`${t}[${r}]`, n));
                      })(e, c));
                  }));
              })(e, t, a)
            : h(e);
        });
      }
      return l;
    }));
  const u = new Set(["string", "number", "integer", "boolean", "null"]);
  function p(e, t, r, n = c.Correct) {
    const i = n === c.Correct ? s.operators.EQ : s.operators.NEQ;
    let o;
    switch (e) {
      case "null":
        return s._`${t} ${i} null`;
      case "array":
        o = s._`Array.isArray(${t})`;
        break;
      case "object":
        o = s._`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
        break;
      case "integer":
        o = a(s._`!(${t} % 1) && !isNaN(${t})`);
        break;
      case "number":
        o = a();
        break;
      default:
        return s._`typeof ${t} ${i} ${e}`;
    }
    return n === c.Correct ? o : (0, s.not)(o);
    function a(e = s.nil) {
      return (0, s.and)(s._`typeof ${t} == "number"`, e, r ? s._`isFinite(${t})` : s.nil);
    }
  }
  function d(e, t, r, n) {
    if (1 === e.length) return p(e[0], t, r, n);
    let i;
    const o = (0, a.toHash)(e);
    if (o.array && o.object) {
      const e = s._`typeof ${t} != "object"`;
      ((i = o.null ? e : s._`!${t} || ${e}`), delete o.null, delete o.array, delete o.object);
    } else i = s.nil;
    o.number && delete o.integer;
    for (const e in o) i = (0, s.and)(i, p(e, t, r, n));
    return i;
  }
  ((t.checkDataType = p), (t.checkDataTypes = d));
  const f = {
    message: ({ schema: e }) => `must be ${e}`,
    params: ({ schema: e, schemaValue: t }) =>
      "string" == typeof e ? s._`{type: ${e}}` : s._`{type: ${t}}`,
  };
  function h(e) {
    const t = (function (e) {
      const { gen: t, data: r, schema: n } = e,
        i = (0, a.schemaRefOrVal)(e, n, "type");
      return {
        gen: t,
        keyword: "type",
        data: r,
        schema: n.type,
        schemaCode: i,
        schemaValue: i,
        parentSchema: n,
        params: {},
        it: e,
      };
    })(e);
    (0, o.reportError)(t, f);
  }
  t.reportTypeError = h;
};
