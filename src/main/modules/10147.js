module.exports = (e, t, r) => {
  "use strict";
  var n = r(87016).parse,
    i = { ftp: 21, gopher: 70, http: 80, https: 443, ws: 80, wss: 443 },
    o =
      String.prototype.endsWith ||
      function (e) {
        return e.length <= this.length && -1 !== this.indexOf(e, this.length - e.length);
      };
  function s(e) {
    return process.env[e.toLowerCase()] || process.env[e.toUpperCase()] || "";
  }
  t.getProxyForUrl = function (e) {
    var t = "string" == typeof e ? n(e) : e || {},
      r = t.protocol,
      a = t.host,
      c = t.port;
    if ("string" != typeof a || !a || "string" != typeof r) return "";
    if (
      ((r = r.split(":", 1)[0]),
      !(function (e, t) {
        var r = (s("npm_config_no_proxy") || s("no_proxy")).toLowerCase();
        return (
          !r ||
          ("*" !== r &&
            r.split(/[,\s]/).every(function (r) {
              if (!r) return !0;
              var n = r.match(/^(.+):(\d+)$/),
                i = n ? n[1] : r,
                s = n ? parseInt(n[2]) : 0;
              return (
                !(!s || s === t) ||
                (/^[.*]/.test(i)
                  ? ("*" === i.charAt(0) && (i = i.slice(1)), !o.call(e, i))
                  : e !== i)
              );
            }))
        );
      })((a = a.replace(/:\d*$/, "")), (c = parseInt(c) || i[r] || 0)))
    )
      return "";
    var l =
      s("npm_config_" + r + "_proxy") || s(r + "_proxy") || s("npm_config_proxy") || s("all_proxy");
    return (l && -1 === l.indexOf("://") && (l = r + "://" + l), l);
  };
};
