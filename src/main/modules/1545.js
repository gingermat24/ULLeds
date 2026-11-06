module.exports = (e, t, r) => {
  "use strict";
  var n = r(40951),
    i = Object.prototype.toString;
  e.exports = new n("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: function (e) {
      if (null === e) return !0;
      var t,
        r,
        n,
        o,
        s,
        a = e;
      for (s = new Array(a.length), t = 0, r = a.length; t < r; t += 1) {
        if (((n = a[t]), "[object Object]" !== i.call(n))) return !1;
        if (1 !== (o = Object.keys(n)).length) return !1;
        s[t] = [o[0], n[o[0]]];
      }
      return !0;
    },
    construct: function (e) {
      if (null === e) return [];
      var t,
        r,
        n,
        i,
        o,
        s = e;
      for (o = new Array(s.length), t = 0, r = s.length; t < r; t += 1)
        ((n = s[t]), (i = Object.keys(n)), (o[t] = [i[0], n[i[0]]]));
      return o;
    },
  });
};
