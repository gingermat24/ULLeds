module.exports = (e, t, n) => {
  var r = n(6106),
    o = Object.prototype,
    i = o.hasOwnProperty,
    a = o.toString,
    s = r ? r.toStringTag : void 0;
  e.exports = function (e) {
    var t = i.call(e, s),
      n = e[s];
    try {
      e[s] = void 0;
      var r = !0;
    } catch (e) {}
    var o = a.call(e);
    return (r && (t ? (e[s] = n) : delete e[s]), o);
  };
};
