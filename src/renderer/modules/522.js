module.exports = (e, t, n) => {
  "use strict";
  var r,
    o =
      Object.assign ||
      function (e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = arguments[t];
          for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
        }
        return e;
      },
    i = (r = n(6689)) && r.__esModule ? r : { default: r };
  t.A = function (e) {
    var t = e.fill,
      n = void 0 === t ? "currentColor" : t,
      r = e.width,
      a = void 0 === r ? 24 : r,
      s = e.height,
      l = void 0 === s ? 24 : s,
      d = e.style,
      c = void 0 === d ? {} : d,
      A = (function (e, t) {
        var n = {};
        for (var r in e)
          t.indexOf(r) >= 0 || (Object.prototype.hasOwnProperty.call(e, r) && (n[r] = e[r]));
        return n;
      })(e, ["fill", "width", "height", "style"]);
    return i.default.createElement(
      "svg",
      o({ viewBox: "0 0 24 24", style: o({ fill: n, width: a, height: l }, c) }, A),
      i.default.createElement("path", {
        d: "M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z",
      }),
    );
  };
};
