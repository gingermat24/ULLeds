module.exports = (e, t, n) => {
  var r = n(1039),
    o = n(6130),
    i = Object.prototype.propertyIsEnumerable,
    a = Object.getOwnPropertySymbols,
    s = a
      ? function (e) {
          return null == e
            ? []
            : ((e = Object(e)),
              r(a(e), function (t) {
                return i.call(e, t);
              }));
        }
      : o;
  e.exports = s;
};
