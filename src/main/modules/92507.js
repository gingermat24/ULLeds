module.exports = (e, t, r) => {
  "use strict";
  var n = r(40951),
    i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
  e.exports = new n("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: function (e) {
      if (null === e) return !1;
      var t,
        r,
        n = 0,
        o = e.length,
        s = i;
      for (r = 0; r < o; r++)
        if (!((t = s.indexOf(e.charAt(r))) > 64)) {
          if (t < 0) return !1;
          n += 6;
        }
      return n % 8 == 0;
    },
    construct: function (e) {
      var t,
        r,
        n = e.replace(/[\r\n=]/g, ""),
        o = n.length,
        s = i,
        a = 0,
        c = [];
      for (t = 0; t < o; t++)
        (t % 4 == 0 && t && (c.push((a >> 16) & 255), c.push((a >> 8) & 255), c.push(255 & a)),
          (a = (a << 6) | s.indexOf(n.charAt(t))));
      return (
        0 == (r = (o % 4) * 6)
          ? (c.push((a >> 16) & 255), c.push((a >> 8) & 255), c.push(255 & a))
          : 18 === r
            ? (c.push((a >> 10) & 255), c.push((a >> 2) & 255))
            : 12 === r && c.push((a >> 4) & 255),
        new Uint8Array(c)
      );
    },
    predicate: function (e) {
      return "[object Uint8Array]" === Object.prototype.toString.call(e);
    },
    represent: function (e) {
      var t,
        r,
        n = "",
        o = 0,
        s = e.length,
        a = i;
      for (t = 0; t < s; t++)
        (t % 3 == 0 &&
          t &&
          ((n += a[(o >> 18) & 63]),
          (n += a[(o >> 12) & 63]),
          (n += a[(o >> 6) & 63]),
          (n += a[63 & o])),
          (o = (o << 8) + e[t]));
      return (
        0 == (r = s % 3)
          ? ((n += a[(o >> 18) & 63]),
            (n += a[(o >> 12) & 63]),
            (n += a[(o >> 6) & 63]),
            (n += a[63 & o]))
          : 2 === r
            ? ((n += a[(o >> 10) & 63]),
              (n += a[(o >> 4) & 63]),
              (n += a[(o << 2) & 63]),
              (n += a[64]))
            : 1 === r &&
              ((n += a[(o >> 2) & 63]), (n += a[(o << 4) & 63]), (n += a[64]), (n += a[64])),
        n
      );
    },
  });
};
