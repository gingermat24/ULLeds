module.exports = (e, t, n) => {
  e = n.nmd(e);
  var r = n(2431),
    o = t && !t.nodeType && t,
    i = o && e && !e.nodeType && e,
    a = i && i.exports === o && r.process,
    s = (function () {
      try {
        return (i && i.require && i.require("util").types) || (a && a.binding && a.binding("util"));
      } catch (e) {}
    })();
  e.exports = s;
};
