module.exports = (e, t, r) => {
  "use strict";
  var n = r(40951);
  e.exports = new n("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: function (e) {
      if (null === e) return !1;
      var t = e.length;
      return (
        (4 === t && ("true" === e || "True" === e || "TRUE" === e)) ||
        (5 === t && ("false" === e || "False" === e || "FALSE" === e))
      );
    },
    construct: function (e) {
      return "true" === e || "True" === e || "TRUE" === e;
    },
    predicate: function (e) {
      return "[object Boolean]" === Object.prototype.toString.call(e);
    },
    represent: {
      lowercase: function (e) {
        return e ? "true" : "false";
      },
      uppercase: function (e) {
        return e ? "TRUE" : "FALSE";
      },
      camelcase: function (e) {
        return e ? "True" : "False";
      },
    },
    defaultStyle: "lowercase",
  });
};
