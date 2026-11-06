module.exports = (e) => {
  "use strict";
  e.exports = function (e) {
    if ("undefined" == typeof document) return { update: function () {}, remove: function () {} };
    var t = e.insertStyleElement(e);
    return {
      update: function (n) {
        !(function (e, t, n) {
          var r = "";
          (n.supports && (r += "@supports (".concat(n.supports, ") {")),
            n.media && (r += "@media ".concat(n.media, " {")));
          var o = void 0 !== n.layer;
          (o && (r += "@layer".concat(n.layer.length > 0 ? " ".concat(n.layer) : "", " {")),
            (r += n.css),
            o && (r += "}"),
            n.media && (r += "}"),
            n.supports && (r += "}"));
          var i = n.sourceMap;
          (i &&
            "undefined" != typeof btoa &&
            (r += "\n/*# sourceMappingURL=data:application/json;base64,".concat(
              btoa(unescape(encodeURIComponent(JSON.stringify(i)))),
              " */",
            )),
            t.styleTagTransform(r, e, t.options));
        })(t, e, n);
      },
      remove: function () {
        !(function (e) {
          if (null === e.parentNode) return !1;
          e.parentNode.removeChild(e);
        })(t);
      },
    };
  };
};
