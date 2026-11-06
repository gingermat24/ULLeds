module.exports = (e, t, r) => {
  "use strict";
  var n = r(90554),
    i = r(40951),
    o = new RegExp(
      "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$",
    ),
    s = /^[-+]?[0-9]+e/;
  e.exports = new i("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: function (e) {
      return null !== e && !(!o.test(e) || "_" === e[e.length - 1]);
    },
    construct: function (e) {
      var t, r;
      return (
        (r = "-" === (t = e.replace(/_/g, "").toLowerCase())[0] ? -1 : 1),
        "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)),
        ".inf" === t
          ? 1 === r
            ? Number.POSITIVE_INFINITY
            : Number.NEGATIVE_INFINITY
          : ".nan" === t
            ? NaN
            : r * parseFloat(t, 10)
      );
    },
    predicate: function (e) {
      return (
        "[object Number]" === Object.prototype.toString.call(e) &&
        (e % 1 != 0 || n.isNegativeZero(e))
      );
    },
    represent: function (e, t) {
      var r;
      if (isNaN(e))
        switch (t) {
          case "lowercase":
            return ".nan";
          case "uppercase":
            return ".NAN";
          case "camelcase":
            return ".NaN";
        }
      else if (Number.POSITIVE_INFINITY === e)
        switch (t) {
          case "lowercase":
            return ".inf";
          case "uppercase":
            return ".INF";
          case "camelcase":
            return ".Inf";
        }
      else if (Number.NEGATIVE_INFINITY === e)
        switch (t) {
          case "lowercase":
            return "-.inf";
          case "uppercase":
            return "-.INF";
          case "camelcase":
            return "-.Inf";
        }
      else if (n.isNegativeZero(e)) return "-0.0";
      return ((r = e.toString(10)), s.test(r) ? r.replace("e", ".e") : r);
    },
    defaultStyle: "lowercase",
  });
};
