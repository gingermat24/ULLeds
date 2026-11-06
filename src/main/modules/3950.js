module.exports = (e, t, r) => {
  "use strict";
  const n =
      "undefined" == typeof process || "renderer" === process.type || "worker" === process.type,
    i = "object" == typeof process && "browser" === process.type;
  n ? (r(99683), (e.exports = r(63576))) : (e.exports = r(i ? 12650 : 66331));
};
