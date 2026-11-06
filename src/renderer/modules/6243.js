module.exports = (e, t, n) => {
  e = n.nmd(e);
  var r = n(9750),
    o = t && !t.nodeType && t,
    i = o && e && !e.nodeType && e,
    a = i && i.exports === o ? r.Buffer : void 0,
    s = a ? a.allocUnsafe : void 0;
  e.exports = function (e, t) {
    if (t) return e.slice();
    var n = e.length,
      r = s ? s(n) : new e.constructor(n);
    return (e.copy(r), r);
  };
};
