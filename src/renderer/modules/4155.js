module.exports = (e, t, n) => {
  var r = n(403),
    o = n(2107),
    i = Object.prototype,
    a = i.hasOwnProperty,
    s = i.propertyIsEnumerable,
    l = r(
      (function () {
        return arguments;
      })(),
    )
      ? r
      : function (e) {
          return o(e) && a.call(e, "callee") && !s.call(e, "callee");
        };
  e.exports = l;
};
