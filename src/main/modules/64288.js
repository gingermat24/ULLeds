module.exports = (e, t, r) => {
  "use strict";
  var n = r(40951),
    i = Object.prototype.hasOwnProperty;
  e.exports = new n("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: function (e) {
      if (null === e) return !0;
      var t,
        r = e;
      for (t in r) if (i.call(r, t) && null !== r[t]) return !1;
      return !0;
    },
    construct: function (e) {
      return null !== e ? e : {};
    },
  });
};
