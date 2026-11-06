module.exports = (e, t, r) => {
  "use strict";
  var n = r(40951);
  e.exports = new n("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: function (e) {
      if (null === e) return !0;
      var t = e.length;
      return (1 === t && "~" === e) || (4 === t && ("null" === e || "Null" === e || "NULL" === e));
    },
    construct: function () {
      return null;
    },
    predicate: function (e) {
      return null === e;
    },
    represent: {
      canonical: function () {
        return "~";
      },
      lowercase: function () {
        return "null";
      },
      uppercase: function () {
        return "NULL";
      },
      camelcase: function () {
        return "Null";
      },
      empty: function () {
        return "";
      },
    },
    defaultStyle: "lowercase",
  });
};
