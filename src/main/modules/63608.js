module.exports = (e, t, r) => {
  "use strict";
  var n = r(40951),
    i = new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),
    o = new RegExp(
      "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$",
    );
  e.exports = new n("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: function (e) {
      return null !== e && (null !== i.exec(e) || null !== o.exec(e));
    },
    construct: function (e) {
      var t,
        r,
        n,
        s,
        a,
        c,
        l,
        u,
        p = 0,
        d = null;
      if ((null === (t = i.exec(e)) && (t = o.exec(e)), null === t))
        throw new Error("Date resolve error");
      if (((r = +t[1]), (n = +t[2] - 1), (s = +t[3]), !t[4])) return new Date(Date.UTC(r, n, s));
      if (((a = +t[4]), (c = +t[5]), (l = +t[6]), t[7])) {
        for (p = t[7].slice(0, 3); p.length < 3;) p += "0";
        p = +p;
      }
      return (
        t[9] && ((d = 6e4 * (60 * +t[10] + +(t[11] || 0))), "-" === t[9] && (d = -d)),
        (u = new Date(Date.UTC(r, n, s, a, c, l, p))),
        d && u.setTime(u.getTime() - d),
        u
      );
    },
    instanceOf: Date,
    represent: function (e) {
      return e.toISOString();
    },
  });
};
