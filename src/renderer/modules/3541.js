module.exports = (e, t, n) => {
  e = n.nmd(e);
  var r = n(9750),
    o = n(6332),
    i = t && !t.nodeType && t,
    a = i && e && !e.nodeType && e,
    s = a && a.exports === i ? r.Buffer : void 0,
    l = (s ? s.isBuffer : void 0) || o;
  e.exports = l;
};
