module.exports = (e) => {
  "use strict";
  e.exports = function (e) {
    var t = [];
    return (
      (t.toString = function () {
        return this.map(function (t) {
          var n = "",
            r = void 0 !== t[5];
          return (
            t[4] && (n += "@supports (".concat(t[4], ") {")),
            t[2] && (n += "@media ".concat(t[2], " {")),
            r && (n += "@layer".concat(t[5].length > 0 ? " ".concat(t[5]) : "", " {")),
            (n += e(t)),
            r && (n += "}"),
            t[2] && (n += "}"),
            t[4] && (n += "}"),
            n
          );
        }).join("");
      }),
      (t.i = function (e, n, r, o, i) {
        "string" == typeof e && (e = [[null, e, void 0]]);
        var a = {};
        if (r)
          for (var s = 0; s < this.length; s++) {
            var l = this[s][0];
            null != l && (a[l] = !0);
          }
        for (var d = 0; d < e.length; d++) {
          var c = [].concat(e[d]);
          (r && a[c[0]]) ||
            (void 0 !== i &&
              (void 0 === c[5] ||
                (c[1] = "@layer"
                  .concat(c[5].length > 0 ? " ".concat(c[5]) : "", " {")
                  .concat(c[1], "}")),
              (c[5] = i)),
            n &&
              (c[2]
                ? ((c[1] = "@media ".concat(c[2], " {").concat(c[1], "}")), (c[2] = n))
                : (c[2] = n)),
            o &&
              (c[4]
                ? ((c[1] = "@supports (".concat(c[4], ") {").concat(c[1], "}")), (c[4] = o))
                : (c[4] = "".concat(o))),
            t.push(c));
        }
      }),
      t
    );
  };
};
