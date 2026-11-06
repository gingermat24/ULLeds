module.exports = (e, t) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.regexpCode =
      t.getEsmExportName =
      t.getProperty =
      t.safeStringify =
      t.stringify =
      t.strConcat =
      t.addCodeArg =
      t.str =
      t._ =
      t.nil =
      t._Code =
      t.Name =
      t.IDENTIFIER =
      t._CodeOrName =
        void 0));
  class r {}
  ((t._CodeOrName = r), (t.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i));
  class n extends r {
    constructor(e) {
      if ((super(), !t.IDENTIFIER.test(e)))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = e;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  t.Name = n;
  class i extends r {
    constructor(e) {
      (super(), (this._items = "string" == typeof e ? [e] : e));
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1) return !1;
      const e = this._items[0];
      return "" === e || '""' === e;
    }
    get str() {
      var e;
      return null !== (e = this._str) && void 0 !== e
        ? e
        : (this._str = this._items.reduce((e, t) => `${e}${t}`, ""));
    }
    get names() {
      var e;
      return null !== (e = this._names) && void 0 !== e
        ? e
        : (this._names = this._items.reduce(
            (e, t) => (t instanceof n && (e[t.str] = (e[t.str] || 0) + 1), e),
            {},
          ));
    }
  }
  function o(e, ...t) {
    const r = [e[0]];
    let n = 0;
    for (; n < t.length;) (c(r, t[n]), r.push(e[++n]));
    return new i(r);
  }
  ((t._Code = i), (t.nil = new i("")), (t._ = o));
  const s = new i("+");
  function a(e, ...t) {
    const r = [u(e[0])];
    let n = 0;
    for (; n < t.length;) (r.push(s), c(r, t[n]), r.push(s, u(e[++n])));
    return (
      (function (e) {
        let t = 1;
        for (; t < e.length - 1;) {
          if (e[t] === s) {
            const r = l(e[t - 1], e[t + 1]);
            if (void 0 !== r) {
              e.splice(t - 1, 3, r);
              continue;
            }
            e[t++] = "+";
          }
          t++;
        }
      })(r),
      new i(r)
    );
  }
  function c(e, t) {
    var r;
    t instanceof i
      ? e.push(...t._items)
      : t instanceof n
        ? e.push(t)
        : e.push(
            "number" == typeof (r = t) || "boolean" == typeof r || null === r
              ? r
              : u(Array.isArray(r) ? r.join(",") : r),
          );
  }
  function l(e, t) {
    if ('""' === t) return e;
    if ('""' === e) return t;
    if ("string" == typeof e) {
      if (t instanceof n || '"' !== e[e.length - 1]) return;
      return "string" != typeof t
        ? `${e.slice(0, -1)}${t}"`
        : '"' === t[0]
          ? e.slice(0, -1) + t.slice(1)
          : void 0;
    }
    return "string" != typeof t || '"' !== t[0] || e instanceof n ? void 0 : `"${e}${t.slice(1)}`;
  }
  function u(e) {
    return JSON.stringify(e)
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029");
  }
  ((t.str = a),
    (t.addCodeArg = c),
    (t.strConcat = function (e, t) {
      return t.emptyStr() ? e : e.emptyStr() ? t : a`${e}${t}`;
    }),
    (t.stringify = function (e) {
      return new i(u(e));
    }),
    (t.safeStringify = u),
    (t.getProperty = function (e) {
      return "string" == typeof e && t.IDENTIFIER.test(e) ? new i(`.${e}`) : o`[${e}]`;
    }),
    (t.getEsmExportName = function (e) {
      if ("string" == typeof e && t.IDENTIFIER.test(e)) return new i(`${e}`);
      throw new Error(`CodeGen: invalid export name: ${e}, use explicit $id name mapping`);
    }),
    (t.regexpCode = function (e) {
      return new i(e.toString());
    }));
};
