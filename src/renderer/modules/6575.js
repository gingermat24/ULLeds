module.exports = (e, t, n) => {
  var r,
    o = n(2198),
    i = (r = /[^.]+$/.exec((o && o.keys && o.keys.IE_PROTO) || "")) ? "Symbol(src)_1." + r : "";
  e.exports = function (e) {
    return !!i && i in e;
  };
};
