module.exports = (e, t, r) => {
  "use strict";
  var n,
    i,
    o,
    s = r(70587),
    a = r(16928).extname,
    c = /^\s*([^;\s]*)(?:;|\s|$)/,
    l = /^text\//i;
  function u(e) {
    if (!e || "string" != typeof e) return !1;
    var t = c.exec(e),
      r = t && s[t[1].toLowerCase()];
    return r && r.charset ? r.charset : !(!t || !l.test(t[1])) && "UTF-8";
  }
  ((t.charset = u),
    (t.charsets = { lookup: u }),
    (t.contentType = function (e) {
      if (!e || "string" != typeof e) return !1;
      var r = -1 === e.indexOf("/") ? t.lookup(e) : e;
      if (!r) return !1;
      if (-1 === r.indexOf("charset")) {
        var n = t.charset(r);
        n && (r += "; charset=" + n.toLowerCase());
      }
      return r;
    }),
    (t.extension = function (e) {
      if (!e || "string" != typeof e) return !1;
      var r = c.exec(e),
        n = r && t.extensions[r[1].toLowerCase()];
      return !(!n || !n.length) && n[0];
    }),
    (t.extensions = Object.create(null)),
    (t.lookup = function (e) {
      if (!e || "string" != typeof e) return !1;
      var r = a("x." + e)
        .toLowerCase()
        .substr(1);
      return (r && t.types[r]) || !1;
    }),
    (t.types = Object.create(null)),
    (n = t.extensions),
    (i = t.types),
    (o = ["nginx", "apache", void 0, "iana"]),
    Object.keys(s).forEach(function (e) {
      var t = s[e],
        r = t.extensions;
      if (r && r.length) {
        n[e] = r;
        for (var a = 0; a < r.length; a++) {
          var c = r[a];
          if (i[c]) {
            var l = o.indexOf(s[i[c]].source),
              u = o.indexOf(t.source);
            if (
              "application/octet-stream" !== i[c] &&
              (l > u || (l === u && "application/" === i[c].substr(0, 12)))
            )
              continue;
          }
          i[c] = e;
        }
      }
    }));
};
