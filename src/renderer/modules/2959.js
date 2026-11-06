module.exports = (e, t, n) => {
  "use strict";
  var r = n(6689),
    o = Symbol.for("react.element"),
    i = Symbol.for("react.fragment"),
    a = Object.prototype.hasOwnProperty,
    s = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    l = { key: !0, ref: !0, __self: !0, __source: !0 };
  function d(e, t, n) {
    var r,
      i = {},
      d = null,
      c = null;
    for (r in (void 0 !== n && (d = "" + n),
    void 0 !== t.key && (d = "" + t.key),
    void 0 !== t.ref && (c = t.ref),
    t))
      a.call(t, r) && !l.hasOwnProperty(r) && (i[r] = t[r]);
    if (e && e.defaultProps) for (r in (t = e.defaultProps)) void 0 === i[r] && (i[r] = t[r]);
    return { $$typeof: o, type: e, key: d, ref: c, props: i, _owner: s.current };
  }
  ((t.Fragment = i), (t.jsx = d), (t.jsxs = d));
};
