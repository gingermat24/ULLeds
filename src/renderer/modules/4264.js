module.exports = (e, t) => {
  "use strict";
  var n = Symbol.for("react.element"),
    r = Symbol.for("react.portal"),
    o = Symbol.for("react.fragment"),
    i = Symbol.for("react.strict_mode"),
    a = Symbol.for("react.profiler"),
    s = Symbol.for("react.provider"),
    l = Symbol.for("react.context"),
    d = Symbol.for("react.forward_ref"),
    c = Symbol.for("react.suspense"),
    A = Symbol.for("react.memo"),
    u = Symbol.for("react.lazy"),
    p = Symbol.iterator,
    f = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () {},
      enqueueReplaceState: function () {},
      enqueueSetState: function () {},
    },
    m = Object.assign,
    b = {};
  function h(e, t, n) {
    ((this.props = e), (this.context = t), (this.refs = b), (this.updater = n || f));
  }
  function g() {}
  function C(e, t, n) {
    ((this.props = e), (this.context = t), (this.refs = b), (this.updater = n || f));
  }
  ((h.prototype.isReactComponent = {}),
    (h.prototype.setState = function (e, t) {
      if ("object" != typeof e && "function" != typeof e && null != e)
        throw Error(
          "setState(...): takes an object of state variables to update or a function which returns an object of state variables.",
        );
      this.updater.enqueueSetState(this, e, t, "setState");
    }),
    (h.prototype.forceUpdate = function (e) {
      this.updater.enqueueForceUpdate(this, e, "forceUpdate");
    }),
    (g.prototype = h.prototype));
  var v = (C.prototype = new g());
  ((v.constructor = C), m(v, h.prototype), (v.isPureReactComponent = !0));
  var y = Array.isArray,
    x = Object.prototype.hasOwnProperty,
    w = { current: null },
    k = { key: !0, ref: !0, __self: !0, __source: !0 };
  function B(e, t, r) {
    var o,
      i = {},
      a = null,
      s = null;
    if (null != t)
      for (o in (void 0 !== t.ref && (s = t.ref), void 0 !== t.key && (a = "" + t.key), t))
        x.call(t, o) && !k.hasOwnProperty(o) && (i[o] = t[o]);
    var l = arguments.length - 2;
    if (1 === l) i.children = r;
    else if (1 < l) {
      for (var d = Array(l), c = 0; c < l; c++) d[c] = arguments[c + 2];
      i.children = d;
    }
    if (e && e.defaultProps) for (o in (l = e.defaultProps)) void 0 === i[o] && (i[o] = l[o]);
    return { $$typeof: n, type: e, key: a, ref: s, props: i, _owner: w.current };
  }
  function $(e) {
    return "object" == typeof e && null !== e && e.$$typeof === n;
  }
  var E = /\/+/g;
  function _(e, t) {
    return "object" == typeof e && null !== e && null != e.key
      ? (function (e) {
          var t = { "=": "=0", ":": "=2" };
          return (
            "$" +
            e.replace(/[=:]/g, function (e) {
              return t[e];
            })
          );
        })("" + e.key)
      : t.toString(36);
  }
  function S(e, t, o, i, a) {
    var s = typeof e;
    ("undefined" !== s && "boolean" !== s) || (e = null);
    var l = !1;
    if (null === e) l = !0;
    else
      switch (s) {
        case "string":
        case "number":
          l = !0;
          break;
        case "object":
          switch (e.$$typeof) {
            case n:
            case r:
              l = !0;
          }
      }
    if (l)
      return (
        (a = a((l = e))),
        (e = "" === i ? "." + _(l, 0) : i),
        y(a)
          ? ((o = ""),
            null != e && (o = e.replace(E, "$&/") + "/"),
            S(a, t, o, "", function (e) {
              return e;
            }))
          : null != a &&
            ($(a) &&
              (a = (function (e, t) {
                return {
                  $$typeof: n,
                  type: e.type,
                  key: t,
                  ref: e.ref,
                  props: e.props,
                  _owner: e._owner,
                };
              })(
                a,
                o +
                  (!a.key || (l && l.key === a.key) ? "" : ("" + a.key).replace(E, "$&/") + "/") +
                  e,
              )),
            t.push(a)),
        1
      );
    if (((l = 0), (i = "" === i ? "." : i + ":"), y(e)))
      for (var d = 0; d < e.length; d++) {
        var c = i + _((s = e[d]), d);
        l += S(s, t, o, c, a);
      }
    else if (
      ((c = (function (e) {
        return null === e || "object" != typeof e
          ? null
          : "function" == typeof (e = (p && e[p]) || e["@@iterator"])
            ? e
            : null;
      })(e)),
      "function" == typeof c)
    )
      for (e = c.call(e), d = 0; !(s = e.next()).done;)
        l += S((s = s.value), t, o, (c = i + _(s, d++)), a);
    else if ("object" === s)
      throw (
        (t = String(e)),
        Error(
          "Objects are not valid as a React child (found: " +
            ("[object Object]" === t ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) +
            "). If you meant to render a collection of children, use an array instead.",
        )
      );
    return l;
  }
  function O(e, t, n) {
    if (null == e) return e;
    var r = [],
      o = 0;
    return (
      S(e, r, "", "", function (e) {
        return t.call(n, e, o++);
      }),
      r
    );
  }
  function I(e) {
    if (-1 === e._status) {
      var t = e._result;
      ((t = t()).then(
        function (t) {
          (0 !== e._status && -1 !== e._status) || ((e._status = 1), (e._result = t));
        },
        function (t) {
          (0 !== e._status && -1 !== e._status) || ((e._status = 2), (e._result = t));
        },
      ),
        -1 === e._status && ((e._status = 0), (e._result = t)));
    }
    if (1 === e._status) return e._result.default;
    throw e._result;
  }
  var R = { current: null },
    P = { transition: null },
    D = { ReactCurrentDispatcher: R, ReactCurrentBatchConfig: P, ReactCurrentOwner: w };
  function q() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  ((t.Children = {
    map: O,
    forEach: function (e, t, n) {
      O(
        e,
        function () {
          t.apply(this, arguments);
        },
        n,
      );
    },
    count: function (e) {
      var t = 0;
      return (
        O(e, function () {
          t++;
        }),
        t
      );
    },
    toArray: function (e) {
      return (
        O(e, function (e) {
          return e;
        }) || []
      );
    },
    only: function (e) {
      if (!$(e))
        throw Error("React.Children.only expected to receive a single React element child.");
      return e;
    },
  }),
    (t.Component = h),
    (t.Fragment = o),
    (t.Profiler = a),
    (t.PureComponent = C),
    (t.StrictMode = i),
    (t.Suspense = c),
    (t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = D),
    (t.act = q),
    (t.cloneElement = function (e, t, r) {
      if (null == e)
        throw Error(
          "React.cloneElement(...): The argument must be a React element, but you passed " +
            e +
            ".",
        );
      var o = m({}, e.props),
        i = e.key,
        a = e.ref,
        s = e._owner;
      if (null != t) {
        if (
          (void 0 !== t.ref && ((a = t.ref), (s = w.current)),
          void 0 !== t.key && (i = "" + t.key),
          e.type && e.type.defaultProps)
        )
          var l = e.type.defaultProps;
        for (d in t)
          x.call(t, d) &&
            !k.hasOwnProperty(d) &&
            (o[d] = void 0 === t[d] && void 0 !== l ? l[d] : t[d]);
      }
      var d = arguments.length - 2;
      if (1 === d) o.children = r;
      else if (1 < d) {
        l = Array(d);
        for (var c = 0; c < d; c++) l[c] = arguments[c + 2];
        o.children = l;
      }
      return { $$typeof: n, type: e.type, key: i, ref: a, props: o, _owner: s };
    }),
    (t.createContext = function (e) {
      return (
        ((e = {
          $$typeof: l,
          _currentValue: e,
          _currentValue2: e,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
          _defaultValue: null,
          _globalName: null,
        }).Provider = { $$typeof: s, _context: e }),
        (e.Consumer = e)
      );
    }),
    (t.createElement = B),
    (t.createFactory = function (e) {
      var t = B.bind(null, e);
      return ((t.type = e), t);
    }),
    (t.createRef = function () {
      return { current: null };
    }),
    (t.forwardRef = function (e) {
      return { $$typeof: d, render: e };
    }),
    (t.isValidElement = $),
    (t.lazy = function (e) {
      return { $$typeof: u, _payload: { _status: -1, _result: e }, _init: I };
    }),
    (t.memo = function (e, t) {
      return { $$typeof: A, type: e, compare: void 0 === t ? null : t };
    }),
    (t.startTransition = function (e) {
      var t = P.transition;
      P.transition = {};
      try {
        e();
      } finally {
        P.transition = t;
      }
    }),
    (t.unstable_act = q),
    (t.useCallback = function (e, t) {
      return R.current.useCallback(e, t);
    }),
    (t.useContext = function (e) {
      return R.current.useContext(e);
    }),
    (t.useDebugValue = function () {}),
    (t.useDeferredValue = function (e) {
      return R.current.useDeferredValue(e);
    }),
    (t.useEffect = function (e, t) {
      return R.current.useEffect(e, t);
    }),
    (t.useId = function () {
      return R.current.useId();
    }),
    (t.useImperativeHandle = function (e, t, n) {
      return R.current.useImperativeHandle(e, t, n);
    }),
    (t.useInsertionEffect = function (e, t) {
      return R.current.useInsertionEffect(e, t);
    }),
    (t.useLayoutEffect = function (e, t) {
      return R.current.useLayoutEffect(e, t);
    }),
    (t.useMemo = function (e, t) {
      return R.current.useMemo(e, t);
    }),
    (t.useReducer = function (e, t, n) {
      return R.current.useReducer(e, t, n);
    }),
    (t.useRef = function (e) {
      return R.current.useRef(e);
    }),
    (t.useState = function (e) {
      return R.current.useState(e);
    }),
    (t.useSyncExternalStore = function (e, t, n) {
      return R.current.useSyncExternalStore(e, t, n);
    }),
    (t.useTransition = function () {
      return R.current.useTransition();
    }),
    (t.version = "18.3.1"));
};
