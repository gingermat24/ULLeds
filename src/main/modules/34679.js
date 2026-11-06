module.exports = (e, t, r) => {
  "use strict";
  var n = r(40951),
    i = Object.prototype.hasOwnProperty,
    o = Object.prototype.toString;
  e.exports = new n("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: function (e) {
      if (null === e) return !0;
      var t,
        r,
        n,
        s,
        a,
        c = [],
        l = e;
      for (t = 0, r = l.length; t < r; t += 1) {
        if (((n = l[t]), (a = !1), "[object Object]" !== o.call(n))) return !1;
        for (s in n)
          if (i.call(n, s)) {
            if (a) return !1;
            a = !0;
          }
        if (!a) return !1;
        if (-1 !== c.indexOf(s)) return !1;
        c.push(s);
      }
      return !0;
    },
    construct: function (e) {
      return null !== e ? e : [];
    },
  });
};
