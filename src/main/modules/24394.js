module.exports = (e) => {
  var t = 1e3,
    r = 60 * t,
    n = 60 * r,
    i = 24 * n,
    o = 7 * i;
  function s(e, t, r, n) {
    var i = t >= 1.5 * r;
    return Math.round(e / r) + " " + n + (i ? "s" : "");
  }
  e.exports = function (e, a) {
    a = a || {};
    var c,
      l,
      u = typeof e;
    if ("string" === u && e.length > 0)
      return (function (e) {
        if (!((e = String(e)).length > 100)) {
          var s =
            /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
              e,
            );
          if (s) {
            var a = parseFloat(s[1]);
            switch ((s[2] || "ms").toLowerCase()) {
              case "years":
              case "year":
              case "yrs":
              case "yr":
              case "y":
                return 315576e5 * a;
              case "weeks":
              case "week":
              case "w":
                return a * o;
              case "days":
              case "day":
              case "d":
                return a * i;
              case "hours":
              case "hour":
              case "hrs":
              case "hr":
              case "h":
                return a * n;
              case "minutes":
              case "minute":
              case "mins":
              case "min":
              case "m":
                return a * r;
              case "seconds":
              case "second":
              case "secs":
              case "sec":
              case "s":
                return a * t;
              case "milliseconds":
              case "millisecond":
              case "msecs":
              case "msec":
              case "ms":
                return a;
              default:
                return;
            }
          }
        }
      })(e);
    if ("number" === u && isFinite(e))
      return a.long
        ? ((c = e),
          (l = Math.abs(c)) >= i
            ? s(c, l, i, "day")
            : l >= n
              ? s(c, l, n, "hour")
              : l >= r
                ? s(c, l, r, "minute")
                : l >= t
                  ? s(c, l, t, "second")
                  : c + " ms")
        : (function (e) {
            var o = Math.abs(e);
            return o >= i
              ? Math.round(e / i) + "d"
              : o >= n
                ? Math.round(e / n) + "h"
                : o >= r
                  ? Math.round(e / r) + "m"
                  : o >= t
                    ? Math.round(e / t) + "s"
                    : e + "ms";
          })(e);
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(e));
  };
};
