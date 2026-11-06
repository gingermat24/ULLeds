module.exports = (e) => {
  var t = /[\\^$.*+?()[\]{}|]/g,
    r = RegExp(t.source),
    n = "object" == typeof global && global && global.Object === Object && global,
    i = "object" == typeof self && self && self.Object === Object && self,
    o = n || i || Function("return this")(),
    s = Object.prototype.toString,
    a = o.Symbol,
    c = a ? a.prototype : void 0,
    l = c ? c.toString : void 0;
  e.exports = function (e) {
    var n;
    return (e =
      null == (n = e)
        ? ""
        : (function (e) {
            if ("string" == typeof e) return e;
            if (
              (function (e) {
                return (
                  "symbol" == typeof e ||
                  ((function (e) {
                    return !!e && "object" == typeof e;
                  })(e) &&
                    "[object Symbol]" == s.call(e))
                );
              })(e)
            )
              return l ? l.call(e) : "";
            var t = e + "";
            return "0" == t && 1 / e == -1 / 0 ? "-0" : t;
          })(n)) && r.test(e)
      ? e.replace(t, "\\$&")
      : e;
  };
};
