module.exports = (e, t, n) => {
  "use strict";
  var r = n(8580),
    o = {
      childContextTypes: !0,
      contextType: !0,
      contextTypes: !0,
      defaultProps: !0,
      displayName: !0,
      getDefaultProps: !0,
      getDerivedStateFromError: !0,
      getDerivedStateFromProps: !0,
      mixins: !0,
      propTypes: !0,
      type: !0,
    },
    i = { name: !0, length: !0, prototype: !0, caller: !0, callee: !0, arguments: !0, arity: !0 },
    a = { $$typeof: !0, compare: !0, defaultProps: !0, displayName: !0, propTypes: !0, type: !0 },
    s = {};
  function l(e) {
    return r.isMemo(e) ? a : s[e.$$typeof] || o;
  }
  ((s[r.ForwardRef] = {
    $$typeof: !0,
    render: !0,
    defaultProps: !0,
    displayName: !0,
    propTypes: !0,
  }),
    (s[r.Memo] = a));
  var d = Object.defineProperty,
    c = Object.getOwnPropertyNames,
    A = Object.getOwnPropertySymbols,
    u = Object.getOwnPropertyDescriptor,
    p = Object.getPrototypeOf,
    f = Object.prototype;
  e.exports = function e(t, n, r) {
    if ("string" != typeof n) {
      if (f) {
        var o = p(n);
        o && o !== f && e(t, o, r);
      }
      var a = c(n);
      A && (a = a.concat(A(n)));
      for (var s = l(t), m = l(n), b = 0; b < a.length; ++b) {
        var h = a[b];
        if (!(i[h] || (r && r[h]) || (m && m[h]) || (s && s[h]))) {
          var g = u(n, h);
          try {
            d(t, h, g);
          } catch (e) {}
        }
      }
    }
    return t;
  };
};
