module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.nil = t.UUID = void 0));
  const n = r(76982),
    i = r(68046),
    o = (0, n.randomBytes)(16);
  o[0] = 1 | o[0];
  const s = {},
    a = [];
  for (let e = 0; e < 256; e++) {
    const t = (e + 256).toString(16).substr(1);
    ((s[t] = e), (a[e] = t));
  }
  class c {
    constructor(e) {
      ((this.ascii = null), (this.binary = null));
      const t = c.check(e);
      if (!t) throw new Error("not a UUID");
      ((this.version = t.version), "ascii" === t.format ? (this.ascii = e) : (this.binary = e));
    }
    static v5(e, t) {
      return (function (e, t, r, o, s = u.ASCII) {
        const l = (0, n.createHash)(t);
        if ("string" != typeof e && !Buffer.isBuffer(e))
          throw (0, i.newError)(
            "options.name must be either a string or a Buffer",
            "ERR_INVALID_UUID_NAME",
          );
        (l.update(o), l.update(e));
        const p = l.digest();
        let d;
        switch (s) {
          case u.BINARY:
            ((p[6] = (15 & p[6]) | r), (p[8] = (63 & p[8]) | 128), (d = p));
            break;
          case u.OBJECT:
            ((p[6] = (15 & p[6]) | r), (p[8] = (63 & p[8]) | 128), (d = new c(p)));
            break;
          default:
            d =
              a[p[0]] +
              a[p[1]] +
              a[p[2]] +
              a[p[3]] +
              "-" +
              a[p[4]] +
              a[p[5]] +
              "-" +
              a[(15 & p[6]) | r] +
              a[p[7]] +
              "-" +
              a[(63 & p[8]) | 128] +
              a[p[9]] +
              "-" +
              a[p[10]] +
              a[p[11]] +
              a[p[12]] +
              a[p[13]] +
              a[p[14]] +
              a[p[15]];
        }
        return d;
      })(e, "sha1", 80, t);
    }
    toString() {
      var e;
      return (
        null == this.ascii &&
          (this.ascii =
            ((e = this.binary),
            a[e[0]] +
              a[e[1]] +
              a[e[2]] +
              a[e[3]] +
              "-" +
              a[e[4]] +
              a[e[5]] +
              "-" +
              a[e[6]] +
              a[e[7]] +
              "-" +
              a[e[8]] +
              a[e[9]] +
              "-" +
              a[e[10]] +
              a[e[11]] +
              a[e[12]] +
              a[e[13]] +
              a[e[14]] +
              a[e[15]])),
        this.ascii
      );
    }
    inspect() {
      return `UUID v${this.version} ${this.toString()}`;
    }
    static check(e, t = 0) {
      if ("string" == typeof e)
        return (
          (e = e.toLowerCase()),
          !!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(e) &&
            ("00000000-0000-0000-0000-000000000000" === e
              ? { version: void 0, variant: "nil", format: "ascii" }
              : {
                  version: (240 & s[e[14] + e[15]]) >> 4,
                  variant: l((224 & s[e[19] + e[20]]) >> 5),
                  format: "ascii",
                })
        );
      if (Buffer.isBuffer(e)) {
        if (e.length < t + 16) return !1;
        let r = 0;
        for (; r < 16 && 0 === e[t + r]; r++);
        return 16 === r
          ? { version: void 0, variant: "nil", format: "binary" }
          : { version: (240 & e[t + 6]) >> 4, variant: l((224 & e[t + 8]) >> 5), format: "binary" };
      }
      throw (0, i.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
    }
    static parse(e) {
      const t = Buffer.allocUnsafe(16);
      let r = 0;
      for (let n = 0; n < 16; n++)
        ((t[n] = s[e[r++] + e[r++]]), (3 !== n && 5 !== n && 7 !== n && 9 !== n) || (r += 1));
      return t;
    }
  }
  function l(e) {
    switch (e) {
      case 0:
      case 1:
      case 3:
        return "ncs";
      case 4:
      case 5:
        return "rfc4122";
      case 6:
        return "microsoft";
      default:
        return "future";
    }
  }
  var u;
  ((t.UUID = c),
    (c.OID = c.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8")),
    (function (e) {
      ((e[(e.ASCII = 0)] = "ASCII"),
        (e[(e.BINARY = 1)] = "BINARY"),
        (e[(e.OBJECT = 2)] = "OBJECT"));
    })(u || (u = {})),
    (t.nil = new c("00000000-0000-0000-0000-000000000000")));
};
