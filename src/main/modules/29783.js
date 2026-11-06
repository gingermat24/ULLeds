module.exports = (e, t, r) => {
  "use strict";
  r.d(t, { Z: () => i });
  var n = r(51204);
  const i = (e, t) => {
    const r = (0, n.P0)(e),
      i = (0, n.P0)(t),
      o = r.pop(),
      s = i.pop(),
      a = (0, n.Uy)(r, i);
    return 0 !== a ? a : o && s ? (0, n.Uy)(o.split("."), s.split(".")) : o || s ? (o ? -1 : 1) : 0;
  };
};
