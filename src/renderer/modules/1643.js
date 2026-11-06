module.exports = (e, t, n) => {
  var r = n(6106),
    o = n(5678),
    i = n(821),
    a = r ? r.toStringTag : void 0;
  e.exports = function (e) {
    return null == e
      ? void 0 === e
        ? "[object Undefined]"
        : "[object Null]"
      : a && a in Object(e)
        ? o(e)
        : i(e);
  };
};
