module.exports = (e, t) => {
  "use strict";
  var n = "function" == typeof Symbol && Symbol.for,
    r = n ? Symbol.for("react.element") : 60103,
    o = n ? Symbol.for("react.portal") : 60106,
    i = n ? Symbol.for("react.fragment") : 60107,
    a = n ? Symbol.for("react.strict_mode") : 60108,
    s = n ? Symbol.for("react.profiler") : 60114,
    l = n ? Symbol.for("react.provider") : 60109,
    d = n ? Symbol.for("react.context") : 60110,
    c = n ? Symbol.for("react.async_mode") : 60111,
    A = n ? Symbol.for("react.concurrent_mode") : 60111,
    u = n ? Symbol.for("react.forward_ref") : 60112,
    p = n ? Symbol.for("react.suspense") : 60113,
    f = n ? Symbol.for("react.suspense_list") : 60120,
    m = n ? Symbol.for("react.memo") : 60115,
    b = n ? Symbol.for("react.lazy") : 60116,
    h = n ? Symbol.for("react.block") : 60121,
    g = n ? Symbol.for("react.fundamental") : 60117,
    C = n ? Symbol.for("react.responder") : 60118,
    v = n ? Symbol.for("react.scope") : 60119;
  function y(e) {
    if ("object" == typeof e && null !== e) {
      var t = e.$$typeof;
      switch (t) {
        case r:
          switch ((e = e.type)) {
            case c:
            case A:
            case i:
            case s:
            case a:
            case p:
              return e;
            default:
              switch ((e = e && e.$$typeof)) {
                case d:
                case u:
                case b:
                case m:
                case l:
                  return e;
                default:
                  return t;
              }
          }
        case o:
          return t;
      }
    }
  }
  function x(e) {
    return y(e) === A;
  }
  ((t.AsyncMode = c),
    (t.ConcurrentMode = A),
    (t.ContextConsumer = d),
    (t.ContextProvider = l),
    (t.Element = r),
    (t.ForwardRef = u),
    (t.Fragment = i),
    (t.Lazy = b),
    (t.Memo = m),
    (t.Portal = o),
    (t.Profiler = s),
    (t.StrictMode = a),
    (t.Suspense = p),
    (t.isAsyncMode = function (e) {
      return x(e) || y(e) === c;
    }),
    (t.isConcurrentMode = x),
    (t.isContextConsumer = function (e) {
      return y(e) === d;
    }),
    (t.isContextProvider = function (e) {
      return y(e) === l;
    }),
    (t.isElement = function (e) {
      return "object" == typeof e && null !== e && e.$$typeof === r;
    }),
    (t.isForwardRef = function (e) {
      return y(e) === u;
    }),
    (t.isFragment = function (e) {
      return y(e) === i;
    }),
    (t.isLazy = function (e) {
      return y(e) === b;
    }),
    (t.isMemo = function (e) {
      return y(e) === m;
    }),
    (t.isPortal = function (e) {
      return y(e) === o;
    }),
    (t.isProfiler = function (e) {
      return y(e) === s;
    }),
    (t.isStrictMode = function (e) {
      return y(e) === a;
    }),
    (t.isSuspense = function (e) {
      return y(e) === p;
    }),
    (t.isValidElementType = function (e) {
      return (
        "string" == typeof e ||
        "function" == typeof e ||
        e === i ||
        e === A ||
        e === s ||
        e === a ||
        e === p ||
        e === f ||
        ("object" == typeof e &&
          null !== e &&
          (e.$$typeof === b ||
            e.$$typeof === m ||
            e.$$typeof === l ||
            e.$$typeof === d ||
            e.$$typeof === u ||
            e.$$typeof === g ||
            e.$$typeof === C ||
            e.$$typeof === v ||
            e.$$typeof === h))
      );
    }),
    (t.typeOf = y));
};
