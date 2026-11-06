module.exports = (e) => {
  "use strict";
  e.exports = function (e) {
    if (null === e || "object" != typeof e) return e;
    if (e instanceof Object) var r = { __proto__: t(e) };
    else r = Object.create(null);
    return (
      Object.getOwnPropertyNames(e).forEach(function (t) {
        Object.defineProperty(r, t, Object.getOwnPropertyDescriptor(e, t));
      }),
      r
    );
  };
  var t =
    Object.getPrototypeOf ||
    function (e) {
      return e.__proto__;
    };
};
