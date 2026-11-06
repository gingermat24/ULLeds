module.exports = (e) => {
  "use strict";
  function t(e, t) {
    var r = "",
      n = e.reason || "(unknown reason)";
    return e.mark
      ? (e.mark.name && (r += 'in "' + e.mark.name + '" '),
        (r += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")"),
        !t && e.mark.snippet && (r += "\n\n" + e.mark.snippet),
        n + " " + r)
      : n;
  }
  function r(e, r) {
    (Error.call(this),
      (this.name = "YAMLException"),
      (this.reason = e),
      (this.mark = r),
      (this.message = t(this, !1)),
      Error.captureStackTrace
        ? Error.captureStackTrace(this, this.constructor)
        : (this.stack = new Error().stack || ""));
  }
  ((r.prototype = Object.create(Error.prototype)),
    (r.prototype.constructor = r),
    (r.prototype.toString = function (e) {
      return this.name + ": " + t(this, e);
    }),
    (e.exports = r));
};
