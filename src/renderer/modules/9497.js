module.exports = (e) => {
  "use strict";
  e.exports = function (e) {
    var t = e[1],
      n = e[3];
    if (!n) return t;
    if ("function" == typeof btoa) {
      var r = btoa(unescape(encodeURIComponent(JSON.stringify(n)))),
        o = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(r),
        i = "/*# ".concat(o, " */");
      return [t].concat([i]).join("\n");
    }
    return [t].join("\n");
  };
};
