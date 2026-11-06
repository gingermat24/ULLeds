module.exports = (e, t, r) => {
  "use strict";
  const n = r(71328),
    i = r(87016),
    o = r(10147),
    s = r(58611),
    a = r(65692),
    c = r(39023),
    l = r(35947),
    u = r(43106),
    p = r(2203),
    d = r(24434);
  function f(e) {
    return e && "object" == typeof e && "default" in e ? e : { default: e };
  }
  const h = f(n),
    m = f(i),
    g = f(o),
    v = f(s),
    y = f(a),
    w = f(c),
    b = f(l),
    x = f(u),
    E = f(p);
  function _(e, t) {
    return function () {
      return e.apply(t, arguments);
    };
  }
  const { toString: S } = Object.prototype,
    { getPrototypeOf: I } = Object,
    $ =
      ((O = Object.create(null)),
      (e) => {
        const t = S.call(e);
        return O[t] || (O[t] = t.slice(8, -1).toLowerCase());
      });
  var O;
  const R = (e) => ((e = e.toLowerCase()), (t) => $(t) === e),
    P = (e) => (t) => typeof t === e,
    { isArray: A } = Array,
    T = P("undefined"),
    k = R("ArrayBuffer"),
    N = P("string"),
    C = P("function"),
    L = P("number"),
    D = (e) => null !== e && "object" == typeof e,
    j = (e) => {
      if ("object" !== $(e)) return !1;
      const t = I(e);
      return !(
        (null !== t && t !== Object.prototype && null !== Object.getPrototypeOf(t)) ||
        Symbol.toStringTag in e ||
        Symbol.iterator in e
      );
    },
    U = R("Date"),
    M = R("File"),
    F = R("Blob"),
    z = R("FileList"),
    B = R("URLSearchParams"),
    [q, V, G, H] = ["ReadableStream", "Request", "Response", "Headers"].map(R);
  function W(e, t, { allOwnKeys: r = !1 } = {}) {
    if (null == e) return;
    let n, i;
    if (("object" != typeof e && (e = [e]), A(e)))
      for (n = 0, i = e.length; n < i; n++) t.call(null, e[n], n, e);
    else {
      const i = r ? Object.getOwnPropertyNames(e) : Object.keys(e),
        o = i.length;
      let s;
      for (n = 0; n < o; n++) ((s = i[n]), t.call(null, e[s], s, e));
    }
  }
  function K(e, t) {
    t = t.toLowerCase();
    const r = Object.keys(e);
    let n,
      i = r.length;
    for (; i-- > 0;) if (((n = r[i]), t === n.toLowerCase())) return n;
    return null;
  }
  const X =
      "undefined" != typeof globalThis
        ? globalThis
        : "undefined" != typeof self
          ? self
          : "undefined" != typeof window
            ? window
            : global,
    Y = (e) => !T(e) && e !== X,
    J = ((Q = "undefined" != typeof Uint8Array && I(Uint8Array)), (e) => Q && e instanceof Q);
  var Q;
  const Z = R("HTMLFormElement"),
    ee = (
      ({ hasOwnProperty: e }) =>
      (t, r) =>
        e.call(t, r)
    )(Object.prototype),
    te = R("RegExp"),
    re = (e, t) => {
      const r = Object.getOwnPropertyDescriptors(e),
        n = {};
      (W(r, (r, i) => {
        let o;
        !1 !== (o = t(r, i, e)) && (n[i] = o || r);
      }),
        Object.defineProperties(e, n));
    },
    ne = "abcdefghijklmnopqrstuvwxyz",
    ie = "0123456789",
    oe = { DIGIT: ie, ALPHA: ne, ALPHA_DIGIT: ne + ne.toUpperCase() + ie },
    se = R("AsyncFunction"),
    ae =
      ((ce = "function" == typeof setImmediate),
      (le = C(X.postMessage)),
      ce
        ? setImmediate
        : le
          ? ((ue = `axios@${Math.random()}`),
            (pe = []),
            X.addEventListener(
              "message",
              ({ source: e, data: t }) => {
                e === X && t === ue && pe.length && pe.shift()();
              },
              !1,
            ),
            (e) => {
              (pe.push(e), X.postMessage(ue, "*"));
            })
          : (e) => setTimeout(e));
  var ce, le, ue, pe;
  const de =
      "undefined" != typeof queueMicrotask
        ? queueMicrotask.bind(X)
        : ("undefined" != typeof process && process.nextTick) || ae,
    fe = {
      isArray: A,
      isArrayBuffer: k,
      isBuffer: function (e) {
        return (
          null !== e &&
          !T(e) &&
          null !== e.constructor &&
          !T(e.constructor) &&
          C(e.constructor.isBuffer) &&
          e.constructor.isBuffer(e)
        );
      },
      isFormData: (e) => {
        let t;
        return (
          e &&
          (("function" == typeof FormData && e instanceof FormData) ||
            (C(e.append) &&
              ("formdata" === (t = $(e)) ||
                ("object" === t && C(e.toString) && "[object FormData]" === e.toString()))))
        );
      },
      isArrayBufferView: function (e) {
        let t;
        return (
          (t =
            "undefined" != typeof ArrayBuffer && ArrayBuffer.isView
              ? ArrayBuffer.isView(e)
              : e && e.buffer && k(e.buffer)),
          t
        );
      },
      isString: N,
      isNumber: L,
      isBoolean: (e) => !0 === e || !1 === e,
      isObject: D,
      isPlainObject: j,
      isReadableStream: q,
      isRequest: V,
      isResponse: G,
      isHeaders: H,
      isUndefined: T,
      isDate: U,
      isFile: M,
      isBlob: F,
      isRegExp: te,
      isFunction: C,
      isStream: (e) => D(e) && C(e.pipe),
      isURLSearchParams: B,
      isTypedArray: J,
      isFileList: z,
      forEach: W,
      merge: function e() {
        const { caseless: t } = (Y(this) && this) || {},
          r = {},
          n = (n, i) => {
            const o = (t && K(r, i)) || i;
            j(r[o]) && j(n)
              ? (r[o] = e(r[o], n))
              : j(n)
                ? (r[o] = e({}, n))
                : A(n)
                  ? (r[o] = n.slice())
                  : (r[o] = n);
          };
        for (let e = 0, t = arguments.length; e < t; e++) arguments[e] && W(arguments[e], n);
        return r;
      },
      extend: (e, t, r, { allOwnKeys: n } = {}) => (
        W(
          t,
          (t, n) => {
            r && C(t) ? (e[n] = _(t, r)) : (e[n] = t);
          },
          { allOwnKeys: n },
        ),
        e
      ),
      trim: (e) => (e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "")),
      stripBOM: (e) => (65279 === e.charCodeAt(0) && (e = e.slice(1)), e),
      inherits: (e, t, r, n) => {
        ((e.prototype = Object.create(t.prototype, n)),
          (e.prototype.constructor = e),
          Object.defineProperty(e, "super", { value: t.prototype }),
          r && Object.assign(e.prototype, r));
      },
      toFlatObject: (e, t, r, n) => {
        let i, o, s;
        const a = {};
        if (((t = t || {}), null == e)) return t;
        do {
          for (i = Object.getOwnPropertyNames(e), o = i.length; o-- > 0;)
            ((s = i[o]), (n && !n(s, e, t)) || a[s] || ((t[s] = e[s]), (a[s] = !0)));
          e = !1 !== r && I(e);
        } while (e && (!r || r(e, t)) && e !== Object.prototype);
        return t;
      },
      kindOf: $,
      kindOfTest: R,
      endsWith: (e, t, r) => {
        ((e = String(e)), (void 0 === r || r > e.length) && (r = e.length), (r -= t.length));
        const n = e.indexOf(t, r);
        return -1 !== n && n === r;
      },
      toArray: (e) => {
        if (!e) return null;
        if (A(e)) return e;
        let t = e.length;
        if (!L(t)) return null;
        const r = new Array(t);
        for (; t-- > 0;) r[t] = e[t];
        return r;
      },
      forEachEntry: (e, t) => {
        const r = (e && e[Symbol.iterator]).call(e);
        let n;
        for (; (n = r.next()) && !n.done;) {
          const r = n.value;
          t.call(e, r[0], r[1]);
        }
      },
      matchAll: (e, t) => {
        let r;
        const n = [];
        for (; null !== (r = e.exec(t));) n.push(r);
        return n;
      },
      isHTMLForm: Z,
      hasOwnProperty: ee,
      hasOwnProp: ee,
      reduceDescriptors: re,
      freezeMethods: (e) => {
        re(e, (t, r) => {
          if (C(e) && -1 !== ["arguments", "caller", "callee"].indexOf(r)) return !1;
          const n = e[r];
          C(n) &&
            ((t.enumerable = !1),
            "writable" in t
              ? (t.writable = !1)
              : t.set ||
                (t.set = () => {
                  throw Error("Can not rewrite read-only method '" + r + "'");
                }));
        });
      },
      toObjectSet: (e, t) => {
        const r = {},
          n = (e) => {
            e.forEach((e) => {
              r[e] = !0;
            });
          };
        return (A(e) ? n(e) : n(String(e).split(t)), r);
      },
      toCamelCase: (e) =>
        e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (e, t, r) {
          return t.toUpperCase() + r;
        }),
      noop: () => {},
      toFiniteNumber: (e, t) => (null != e && Number.isFinite((e = +e)) ? e : t),
      findKey: K,
      global: X,
      isContextDefined: Y,
      ALPHABET: oe,
      generateString: (e = 16, t = oe.ALPHA_DIGIT) => {
        let r = "";
        const { length: n } = t;
        for (; e--;) r += t[(Math.random() * n) | 0];
        return r;
      },
      isSpecCompliantForm: function (e) {
        return !!(e && C(e.append) && "FormData" === e[Symbol.toStringTag] && e[Symbol.iterator]);
      },
      toJSONObject: (e) => {
        const t = new Array(10),
          r = (e, n) => {
            if (D(e)) {
              if (t.indexOf(e) >= 0) return;
              if (!("toJSON" in e)) {
                t[n] = e;
                const i = A(e) ? [] : {};
                return (
                  W(e, (e, t) => {
                    const o = r(e, n + 1);
                    !T(o) && (i[t] = o);
                  }),
                  (t[n] = void 0),
                  i
                );
              }
            }
            return e;
          };
        return r(e, 0);
      },
      isAsyncFn: se,
      isThenable: (e) => e && (D(e) || C(e)) && C(e.then) && C(e.catch),
      setImmediate: ae,
      asap: de,
    };
  function he(e, t, r, n, i) {
    (Error.call(this),
      Error.captureStackTrace
        ? Error.captureStackTrace(this, this.constructor)
        : (this.stack = new Error().stack),
      (this.message = e),
      (this.name = "AxiosError"),
      t && (this.code = t),
      r && (this.config = r),
      n && (this.request = n),
      i && ((this.response = i), (this.status = i.status ? i.status : null)));
  }
  fe.inherits(he, Error, {
    toJSON: function () {
      return {
        message: this.message,
        name: this.name,
        description: this.description,
        number: this.number,
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        config: fe.toJSONObject(this.config),
        code: this.code,
        status: this.status,
      };
    },
  });
  const me = he.prototype,
    ge = {};
  function ve(e) {
    return fe.isPlainObject(e) || fe.isArray(e);
  }
  function ye(e) {
    return fe.endsWith(e, "[]") ? e.slice(0, -2) : e;
  }
  function we(e, t, r) {
    return e
      ? e
          .concat(t)
          .map(function (e, t) {
            return ((e = ye(e)), !r && t ? "[" + e + "]" : e);
          })
          .join(r ? "." : "")
      : t;
  }
  ([
    "ERR_BAD_OPTION_VALUE",
    "ERR_BAD_OPTION",
    "ECONNABORTED",
    "ETIMEDOUT",
    "ERR_NETWORK",
    "ERR_FR_TOO_MANY_REDIRECTS",
    "ERR_DEPRECATED",
    "ERR_BAD_RESPONSE",
    "ERR_BAD_REQUEST",
    "ERR_CANCELED",
    "ERR_NOT_SUPPORT",
    "ERR_INVALID_URL",
  ].forEach((e) => {
    ge[e] = { value: e };
  }),
    Object.defineProperties(he, ge),
    Object.defineProperty(me, "isAxiosError", { value: !0 }),
    (he.from = (e, t, r, n, i, o) => {
      const s = Object.create(me);
      return (
        fe.toFlatObject(
          e,
          s,
          function (e) {
            return e !== Error.prototype;
          },
          (e) => "isAxiosError" !== e,
        ),
        he.call(s, e.message, t, r, n, i),
        (s.cause = e),
        (s.name = e.name),
        o && Object.assign(s, o),
        s
      );
    }));
  const be = fe.toFlatObject(fe, {}, null, function (e) {
    return /^is[A-Z]/.test(e);
  });
  function xe(e, t, r) {
    if (!fe.isObject(e)) throw new TypeError("target must be an object");
    t = t || new (h.default || FormData)();
    const n = (r = fe.toFlatObject(
        r,
        { metaTokens: !0, dots: !1, indexes: !1 },
        !1,
        function (e, t) {
          return !fe.isUndefined(t[e]);
        },
      )).metaTokens,
      i = r.visitor || l,
      o = r.dots,
      s = r.indexes,
      a = (r.Blob || ("undefined" != typeof Blob && Blob)) && fe.isSpecCompliantForm(t);
    if (!fe.isFunction(i)) throw new TypeError("visitor must be a function");
    function c(e) {
      if (null === e) return "";
      if (fe.isDate(e)) return e.toISOString();
      if (!a && fe.isBlob(e)) throw new he("Blob is not supported. Use a Buffer instead.");
      return fe.isArrayBuffer(e) || fe.isTypedArray(e)
        ? a && "function" == typeof Blob
          ? new Blob([e])
          : Buffer.from(e)
        : e;
    }
    function l(e, r, i) {
      let a = e;
      if (e && !i && "object" == typeof e)
        if (fe.endsWith(r, "{}")) ((r = n ? r : r.slice(0, -2)), (e = JSON.stringify(e)));
        else if (
          (fe.isArray(e) &&
            (function (e) {
              return fe.isArray(e) && !e.some(ve);
            })(e)) ||
          ((fe.isFileList(e) || fe.endsWith(r, "[]")) && (a = fe.toArray(e)))
        )
          return (
            (r = ye(r)),
            a.forEach(function (e, n) {
              !fe.isUndefined(e) &&
                null !== e &&
                t.append(!0 === s ? we([r], n, o) : null === s ? r : r + "[]", c(e));
            }),
            !1
          );
      return !!ve(e) || (t.append(we(i, r, o), c(e)), !1);
    }
    const u = [],
      p = Object.assign(be, { defaultVisitor: l, convertValue: c, isVisitable: ve });
    if (!fe.isObject(e)) throw new TypeError("data must be an object");
    return (
      (function e(r, n) {
        if (!fe.isUndefined(r)) {
          if (-1 !== u.indexOf(r)) throw Error("Circular reference detected in " + n.join("."));
          (u.push(r),
            fe.forEach(r, function (r, o) {
              !0 ===
                (!(fe.isUndefined(r) || null === r) &&
                  i.call(t, r, fe.isString(o) ? o.trim() : o, n, p)) && e(r, n ? n.concat(o) : [o]);
            }),
            u.pop());
        }
      })(e),
      t
    );
  }
  function Ee(e) {
    const t = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0",
    };
    return encodeURIComponent(e).replace(/[!'()~]|%20|%00/g, function (e) {
      return t[e];
    });
  }
  function _e(e, t) {
    ((this._pairs = []), e && xe(e, this, t));
  }
  const Se = _e.prototype;
  function Ie(e) {
    return encodeURIComponent(e)
      .replace(/%3A/gi, ":")
      .replace(/%24/g, "$")
      .replace(/%2C/gi, ",")
      .replace(/%20/g, "+")
      .replace(/%5B/gi, "[")
      .replace(/%5D/gi, "]");
  }
  function $e(e, t, r) {
    if (!t) return e;
    const n = (r && r.encode) || Ie;
    fe.isFunction(r) && (r = { serialize: r });
    const i = r && r.serialize;
    let o;
    if (
      ((o = i ? i(t, r) : fe.isURLSearchParams(t) ? t.toString() : new _e(t, r).toString(n)), o)
    ) {
      const t = e.indexOf("#");
      (-1 !== t && (e = e.slice(0, t)), (e += (-1 === e.indexOf("?") ? "?" : "&") + o));
    }
    return e;
  }
  ((Se.append = function (e, t) {
    this._pairs.push([e, t]);
  }),
    (Se.toString = function (e) {
      const t = e
        ? function (t) {
            return e.call(this, t, Ee);
          }
        : Ee;
      return this._pairs
        .map(function (e) {
          return t(e[0]) + "=" + t(e[1]);
        }, "")
        .join("&");
    }));
  const Oe = class {
      constructor() {
        this.handlers = [];
      }
      use(e, t, r) {
        return (
          this.handlers.push({
            fulfilled: e,
            rejected: t,
            synchronous: !!r && r.synchronous,
            runWhen: r ? r.runWhen : null,
          }),
          this.handlers.length - 1
        );
      }
      eject(e) {
        this.handlers[e] && (this.handlers[e] = null);
      }
      clear() {
        this.handlers && (this.handlers = []);
      }
      forEach(e) {
        fe.forEach(this.handlers, function (t) {
          null !== t && e(t);
        });
      }
    },
    Re = { silentJSONParsing: !0, forcedJSONParsing: !0, clarifyTimeoutError: !1 },
    Pe = {
      isNode: !0,
      classes: {
        URLSearchParams: m.default.URLSearchParams,
        FormData: h.default,
        Blob: ("undefined" != typeof Blob && Blob) || null,
      },
      protocols: ["http", "https", "file", "data"],
    },
    Ae = "undefined" != typeof window && "undefined" != typeof document,
    Te = ("object" == typeof navigator && navigator) || void 0,
    ke = Ae && (!Te || ["ReactNative", "NativeScript", "NS"].indexOf(Te.product) < 0),
    Ne =
      "undefined" != typeof WorkerGlobalScope &&
      self instanceof WorkerGlobalScope &&
      "function" == typeof self.importScripts,
    Ce = (Ae && window.location.href) || "http://localhost",
    Le = {
      ...Object.freeze({
        __proto__: null,
        hasBrowserEnv: Ae,
        hasStandardBrowserWebWorkerEnv: Ne,
        hasStandardBrowserEnv: ke,
        navigator: Te,
        origin: Ce,
      }),
      ...Pe,
    };
  function De(e) {
    function t(e, r, n, i) {
      let o = e[i++];
      if ("__proto__" === o) return !0;
      const s = Number.isFinite(+o),
        a = i >= e.length;
      return (
        (o = !o && fe.isArray(n) ? n.length : o),
        a
          ? (fe.hasOwnProp(n, o) ? (n[o] = [n[o], r]) : (n[o] = r), !s)
          : ((n[o] && fe.isObject(n[o])) || (n[o] = []),
            t(e, r, n[o], i) &&
              fe.isArray(n[o]) &&
              (n[o] = (function (e) {
                const t = {},
                  r = Object.keys(e);
                let n;
                const i = r.length;
                let o;
                for (n = 0; n < i; n++) ((o = r[n]), (t[o] = e[o]));
                return t;
              })(n[o])),
            !s)
      );
    }
    if (fe.isFormData(e) && fe.isFunction(e.entries)) {
      const r = {};
      return (
        fe.forEachEntry(e, (e, n) => {
          t(
            (function (e) {
              return fe
                .matchAll(/\w+|\[(\w*)]/g, e)
                .map((e) => ("[]" === e[0] ? "" : e[1] || e[0]));
            })(e),
            n,
            r,
            0,
          );
        }),
        r
      );
    }
    return null;
  }
  const je = {
    transitional: Re,
    adapter: ["xhr", "http", "fetch"],
    transformRequest: [
      function (e, t) {
        const r = t.getContentType() || "",
          n = r.indexOf("application/json") > -1,
          i = fe.isObject(e);
        if ((i && fe.isHTMLForm(e) && (e = new FormData(e)), fe.isFormData(e)))
          return n ? JSON.stringify(De(e)) : e;
        if (
          fe.isArrayBuffer(e) ||
          fe.isBuffer(e) ||
          fe.isStream(e) ||
          fe.isFile(e) ||
          fe.isBlob(e) ||
          fe.isReadableStream(e)
        )
          return e;
        if (fe.isArrayBufferView(e)) return e.buffer;
        if (fe.isURLSearchParams(e))
          return (
            t.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1),
            e.toString()
          );
        let o;
        if (i) {
          if (r.indexOf("application/x-www-form-urlencoded") > -1)
            return (function (e, t) {
              return xe(
                e,
                new Le.classes.URLSearchParams(),
                Object.assign(
                  {
                    visitor: function (e, t, r, n) {
                      return Le.isNode && fe.isBuffer(e)
                        ? (this.append(t, e.toString("base64")), !1)
                        : n.defaultVisitor.apply(this, arguments);
                    },
                  },
                  t,
                ),
              );
            })(e, this.formSerializer).toString();
          if ((o = fe.isFileList(e)) || r.indexOf("multipart/form-data") > -1) {
            const t = this.env && this.env.FormData;
            return xe(o ? { "files[]": e } : e, t && new t(), this.formSerializer);
          }
        }
        return i || n
          ? (t.setContentType("application/json", !1),
            (function (e) {
              if (fe.isString(e))
                try {
                  return ((0, JSON.parse)(e), fe.trim(e));
                } catch (e) {
                  if ("SyntaxError" !== e.name) throw e;
                }
              return (0, JSON.stringify)(e);
            })(e))
          : e;
      },
    ],
    transformResponse: [
      function (e) {
        const t = this.transitional || je.transitional,
          r = t && t.forcedJSONParsing,
          n = "json" === this.responseType;
        if (fe.isResponse(e) || fe.isReadableStream(e)) return e;
        if (e && fe.isString(e) && ((r && !this.responseType) || n)) {
          const r = !(t && t.silentJSONParsing) && n;
          try {
            return JSON.parse(e);
          } catch (e) {
            if (r) {
              if ("SyntaxError" === e.name)
                throw he.from(e, he.ERR_BAD_RESPONSE, this, null, this.response);
              throw e;
            }
          }
        }
        return e;
      },
    ],
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: { FormData: Le.classes.FormData, Blob: Le.classes.Blob },
    validateStatus: function (e) {
      return e >= 200 && e < 300;
    },
    headers: { common: { Accept: "application/json, text/plain, */*", "Content-Type": void 0 } },
  };
  fe.forEach(["delete", "get", "head", "post", "put", "patch"], (e) => {
    je.headers[e] = {};
  });
  const Ue = je,
    Me = fe.toObjectSet([
      "age",
      "authorization",
      "content-length",
      "content-type",
      "etag",
      "expires",
      "from",
      "host",
      "if-modified-since",
      "if-unmodified-since",
      "last-modified",
      "location",
      "max-forwards",
      "proxy-authorization",
      "referer",
      "retry-after",
      "user-agent",
    ]),
    Fe = Symbol("internals");
  function ze(e) {
    return e && String(e).trim().toLowerCase();
  }
  function Be(e) {
    return !1 === e || null == e ? e : fe.isArray(e) ? e.map(Be) : String(e);
  }
  function qe(e, t, r, n, i) {
    return fe.isFunction(n)
      ? n.call(this, t, r)
      : (i && (t = r),
        fe.isString(t)
          ? fe.isString(n)
            ? -1 !== t.indexOf(n)
            : fe.isRegExp(n)
              ? n.test(t)
              : void 0
          : void 0);
  }
  class Ve {
    constructor(e) {
      e && this.set(e);
    }
    set(e, t, r) {
      const n = this;
      function i(e, t, r) {
        const i = ze(t);
        if (!i) throw new Error("header name must be a non-empty string");
        const o = fe.findKey(n, i);
        (!o || void 0 === n[o] || !0 === r || (void 0 === r && !1 !== n[o])) && (n[o || t] = Be(e));
      }
      const o = (e, t) => fe.forEach(e, (e, r) => i(e, r, t));
      if (fe.isPlainObject(e) || e instanceof this.constructor) o(e, t);
      else if (fe.isString(e) && (e = e.trim()) && !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim()))
        o(
          ((e) => {
            const t = {};
            let r, n, i;
            return (
              e &&
                e.split("\n").forEach(function (e) {
                  ((i = e.indexOf(":")),
                    (r = e.substring(0, i).trim().toLowerCase()),
                    (n = e.substring(i + 1).trim()),
                    !r ||
                      (t[r] && Me[r]) ||
                      ("set-cookie" === r
                        ? t[r]
                          ? t[r].push(n)
                          : (t[r] = [n])
                        : (t[r] = t[r] ? t[r] + ", " + n : n)));
                }),
              t
            );
          })(e),
          t,
        );
      else if (fe.isHeaders(e)) for (const [t, n] of e.entries()) i(n, t, r);
      else null != e && i(t, e, r);
      return this;
    }
    get(e, t) {
      if ((e = ze(e))) {
        const r = fe.findKey(this, e);
        if (r) {
          const e = this[r];
          if (!t) return e;
          if (!0 === t)
            return (function (e) {
              const t = Object.create(null),
                r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
              let n;
              for (; (n = r.exec(e));) t[n[1]] = n[2];
              return t;
            })(e);
          if (fe.isFunction(t)) return t.call(this, e, r);
          if (fe.isRegExp(t)) return t.exec(e);
          throw new TypeError("parser must be boolean|regexp|function");
        }
      }
    }
    has(e, t) {
      if ((e = ze(e))) {
        const r = fe.findKey(this, e);
        return !(!r || void 0 === this[r] || (t && !qe(0, this[r], r, t)));
      }
      return !1;
    }
    delete(e, t) {
      const r = this;
      let n = !1;
      function i(e) {
        if ((e = ze(e))) {
          const i = fe.findKey(r, e);
          !i || (t && !qe(0, r[i], i, t)) || (delete r[i], (n = !0));
        }
      }
      return (fe.isArray(e) ? e.forEach(i) : i(e), n);
    }
    clear(e) {
      const t = Object.keys(this);
      let r = t.length,
        n = !1;
      for (; r--;) {
        const i = t[r];
        (e && !qe(0, this[i], i, e, !0)) || (delete this[i], (n = !0));
      }
      return n;
    }
    normalize(e) {
      const t = this,
        r = {};
      return (
        fe.forEach(this, (n, i) => {
          const o = fe.findKey(r, i);
          if (o) return ((t[o] = Be(n)), void delete t[i]);
          const s = e
            ? (function (e) {
                return e
                  .trim()
                  .toLowerCase()
                  .replace(/([a-z\d])(\w*)/g, (e, t, r) => t.toUpperCase() + r);
              })(i)
            : String(i).trim();
          (s !== i && delete t[i], (t[s] = Be(n)), (r[s] = !0));
        }),
        this
      );
    }
    concat(...e) {
      return this.constructor.concat(this, ...e);
    }
    toJSON(e) {
      const t = Object.create(null);
      return (
        fe.forEach(this, (r, n) => {
          null != r && !1 !== r && (t[n] = e && fe.isArray(r) ? r.join(", ") : r);
        }),
        t
      );
    }
    [Symbol.iterator]() {
      return Object.entries(this.toJSON())[Symbol.iterator]();
    }
    toString() {
      return Object.entries(this.toJSON())
        .map(([e, t]) => e + ": " + t)
        .join("\n");
    }
    get [Symbol.toStringTag]() {
      return "AxiosHeaders";
    }
    static from(e) {
      return e instanceof this ? e : new this(e);
    }
    static concat(e, ...t) {
      const r = new this(e);
      return (t.forEach((e) => r.set(e)), r);
    }
    static accessor(e) {
      const t = (this[Fe] = this[Fe] = { accessors: {} }).accessors,
        r = this.prototype;
      function n(e) {
        const n = ze(e);
        t[n] ||
          ((function (e, t) {
            const r = fe.toCamelCase(" " + t);
            ["get", "set", "has"].forEach((n) => {
              Object.defineProperty(e, n + r, {
                value: function (e, r, i) {
                  return this[n].call(this, t, e, r, i);
                },
                configurable: !0,
              });
            });
          })(r, e),
          (t[n] = !0));
      }
      return (fe.isArray(e) ? e.forEach(n) : n(e), this);
    }
  }
  (Ve.accessor([
    "Content-Type",
    "Content-Length",
    "Accept",
    "Accept-Encoding",
    "User-Agent",
    "Authorization",
  ]),
    fe.reduceDescriptors(Ve.prototype, ({ value: e }, t) => {
      let r = t[0].toUpperCase() + t.slice(1);
      return {
        get: () => e,
        set(e) {
          this[r] = e;
        },
      };
    }),
    fe.freezeMethods(Ve));
  const Ge = Ve;
  function He(e, t) {
    const r = this || Ue,
      n = t || r,
      i = Ge.from(n.headers);
    let o = n.data;
    return (
      fe.forEach(e, function (e) {
        o = e.call(r, o, i.normalize(), t ? t.status : void 0);
      }),
      i.normalize(),
      o
    );
  }
  function We(e) {
    return !(!e || !e.__CANCEL__);
  }
  function Ke(e, t, r) {
    (he.call(this, null == e ? "canceled" : e, he.ERR_CANCELED, t, r),
      (this.name = "CanceledError"));
  }
  function Xe(e, t, r) {
    const n = r.config.validateStatus;
    r.status && n && !n(r.status)
      ? t(
          new he(
            "Request failed with status code " + r.status,
            [he.ERR_BAD_REQUEST, he.ERR_BAD_RESPONSE][Math.floor(r.status / 100) - 4],
            r.config,
            r.request,
            r,
          ),
        )
      : e(r);
  }
  function Ye(e, t) {
    return e &&
      !(function (e) {
        return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
      })(t)
      ? (function (e, t) {
          return t ? e.replace(/\/?\/$/, "") + "/" + t.replace(/^\/+/, "") : e;
        })(e, t)
      : t;
  }
  fe.inherits(Ke, he, { __CANCEL__: !0 });
  const Je = "1.7.9";
  function Qe(e) {
    const t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
    return (t && t[1]) || "";
  }
  const Ze = /^(?:([^;]+);)?(?:[^;]+;)?(base64|),([\s\S]*)$/,
    et = Symbol("internals");
  class tt extends E.default.Transform {
    constructor(e) {
      super({
        readableHighWaterMark: (e = fe.toFlatObject(
          e,
          {
            maxRate: 0,
            chunkSize: 65536,
            minChunkSize: 100,
            timeWindow: 500,
            ticksRate: 2,
            samplesCount: 15,
          },
          null,
          (e, t) => !fe.isUndefined(t[e]),
        )).chunkSize,
      });
      const t = (this[et] = {
        timeWindow: e.timeWindow,
        chunkSize: e.chunkSize,
        maxRate: e.maxRate,
        minChunkSize: e.minChunkSize,
        bytesSeen: 0,
        isCaptured: !1,
        notifiedBytesLoaded: 0,
        ts: Date.now(),
        bytes: 0,
        onReadCallback: null,
      });
      this.on("newListener", (e) => {
        "progress" === e && (t.isCaptured || (t.isCaptured = !0));
      });
    }
    _read(e) {
      const t = this[et];
      return (t.onReadCallback && t.onReadCallback(), super._read(e));
    }
    _transform(e, t, r) {
      const n = this[et],
        i = n.maxRate,
        o = this.readableHighWaterMark,
        s = n.timeWindow,
        a = i / (1e3 / s),
        c = !1 !== n.minChunkSize ? Math.max(n.minChunkSize, 0.01 * a) : 0,
        l = (e, t) => {
          const r = Buffer.byteLength(e);
          ((n.bytesSeen += r),
            (n.bytes += r),
            n.isCaptured && this.emit("progress", n.bytesSeen),
            this.push(e)
              ? process.nextTick(t)
              : (n.onReadCallback = () => {
                  ((n.onReadCallback = null), process.nextTick(t));
                }));
        },
        u = (e, t) => {
          const r = Buffer.byteLength(e);
          let u,
            p = null,
            d = o,
            f = 0;
          if (i) {
            const e = Date.now();
            ((!n.ts || (f = e - n.ts) >= s) &&
              ((n.ts = e), (u = a - n.bytes), (n.bytes = u < 0 ? -u : 0), (f = 0)),
              (u = a - n.bytes));
          }
          if (i) {
            if (u <= 0)
              return setTimeout(() => {
                t(null, e);
              }, s - f);
            u < d && (d = u);
          }
          (d && r > d && r - d > c && ((p = e.subarray(d)), (e = e.subarray(0, d))),
            l(
              e,
              p
                ? () => {
                    process.nextTick(t, null, p);
                  }
                : t,
            ));
        };
      u(e, function e(t, n) {
        if (t) return r(t);
        n ? u(n, e) : r(null);
      });
    }
  }
  const rt = tt,
    { asyncIterator: nt } = Symbol,
    it = async function* (e) {
      e.stream
        ? yield* e.stream()
        : e.arrayBuffer
          ? yield await e.arrayBuffer()
          : e[nt]
            ? yield* e[nt]()
            : yield e;
    },
    ot = fe.ALPHABET.ALPHA_DIGIT + "-_",
    st = "function" == typeof TextEncoder ? new TextEncoder() : new w.default.TextEncoder(),
    at = "\r\n",
    ct = st.encode(at);
  class lt {
    constructor(e, t) {
      const { escapeName: r } = this.constructor,
        n = fe.isString(t);
      let i = `Content-Disposition: form-data; name="${r(e)}"${!n && t.name ? `; filename="${r(t.name)}"` : ""}${at}`;
      (n
        ? (t = st.encode(String(t).replace(/\r?\n|\r\n?/g, at)))
        : (i += `Content-Type: ${t.type || "application/octet-stream"}${at}`),
        (this.headers = st.encode(i + at)),
        (this.contentLength = n ? t.byteLength : t.size),
        (this.size = this.headers.byteLength + this.contentLength + 2),
        (this.name = e),
        (this.value = t));
    }
    async *encode() {
      yield this.headers;
      const { value: e } = this;
      (fe.isTypedArray(e) ? yield e : yield* it(e), yield ct);
    }
    static escapeName(e) {
      return String(e).replace(/[\r\n"]/g, (e) => ({ "\r": "%0D", "\n": "%0A", '"': "%22" })[e]);
    }
  }
  class ut extends E.default.Transform {
    __transform(e, t, r) {
      (this.push(e), r());
    }
    _transform(e, t, r) {
      if (0 !== e.length && ((this._transform = this.__transform), 120 !== e[0])) {
        const e = Buffer.alloc(2);
        ((e[0] = 120), (e[1] = 156), this.push(e, t));
      }
      this.__transform(e, t, r);
    }
  }
  const pt = ut,
    dt = (e, t) =>
      fe.isAsyncFn(e)
        ? function (...r) {
            const n = r.pop();
            e.apply(this, r).then((e) => {
              try {
                t ? n(null, ...t(e)) : n(null, e);
              } catch (e) {
                n(e);
              }
            }, n);
          }
        : e,
    ft = (e, t, r = 3) => {
      let n = 0;
      const i = (function (e, t) {
        e = e || 10;
        const r = new Array(e),
          n = new Array(e);
        let i,
          o = 0,
          s = 0;
        return (
          (t = void 0 !== t ? t : 1e3),
          function (a) {
            const c = Date.now(),
              l = n[s];
            (i || (i = c), (r[o] = a), (n[o] = c));
            let u = s,
              p = 0;
            for (; u !== o;) ((p += r[u++]), (u %= e));
            if (((o = (o + 1) % e), o === s && (s = (s + 1) % e), c - i < t)) return;
            const d = l && c - l;
            return d ? Math.round((1e3 * p) / d) : void 0;
          }
        );
      })(50, 250);
      return (function (e, t) {
        let r,
          n,
          i = 0,
          o = 1e3 / t;
        const s = (t, o = Date.now()) => {
          ((i = o), (r = null), n && (clearTimeout(n), (n = null)), e.apply(null, t));
        };
        return [
          (...e) => {
            const t = Date.now(),
              a = t - i;
            a >= o
              ? s(e, t)
              : ((r = e),
                n ||
                  (n = setTimeout(() => {
                    ((n = null), s(r));
                  }, o - a)));
          },
          () => r && s(r),
        ];
      })((r) => {
        const o = r.loaded,
          s = r.lengthComputable ? r.total : void 0,
          a = o - n,
          c = i(a);
        ((n = o),
          e({
            loaded: o,
            total: s,
            progress: s ? o / s : void 0,
            bytes: a,
            rate: c || void 0,
            estimated: c && s && o <= s ? (s - o) / c : void 0,
            event: r,
            lengthComputable: null != s,
            [t ? "download" : "upload"]: !0,
          }));
      }, r);
    },
    ht = (e, t) => {
      const r = null != e;
      return [(n) => t[0]({ lengthComputable: r, total: e, loaded: n }), t[1]];
    },
    mt =
      (e) =>
      (...t) =>
        fe.asap(() => e(...t)),
    gt = { flush: x.default.constants.Z_SYNC_FLUSH, finishFlush: x.default.constants.Z_SYNC_FLUSH },
    vt = {
      flush: x.default.constants.BROTLI_OPERATION_FLUSH,
      finishFlush: x.default.constants.BROTLI_OPERATION_FLUSH,
    },
    yt = fe.isFunction(x.default.createBrotliDecompress),
    { http: wt, https: bt } = b.default,
    xt = /https:?/,
    Et = Le.protocols.map((e) => e + ":"),
    _t = (e, [t, r]) => (e.on("end", r).on("error", r), t);
  function St(e, t) {
    (e.beforeRedirects.proxy && e.beforeRedirects.proxy(e),
      e.beforeRedirects.config && e.beforeRedirects.config(e, t));
  }
  function It(e, t, r) {
    let n = t;
    if (!n && !1 !== n) {
      const e = g.default.getProxyForUrl(r);
      e && (n = new URL(e));
    }
    if (n) {
      if ((n.username && (n.auth = (n.username || "") + ":" + (n.password || "")), n.auth)) {
        (n.auth.username || n.auth.password) &&
          (n.auth = (n.auth.username || "") + ":" + (n.auth.password || ""));
        const t = Buffer.from(n.auth, "utf8").toString("base64");
        e.headers["Proxy-Authorization"] = "Basic " + t;
      }
      e.headers.host = e.hostname + (e.port ? ":" + e.port : "");
      const t = n.hostname || n.host;
      ((e.hostname = t),
        (e.host = t),
        (e.port = n.port),
        (e.path = r),
        n.protocol && (e.protocol = n.protocol.includes(":") ? n.protocol : `${n.protocol}:`));
    }
    e.beforeRedirects.proxy = function (e) {
      It(e, t, e.href);
    };
  }
  const $t = "undefined" != typeof process && "process" === fe.kindOf(process),
    Ot = (e, t) =>
      (({ address: e, family: t }) => {
        if (!fe.isString(e)) throw TypeError("address must be a string");
        return { address: e, family: t || (e.indexOf(".") < 0 ? 6 : 4) };
      })(fe.isObject(e) ? e : { address: e, family: t }),
    Rt =
      $t &&
      function (e) {
        return (
          (t = async function (t, r, n) {
            let { data: i, lookup: o, family: s } = e;
            const { responseType: a, responseEncoding: c } = e,
              l = e.method.toUpperCase();
            let u,
              f,
              h = !1;
            if (o) {
              const e = dt(o, (e) => (fe.isArray(e) ? e : [e]));
              o = (t, r, n) => {
                e(t, r, (e, t, i) => {
                  if (e) return n(e);
                  const o = fe.isArray(t) ? t.map((e) => Ot(e)) : [Ot(t, i)];
                  r.all ? n(e, o) : n(e, o[0].address, o[0].family);
                });
              };
            }
            const m = new d.EventEmitter(),
              g = () => {
                (e.cancelToken && e.cancelToken.unsubscribe(b),
                  e.signal && e.signal.removeEventListener("abort", b),
                  m.removeAllListeners());
              };
            function b(t) {
              m.emit("abort", !t || t.type ? new Ke(null, e, f) : t);
            }
            (n((e, t) => {
              ((u = !0), t && ((h = !0), g()));
            }),
              m.once("abort", r),
              (e.cancelToken || e.signal) &&
                (e.cancelToken && e.cancelToken.subscribe(b),
                e.signal && (e.signal.aborted ? b() : e.signal.addEventListener("abort", b))));
            const _ = Ye(e.baseURL, e.url),
              S = new URL(_, Le.hasBrowserEnv ? Le.origin : void 0),
              I = S.protocol || Et[0];
            if ("data:" === I) {
              let n;
              if ("GET" !== l)
                return Xe(t, r, {
                  status: 405,
                  statusText: "method not allowed",
                  headers: {},
                  config: e,
                });
              try {
                n = (function (e, t, r) {
                  const n = (r && r.Blob) || Le.classes.Blob,
                    i = Qe(e);
                  if ((void 0 === t && n && (t = !0), "data" === i)) {
                    e = i.length ? e.slice(i.length + 1) : e;
                    const r = Ze.exec(e);
                    if (!r) throw new he("Invalid URL", he.ERR_INVALID_URL);
                    const o = r[1],
                      s = r[2],
                      a = r[3],
                      c = Buffer.from(decodeURIComponent(a), s ? "base64" : "utf8");
                    if (t) {
                      if (!n) throw new he("Blob is not supported", he.ERR_NOT_SUPPORT);
                      return new n([c], { type: o });
                    }
                    return c;
                  }
                  throw new he("Unsupported protocol " + i, he.ERR_NOT_SUPPORT);
                })(e.url, "blob" === a, { Blob: e.env && e.env.Blob });
              } catch (t) {
                throw he.from(t, he.ERR_BAD_REQUEST, e);
              }
              return (
                "text" === a
                  ? ((n = n.toString(c)), (c && "utf8" !== c) || (n = fe.stripBOM(n)))
                  : "stream" === a && (n = E.default.Readable.from(n)),
                Xe(t, r, { data: n, status: 200, statusText: "OK", headers: new Ge(), config: e })
              );
            }
            if (-1 === Et.indexOf(I))
              return r(new he("Unsupported protocol " + I, he.ERR_BAD_REQUEST, e));
            const $ = Ge.from(e.headers).normalize();
            $.set("User-Agent", "axios/" + Je, !1);
            const { onUploadProgress: O, onDownloadProgress: R } = e,
              P = e.maxRate;
            let A, T;
            if (fe.isSpecCompliantForm(i)) {
              const e = $.getContentType(/boundary=([-_\w\d]{10,70})/i);
              i = ((e, t, r) => {
                const {
                  tag: n = "form-data-boundary",
                  size: i = 25,
                  boundary: o = n + "-" + fe.generateString(i, ot),
                } = r || {};
                if (!fe.isFormData(e)) throw TypeError("FormData instance required");
                if (o.length < 1 || o.length > 70)
                  throw Error("boundary must be 10-70 characters long");
                const s = st.encode("--" + o + at),
                  a = st.encode("--" + o + "--" + at + at);
                let c = a.byteLength;
                const l = Array.from(e.entries()).map(([e, t]) => {
                  const r = new lt(e, t);
                  return ((c += r.size), r);
                });
                ((c += s.byteLength * l.length), (c = fe.toFiniteNumber(c)));
                const u = { "Content-Type": `multipart/form-data; boundary=${o}` };
                return (
                  Number.isFinite(c) && (u["Content-Length"] = c),
                  t && t(u),
                  p.Readable.from(
                    (async function* () {
                      for (const e of l) (yield s, yield* e.encode());
                      yield a;
                    })(),
                  )
                );
              })(
                i,
                (e) => {
                  $.set(e);
                },
                { tag: `axios-${Je}-boundary`, boundary: (e && e[1]) || void 0 },
              );
            } else if (fe.isFormData(i) && fe.isFunction(i.getHeaders)) {
              if (($.set(i.getHeaders()), !$.hasContentLength()))
                try {
                  const e = await w.default.promisify(i.getLength).call(i);
                  Number.isFinite(e) && e >= 0 && $.setContentLength(e);
                } catch (e) {}
            } else if (fe.isBlob(i) || fe.isFile(i))
              (i.size && $.setContentType(i.type || "application/octet-stream"),
                $.setContentLength(i.size || 0),
                (i = E.default.Readable.from(it(i))));
            else if (i && !fe.isStream(i)) {
              if (Buffer.isBuffer(i));
              else if (fe.isArrayBuffer(i)) i = Buffer.from(new Uint8Array(i));
              else {
                if (!fe.isString(i))
                  return r(
                    new he(
                      "Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream",
                      he.ERR_BAD_REQUEST,
                      e,
                    ),
                  );
                i = Buffer.from(i, "utf-8");
              }
              if (
                ($.setContentLength(i.length, !1),
                e.maxBodyLength > -1 && i.length > e.maxBodyLength)
              )
                return r(
                  new he("Request body larger than maxBodyLength limit", he.ERR_BAD_REQUEST, e),
                );
            }
            const k = fe.toFiniteNumber($.getContentLength());
            let N, C;
            (fe.isArray(P) ? ((A = P[0]), (T = P[1])) : (A = T = P),
              i &&
                (O || A) &&
                (fe.isStream(i) || (i = E.default.Readable.from(i, { objectMode: !1 })),
                (i = E.default.pipeline([i, new rt({ maxRate: fe.toFiniteNumber(A) })], fe.noop)),
                O && i.on("progress", _t(i, ht(k, ft(mt(O), !1, 3))))),
              e.auth && (N = (e.auth.username || "") + ":" + (e.auth.password || "")),
              !N && S.username && (N = S.username + ":" + S.password),
              N && $.delete("authorization"));
            try {
              C = $e(S.pathname + S.search, e.params, e.paramsSerializer).replace(/^\?/, "");
            } catch (t) {
              const n = new Error(t.message);
              return ((n.config = e), (n.url = e.url), (n.exists = !0), r(n));
            }
            $.set("Accept-Encoding", "gzip, compress, deflate" + (yt ? ", br" : ""), !1);
            const L = {
              path: C,
              method: l,
              headers: $.toJSON(),
              agents: { http: e.httpAgent, https: e.httpsAgent },
              auth: N,
              protocol: I,
              family: s,
              beforeRedirect: St,
              beforeRedirects: {},
            };
            let D;
            (!fe.isUndefined(o) && (L.lookup = o),
              e.socketPath
                ? (L.socketPath = e.socketPath)
                : ((L.hostname = S.hostname.startsWith("[") ? S.hostname.slice(1, -1) : S.hostname),
                  (L.port = S.port),
                  It(L, e.proxy, I + "//" + S.hostname + (S.port ? ":" + S.port : "") + L.path)));
            const j = xt.test(L.protocol);
            if (
              ((L.agent = j ? e.httpsAgent : e.httpAgent),
              e.transport
                ? (D = e.transport)
                : 0 === e.maxRedirects
                  ? (D = j ? y.default : v.default)
                  : (e.maxRedirects && (L.maxRedirects = e.maxRedirects),
                    e.beforeRedirect && (L.beforeRedirects.config = e.beforeRedirect),
                    (D = j ? bt : wt)),
              e.maxBodyLength > -1
                ? (L.maxBodyLength = e.maxBodyLength)
                : (L.maxBodyLength = 1 / 0),
              e.insecureHTTPParser && (L.insecureHTTPParser = e.insecureHTTPParser),
              (f = D.request(L, function (n) {
                if (f.destroyed) return;
                const i = [n],
                  o = +n.headers["content-length"];
                if (R || T) {
                  const e = new rt({ maxRate: fe.toFiniteNumber(T) });
                  (R && e.on("progress", _t(e, ht(o, ft(mt(R), !0, 3)))), i.push(e));
                }
                let s = n;
                const u = n.req || f;
                if (!1 !== e.decompress && n.headers["content-encoding"])
                  switch (
                    (("HEAD" !== l && 204 !== n.statusCode) || delete n.headers["content-encoding"],
                    (n.headers["content-encoding"] || "").toLowerCase())
                  ) {
                    case "gzip":
                    case "x-gzip":
                    case "compress":
                    case "x-compress":
                      (i.push(x.default.createUnzip(gt)), delete n.headers["content-encoding"]);
                      break;
                    case "deflate":
                      (i.push(new pt()),
                        i.push(x.default.createUnzip(gt)),
                        delete n.headers["content-encoding"]);
                      break;
                    case "br":
                      yt &&
                        (i.push(x.default.createBrotliDecompress(vt)),
                        delete n.headers["content-encoding"]);
                  }
                s = i.length > 1 ? E.default.pipeline(i, fe.noop) : i[0];
                const p = E.default.finished(s, () => {
                    (p(), g());
                  }),
                  d = {
                    status: n.statusCode,
                    statusText: n.statusMessage,
                    headers: new Ge(n.headers),
                    config: e,
                    request: u,
                  };
                if ("stream" === a) ((d.data = s), Xe(t, r, d));
                else {
                  const n = [];
                  let i = 0;
                  (s.on("data", function (t) {
                    (n.push(t),
                      (i += t.length),
                      e.maxContentLength > -1 &&
                        i > e.maxContentLength &&
                        ((h = !0),
                        s.destroy(),
                        r(
                          new he(
                            "maxContentLength size of " + e.maxContentLength + " exceeded",
                            he.ERR_BAD_RESPONSE,
                            e,
                            u,
                          ),
                        )));
                  }),
                    s.on("aborted", function () {
                      if (h) return;
                      const t = new he("stream has been aborted", he.ERR_BAD_RESPONSE, e, u);
                      (s.destroy(t), r(t));
                    }),
                    s.on("error", function (t) {
                      f.destroyed || r(he.from(t, null, e, u));
                    }),
                    s.on("end", function () {
                      try {
                        let e = 1 === n.length ? n[0] : Buffer.concat(n);
                        ("arraybuffer" !== a &&
                          ((e = e.toString(c)), (c && "utf8" !== c) || (e = fe.stripBOM(e))),
                          (d.data = e));
                      } catch (t) {
                        return r(he.from(t, null, e, d.request, d));
                      }
                      Xe(t, r, d);
                    }));
                }
                m.once("abort", (e) => {
                  s.destroyed || (s.emit("error", e), s.destroy());
                });
              })),
              m.once("abort", (e) => {
                (r(e), f.destroy(e));
              }),
              f.on("error", function (t) {
                r(he.from(t, null, e, f));
              }),
              f.on("socket", function (e) {
                e.setKeepAlive(!0, 6e4);
              }),
              e.timeout)
            ) {
              const t = parseInt(e.timeout, 10);
              if (Number.isNaN(t))
                return void r(
                  new he(
                    "error trying to parse `config.timeout` to int",
                    he.ERR_BAD_OPTION_VALUE,
                    e,
                    f,
                  ),
                );
              f.setTimeout(t, function () {
                if (u) return;
                let t = e.timeout ? "timeout of " + e.timeout + "ms exceeded" : "timeout exceeded";
                const n = e.transitional || Re;
                (e.timeoutErrorMessage && (t = e.timeoutErrorMessage),
                  r(new he(t, n.clarifyTimeoutError ? he.ETIMEDOUT : he.ECONNABORTED, e, f)),
                  b());
              });
            }
            if (fe.isStream(i)) {
              let t = !1,
                r = !1;
              (i.on("end", () => {
                t = !0;
              }),
                i.once("error", (e) => {
                  ((r = !0), f.destroy(e));
                }),
                i.on("close", () => {
                  t || r || b(new Ke("Request stream has been aborted", e, f));
                }),
                i.pipe(f));
            } else f.end(i);
          }),
          new Promise((e, r) => {
            let n, i;
            const o = (e, t) => {
                i || ((i = !0), n && n(e, t));
              },
              s = (e) => {
                (o(e, !0), r(e));
              };
            t(
              (t) => {
                (o(t), e(t));
              },
              s,
              (e) => (n = e),
            ).catch(s);
          })
        );
        var t;
      },
    Pt = Le.hasStandardBrowserEnv
      ? ((e, t) => (r) => (
          (r = new URL(r, Le.origin)),
          e.protocol === r.protocol && e.host === r.host && (t || e.port === r.port)
        ))(new URL(Le.origin), Le.navigator && /(msie|trident)/i.test(Le.navigator.userAgent))
      : () => !0,
    At = Le.hasStandardBrowserEnv
      ? {
          write(e, t, r, n, i, o) {
            const s = [e + "=" + encodeURIComponent(t)];
            (fe.isNumber(r) && s.push("expires=" + new Date(r).toGMTString()),
              fe.isString(n) && s.push("path=" + n),
              fe.isString(i) && s.push("domain=" + i),
              !0 === o && s.push("secure"),
              (document.cookie = s.join("; ")));
          },
          read(e) {
            const t = document.cookie.match(new RegExp("(^|;\\s*)(" + e + ")=([^;]*)"));
            return t ? decodeURIComponent(t[3]) : null;
          },
          remove(e) {
            this.write(e, "", Date.now() - 864e5);
          },
        }
      : { write() {}, read: () => null, remove() {} },
    Tt = (e) => (e instanceof Ge ? { ...e } : e);
  function kt(e, t) {
    t = t || {};
    const r = {};
    function n(e, t, r, n) {
      return fe.isPlainObject(e) && fe.isPlainObject(t)
        ? fe.merge.call({ caseless: n }, e, t)
        : fe.isPlainObject(t)
          ? fe.merge({}, t)
          : fe.isArray(t)
            ? t.slice()
            : t;
    }
    function i(e, t, r, i) {
      return fe.isUndefined(t) ? (fe.isUndefined(e) ? void 0 : n(void 0, e, 0, i)) : n(e, t, 0, i);
    }
    function o(e, t) {
      if (!fe.isUndefined(t)) return n(void 0, t);
    }
    function s(e, t) {
      return fe.isUndefined(t) ? (fe.isUndefined(e) ? void 0 : n(void 0, e)) : n(void 0, t);
    }
    function a(r, i, o) {
      return o in t ? n(r, i) : o in e ? n(void 0, r) : void 0;
    }
    const c = {
      url: o,
      method: o,
      data: o,
      baseURL: s,
      transformRequest: s,
      transformResponse: s,
      paramsSerializer: s,
      timeout: s,
      timeoutMessage: s,
      withCredentials: s,
      withXSRFToken: s,
      adapter: s,
      responseType: s,
      xsrfCookieName: s,
      xsrfHeaderName: s,
      onUploadProgress: s,
      onDownloadProgress: s,
      decompress: s,
      maxContentLength: s,
      maxBodyLength: s,
      beforeRedirect: s,
      transport: s,
      httpAgent: s,
      httpsAgent: s,
      cancelToken: s,
      socketPath: s,
      responseEncoding: s,
      validateStatus: a,
      headers: (e, t, r) => i(Tt(e), Tt(t), 0, !0),
    };
    return (
      fe.forEach(Object.keys(Object.assign({}, e, t)), function (n) {
        const o = c[n] || i,
          s = o(e[n], t[n], n);
        (fe.isUndefined(s) && o !== a) || (r[n] = s);
      }),
      r
    );
  }
  const Nt = (e) => {
      const t = kt({}, e);
      let r,
        {
          data: n,
          withXSRFToken: i,
          xsrfHeaderName: o,
          xsrfCookieName: s,
          headers: a,
          auth: c,
        } = t;
      if (
        ((t.headers = a = Ge.from(a)),
        (t.url = $e(Ye(t.baseURL, t.url), e.params, e.paramsSerializer)),
        c &&
          a.set(
            "Authorization",
            "Basic " +
              btoa(
                (c.username || "") +
                  ":" +
                  (c.password ? unescape(encodeURIComponent(c.password)) : ""),
              ),
          ),
        fe.isFormData(n))
      )
        if (Le.hasStandardBrowserEnv || Le.hasStandardBrowserWebWorkerEnv) a.setContentType(void 0);
        else if (!1 !== (r = a.getContentType())) {
          const [e, ...t] = r
            ? r
                .split(";")
                .map((e) => e.trim())
                .filter(Boolean)
            : [];
          a.setContentType([e || "multipart/form-data", ...t].join("; "));
        }
      if (
        Le.hasStandardBrowserEnv &&
        (i && fe.isFunction(i) && (i = i(t)), i || (!1 !== i && Pt(t.url)))
      ) {
        const e = o && s && At.read(s);
        e && a.set(o, e);
      }
      return t;
    },
    Ct =
      "undefined" != typeof XMLHttpRequest &&
      function (e) {
        return new Promise(function (t, r) {
          const n = Nt(e);
          let i = n.data;
          const o = Ge.from(n.headers).normalize();
          let s,
            a,
            c,
            l,
            u,
            { responseType: p, onUploadProgress: d, onDownloadProgress: f } = n;
          function h() {
            (l && l(),
              u && u(),
              n.cancelToken && n.cancelToken.unsubscribe(s),
              n.signal && n.signal.removeEventListener("abort", s));
          }
          let m = new XMLHttpRequest();
          function g() {
            if (!m) return;
            const n = Ge.from("getAllResponseHeaders" in m && m.getAllResponseHeaders());
            (Xe(
              function (e) {
                (t(e), h());
              },
              function (e) {
                (r(e), h());
              },
              {
                data: p && "text" !== p && "json" !== p ? m.response : m.responseText,
                status: m.status,
                statusText: m.statusText,
                headers: n,
                config: e,
                request: m,
              },
            ),
              (m = null));
          }
          (m.open(n.method.toUpperCase(), n.url, !0),
            (m.timeout = n.timeout),
            "onloadend" in m
              ? (m.onloadend = g)
              : (m.onreadystatechange = function () {
                  m &&
                    4 === m.readyState &&
                    (0 !== m.status || (m.responseURL && 0 === m.responseURL.indexOf("file:"))) &&
                    setTimeout(g);
                }),
            (m.onabort = function () {
              m && (r(new he("Request aborted", he.ECONNABORTED, e, m)), (m = null));
            }),
            (m.onerror = function () {
              (r(new he("Network Error", he.ERR_NETWORK, e, m)), (m = null));
            }),
            (m.ontimeout = function () {
              let t = n.timeout ? "timeout of " + n.timeout + "ms exceeded" : "timeout exceeded";
              const i = n.transitional || Re;
              (n.timeoutErrorMessage && (t = n.timeoutErrorMessage),
                r(new he(t, i.clarifyTimeoutError ? he.ETIMEDOUT : he.ECONNABORTED, e, m)),
                (m = null));
            }),
            void 0 === i && o.setContentType(null),
            "setRequestHeader" in m &&
              fe.forEach(o.toJSON(), function (e, t) {
                m.setRequestHeader(t, e);
              }),
            fe.isUndefined(n.withCredentials) || (m.withCredentials = !!n.withCredentials),
            p && "json" !== p && (m.responseType = n.responseType),
            f && (([c, u] = ft(f, !0)), m.addEventListener("progress", c)),
            d &&
              m.upload &&
              (([a, l] = ft(d)),
              m.upload.addEventListener("progress", a),
              m.upload.addEventListener("loadend", l)),
            (n.cancelToken || n.signal) &&
              ((s = (t) => {
                m && (r(!t || t.type ? new Ke(null, e, m) : t), m.abort(), (m = null));
              }),
              n.cancelToken && n.cancelToken.subscribe(s),
              n.signal && (n.signal.aborted ? s() : n.signal.addEventListener("abort", s))));
          const v = Qe(n.url);
          v && -1 === Le.protocols.indexOf(v)
            ? r(new he("Unsupported protocol " + v + ":", he.ERR_BAD_REQUEST, e))
            : m.send(i || null);
        });
      },
    Lt = (e, t) => {
      const { length: r } = (e = e ? e.filter(Boolean) : []);
      if (t || r) {
        let r,
          n = new AbortController();
        const i = function (e) {
          if (!r) {
            ((r = !0), s());
            const t = e instanceof Error ? e : this.reason;
            n.abort(t instanceof he ? t : new Ke(t instanceof Error ? t.message : t));
          }
        };
        let o =
          t &&
          setTimeout(() => {
            ((o = null), i(new he(`timeout ${t} of ms exceeded`, he.ETIMEDOUT)));
          }, t);
        const s = () => {
          e &&
            (o && clearTimeout(o),
            (o = null),
            e.forEach((e) => {
              e.unsubscribe ? e.unsubscribe(i) : e.removeEventListener("abort", i);
            }),
            (e = null));
        };
        e.forEach((e) => e.addEventListener("abort", i));
        const { signal: a } = n;
        return ((a.unsubscribe = () => fe.asap(s)), a);
      }
    },
    Dt = function* (e, t) {
      let r = e.byteLength;
      if (!t || r < t) return void (yield e);
      let n,
        i = 0;
      for (; i < r;) ((n = i + t), yield e.slice(i, n), (i = n));
    },
    jt = (e, t, r, n) => {
      const i = (async function* (e, t) {
        for await (const r of (async function* (e) {
          if (e[Symbol.asyncIterator]) return void (yield* e);
          const t = e.getReader();
          try {
            for (;;) {
              const { done: e, value: r } = await t.read();
              if (e) break;
              yield r;
            }
          } finally {
            await t.cancel();
          }
        })(e))
          yield* Dt(r, t);
      })(e, t);
      let o,
        s = 0,
        a = (e) => {
          o || ((o = !0), n && n(e));
        };
      return new ReadableStream(
        {
          async pull(e) {
            try {
              const { done: t, value: n } = await i.next();
              if (t) return (a(), void e.close());
              let o = n.byteLength;
              if (r) {
                let e = (s += o);
                r(e);
              }
              e.enqueue(new Uint8Array(n));
            } catch (e) {
              throw (a(e), e);
            }
          },
          cancel: (e) => (a(e), i.return()),
        },
        { highWaterMark: 2 },
      );
    },
    Ut =
      "function" == typeof fetch && "function" == typeof Request && "function" == typeof Response,
    Mt = Ut && "function" == typeof ReadableStream,
    Ft =
      Ut &&
      ("function" == typeof TextEncoder
        ? ((zt = new TextEncoder()), (e) => zt.encode(e))
        : async (e) => new Uint8Array(await new Response(e).arrayBuffer()));
  var zt;
  const Bt = (e, ...t) => {
      try {
        return !!e(...t);
      } catch (e) {
        return !1;
      }
    },
    qt =
      Mt &&
      Bt(() => {
        let e = !1;
        const t = new Request(Le.origin, {
          body: new ReadableStream(),
          method: "POST",
          get duplex() {
            return ((e = !0), "half");
          },
        }).headers.has("Content-Type");
        return e && !t;
      }),
    Vt = Mt && Bt(() => fe.isReadableStream(new Response("").body)),
    Gt = { stream: Vt && ((e) => e.body) };
  var Ht;
  Ut &&
    ((Ht = new Response()),
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((e) => {
      !Gt[e] &&
        (Gt[e] = fe.isFunction(Ht[e])
          ? (t) => t[e]()
          : (t, r) => {
              throw new he(`Response type '${e}' is not supported`, he.ERR_NOT_SUPPORT, r);
            });
    }));
  const Wt =
      Ut &&
      (async (e) => {
        let {
          url: t,
          method: r,
          data: n,
          signal: i,
          cancelToken: o,
          timeout: s,
          onDownloadProgress: a,
          onUploadProgress: c,
          responseType: l,
          headers: u,
          withCredentials: p = "same-origin",
          fetchOptions: d,
        } = Nt(e);
        l = l ? (l + "").toLowerCase() : "text";
        let f,
          h = Lt([i, o && o.toAbortSignal()], s);
        const m =
          h &&
          h.unsubscribe &&
          (() => {
            h.unsubscribe();
          });
        let g;
        try {
          if (
            c &&
            qt &&
            "get" !== r &&
            "head" !== r &&
            0 !==
              (g = await (async (e, t) => {
                const r = fe.toFiniteNumber(e.getContentLength());
                return null == r
                  ? (async (e) => {
                      if (null == e) return 0;
                      if (fe.isBlob(e)) return e.size;
                      if (fe.isSpecCompliantForm(e)) {
                        const t = new Request(Le.origin, { method: "POST", body: e });
                        return (await t.arrayBuffer()).byteLength;
                      }
                      return fe.isArrayBufferView(e) || fe.isArrayBuffer(e)
                        ? e.byteLength
                        : (fe.isURLSearchParams(e) && (e += ""),
                          fe.isString(e) ? (await Ft(e)).byteLength : void 0);
                    })(t)
                  : r;
              })(u, n))
          ) {
            let e,
              r = new Request(t, { method: "POST", body: n, duplex: "half" });
            if (
              (fe.isFormData(n) && (e = r.headers.get("content-type")) && u.setContentType(e),
              r.body)
            ) {
              const [e, t] = ht(g, ft(mt(c)));
              n = jt(r.body, 65536, e, t);
            }
          }
          fe.isString(p) || (p = p ? "include" : "omit");
          const i = "credentials" in Request.prototype;
          f = new Request(t, {
            ...d,
            signal: h,
            method: r.toUpperCase(),
            headers: u.normalize().toJSON(),
            body: n,
            duplex: "half",
            credentials: i ? p : void 0,
          });
          let o = await fetch(f);
          const s = Vt && ("stream" === l || "response" === l);
          if (Vt && (a || (s && m))) {
            const e = {};
            ["status", "statusText", "headers"].forEach((t) => {
              e[t] = o[t];
            });
            const t = fe.toFiniteNumber(o.headers.get("content-length")),
              [r, n] = (a && ht(t, ft(mt(a), !0))) || [];
            o = new Response(
              jt(o.body, 65536, r, () => {
                (n && n(), m && m());
              }),
              e,
            );
          }
          l = l || "text";
          let v = await Gt[fe.findKey(Gt, l) || "text"](o, e);
          return (
            !s && m && m(),
            await new Promise((t, r) => {
              Xe(t, r, {
                data: v,
                headers: Ge.from(o.headers),
                status: o.status,
                statusText: o.statusText,
                config: e,
                request: f,
              });
            })
          );
        } catch (t) {
          if ((m && m(), t && "TypeError" === t.name && /fetch/i.test(t.message)))
            throw Object.assign(new he("Network Error", he.ERR_NETWORK, e, f), {
              cause: t.cause || t,
            });
          throw he.from(t, t && t.code, e, f);
        }
      }),
    Kt = { http: Rt, xhr: Ct, fetch: Wt };
  fe.forEach(Kt, (e, t) => {
    if (e) {
      try {
        Object.defineProperty(e, "name", { value: t });
      } catch (e) {}
      Object.defineProperty(e, "adapterName", { value: t });
    }
  });
  const Xt = (e) => `- ${e}`,
    Yt = (e) => fe.isFunction(e) || null === e || !1 === e,
    Jt = (e) => {
      e = fe.isArray(e) ? e : [e];
      const { length: t } = e;
      let r, n;
      const i = {};
      for (let o = 0; o < t; o++) {
        let t;
        if (
          ((r = e[o]), (n = r), !Yt(r) && ((n = Kt[(t = String(r)).toLowerCase()]), void 0 === n))
        )
          throw new he(`Unknown adapter '${t}'`);
        if (n) break;
        i[t || "#" + o] = n;
      }
      if (!n) {
        const e = Object.entries(i).map(
          ([e, t]) =>
            `adapter ${e} ` +
            (!1 === t ? "is not supported by the environment" : "is not available in the build"),
        );
        throw new he(
          "There is no suitable adapter to dispatch the request " +
            (t
              ? e.length > 1
                ? "since :\n" + e.map(Xt).join("\n")
                : " " + Xt(e[0])
              : "as no adapter specified"),
          "ERR_NOT_SUPPORT",
        );
      }
      return n;
    };
  function Qt(e) {
    if ((e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted))
      throw new Ke(null, e);
  }
  function Zt(e) {
    return (
      Qt(e),
      (e.headers = Ge.from(e.headers)),
      (e.data = He.call(e, e.transformRequest)),
      -1 !== ["post", "put", "patch"].indexOf(e.method) &&
        e.headers.setContentType("application/x-www-form-urlencoded", !1),
      Jt(e.adapter || Ue.adapter)(e).then(
        function (t) {
          return (
            Qt(e),
            (t.data = He.call(e, e.transformResponse, t)),
            (t.headers = Ge.from(t.headers)),
            t
          );
        },
        function (t) {
          return (
            We(t) ||
              (Qt(e),
              t &&
                t.response &&
                ((t.response.data = He.call(e, e.transformResponse, t.response)),
                (t.response.headers = Ge.from(t.response.headers)))),
            Promise.reject(t)
          );
        },
      )
    );
  }
  const er = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
    er[e] = function (r) {
      return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
    };
  });
  const tr = {};
  ((er.transitional = function (e, t, r) {
    function n(e, t) {
      return "[Axios v1.7.9] Transitional option '" + e + "'" + t + (r ? ". " + r : "");
    }
    return (r, i, o) => {
      if (!1 === e)
        throw new he(n(i, " has been removed" + (t ? " in " + t : "")), he.ERR_DEPRECATED);
      return (
        t &&
          !tr[i] &&
          ((tr[i] = !0),
          console.warn(
            n(i, " has been deprecated since v" + t + " and will be removed in the near future"),
          )),
        !e || e(r, i, o)
      );
    };
  }),
    (er.spelling = function (e) {
      return (t, r) => (console.warn(`${r} is likely a misspelling of ${e}`), !0);
    }));
  const rr = {
      assertOptions: function (e, t, r) {
        if ("object" != typeof e)
          throw new he("options must be an object", he.ERR_BAD_OPTION_VALUE);
        const n = Object.keys(e);
        let i = n.length;
        for (; i-- > 0;) {
          const o = n[i],
            s = t[o];
          if (s) {
            const t = e[o],
              r = void 0 === t || s(t, o, e);
            if (!0 !== r) throw new he("option " + o + " must be " + r, he.ERR_BAD_OPTION_VALUE);
          } else if (!0 !== r) throw new he("Unknown option " + o, he.ERR_BAD_OPTION);
        }
      },
      validators: er,
    },
    nr = rr.validators;
  class ir {
    constructor(e) {
      ((this.defaults = e), (this.interceptors = { request: new Oe(), response: new Oe() }));
    }
    async request(e, t) {
      try {
        return await this._request(e, t);
      } catch (e) {
        if (e instanceof Error) {
          let t = {};
          Error.captureStackTrace ? Error.captureStackTrace(t) : (t = new Error());
          const r = t.stack ? t.stack.replace(/^.+\n/, "") : "";
          try {
            e.stack
              ? r && !String(e.stack).endsWith(r.replace(/^.+\n.+\n/, "")) && (e.stack += "\n" + r)
              : (e.stack = r);
          } catch (e) {}
        }
        throw e;
      }
    }
    _request(e, t) {
      ("string" == typeof e ? ((t = t || {}).url = e) : (t = e || {}), (t = kt(this.defaults, t)));
      const { transitional: r, paramsSerializer: n, headers: i } = t;
      (void 0 !== r &&
        rr.assertOptions(
          r,
          {
            silentJSONParsing: nr.transitional(nr.boolean),
            forcedJSONParsing: nr.transitional(nr.boolean),
            clarifyTimeoutError: nr.transitional(nr.boolean),
          },
          !1,
        ),
        null != n &&
          (fe.isFunction(n)
            ? (t.paramsSerializer = { serialize: n })
            : rr.assertOptions(n, { encode: nr.function, serialize: nr.function }, !0)),
        rr.assertOptions(
          t,
          { baseUrl: nr.spelling("baseURL"), withXsrfToken: nr.spelling("withXSRFToken") },
          !0,
        ),
        (t.method = (t.method || this.defaults.method || "get").toLowerCase()));
      let o = i && fe.merge(i.common, i[t.method]);
      (i &&
        fe.forEach(["delete", "get", "head", "post", "put", "patch", "common"], (e) => {
          delete i[e];
        }),
        (t.headers = Ge.concat(o, i)));
      const s = [];
      let a = !0;
      this.interceptors.request.forEach(function (e) {
        ("function" == typeof e.runWhen && !1 === e.runWhen(t)) ||
          ((a = a && e.synchronous), s.unshift(e.fulfilled, e.rejected));
      });
      const c = [];
      let l;
      this.interceptors.response.forEach(function (e) {
        c.push(e.fulfilled, e.rejected);
      });
      let u,
        p = 0;
      if (!a) {
        const e = [Zt.bind(this), void 0];
        for (
          e.unshift.apply(e, s), e.push.apply(e, c), u = e.length, l = Promise.resolve(t);
          p < u;
        )
          l = l.then(e[p++], e[p++]);
        return l;
      }
      u = s.length;
      let d = t;
      for (p = 0; p < u;) {
        const e = s[p++],
          t = s[p++];
        try {
          d = e(d);
        } catch (e) {
          t.call(this, e);
          break;
        }
      }
      try {
        l = Zt.call(this, d);
      } catch (e) {
        return Promise.reject(e);
      }
      for (p = 0, u = c.length; p < u;) l = l.then(c[p++], c[p++]);
      return l;
    }
    getUri(e) {
      return $e(Ye((e = kt(this.defaults, e)).baseURL, e.url), e.params, e.paramsSerializer);
    }
  }
  (fe.forEach(["delete", "get", "head", "options"], function (e) {
    ir.prototype[e] = function (t, r) {
      return this.request(kt(r || {}, { method: e, url: t, data: (r || {}).data }));
    };
  }),
    fe.forEach(["post", "put", "patch"], function (e) {
      function t(t) {
        return function (r, n, i) {
          return this.request(
            kt(i || {}, {
              method: e,
              headers: t ? { "Content-Type": "multipart/form-data" } : {},
              url: r,
              data: n,
            }),
          );
        };
      }
      ((ir.prototype[e] = t()), (ir.prototype[e + "Form"] = t(!0)));
    }));
  const or = ir;
  class sr {
    constructor(e) {
      if ("function" != typeof e) throw new TypeError("executor must be a function.");
      let t;
      this.promise = new Promise(function (e) {
        t = e;
      });
      const r = this;
      (this.promise.then((e) => {
        if (!r._listeners) return;
        let t = r._listeners.length;
        for (; t-- > 0;) r._listeners[t](e);
        r._listeners = null;
      }),
        (this.promise.then = (e) => {
          let t;
          const n = new Promise((e) => {
            (r.subscribe(e), (t = e));
          }).then(e);
          return (
            (n.cancel = function () {
              r.unsubscribe(t);
            }),
            n
          );
        }),
        e(function (e, n, i) {
          r.reason || ((r.reason = new Ke(e, n, i)), t(r.reason));
        }));
    }
    throwIfRequested() {
      if (this.reason) throw this.reason;
    }
    subscribe(e) {
      this.reason
        ? e(this.reason)
        : this._listeners
          ? this._listeners.push(e)
          : (this._listeners = [e]);
    }
    unsubscribe(e) {
      if (!this._listeners) return;
      const t = this._listeners.indexOf(e);
      -1 !== t && this._listeners.splice(t, 1);
    }
    toAbortSignal() {
      const e = new AbortController(),
        t = (t) => {
          e.abort(t);
        };
      return (this.subscribe(t), (e.signal.unsubscribe = () => this.unsubscribe(t)), e.signal);
    }
    static source() {
      let e;
      return {
        token: new sr(function (t) {
          e = t;
        }),
        cancel: e,
      };
    }
  }
  const ar = sr,
    cr = {
      Continue: 100,
      SwitchingProtocols: 101,
      Processing: 102,
      EarlyHints: 103,
      Ok: 200,
      Created: 201,
      Accepted: 202,
      NonAuthoritativeInformation: 203,
      NoContent: 204,
      ResetContent: 205,
      PartialContent: 206,
      MultiStatus: 207,
      AlreadyReported: 208,
      ImUsed: 226,
      MultipleChoices: 300,
      MovedPermanently: 301,
      Found: 302,
      SeeOther: 303,
      NotModified: 304,
      UseProxy: 305,
      Unused: 306,
      TemporaryRedirect: 307,
      PermanentRedirect: 308,
      BadRequest: 400,
      Unauthorized: 401,
      PaymentRequired: 402,
      Forbidden: 403,
      NotFound: 404,
      MethodNotAllowed: 405,
      NotAcceptable: 406,
      ProxyAuthenticationRequired: 407,
      RequestTimeout: 408,
      Conflict: 409,
      Gone: 410,
      LengthRequired: 411,
      PreconditionFailed: 412,
      PayloadTooLarge: 413,
      UriTooLong: 414,
      UnsupportedMediaType: 415,
      RangeNotSatisfiable: 416,
      ExpectationFailed: 417,
      ImATeapot: 418,
      MisdirectedRequest: 421,
      UnprocessableEntity: 422,
      Locked: 423,
      FailedDependency: 424,
      TooEarly: 425,
      UpgradeRequired: 426,
      PreconditionRequired: 428,
      TooManyRequests: 429,
      RequestHeaderFieldsTooLarge: 431,
      UnavailableForLegalReasons: 451,
      InternalServerError: 500,
      NotImplemented: 501,
      BadGateway: 502,
      ServiceUnavailable: 503,
      GatewayTimeout: 504,
      HttpVersionNotSupported: 505,
      VariantAlsoNegotiates: 506,
      InsufficientStorage: 507,
      LoopDetected: 508,
      NotExtended: 510,
      NetworkAuthenticationRequired: 511,
    };
  Object.entries(cr).forEach(([e, t]) => {
    cr[t] = e;
  });
  const lr = cr,
    ur = (function e(t) {
      const r = new or(t),
        n = _(or.prototype.request, r);
      return (
        fe.extend(n, or.prototype, r, { allOwnKeys: !0 }),
        fe.extend(n, r, null, { allOwnKeys: !0 }),
        (n.create = function (r) {
          return e(kt(t, r));
        }),
        n
      );
    })(Ue);
  ((ur.Axios = or),
    (ur.CanceledError = Ke),
    (ur.CancelToken = ar),
    (ur.isCancel = We),
    (ur.VERSION = Je),
    (ur.toFormData = xe),
    (ur.AxiosError = he),
    (ur.Cancel = ur.CanceledError),
    (ur.all = function (e) {
      return Promise.all(e);
    }),
    (ur.spread = function (e) {
      return function (t) {
        return e.apply(null, t);
      };
    }),
    (ur.isAxiosError = function (e) {
      return fe.isObject(e) && !0 === e.isAxiosError;
    }),
    (ur.mergeConfig = kt),
    (ur.AxiosHeaders = Ge),
    (ur.formToJSON = (e) => De(fe.isHTMLForm(e) ? new FormData(e) : e)),
    (ur.getAdapter = Jt),
    (ur.HttpStatusCode = lr),
    (ur.default = ur),
    (e.exports = ur));
};
