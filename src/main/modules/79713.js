module.exports = (e, t, r) => {
  "use strict";
  var n = r(90554),
    i = r(40951);
  function o(e) {
    return 48 <= e && e <= 55;
  }
  function s(e) {
    return 48 <= e && e <= 57;
  }
  e.exports = new i("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: function (e) {
      if (null === e) return !1;
      var t,
        r,
        n = e.length,
        i = 0,
        a = !1;
      if (!n) return !1;
      if ((("-" !== (t = e[i]) && "+" !== t) || (t = e[++i]), "0" === t)) {
        if (i + 1 === n) return !0;
        if ("b" === (t = e[++i])) {
          for (i++; i < n; i++)
            if ("_" !== (t = e[i])) {
              if ("0" !== t && "1" !== t) return !1;
              a = !0;
            }
          return a && "_" !== t;
        }
        if ("x" === t) {
          for (i++; i < n; i++)
            if ("_" !== (t = e[i])) {
              if (!(
                (48 <= (r = e.charCodeAt(i)) && r <= 57) ||
                (65 <= r && r <= 70) ||
                (97 <= r && r <= 102)
              ))
                return !1;
              a = !0;
            }
          return a && "_" !== t;
        }
        if ("o" === t) {
          for (i++; i < n; i++)
            if ("_" !== (t = e[i])) {
              if (!o(e.charCodeAt(i))) return !1;
              a = !0;
            }
          return a && "_" !== t;
        }
      }
      if ("_" === t) return !1;
      for (; i < n; i++)
        if ("_" !== (t = e[i])) {
          if (!s(e.charCodeAt(i))) return !1;
          a = !0;
        }
      return !(!a || "_" === t);
    },
    construct: function (e) {
      var t,
        r = e,
        n = 1;
      if (
        (-1 !== r.indexOf("_") && (r = r.replace(/_/g, "")),
        ("-" !== (t = r[0]) && "+" !== t) || ("-" === t && (n = -1), (t = (r = r.slice(1))[0])),
        "0" === r)
      )
        return 0;
      if ("0" === t) {
        if ("b" === r[1]) return n * parseInt(r.slice(2), 2);
        if ("x" === r[1]) return n * parseInt(r.slice(2), 16);
        if ("o" === r[1]) return n * parseInt(r.slice(2), 8);
      }
      return n * parseInt(r, 10);
    },
    predicate: function (e) {
      return (
        "[object Number]" === Object.prototype.toString.call(e) &&
        e % 1 == 0 &&
        !n.isNegativeZero(e)
      );
    },
    represent: {
      binary: function (e) {
        return e >= 0 ? "0b" + e.toString(2) : "-0b" + e.toString(2).slice(1);
      },
      octal: function (e) {
        return e >= 0 ? "0o" + e.toString(8) : "-0o" + e.toString(8).slice(1);
      },
      decimal: function (e) {
        return e.toString(10);
      },
      hexadecimal: function (e) {
        return e >= 0
          ? "0x" + e.toString(16).toUpperCase()
          : "-0x" + e.toString(16).toUpperCase().slice(1);
      },
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"],
    },
  });
};
